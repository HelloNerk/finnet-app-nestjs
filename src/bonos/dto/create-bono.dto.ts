import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  Min,
  Max,
  IsDate,
} from 'class-validator';
import { MetodoAmortizacion } from 'src/common/enums/amortizacion.enum';
import { Capitalizacion } from 'src/common/enums/capitalizacion.enum';
import { FrecuenciaPago } from 'src/common/enums/frecuenciaPago.enum';
import { Moneda } from 'src/common/enums/moneda.enum';
import { PlazoGracia } from 'src/common/enums/plazoGracia.enum';
import { TipoTasa } from 'src/common/enums/tipoTasa.enum';

export class CreateBonoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(1)
  userId: number; // Este campo se asigna automáticamente desde el token JWT

  @IsNumber()
  @Min(0)
  valorNominal: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorComercial?: number;

  @IsDate()
  @Type(() => Date)
  fechaEmision: Date;

  @IsDate()
  @Type(() => Date)
  fechaVencimiento: Date;

  @IsNumber()
  @Min(0)
  tasaCupon: number;

  @IsEnum(TipoTasa)
  tipoTasaCupon: TipoTasa;

  @IsEnum(Capitalizacion)
  @IsOptional() // Solo si la tasa es nominal
  capitalizacionCupon?: Capitalizacion;

  @IsEnum(TipoTasa)
  @IsOptional()
  tipoTasaMercado?: TipoTasa;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tasaMercado?: number;

  @IsEnum(Capitalizacion)
  @IsOptional() // Solo si la tasa es nominal
  capitalizacionMercado?: Capitalizacion;

  @IsEnum(FrecuenciaPago)
  frecuenciaPago: FrecuenciaPago;

  @IsNumber()
  @Min(0)
  comision: number;

  @IsNumber()
  @Min(0)
  gastosAdministrativos: number;

  @IsEnum(PlazoGracia)
  plazoGracia: PlazoGracia;

  @IsNumber()
  @Min(0)
  @IsOptional() // Solo si hay plazo de gracia
  duracionPlazoGracia?: number;

  @IsEnum(Moneda)
  moneda: Moneda;

  @IsEnum(MetodoAmortizacion)
  @IsOptional()
  metodoAmortizacion?: MetodoAmortizacion;

  @IsNumber()
  @Min(0)
  @IsOptional()
  primaRedencion?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estructuracion?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  colocacion?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  flotacion?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cavali?: number;


}
