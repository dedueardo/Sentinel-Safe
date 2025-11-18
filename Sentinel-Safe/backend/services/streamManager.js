const Stream = require('node-rtsp-stream');

const streamsByCameraId = new Map();
const BASE_PORT = parseInt(process.env.STREAM_BASE_PORT || '3100', 10);
let nextPort = BASE_PORT;

function getClientAddress(req) {
    const hostname = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const wsProto = req.headers['x-forwarded-proto'] === 'https' ? 'wss' : 'ws';
    return { hostname: hostname.split(':')[0], wsProto };
}

function ensureStreamForCamera(camera, req) {
    if (streamsByCameraId.has(camera.id)) {
        const { port } = streamsByCameraId.get(camera.id);
        const { hostname, wsProto } = getClientAddress(req);
        console.log(`♻️ Stream já existe p/ cam:${camera.id} -> ${wsProto}://${hostname}:${port}`);
        return `${wsProto}://${hostname}:${port}`;
    }

    const port = nextPort++;

    console.log(`🎬 Iniciando stream para câmera ${camera.id} (${camera.name})`);
    console.log(`   URL RTSP: ${camera.url}`);
    console.log(`   WS Port: ${port}`);

    const stream = new Stream({
        name: camera.name,
        streamUrl: camera.url,
        wsPort: port,
        inputOptions: [
            '-rtsp_transport', 'tcp',
            '-stimeout', '5000000',
            '-fflags', 'nobuffer',
            '-flags', 'low_delay',
            '-max_delay', '500000',
            '-probesize', '32',
            '-analyzeduration', '0'
        ],
        ffmpegOptions: {
            '-stats': '',
            '-f': 'mpegts',
            '-codec:v': 'mpeg1video',
            '-q:v': '5',
            '-r': '25',              // 👈 CORRIGIDO: 25 fps (compatível com MPEG-1)
            '-s': '352x240',
            '-bf': '0',
            '-an': '',
            '-muxdelay': '0.001',
            '-muxpreload': '0.001'
        }
    });

    stream.on('ffmpegStderr', (data) => {
        const msg = data.toString();
        if (msg.includes('error') || msg.includes('Error') || msg.includes('failed')) {
            console.error(`[ffmpeg cam:${camera.id}] ❌ ${msg}`);
        }
    });

    if (stream.wsServer) {
        stream.wsServer.on('connection', (ws, req) => {
            const clientIp = req.socket.remoteAddress;
            console.log(`[ws cam:${camera.id}] 🟢 Cliente conectado: ${clientIp}`);

            ws.on('close', () => {
                console.log(`[ws cam:${camera.id}] 🔴 Cliente desconectado: ${clientIp}`);
            });
        });

        stream.wsServer.on('error', (e) => {
            console.error(`[ws cam:${camera.id}] ❌ Erro no WebSocket:`, e.message);
        });
    }

    stream.on('exitWithError', (err) => {
        console.error(`❌ RTSP stream ${camera.id} parou com erro:`, err);
        try { stream.stop(); } catch { }
        streamsByCameraId.delete(camera.id);
    });

    streamsByCameraId.set(camera.id, { stream, port });

    const { hostname, wsProto } = getClientAddress(req);
    console.log(`✅ RTSP iniciado p/ cam:${camera.id} -> ${wsProto}://${hostname}:${port}`);
    return `${wsProto}://${hostname}:${port}`;
}

function stopStream(cameraId) {
    const entry = streamsByCameraId.get(cameraId);
    if (entry) {
        console.log(`⏹️ Parando stream da câmera ${cameraId}`);
        try { entry.stream.stop(); } catch (e) {
            console.error(`Erro ao parar stream ${cameraId}:`, e.message);
        }
        streamsByCameraId.delete(cameraId);
    }
}

function stopAll() {
    console.log(`⏹️ Parando todos os ${streamsByCameraId.size} streams ativos...`);
    for (const [id, entry] of streamsByCameraId) {
        try { entry.stream.stop(); } catch { }
        streamsByCameraId.delete(id);
    }
}

function getActiveStreams() {
    return Array.from(streamsByCameraId.entries()).map(([id, { port }]) => ({
        cameraId: id,
        wsPort: port,
        wsUrl: `ws://localhost:${port}`
    }));
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

module.exports = { ensureStreamForCamera, stopStream, stopAll, getActiveStreams };