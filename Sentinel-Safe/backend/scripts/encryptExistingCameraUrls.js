require('dotenv').config();
const db = require('../config/db');
const { encrypt } = require('../utils/crypto');

function needsEncryption(value) {
    if (!value) return false;
    return /^(rtsp|http)s?:\/\//i.test(value);
}

console.log('Iniciando criptografia de URLs de câmeras...');

db.query('SELECT id, url FROM cameras', async (err, rows) => {
    if (err) {
        console.error('Erro ao ler câmeras:', err);
        process.exit(1);
    }
    const targets = rows.filter(r => needsEncryption(r.url));
    console.log(`Encontradas ${targets.length} URLs para criptografar.`);

    const ops = targets.map(r => new Promise((resolve, reject) => {
        try {
            const enc = encrypt(r.url);
            db.query('UPDATE cameras SET url = ? WHERE id = ?', [enc, r.id], e => {
                if (e) return reject(e);
                resolve();
            });
        } catch (e) {
            reject(e);
        }
    }));

    try {
        await Promise.all(ops);
        console.log('Criptografia concluída com sucesso.');
    } catch (e) {
        console.error('Falha durante atualização:', e);
    } finally {
        process.exit(0);
    }
});
