const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// ROTA PARA OBTER DADOS DO PERFIL DO USUÁRIO LOGADO
// Esta rota será protegida pelo nosso middleware
router.get('/profile', authMiddleware, (req, res) => {
    // O middleware de autenticação já validou o token e adicionou
    // as informações do usuário (payload) em 'req.user'.
    const userId = req.user.id;

    const query = 'SELECT id, name, email, created_at FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).send('Erro no servidor.');
        }
        if (results.length === 0) {
            return res.status(404).send('Usuário não encontrado.');
        }

        // Retorna os dados do usuário (sem a senha!)
        res.json(results[0]);
    });
});

module.exports = router;