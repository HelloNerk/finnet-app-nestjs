import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsString, Max, MinLength } from 'class-validator';

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
    firstName: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    lastName: string;

}
