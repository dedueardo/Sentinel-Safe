// backend/routes/users.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const { sanitizeString, validateEmail } = require('../utils/sanitize');

// ========================================================
// NOVA ROTA: Registrar um novo usuário (Cadastro)
// Rota: POST /api/users/
// ========================================================
router.post('/', async (req, res) => {
    let { name, email, password } = req.body;
    name = sanitizeString(name);
    email = sanitizeString(email);
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Email inválido.' });
    }

    // Validação simples
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
    }

    try {
        // Verificar se o usuário já existe
        const userExistsQuery = 'SELECT email FROM users WHERE email = ?';
        db.query(userExistsQuery, [email], async (err, results) => {
            if (err) {
                console.error("Erro no banco de dados:", err);
                return res.status(500).json({ error: 'Erro no servidor.' });
            }

            if (results.length > 0) {
                return res.status(409).json({ error: 'Este email já está em uso.' }); // 409 Conflict
            }

            // Criptografar a senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Inserir o novo usuário no banco de dados
            const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Erro ao inserir usuário:", err);
                    return res.status(500).json({ error: 'Erro ao criar usuário.' });
                }

                // Enviar resposta de sucesso
                res.status(201).json({ message: 'Usuário cadastrado com sucesso!' }); // 201 Created
            });
        });
    } catch (error) {
        console.error("Erro inesperado:", error);
        res.status(500).json({ error: 'Ocorreu um erro inesperado.' });
    }
});

// ========================================================
// ROTA EXISTENTE: Obter dados do perfil do usuário logado
// Rota: GET /api/users/profile
// ========================================================
router.get('/profile', authMiddleware, (req, res) => {
    const userId = req.user.id;

    const query = 'SELECT id, name, email, created_at FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).send('Erro no servidor.');
        }
        if (results.length === 0) {
            return res.status(404).send('Usuário não encontrado.');
        }

        res.json(results[0]);
    });
});

module.exports = router;