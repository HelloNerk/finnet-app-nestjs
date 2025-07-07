import { MetodoAmortizacion } from "src/common/enums/amortizacion.enum";
import { Capitalizacion } from "src/common/enums/capitalizacion.enum";
import { FrecuenciaPago } from "src/common/enums/frecuenciaPago.enum";
import { Moneda } from "src/common/enums/moneda.enum";
import { PlazoGracia } from "src/common/enums/plazoGracia.enum";
import { TipoTasa } from "src/common/enums/tipoTasa.enum";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Bono {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, user => user.bonos, { eager: true, onDelete: 'CASCADE' })
    user: User;

    @Column({length: 100})
    nombre: string;

    @Column({length: 500, nullable: true})
    descripcion: string;

    @Column({type: 'enum', default: Moneda.USD, enum: Moneda})
    moneda: Moneda;

    @Column({type: 'decimal', precision: 10, scale: 5})
    valorNominal: number;

    @Column({type: 'decimal', precision: 10, scale: 5})
    valorComercial: number;

    @Column({type: 'decimal', precision: 10, scale: 5})
    tasaCupon: number;

    @Column({type:'enum', enum: TipoTasa})
    tipoTasa: TipoTasa;

    @Column({type:'enum', enum: Capitalizacion, nullable: true})
    capitalizacion: Capitalizacion;

    @Column({type:'enum', enum: FrecuenciaPago})
    frecuenciaPago: FrecuenciaPago;

    @Column()
    plazoAnios: number;

    @Column({type: 'enum', default: MetodoAmortizacion.FRANCES, enum: MetodoAmortizacion})
    metodoAmortizacion: MetodoAmortizacion;

    @Column({type: 'decimal', precision: 10, scale: 5})
    tasaMercado: number;

    @Column({type: 'decimal', precision: 10, scale: 5})
    primaRedencion: number;

    @Column({type: 'decimal', precision: 10, scale: 5})
    estructuracion: number;

    @Column({type: 'decimal', precision: 10, scale: 5})
    colocacion: number;

    @Column({type: 'decimal', precision: 10, scale: 5})
    flotacion: number;
    
    @Column({type: 'decimal', precision: 10, scale: 5})
    cavali: number;

    @Column({type: 'enum', default: PlazoGracia.NINGUNO, enum: PlazoGracia})
    plazoGracia: PlazoGracia;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    fechaCreacion: Date;

}
