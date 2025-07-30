import { Bono } from "src/bonos/bono.entity";
import { Role } from "src/common/enums/role.enum";
import { SectorEmpresarial } from "src/common/enums/sectorEmpresarial";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({unique: true, nullable: false})
    email: string;

    @Column({nullable: false, select: false})
    password: string;

    @Column({unique:true, nullable: false, length: 11})
    ruc: string;

    @Column({nullable: false})
    razonSocial: string;

    @Column({nullable: false})
    direccion: string;

    @Column({type:'enum', enum: SectorEmpresarial, default: SectorEmpresarial.OTROS})
    sectorEmpresarial: SectorEmpresarial;

    @Column({type: 'enum', default: Role.USER, enum: Role})
    role: Role;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(()=>Bono, bono => bono.user)
    bonos: Bono[];
}