import { MetodoAmortizacion } from "src/common/enums/amortizacion.enum";
import { Capitalizacion } from "src/common/enums/capitalizacion.enum";
import { FrecuenciaPago } from "src/common/enums/frecuenciaPago.enum";
import { Moneda } from "src/common/enums/moneda.enum";
import { PlazoGracia } from "src/common/enums/plazoGracia.enum";
import { TipoTasa } from "src/common/enums/tipoTasa.enum";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({type: 'decimal', precision: 10, scale: 5})
    valorNominal: number;

    @Column({type: 'decimal', precision: 10, scale: 5, nullable: true})
    valorComercial: number;

    @Column({type: 'date'})
    fechaEmision: Date;

    @Column({type: 'date'})
    fechaVencimiento: Date;

    @Column({type: 'decimal', precision: 10, scale: 5})
    tasaCupon: number;

    @Column({type: 'enum', enum: TipoTasa})
    tipoTasaCupon: TipoTasa;

    @Column({type:'enum', enum: Capitalizacion, nullable: true})
    capitalizacionCupon: Capitalizacion;

    @Column({type:'enum', enum: TipoTasa, nullable: true})
    tipoTasaMercado: TipoTasa;

    @Column({type: 'decimal', precision: 10, scale: 5, nullable: true})
    tasaMercado: number;

    @Column({type:'enum', enum: Capitalizacion, nullable: true})
    capitalizacionMercado: Capitalizacion;

    @Column({type:'enum', enum: FrecuenciaPago})
    frecuenciaPago: FrecuenciaPago;

    @Column({type: 'decimal', precision: 10, scale: 5})
    comision: number;

    @Column({type: 'decimal', precision: 10, scale: 5})
    gastosAdministrativos: number;

    @Column({type: 'enum', default: PlazoGracia.NINGUNO, enum: PlazoGracia})
    plazoGracia: PlazoGracia;

    @Column({type: 'integer', nullable: true})
    duracionPlazoGracia: number;

    @Column({type: 'enum', default: Moneda.PEN, enum: Moneda})
    moneda: Moneda;

    @Column({type: 'enum', default: MetodoAmortizacion.FRANCES, enum: MetodoAmortizacion})
    metodoAmortizacion: MetodoAmortizacion;

    @Column({type: 'decimal', precision: 10, scale: 5, nullable: true})
    primaRedencion: number;

    @Column({type: 'decimal', precision: 10, scale: 5, nullable: true})
    estructuracion: number;

    @Column({type: 'decimal', precision: 10, scale: 5, nullable: true})
    colocacion: number;

    @Column({type: 'decimal', precision: 10, scale: 5, nullable: true})
    flotacion: number;
    
    @Column({type: 'decimal', precision: 10, scale: 5, nullable: true})
    cavali: number;
    
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    fechaCreacion: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    fechaActualizacion: Date;
}
