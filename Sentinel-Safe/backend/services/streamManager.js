const { spawn } = require('child_process');
const WebSocket = require('ws');
const http = require('http');

// ✅ CORRIGIDO - Import correto do módulo crypto
const { decrypt } = require('../utils/crypto');

// Load tuning parameters from environment with sensible defaults
const BASE_PORT = parseInt(process.env.STREAM_BASE_PORT || '3100', 10);
const STREAM_PROBESIZE = process.env.STREAM_PROBESIZE || '20000000';
const STREAM_ANALYZE_DURATION = process.env.STREAM_ANALYZE_DURATION || '5000000';
const STREAM_OUTPUT_CODEC = process.env.STREAM_OUTPUT_CODEC || 'copy';
const STREAM_OUTPUT_RESOLUTION = '352x240';
const STREAM_OUTPUT_BITRATE = '1200k';
const RESTART_DELAY_MS = parseInt(process.env.STREAM_RESTART_DELAY_MS || '3000', 10);

// Log config on startup
console.log('📡 RTSP Stream Configuration (Direct FFmpeg):');
console.log(`   Probe: ${STREAM_PROBESIZE}, Analyze: ${STREAM_ANALYZE_DURATION}`);
console.log(`   Codec: ${STREAM_OUTPUT_CODEC}, Bitrate: ${STREAM_OUTPUT_BITRATE}`);
console.log(`   Delay: ${RESTART_DELAY_MS}ms (sem limite de tentativas)`);

const streamsByCameraId = new Map();
let nextPort = BASE_PORT;

function getClientAddress(req) {
    const wsProto = req.headers['x-forwarded-proto'] === 'https' ? 'wss' : 'ws';
    return { hostname: 'localhost', wsProto };
}

function createFFmpegProcess(rtspUrl, codec) {
    // ✅ Melhorar o log para não exibir a senha completa
    const safUrl = rtspUrl.replace(/([^:]+):([^@]+)@/, '$1:***@');
    console.log(`[ffmpeg] Conectando a: ${safUrl}`);

    const inputArgs = [
        '-rtsp_transport', 'tcp',
        '-probesize', STREAM_PROBESIZE,
        '-analyzeduration', STREAM_ANALYZE_DURATION,
        '-fflags', '+genpts+discardcorrupt',
        '-flags', 'low_delay',
        '-i', rtspUrl
    ];

    const outputArgs = [
        '-f', 'mpegts',
        '-codec:v', 'mpeg1video',
        '-q:v', '5',
        '-r', '30',
        '-b:v', '800k',
        '-an',
        '-'
    ];

    return spawn('ffmpeg', [...inputArgs, ...outputArgs], {
        stdio: ['ignore', 'pipe', 'pipe']
    });
}

