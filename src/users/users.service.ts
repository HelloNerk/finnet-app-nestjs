import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ){}

    createUser(createUserDto: CreateUserDto){
        const newUser = this.userRepository.create(createUserDto);
        return this.userRepository.save(newUser);
    }

    async findUserByEmail(email: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: [
                { email: email }
            ]
        });

        return user;
    }

    findUserByEmailWithPassword(email:string){
        return this.userRepository.findOne({
            where: {email},
            select: ['id', 'email', 'password', 'firstName', 'lastName', 'role'],
        });
    }
}
