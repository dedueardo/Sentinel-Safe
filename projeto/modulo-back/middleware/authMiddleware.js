const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Pega o token do header da requisição
    const token = req.header('Authorization');

    // Verifica se não há token
    if (!token) {
        return res.status(401).json({ msg: 'Nenhum token, autorização negada.' });
    }

    try {
        // O token geralmente vem no formato "Bearer TOKEN_REAL". Vamos extrair apenas o token.
        const tokenReal = token.split(' ')[1];

        // Verifica o token
        const decoded = jwt.verify(tokenReal, process.env.JWT_SECRET);

        // Adiciona o usuário do payload do token ao objeto da requisição
        req.user = decoded;
        next(); // Passa para a próxima função (a rota que está sendo protegida)
    } catch (err) {
        res.status(401).json({ msg: 'Token não é válido.' });
    }
};