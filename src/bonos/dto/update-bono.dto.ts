import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsDate,
} from 'class-validator';
import { MetodoAmortizacion } from 'src/common/enums/amortizacion.enum';
import { Capitalizacion } from 'src/common/enums/capitalizacion.enum';
import { FrecuenciaPago } from 'src/common/enums/frecuenciaPago.enum';
import { Moneda } from 'src/common/enums/moneda.enum';
import { PlazoGracia } from 'src/common/enums/plazoGracia.enum';
import { TipoTasa } from 'src/common/enums/tipoTasa.enum';

export class UpdateBonoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorNominal?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorComercial?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaEmision?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaVencimiento?: Date;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tasaCupon?: number;

  @IsEnum(TipoTasa)
  @IsOptional()
  tipoTasaCupon?: TipoTasa;

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
  @IsOptional()
  capitalizacionMercado?: Capitalizacion;

  @IsEnum(FrecuenciaPago)
  @IsOptional()
  frecuenciaPago?: FrecuenciaPago;

  @IsNumber()
  @Min(0)
  @IsOptional()
  comision?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  gastosAdministrativos?: number;

  @IsEnum(PlazoGracia)
  @IsOptional()
  plazoGracia?: PlazoGracia;

  @IsNumber()
  @Min(0)
  @IsOptional() // Solo si hay plazo de gracia
  duracionPlazoGracia?: number;

  @IsEnum(Moneda)
  @IsOptional()
  moneda?: Moneda;

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
