import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { SectorEmpresarial } from "src/common/enums/sectorEmpresarial";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @Length(11)
    ruc: string;

    @IsString()
    @IsNotEmpty()
    razonSocial: string;

    @IsString()
    @IsNotEmpty()
    direccion: string;

    @IsEnum(SectorEmpresarial)
    @IsOptional()
    sectorEmpresarial?: SectorEmpresarial;

}
