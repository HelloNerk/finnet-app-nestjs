import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';
import { Role } from '../common/enums/role.enum';
import { Auth } from './decorators/auth.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';


interface RequestWithUser extends Request {
    user: {
        email: string;
        role: string;
    };
}


@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService){}

    @Post('login')
    login(@Body() loginDto:LoginDto){
        return this.authService.login(loginDto);
    }

    @Post('register')
    register(@Body() registerDto: RegisterDto){
        return this.authService.register(registerDto);
    }

    @ApiBearerAuth()
    @Get('profile')
    @Auth(Role.USER)
    profile(@ActiveUser() user: UserActiveInterface){
        return this.authService.profile(user);
    }
}
