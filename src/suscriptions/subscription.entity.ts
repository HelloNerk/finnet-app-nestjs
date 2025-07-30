import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Plan } from "./enums/plan.enum";
import { User } from "src/users/user.entity";

@Entity()
export class Subscription{

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    userId: number;

    @ManyToOne(() => User, user => user.subscriptions)
    user: User;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    startedAt: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date;

    @Column({ type: "timestamp", nullable: true })
    expiresAt: Date | null;

    @Column({type: 'enum', default: Plan.FREE, enum: Plan})
    plan: Plan;
    
    @Column({default: true})
    isActive: boolean;

}