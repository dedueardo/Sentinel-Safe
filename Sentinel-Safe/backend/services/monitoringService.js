const db = require('../config/db');
const { spawn } = require('child_process');
const { decrypt } = require('../utils/crypto'); // ✅ ADICIONE ISTO

let broadcastCallback = null;

// Função para verificar o status de uma câmera
function checkCameraStatus(camera) {
    return new Promise((resolve) => {
        // ✅ Descriptografar a URL ANTES de usar
        let decryptedUrl;
        try {
            decryptedUrl = decrypt(camera.url);
        } catch (err) {
            console.error(`❌ Erro ao descriptografar URL da câmera ${camera.id}: ${err.message}`);
            resolve('offline');
            return;
        }

        const timeout = setTimeout(() => {
            console.warn(`⏱️ Timeout ao verificar câmera ${camera.id}`);
            resolve('offline');
        }, 5000);

        const process = spawn('ffprobe', [
            '-v', 'error',
            '-rtsp_transport', 'tcp',
            '-i', decryptedUrl, // ✅ USE A URL DESCRIPTOGRAFADA
            '-show_entries', 'stream=codec_type',
            '-select_streams', 'v:0',
        ]);

        let hasOutput = false;
        process.stdout.on('data', () => {
            hasOutput = true;
        });

        process.on('close', (code) => {
            clearTimeout(timeout);
            const status = hasOutput && code === 0 ? 'online' : 'offline';
            console.log(`✅ Camera ${camera.id} status check: ${status}`);
            resolve(status);
        });

        process.on('error', (err) => {
            console.error(`❌ FFprobe error for cam ${camera.id}: ${err.message}`);
            clearTimeout(timeout);
            resolve('offline');
        });
    });
}

// A função principal que roda periodicamente
async function monitorCameras() {
    console.log('Verificando status das câmeras...');

    db.query('SELECT * FROM cameras', async (err, cameras) => {
        if (err) {
            console.error('Erro ao buscar câmeras para monitoramento:', err);
            return;
        }

        for (const camera of cameras) {
            const newStatus = await checkCameraStatus(camera);

            // Se o status mudou, atualiza no banco e notifica os clientes
            if (camera.status !== newStatus) {
                db.query('UPDATE cameras SET status = ? WHERE id = ?', [newStatus, camera.id], (err) => {
                    if (err) {
                        console.error(`Erro ao atualizar status da câmera ${camera.id}:`, err);
                        return;
                    }

                    console.log(`✅ Status da câmera ${camera.name} (ID: ${camera.id}) mudou para ${newStatus}`);

                    // Se o callback de broadcast estiver registrado, use-o!
                    if (broadcastCallback) {
                        broadcastCallback({
                            type: 'status_update',
                            payload: {
                                id: camera.id,
                                status: newStatus,
                            },
                        });
                    }
                });
            }
        }
    });
}

// Função para iniciar o serviço
function startMonitoring(broadcast) {
    broadcastCallback = broadcast;
    console.log('🟢 Camera monitoring started');

    // Verifica a cada 30 segundos
    setInterval(monitorCameras, 30000);

    // Faz a primeira verificação imediatamente
    monitorCameras();
}

module.exports = { startMonitoring };