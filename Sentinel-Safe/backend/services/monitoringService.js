// backend/services/monitoringService.js
const db = require('../config/db');

let broadcastCallback = null;

// Função para simular a verificação do status de uma câmera
function checkCameraStatus(camera) {
    // Em um cenário real, você tentaria se conectar à camera.url.
    // Aqui, vamos simular: há 50% de chance de a câmera estar online.
    return Math.random() < 0.5 ? 'online' : 'offline';
}

// A função principal que roda periodicamente
async function monitorCameras() {
    console.log('Verificando status das câmeras...');

    db.query('SELECT * FROM cameras', (err, cameras) => {
        if (err) {
            console.error('Erro ao buscar câmeras para monitoramento:', err);
            return;
        }

        cameras.forEach(camera => {
            const newStatus = checkCameraStatus(camera);

            // Se o status mudou, atualiza no banco e notifica os clientes
            if (camera.status !== newStatus) {
                db.query('UPDATE cameras SET status = ? WHERE id = ?', [newStatus, camera.id], (err) => {
                    if (err) {
                        console.error(`Erro ao atualizar status da câmera ${camera.id}:`, err);
                        return;
                    }

                    console.log(`Status da câmera ${camera.name} (ID: ${camera.id}) mudou para ${newStatus}`);

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
        });
    });
}

// Função para iniciar o serviço
function startMonitoring(broadcast) {
    broadcastCallback = broadcast; // Registra a função de broadcast do index.js
    console.log('Serviço de monitoramento de câmeras iniciado.');
    // Executa a verificação a cada 10 segundos
    setInterval(monitorCameras, 10000);
}

module.exports = { startMonitoring }; 