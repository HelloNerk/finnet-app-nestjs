import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ){}

    async register(registerDto: RegisterDto){
        const user = await this.usersService.findUserByEmail(registerDto.email);
        if(user){
            throw new BadRequestException('User already exists');
        }
        await this.usersService.createUser({
            name: registerDto.name,
            fullName: registerDto.fullName,
            email: registerDto.email,
            password: await bcrypt.hash(registerDto.password, 10)
        });
        return {
            name: registerDto.name,
            email: registerDto.email,
        }
    }

    async login(loginDto: LoginDto){
        const user = await this.usersService.findUserByEmailWithPassword(loginDto.email);
        if(!user){  
            throw new UnauthorizedException('Invalid credentials');
        }
        if(!await bcrypt.compare(loginDto.password, user.password)){
            throw new BadRequestException('Invalid credentials');
        }

        const payload = { email: user.email, role: user.role};
        
        const token = await this.jwtService.signAsync(payload);

        return {
            token: token,
            email: user.email
        };
    }

    async profile({email, role}: {email:string; role: string}){

        return await this.usersService.findUserByEmail(email);
    }
}
