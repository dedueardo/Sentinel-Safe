const Stream = require('node-rtsp-stream');

const streamsByCameraId = new Map();
const BASE_PORT = parseInt(process.env.STREAM_BASE_PORT || '3100', 10);
let nextPort = BASE_PORT;

function getClientAddress(req) {
    const origin = req.headers.origin;
    let hostname = 'localhost';
    let wsProto = 'ws';
    if (origin) {
        try {
            const u = new URL(origin);
            hostname = u.hostname;
            wsProto = u.protocol === 'https:' ? 'wss' : 'ws';
        } catch { }
    } else {
        const hostHeader = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
        hostname = hostHeader.split(':')[0] || 'localhost';
        const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString();
        wsProto = proto === 'https' ? 'wss' : 'ws';
    }
    return { hostname, wsProto };
}

function ensureStreamForCamera(camera, req) {
    if (streamsByCameraId.has(camera.id)) {
        const { port } = streamsByCameraId.get(camera.id);
        const { hostname, wsProto } = getClientAddress(req);
        return `${wsProto}://${hostname}:${port}`;
    }

    const port = nextPort++;

    const stream = new Stream({
        name: camera.name,
        streamUrl: camera.url,
        wsPort: port,
        // flags que precisam ir ANTES do -i
        inputOptions: [
            '-rtsp_transport', 'tcp',   // tente 'udp' se tcp não funcionar
            '-stimeout', '5000000',
            '-fflags', 'nobuffer'
        ],
        // flags de saída (mpeg1 em mpegts para JSMpeg)
        ffmpegOptions: {
            '-stats': '',
            '-f': 'mpegts',
            '-codec:v': 'mpeg1video',
            '-q:v': '5',         // qualidade/bitrate
            '-r': 25,
            '-bf': 0,
            '-an': '',
            '-muxdelay': '0',
            '-muxpreload': '0'
        }
    });

    // Logs úteis para depuração
    stream.on('ffmpegStderr', (data) => {
        console.log(`[ffmpeg cam:${camera.id}] ${data.toString()}`);
    });
    if (stream.wsServer) {
        stream.wsServer.on('connection', () => {
            console.log(`[ws cam:${camera.id}] viewer conectado em ws://localhost:${port}`);
        });
        stream.wsServer.on('error', (e) => {
            console.error(`[ws cam:${camera.id}] erro`, e);
        });
    }

    stream.on('exitWithError', (err) => {
        console.error(`RTSP stream ${camera.id} parou com erro:`, err);
        try { stream.stop(); } catch { }
        streamsByCameraId.delete(camera.id);
    });

    streamsByCameraId.set(camera.id, { stream, port });

    const { hostname, wsProto } = getClientAddress(req);
    console.log(`RTSP iniciado p/ cam:${camera.id} -> ${wsProto}://${hostname}:${port} (URL RTSP: ${camera.url})`);
    return `${wsProto}://${hostname}:${port}`;
}

function stopStream(cameraId) {
    const entry = streamsByCameraId.get(cameraId);
    if (entry) {
        try { entry.stream.stop(); } catch { }
        streamsByCameraId.delete(cameraId);
    }
}

function stopAll() {
    for (const [id, entry] of streamsByCameraId) {
        try { entry.stream.stop(); } catch { }
        streamsByCameraId.delete(id);
    }
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

module.exports = { ensureStreamForCamera, stopStream, stopAll };