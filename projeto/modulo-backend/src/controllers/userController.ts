import { Request, Response } from "express";
import { UserService } from "../services/userService";

const service = new UserService();

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const user = await service.create(name, email, password);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req: Request, res: Response) {
    const users = await service.list();
    res.json(users);
  }

  async findById(req: Request, res: Response) {
    const id_user = Number.parseInt(req.params.id);
    const user = await service.findById(id_user);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado!" });
    }
    res.json(user);
  } 

  async update(req: Request, res: Response) {
    try {
      const id_user = Number.parseInt(req.params.id);
      const { name, email, password } = req.body;
      const user = await service.update(id_user, name, email, password);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado!" });
      }
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
  
  async delete(req: Request, res: Response) {
    const id_user = Number.parseInt(req.params.id);
    const result = await service.delete(id_user);
    if (result.affected === 0) {
      return res.status(404).json({ error: "Usuário não encontrado!" });
    } 
    res.status(204).send();
  }
}
