import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
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

  @IsEnum(Moneda)
  @IsOptional()
  moneda?: Moneda;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorNominal?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorComercial?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tasaCupon?: number;

  @IsEnum(TipoTasa)
  @IsOptional()
  tipoTasa?: TipoTasa;

  @IsEnum(Capitalizacion)
  @IsOptional()
  capitalizacion?: Capitalizacion;

  @IsEnum(FrecuenciaPago)
  @IsOptional()
  frecuenciaPago?: FrecuenciaPago;

  @IsNumber()
  @Min(1)
  @IsOptional()
  plazoAnios?: number;

  @IsEnum(MetodoAmortizacion)
  @IsOptional()
  metodoAmortizacion?: MetodoAmortizacion;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tasaMercado?: number;

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

  @IsEnum(PlazoGracia)
  @IsOptional()
  plazoGracia?: PlazoGracia;
}
