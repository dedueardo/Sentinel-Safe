const express = require('express');
const router = express.Router();
const db = require('../config/db');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { pipeline } = require('stream');
const jwt = require('jsonwebtoken');
const { decrypt } = require('../utils/crypto');

// REMOVER router.use(authMiddleware); para permitir query ?auth=

const httpAgent = new http.Agent({ keepAlive: true, keepAliveMsecs: 10000, maxSockets: 128 });
const httpsAgent = new https.Agent({ keepAlive: true, keepAliveMsecs: 10000, maxSockets: 128 });

function authenticate(req, res) {
    // Tenta header Authorization primeiro
    const header = req.header('Authorization');
    let token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
    // Ou query ?auth=
    if (!token && req.query.auth) token = req.query.auth;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

router.get('/mjpeg/:id', (req, res) => {
    const user = authenticate(req, res);
    if (!user) return res.status(401).send('Não autorizado.');
    const userId = user.id;
    const camId = req.params.id;

    db.query('SELECT * FROM cameras WHERE id = ? AND user_id = ?', [camId, userId], (err, rows) => {
        if (err) return res.status(500).send('Erro no servidor.');
        if (!rows?.length) return res.status(404).send('Câmera não encontrada.');

        const camera = rows[0];
        let upstreamStr = camera.url;
        try { upstreamStr = decrypt(upstreamStr); } catch { }
        const upstreamUrl = new URL(upstreamStr);
        const isHttps = upstreamUrl.protocol === 'https:';

        const options = {
            protocol: upstreamUrl.protocol,
            hostname: upstreamUrl.hostname,
            port: upstreamUrl.port || (isHttps ? 443 : 80),
            path: upstreamUrl.pathname + upstreamUrl.search,
            method: 'GET',
            headers: {
                Accept: 'multipart/x-mixed-replace',
                Connection: 'keep-alive',
                'User-Agent': 'SentinelProxy/1.0',
            },
            agent: isHttps ? httpsAgent : httpAgent,
            timeout: 10000,
        };

        if (camera.username || camera.password) {
            const auth = Buffer.from(`${camera.username || ''}:${camera.password || ''}`).toString('base64');
            options.headers.Authorization = `Basic ${auth}`;
        }

        const client = isHttps ? https : http;
        const upstreamReq = client.request(options, (upstreamRes) => {
            res.setHeader('X-Accel-Buffering', 'no');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            const contentType = upstreamRes.headers['content-type'] || 'multipart/x-mixed-replace;boundary=frame';
            res.writeHead(200, { 'Content-Type': contentType, Connection: 'keep-alive' });
            res.flushHeaders?.();
            res.socket?.setNoDelay(true);
            upstreamRes.socket?.setNoDelay(true);

            pipeline(upstreamRes, res, (e) => {
                if (e && !res.headersSent) res.status(502).end();
            });
        });

        upstreamReq.on('timeout', () => upstreamReq.destroy(new Error('timeout')));
        upstreamReq.on('error', () => {
            if (!res.headersSent) res.status(502).send('Erro no upstream MJPEG');
            else res.end();
        });
        upstreamReq.end();
    });
});

module.exports = router;