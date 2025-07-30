import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SubscriptionsService } from 'src/suscriptions/subscriptions.service';
import { Plan } from 'src/suscriptions/enums/plan.enum';
import { SubscriptionDto } from 'src/suscriptions/dto/subscription.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly subscriptionsService: SubscriptionsService,
        private readonly jwtService: JwtService
    ){}

    async register(registerDto: RegisterDto){
        const user = await this.usersService.findUserByEmail(registerDto.email);
        
        if(user){
            throw new BadRequestException('User already exists');
        }

        const userSaved =await this.usersService.createUser({
            email: registerDto.email,
            password: await bcrypt.hash(registerDto.password, 10),
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
        });

        const subscription = new SubscriptionDto();
        subscription.userId = userSaved.id;
        subscription.plan = Plan.FREE;
        subscription.isActive = true;

        this.subscriptionsService.createSubscription(subscription);

        return {
            email: registerDto.email
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

    async profile({email, role}: {email:string;  role: string}): Promise<any> {
        const user = await this.usersService.findUserByEmail(email);
        
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const activeSubscriptions = await this.subscriptionsService.findActiveSubscriptionsByUserId(user.id);
        const activeSubscription = activeSubscriptions.length > 0 ? activeSubscriptions[0] : null;

        return {
            ...user,
            plan: activeSubscription?.plan || Plan.FREE,
            isPlanActive: activeSubscription?.isActive || false,
            expiresAt: activeSubscription?.expiresAt || null,
        };
    }
}
