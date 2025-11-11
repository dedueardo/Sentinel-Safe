import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user";
import { AuthHelpers } from "../config/hash";

export class UserService {
    private readonly repo = AppDataSource.getRepository(User);

    async create(name: string, email: string, password: string) {
        const existing = await this.repo.findOne({ where: { email } });
        if (existing) throw new Error("Email já cadastrado!");

        const hashedPassword = await AuthHelpers.hash(password);

        const user = this.repo.create({ name, email, password: hashedPassword });
        return this.repo.save(user);
    }

    async list() {
        return this.repo.find();
    }

    async findById(id_user: number) {
        return this.repo.findOneBy({ id_user });
    }

    async update(id_user: number, name: string, email: string, password: string) {
        const existing = await this.repo.findOne({ where: { email } });
        if (existing && existing.id_user !== id_user)
            throw new Error("Email já cadastrado!");

        const updateData: Partial<User> = { name, email };

        if (password) {
            updateData.password = await AuthHelpers.hash(password);
        }

        await this.repo.update(id_user, updateData);
        return this.findById(id_user);
    }

    async delete(id_user: number) {
        return this.repo.delete(id_user);
    }
}
