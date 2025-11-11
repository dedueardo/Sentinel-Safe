import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user";
import { AuthHelpers } from "../config/hash";
import jwt from "jsonwebtoken";

export class AuthService {
  private repo = AppDataSource.getRepository(User);

  async login(email: string, password: string) {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) throw new Error("Usuário não encontrado");

    const isValid = await AuthHelpers.verify(password, user.password);
    if (!isValid) throw new Error("Senha incorreta");

    const token = jwt.sign(
      { id_user: user.id_user, email: user.email },
      process.env.JWT_SECRET || "segredo_dev",
      { expiresIn: "1h" }
    );

    return {
      token,
      user: {
        id: user.id_user,
        name: user.name,
        email: user.email,
      },
    };
  }
}
