const crypto = require('crypto');

function getKey() {
    const b64 = process.env.CRYPTO_KEY;
    if (!b64) throw new Error('CRYPTO_KEY não configurada');
    const key = Buffer.from(b64, 'base64');
    if (key.length !== 32) throw new Error('CRYPTO_KEY deve representar 32 bytes em base64');
    return key;
}

function encrypt(plainText) {
    if (!plainText) return plainText;
    const key = getKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(payload) {
    if (!payload) return payload;
    // Se já parece uma URL (dados antigos), retorna como está
    if (/^(rtsp|http)s?:\/\//i.test(payload)) return payload;
    const key = getKey();
    const buf = Buffer.from(payload, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec.toString('utf8');
}

module.exports = { encrypt, decrypt };