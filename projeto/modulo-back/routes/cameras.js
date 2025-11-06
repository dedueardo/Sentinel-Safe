const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Protege todas as rotas de câmeras
router.use(authMiddleware);

// LISTAR todas as câmeras do usuário logado
router.get('/', (req, res) => {
    // Verificação de segurança: Garante que req.user e req.user.id existem.
    if (!req.user || !req.user.id) {
        console.error("Erro de autenticação: req.user.id não encontrado no token.");
        return res.status(401).send('Acesso não autorizado. Token inválido ou corrompido.');
    }
    const userId = req.user.id;
    // --- FIM DA CORREÇÃO ---

    const query = 'SELECT * FROM cameras WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            // Adiciona um log de erro detalhado no terminal do backend
            console.error("Erro de banco de dados ao buscar câmeras:", err);
            return res.status(500).send('Erro no servidor ao processar sua requisição.');
        }
        res.json(results);
    });
});

// CRIAR uma nova câmera
router.post('/', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send('Acesso não autorizado.');
    }
    const userId = req.user.id;
    const { name, url, username, password, location, description } = req.body;
    const query = 'INSERT INTO cameras (user_id, name, url, username, password, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [userId, name, url, username, password, location, description], (err, result) => {
        if (err) {
            console.error("Erro de banco de dados ao criar câmera:", err);
            return res.status(500).send('Erro ao criar a câmera.');
        }
        res.status(201).json({ id: result.insertId, ...req.body, status: 'offline' });
    });
});

// ATUALIZAR uma câmera
router.put('/:id', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send('Acesso não autorizado.');
    }
    const userId = req.user.id;
    const cameraId = req.params.id;
    const { name, url, username, password, location, description } = req.body;
    const query = 'UPDATE cameras SET name = ?, url = ?, username = ?, password = ?, location = ?, description = ? WHERE id = ? AND user_id = ?';
    db.query(query, [name, url, username, password, location, description, cameraId, userId], (err, result) => {
        if (err) {
            console.error("Erro de banco de dados ao atualizar câmera:", err);
            return res.status(500).send('Erro ao atualizar a câmera.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Câmera não encontrada ou você não tem permissão.');
        }
        res.send('Câmera atualizada com sucesso.');
    });
});


// DELETAR uma câmera
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
        res.status(204).send(); // 204 No Content
    });
});

module.exports = router;