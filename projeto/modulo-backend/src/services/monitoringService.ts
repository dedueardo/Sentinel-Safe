import { CameraService } from "./cameraService";
import { Camera } from "../entities/camera";

type BroadcastMessage = {
    type: string;
    payload: any;
};

let broadcastCallback: ((message: BroadcastMessage) => void) | null = null;

export class MonitoringService {
    private cameraService = new CameraService();

    // Simula status (em um sistema real você faria uma verificação de IP ou ping)
    private checkCameraStatus(camera: Camera): "online" | "offline" {
        return Math.random() < 0.5 ? "online" : "offline";
    }

    // Função principal de verificação
    private async monitorCameras() {
        console.log("🔍 Verificando status das câmeras...");

        try {
            const cameras = await this.cameraService.list();

            for (const camera of cameras) {
                const newStatus = this.checkCameraStatus(camera);

                // adiciona campo status dinamicamente (se não existir na entidade)
                const currentStatus = (camera as any).status || "offline";

                if (currentStatus !== newStatus) {
                    // atualiza status no banco (se sua entidade já tiver esse campo)
                    await this.cameraService.update(
                        camera.id_camera,
                        camera.ip_camera,
                        camera.nome,
                        camera.modelo,
                        camera.localizacao,
                        camera.data_instalacao
                    );

                    // envia log e broadcast
                    console.log(`📸 Câmera ${camera.nome} mudou para ${newStatus}`);

                    if (broadcastCallback) {
                        broadcastCallback({
                            type: "status_update",
                            payload: {
                                id_camera: camera.id_camera,
                                status: newStatus,
                            },
                        });
                    }
                }
            }
        } catch (err) {
            console.error("Erro ao monitorar câmeras:", err);
        }
    }

    // Inicia o monitoramento
    startMonitoring(broadcast?: (message: BroadcastMessage) => void) {
        if (broadcast) broadcastCallback = broadcast;
        console.log("🚀 Serviço de monitoramento iniciado (a cada 10s)");
        setInterval(() => this.monitorCameras(), 10000);
    }
}
