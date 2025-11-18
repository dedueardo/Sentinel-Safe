const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const { sanitizeString, validateEmail } = require('../utils/sanitize');

// Mapa de tentativas de login falhadas por IP/email
const loginAttempts = new Map();

// Rate limiter para endpoint de login (máx 10 tentativas em 15 min)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
    skipSuccessfulRequests: true
});

// Rate limiter para registro (máx 5 registros em 1 hora)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,
    message: { msg: 'Muitas tentativas de registro. Tente novamente mais tarde.' }
});

// ROTA DE REGISTRO
router.post('/register', registerLimiter, async (req, res) => {
    let { name, email, password } = req.body;

    // Sanitização
    name = sanitizeString(name);
    email = sanitizeString(email);

    // Validações
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Email inválido.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email já cadastrado.' });
                }
                console.error(err);
                return res.status(500).json({ error: 'Erro ao criar usuário.' });
            }
            res.status(201).json({ msg: 'Usuário criado com sucesso!' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

// ROTA DE LOGIN com proteção anti-brute force
router.post('/login', loginLimiter, (req, res) => {
    let { email, password } = req.body;

    // Sanitização
    email = sanitizeString(email);

    const attemptKey = `${email}|${req.ip}`;
    const attemptData = loginAttempts.get(attemptKey) || {
        count: 0,
        lastAttempt: 0,
        blockedUntil: 0
    };

    // Verificar se está bloqueado temporariamente
    if (attemptData.blockedUntil > Date.now()) {
        const waitTime = Math.ceil((attemptData.blockedUntil - Date.now()) / 1000);
        return res.status(429).json({
            msg: `Conta temporariamente bloqueada. Aguarde ${waitTime} segundos.`
        });
    }

    // Delay progressivo baseado em tentativas anteriores
    const baseDelay = Math.min(attemptData.count * 500, 5000); // máx 5s
    if (baseDelay > 0) {
        const timeSinceLastAttempt = Date.now() - attemptData.lastAttempt;
        if (timeSinceLastAttempt < baseDelay) {
            return res.status(429).json({
                msg: 'Aguarde antes de tentar novamente.'
            });
        }
    }

    const query = 'SELECT * FROM users WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ msg: 'Erro no servidor.' });
        }

        if (results.length === 0) {
            // Incrementar tentativas falhadas
            attemptData.count++;
            attemptData.lastAttempt = Date.now();

            // Bloquear após 5 tentativas falhadas
            if (attemptData.count >= 5) {
                attemptData.blockedUntil = Date.now() + (5 * 60 * 1000); // 5 minutos
            }

            loginAttempts.set(attemptKey, attemptData);
            return res.status(400).json({ msg: 'Email ou senha inválidos.' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Incrementar tentativas falhadas
            attemptData.count++;
            attemptData.lastAttempt = Date.now();

            // Bloquear após 5 tentativas falhadas
            if (attemptData.count >= 5) {
                attemptData.blockedUntil = Date.now() + (5 * 60 * 1000); // 5 minutos
            }

            loginAttempts.set(attemptKey, attemptData);
            return res.status(400).json({ msg: 'Email ou senha inválidos.' });
        }

        // Login bem-sucedido - resetar tentativas
        loginAttempts.delete(attemptKey);

        const payload = { id: user.id, email: user.email, name: user.name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h',
            algorithm: 'HS256'
        });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
});

// ROTA PARA PEGAR DADOS DO USUÁRIO AUTENTICADO
router.get('/me', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT id, name, email FROM users WHERE id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro no servidor.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(results[0]);
    });
});

// Limpar tentativas antigas a cada hora
setInterval(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [key, data] of loginAttempts.entries()) {
        if (data.lastAttempt < oneHourAgo && data.blockedUntil < Date.now()) {
            loginAttempts.delete(key);
        }
    }
}, 60 * 60 * 1000);

module.exports = router;