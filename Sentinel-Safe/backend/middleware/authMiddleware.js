const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Autorização ausente.' });
    }
    const tokenReal = header.slice(7);
    try {
        const decoded = jwt.verify(tokenReal, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Token inválido ou expirado.' });
    }
};