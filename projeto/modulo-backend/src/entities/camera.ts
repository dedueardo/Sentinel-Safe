import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user";

@Entity("camera")
export class Camera {
    @PrimaryGeneratedColumn()
    id_camera!: number;

    @Column()
    ip_camera!: string;

    @Column()
    nome!: string;

    @Column()
    modelo!: string;

    @Column()
    localizacao!: string;

    @Column()
    data_instalacao!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: "id_user" })
    user!: User;
}
