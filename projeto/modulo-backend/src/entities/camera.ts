import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("cameras")
export class Camera {
    @PrimaryGeneratedColumn()
    id_camera: number;

    @Column()
    ip_camera: string;

    @Column()
    nome: string;

    @Column()
    modelo: string;

    @Column()
    localizacao: string;

    @Column()
    data_instalacao: Date;

    @Column()
    status: string;


}