function startStream(camera, port, attempt = 1, codec = STREAM_OUTPUT_CODEC) {
    console.log(`🎬 Starting stream cam:${camera.id} (${camera.name}) on port ${port} (tentativa #${attempt})`);

    let ffmpegProcess = null;
    let wsServer = null;
    const clients = new Set();
    let isClosing = false;

    // Create HTTP server for WebSocket with error handling
    const server = http.createServer();
    wsServer = new WebSocket.Server({ server });

    wsServer.on('connection', (ws, req) => {
        console.log(`[ws cam:${camera.id}] 🟢 Client connected from ${req.socket.remoteAddress}`);
        clients.add(ws);

        ws.on('close', () => {
            console.log(`[ws cam:${camera.id}] 🔴 Client disconnected`);
            clients.delete(ws);
        });

        ws.on('error', err => {
            console.error(`[ws cam:${camera.id}] ⚠️ WebSocket error: ${err.message}`);
            clients.delete(ws);
        });
    });

    // ✅ MELHORADO: Lidar com erro de porta já em uso
    server.listen(port, '0.0.0.0', () => {
        console.log(`✅ WebSocket server listening on port ${port}`);
    });

    server.on('error', err => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Porta ${port} já está em uso! Tentando próxima porta...`);
            handleStreamError();
            return;
        }
        console.error(`❌ Server error on port ${port}: ${err.message}`);
        handleStreamError();
    });

    // ✅ CRÍTICO: Descriptografar a URL antes de usar
    let decryptedUrl;
    try {
        decryptedUrl = decrypt(camera.url);
        console.log(`🔓 URL descriptografada com sucesso`);
    } catch (err) {
        console.error(`❌ Erro ao descriptografar URL da câmera ${camera.id}: ${err.message}`);
        handleStreamError();
        return;
    }

    // Start ffmpeg process
    try {
        ffmpegProcess = createFFmpegProcess(decryptedUrl, codec);
        let dataCount = 0;
        let lastLogTime = Date.now();

        ffmpegProcess.stdout.on('data', chunk => {
            dataCount++;
            if (dataCount % 10 === 0 || Date.now() - lastLogTime > 5000) {
                console.log(`[ffmpeg cam:${camera.id}] ✅ Data flowing (${dataCount} chunks, ${chunk.length} bytes), ${clients.size} clients connected`);
                lastLogTime = Date.now();
            }

            if (clients.size > 0) {
                let sentCount = 0;
                for (const client of clients) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(chunk, { binary: true }, err => {
                            if (err && err.code !== 'ERR_WEBSOCKET_NOT_OPEN') {
                                console.error(`[cam:${camera.id}] Send error:`, err.message);
                            }
                        });
                        sentCount++;
                    }
                }
                if (sentCount === 0 && clients.size > 0) {
                    console.warn(`[ffmpeg cam:${camera.id}] ⚠️ ${clients.size} clients connected but none are OPEN`);
                }
            }
        });

        ffmpegProcess.stderr.on('data', data => {
            const msg = data.toString();
            if (/error|failed|invalid|decode|connection|refused|timeout/i.test(msg) && !/deprecated/i.test(msg)) {
                console.error(`[ffmpeg cam:${camera.id}] ⚠️ ${msg.trim()}`);
            }
        });

        ffmpegProcess.on('error', err => {
            console.error(`❌ FFmpeg spawn error for cam:${camera.id}: ${err.message}`);
            handleStreamError();
        });

        ffmpegProcess.on('exit', (code, signal) => {
            if (!isClosing) {
                if (code === 0 || code === 255) {
                    console.warn(`⚠️ FFmpeg normal exit para cam:${camera.id} (código: ${code}). Reiniciando...`);
                    setTimeout(() => {
                        if (!isClosing && streamsByCameraId.has(camera.id)) {
                            const restarted = startStream(camera, port, attempt + 1, 'copy');
                            streamsByCameraId.set(camera.id, restarted);
                        }
                    }, 1000);
                } else {
                    console.error(`❌ FFmpeg exited for cam:${camera.id} (code: ${code}, signal: ${signal})`);
                    handleStreamError();
                }
            }
        });

    } catch (err) {
        console.error(`❌ Failed to spawn ffmpeg for cam:${camera.id}: ${err.message}`);
        handleStreamError();
    }

    function handleStreamError() {
        if (isClosing) return;
        isClosing = true;

        for (const client of clients) {
            try { client.close(); } catch { }
        }
        clients.clear();

        if (ffmpegProcess && !ffmpegProcess.killed) {
            try { ffmpegProcess.kill('SIGTERM'); } catch { }
        }

        try { server.close(); } catch { }

        streamsByCameraId.delete(camera.id);

        console.log(`🔄 Reiniciando cam:${camera.id} em ${RESTART_DELAY_MS}ms (tentativa #${attempt + 1})...`);
        setTimeout(() => {
            const restarted = startStream(camera, port, attempt + 1, STREAM_OUTPUT_CODEC);
            streamsByCameraId.set(camera.id, restarted);
        }, RESTART_DELAY_MS);
    }

    return {
        port, server, wsServer, clients, ffmpegProcess, stop: () => {
            isClosing = true;
            for (const client of clients) {
                try { client.close(); } catch { }
            }
            if (ffmpegProcess && !ffmpegProcess.killed) {
                try { ffmpegProcess.kill('SIGTERM'); } catch { }
            }
            try { server.close(); } catch { }
        }
    };
}

function ensureStreamForCamera(camera, req) {
    if (streamsByCameraId.has(camera.id)) {
        const { port } = streamsByCameraId.get(camera.id);
        const { hostname, wsProto } = getClientAddress(req);
        return `${wsProto}://${hostname}:${port}`;
    }
    const port = nextPort++;
    const streamInfo = startStream(camera, port);
    streamsByCameraId.set(camera.id, streamInfo);
    const { hostname, wsProto } = getClientAddress(req);
    return `${wsProto}://${hostname}:${port}`;
}

function stopStream(cameraId) {
    const streamInfo = streamsByCameraId.get(cameraId);
    if (streamInfo) {
        console.log(`⏹️ Stopping stream for camera ${cameraId}`);
        try { streamInfo.stop(); } catch (e) {
            console.error(`Error stopping stream ${cameraId}:`, e.message);
        }
        streamsByCameraId.delete(cameraId);
    }
}

function stopAll() {
    console.log(`⏹️ Stopping all ${streamsByCameraId.size} active streams...`);
    for (const [id, streamInfo] of streamsByCameraId) {
        try { streamInfo.stop(); } catch { }
        streamsByCameraId.delete(id);
    }
}

function getActiveStreams() {
    return Array.from(streamsByCameraId.entries()).map(([id, streamInfo]) => ({
        cameraId: id,
        wsPort: streamInfo.port,
        wsUrl: `ws://localhost:${streamInfo.port}`
    }));
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

module.exports = { ensureStreamForCamera, stopStream, stopAll, getActiveStreams };