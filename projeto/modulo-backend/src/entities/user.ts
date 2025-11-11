import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn()
    id_user!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;
}
