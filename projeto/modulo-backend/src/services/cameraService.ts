import { AppDataSource } from "../config/data-source";
import { Camera } from "../entities/camera";
import { User } from "../entities/user";

export class CameraService {
  private repo = AppDataSource.getRepository(Camera);
  private userRepo = AppDataSource.getRepository(User);

  async create(id_user: number, ip_camera: string, nome: string, modelo: string, localizacao: string, data_instalacao: Date) {
    const user = await this.userRepo.findOne({ where: { id_user } });
    if (!user) throw new Error("Usuário não encontrado.");

    const camera = this.repo.create({ ip_camera, nome, modelo, localizacao, data_instalacao, user });
    return this.repo.save(camera);
  }

  async listByUser(id_user: number) {
    return this.repo.find({ where: { user: { id_user } }, relations: ["user"] });
  }

  async findById(id_camera: number) {
    return this.repo.findOne({ where: { id_camera }, relations: ["user"] });
  }

  async update(id_camera: number, id_user: number, ip_camera: string, nome: string, modelo: string, localizacao: string, data_instalacao: Date) {
    const camera = await this.findById(id_camera);
    if (!camera) throw new Error("Câmera não encontrada.");
    if (camera.user.id_user !== id_user) throw new Error("Sem permissão.");

    Object.assign(camera, { ip_camera, nome, modelo, localizacao, data_instalacao });
    return this.repo.save(camera);
  }

  async delete(id_camera: number, id_user: number) {
    const camera = await this.findById(id_camera);
    if (!camera) throw new Error("Câmera não encontrada.");
    if (camera.user.id_user !== id_user) throw new Error("Sem permissão.");

    const result = await this.repo.delete(id_camera);
    return result.affected && result.affected > 0;
  }
}
