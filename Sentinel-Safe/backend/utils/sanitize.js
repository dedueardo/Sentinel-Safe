const xss = require('xss');
const validator = require('validator');

/**
 * Sanitiza uma string contra XSS
 */
function sanitizeString(value) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    return xss(trimmed, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'style']
    });
}

/**
 * Sanitiza dados de entrada de câmera
 */
function sanitizeCameraInput(body) {
    return {
        name: sanitizeString(body.name || ''),
        url: sanitizeString(body.url || ''),
        streamType: sanitizeString(body.streamType || ''),
        username: sanitizeString(body.username || ''),
        password: body.password || '', // Senha não sanitizar (pode ter caracteres especiais)
        location: sanitizeString(body.location || ''),
        description: sanitizeString(body.description || '')
    };
}

/**
 * Valida formato de email
 */
function validateEmail(email) {
    return validator.isEmail(email || '');
}

/**
 * Valida URL
 */
function validateURL(url) {
    return validator.isURL(url || '', {
        protocols: ['http', 'https', 'rtsp'],
        require_protocol: true
    });
}

module.exports = {
    sanitizeString,
    sanitizeCameraInput,
    validateEmail,
    validateURL
};