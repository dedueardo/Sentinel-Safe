import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { CameraService } from "../services/cameraService";

const service = new CameraService();

export class CameraController {
    async create(req: AuthRequest, res: Response) {
        try {
            const id_user = req.user!.id_user;
            const { ip_camera, nome, modelo, localizacao, data_instalacao } = req.body;

            const camera = await service.create(
                id_user,
                ip_camera,
                nome,
                modelo,
                localizacao,
                data_instalacao ? new Date(data_instalacao) : new Date()
            );

            return res.status(201).json(camera);
        } catch (err: any) {
            console.error("Erro ao criar câmera:", err);
            return res.status(400).json({ error: err.message });
        }
    }

    async list(req: AuthRequest, res: Response) {
        try {
            const id_user = req.user!.id_user;
            const cameras = await service.listByUser(id_user);
            return res.json(cameras);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    }

    async findById(req: AuthRequest, res: Response) {
        try {
            const id_user = req.user!.id_user;
            const id_camera = Number(req.params.id);

            const camera = await service.findById(id_camera);
            if (!camera) return res.status(404).json({ error: "Câmera não encontrada!" });

            if (camera.user.id_user !== id_user)
                return res.status(403).json({ error: "Acesso negado!" });

            return res.json(camera);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    }

    async update(req: AuthRequest, res: Response) {
        try {
            const id_user = req.user!.id_user;
            const id_camera = Number(req.params.id);
            const { ip_camera, nome, modelo, localizacao, data_instalacao } = req.body;

            const updated = await service.update(
                id_camera,
                id_user,
                ip_camera,
                nome,
                modelo,
                localizacao,
                data_instalacao ? new Date(data_instalacao) : new Date()
            );

            return res.json(updated);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        try {
            const id_user = req.user!.id_user;
            const id_camera = Number(req.params.id);

            const deleted = await service.delete(id_camera, id_user);
            if (!deleted)
                return res.status(404).json({ error: "Câmera não encontrada ou sem permissão." });

            return res.status(204).send();
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    }
}
