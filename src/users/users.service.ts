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

    findUserByEmail(email:string){
        return this.userRepository.findOneBy({email});
    }

    findUserByEmailWithPassword(email:string){
        return this.userRepository.findOne({
            where: {email},
            select: ['id', 'name', 'email', 'password', 'role'],
        });
    }
}
