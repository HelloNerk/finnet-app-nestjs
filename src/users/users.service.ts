import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private userRepository: Repository<User>){}

    createUser(createUserDto: CreateUserDto){
        const newUser = this.userRepository.create(createUserDto);
        return this.userRepository.save(newUser);
    }

    findUserByEmailOrRuc(email: string, ruc: string) {
        return this.userRepository.findOne({
            where: [
                { email: email },
                { ruc: ruc }
            ]
        });
    }

    findUserByEmailWithPassword(email:string){
        return this.userRepository.findOne({
            where: {email},
            select: ['id', 'email', 'password', 'ruc', 'role'],
        });
    }
}
