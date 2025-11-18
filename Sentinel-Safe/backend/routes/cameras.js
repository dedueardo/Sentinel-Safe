const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware'); // 👈 Corrigido
const { encrypt, decrypt } = require('../utils/crypto');
const { sanitizeCameraInput, validateURL } = require('../utils/sanitize');
const { ensureStreamForCamera, stopStream, getActiveStreams } = require('../services/streamManager');

router.use(authMiddleware);

// 👇 NOVO: Endpoint de debug
router.get('/debug/streams', (req, res) => {
    const activeStreams = getActiveStreams();
    res.json({
        total: activeStreams.length,
        basePort: process.env.STREAM_BASE_PORT || 3100,
        streams: activeStreams
    });
});

router.get('/', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'Acesso não autorizado. Token inválido.' });
    }

    const userId = req.user.id;
    const query = 'SELECT * FROM cameras WHERE user_id = ? ORDER BY COALESCE(display_order, 99999) ASC';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Erro de banco de dados ao buscar câmeras:", err);
            return res.status(500).json({ error: 'Erro no servidor.' });
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
    const userId = req.user.id;
    const data = sanitizeCameraInput(req.body);

    // Validações
    if (!data.name || !data.url) {
        return res.status(400).json({ error: 'Nome e URL são obrigatórios.' });
    }

    if (!validateURL(data.url)) {
        return res.status(400).json({ error: 'URL inválida.' });
    }

    const validStreamTypes = ['rtsp', 'mjpeg', 'http', 'hls', 'dash'];
    if (!validStreamTypes.includes(data.streamType)) {
        return res.status(400).json({ error: 'Tipo de stream inválido.' });
    }

    const query = 'INSERT INTO cameras (user_id, name, url, streamType, username, password, location, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [
        userId,
        data.name,
        encrypt(data.url),
        data.streamType,
        data.username,
        data.password,
        data.location,
        data.description
    ], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao criar câmera.' });
        }
        res.status(201).json({ id: result.insertId, msg: 'Câmera criada com sucesso.' });
    });
});

router.put('/:id', (req, res) => {
    const userId = req.user.id;
    const camId = req.params.id;
    const data = sanitizeCameraInput(req.body);

    // Validações
    if (!validateURL(data.url)) {
        return res.status(400).json({ error: 'URL inválida.' });
    }

    const sel = 'SELECT id FROM cameras WHERE id = ? AND user_id = ?';

    db.query(sel, [camId, userId], (e, rows) => {
        if (e) {
            console.error(e);
            return res.status(500).json({ error: 'Erro no servidor.' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Câmera não encontrada.' });
        }

        const upd = 'UPDATE cameras SET name = ?, url = ?, streamType = ?, username = ?, password = ?, location = ?, description = ? WHERE id = ?';

        db.query(upd, [
            data.name,
            encrypt(data.url),
            data.streamType,
            data.username,
            data.password,
            data.location,
            data.description,
            camId
        ], err => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao atualizar câmera.' });
            }
            res.json({ msg: 'Câmera atualizada com sucesso.' });
        });
    });
});

router.delete('/:id', (req, res) => {
    const userId = req.user.id;
    const camId = req.params.id;
    const sel = 'SELECT id FROM cameras WHERE id = ? AND user_id = ?';

    db.query(sel, [camId, userId], (e, rows) => {
        if (e) {
            console.error(e);
            return res.status(500).json({ error: 'Erro no servidor.' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Câmera não encontrada.' });
        }

        const del = 'DELETE FROM cameras WHERE id = ?';
        db.query(del, [camId], err => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao excluir câmera.' });
            }
            res.json({ msg: 'Câmera excluída com sucesso.' });
        });
    });
});

router.patch('/reorder', (req, res) => {
    const userId = req.user.id;
    const { order } = req.body;

    if (!Array.isArray(order)) {
        return res.status(400).json({ error: 'Ordem inválida.' });
    }

    const promises = order.map(({ id, order: newOrder }) => {
        return new Promise((resolve, reject) => {
            db.query(
                'UPDATE cameras SET display_order = ? WHERE id = ? AND user_id = ?',
                [newOrder, id, userId],
                (err) => (err ? reject(err) : resolve())
            );
        });
    });

    Promise.all(promises)
        .then(() => res.json({ msg: 'Ordem atualizada.' }))
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Erro ao atualizar ordem.' });
        });
});

module.exports = router;