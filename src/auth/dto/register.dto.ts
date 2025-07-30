import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsString, Max, MinLength } from 'class-validator';
import { SectorEmpresarial } from 'src/common/enums/sectorEmpresarial';

export class RegisterDto {
    
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsEmail()
    email: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(6)
    password: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(11)
    ruc: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(3)
    razonSocial: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(3)
    direccion: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @IsEnum(SectorEmpresarial)
    sectorEmpresarial: SectorEmpresarial;

}
