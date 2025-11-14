const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const { ensureStreamForCamera } = require('../services/streamManager');
const { encrypt, decrypt } = require('../utils/crypto');

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware);

router.get('/', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send('Acesso não autorizado. Token inválido.');
    }
    const userId = req.user.id;
    const query = 'SELECT * FROM cameras WHERE user_id = ? ORDER BY COALESCE(display_order, 99999) ASC';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Erro de banco de dados ao buscar câmeras:", err);
            return res.status(500).send('Erro no servidor.');
        }

        const camerasComStreamUrl = results.map(row => {
            let plainUrl = '';
            try { plainUrl = decrypt(row.url); } catch { plainUrl = row.url; }

            let streamUrl = '';
            if (row.streamType === 'mjpeg') {
                streamUrl = `/api/streams/mjpeg/${row.id}`;
            } else if (row.streamType === 'rtsp') {
                streamUrl = ensureStreamForCamera({ ...row, url: plainUrl }, req);
            }

            const { url, username, password, ...safe } = row;
            return { ...safe, streamUrl };
        });

        res.json(camerasComStreamUrl);
    });
});

router.post('/', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send('Acesso não autorizado.');
    }
    const userId = req.user.id;
    const { name, url, streamType, username, password, location, description } = req.body;

    // Validar tipo de stream
    const validTypes = ['rtsp', 'mjpeg', 'http', 'hls', 'dash'];
    if (!validTypes.includes(streamType)) {
        return res.status(400).json({ error: 'Tipo de stream inválido.' });
    }

    const orderQuery = 'SELECT COUNT(*) as cameraCount FROM cameras WHERE user_id = ?';
    db.query(orderQuery, [userId], (err, countResult) => {
        if (err) {
            console.error("Erro ao contar câmeras:", err);
            return res.status(500).send('Erro ao criar a câmera.');
        }
        const newOrder = countResult[0].cameraCount;

        // Adicione streamType ao INSERT
        const insertQuery = 'INSERT INTO cameras (user_id, name, url, streamType, username, password, location, description, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const encUrl = encrypt(url);
        db.query(insertQuery, [userId, name, encUrl, streamType, username, password, location, description, newOrder], (err, result) => {
            if (err) {
                console.error("Erro ao criar câmera:", err);
                return res.status(500).send('Erro ao criar a câmera.');
            }
            let streamUrl = '';
            if (streamType === 'mjpeg') streamUrl = `/api/streams/mjpeg/${result.insertId}`;
            if (streamType === 'rtsp') {
                let plainUrl = '';
                try { plainUrl = decrypt(encUrl); } catch { plainUrl = url; }
                streamUrl = ensureStreamForCamera({ id: result.insertId, name, url: plainUrl }, req);
            }
            res.status(201).json({
                id: result.insertId,
                name,
                streamType,
                location,
                description,
                status: 'offline',
                display_order: newOrder,
                streamUrl
            });
        });
    });
});

router.put('/:id', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send('Acesso não autorizado.');
    }
    const userId = req.user.id;
    const cameraId = req.params.id;
    const { name, url, streamType, username, password, location, description } = req.body;
    const encUrl = url ? encrypt(url) : undefined;
    const query = 'UPDATE cameras SET name = ?, url = ?, streamType = ?, username = ?, password = ?, location = ?, description = ? WHERE id = ? AND user_id = ?';
    db.query(query, [name, encUrl, streamType, username, password, location, description, cameraId, userId], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar câmera:", err);
            return res.status(500).send('Erro ao atualizar a câmera.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Câmera não encontrada ou você não tem permissão.');
        }
        res.send('Câmera atualizada com sucesso.');
    });
});

router.delete('/:id', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send('Acesso não autorizado.');
    }
    const userId = req.user.id;
    const cameraId = req.params.id;
    const query = 'DELETE FROM cameras WHERE id = ? AND user_id = ?';
    db.query(query, [cameraId, userId], (err, result) => {
        if (err) {
            console.error("Erro de banco de dados ao deletar câmera:", err);
            return res.status(500).send('Erro ao deletar a câmera.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Câmera não encontrada ou você não tem permissão.');
        }
        res.status(204).send();
    });
});

router.patch('/reorder', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send('Acesso não autorizado.');
    }
    const userId = req.user.id;
    const { order } = req.body; // Espera um array: [{ id: '1', order: 0 }, { id: '2', order: 1 }]

    if (!Array.isArray(order)) {
        return res.status(400).json({ message: 'O corpo da requisição deve ser um array.' });
    }

    db.beginTransaction(err => {
        if (err) {
            console.error("Erro ao iniciar transação:", err);
            return res.status(500).send('Erro no servidor.');
        }

        const promises = order.map(item => {
            const query = 'UPDATE cameras SET display_order = ? WHERE id = ? AND user_id = ?';
            return new Promise((resolve, reject) => {
                db.query(query, [item.order, item.id, userId], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        });

        Promise.all(promises)
            .then(() => {
                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Erro ao commitar transação:", err);
                            res.status(500).send('Erro no servidor.');
                        });
                    }
                    res.status(200).json({ message: 'Ordem das câmeras atualizada com sucesso.' });
                });
            })
            .catch(error => {
                db.rollback(() => {
                    console.error('Erro ao reordenar câmeras:', error);
                    res.status(500).send('Erro no servidor ao atualizar a ordem.');
                });
            });
    });
});

module.exports = router;