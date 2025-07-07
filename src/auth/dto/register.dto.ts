import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(3)
    name:string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(3)
    fullName:string;

    @IsEmail()
    email: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(6)
    password: string;
}