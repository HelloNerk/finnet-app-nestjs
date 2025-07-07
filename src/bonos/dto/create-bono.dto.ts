import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  Min,
  Max,
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

  @IsEnum(Moneda)
  moneda: Moneda;

  @IsNumber()
  @Min(0)
  valorNominal: number;

  @IsNumber()
  @Min(0)
  valorComercial: number;

  @IsNumber()
  @Min(0)
  tasaCupon: number;

  @IsEnum(TipoTasa)
  tipoTasa: TipoTasa;

  @IsEnum(Capitalizacion)
  @IsOptional() // Solo si la tasa es nominal
  capitalizacion?: Capitalizacion;

  @IsEnum(FrecuenciaPago)
  frecuenciaPago: FrecuenciaPago;

  @IsNumber()
  @Min(1)
  plazoAnios: number;

  @IsEnum(MetodoAmortizacion)
  metodoAmortizacion: MetodoAmortizacion;

  @IsNumber()
  @Min(0)
  tasaMercado: number;

  @IsNumber()
  @Min(0)
  primaRedencion: number;

  @IsNumber()
  @Min(0)
  estructuracion: number;

  @IsNumber()
  @Min(0)
  colocacion: number;

  @IsNumber()
  @Min(0)
  flotacion: number;

  @IsNumber()
  @Min(0)
  cavali: number;

  @IsEnum(PlazoGracia)
  plazoGracia: PlazoGracia;
}
