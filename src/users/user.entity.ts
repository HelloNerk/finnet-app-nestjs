import { Bono } from "src/bonos/bono.entity";
import { Role } from "src/common/enums/role.enum";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name: string;

    @Column()
    fullName: string;

    @Column({unique: true, nullable: false})
    email: string;

    @Column({nullable: false, select: false})
    password: string;

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