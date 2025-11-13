const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ROTA DE REGISTRO DE USUÁRIO
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Verifica se o email já existe
    db.query('SELECT email FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).send('Erro no servidor');
        if (results.length > 0) {
            return res.status(400).send('Este email já está em uso.');
        }

        // Cria o hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insere o novo usuário no banco de dados
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) return res.status(500).send('Erro ao registrar o usuário.');
            res.status(201).send('Usuário registrado com sucesso!');
        });
    });
});

// ROTA DE LOGIN DE USUÁRIO
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).send('Erro no servidor.');
        if (results.length === 0) {
            return res.status(400).send('Email ou senha inválidos.');
        }

        const user = results[0];

        // Compara a senha enviada com o hash no banco
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Email ou senha inválidos.');
        }

        // Cria e assina o token JWT
        const payload = { id: user.id, email: user.email };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        // Remover a senha do objeto do usuário antes de enviá-lo como resposta.
        delete user.password;

        // 2. Adicionar o objeto 'user' à resposta JSON.
        res.json({
            message: 'Login bem-sucedido!',
            token: token,
            user: user
        });
    });
});

module.exports = router;