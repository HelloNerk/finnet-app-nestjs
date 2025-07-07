import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BonosService } from './bonos.service';
import { create } from 'domain';
import { CreateBonoDto } from './dto/create-bono.dto';
import { UpdateBonoDto } from './dto/update-bono.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Auth(Role.USER)
@Controller('bonos')
export class BonosController {
    constructor(private readonly bonosService: BonosService) {}

    @Post()
    createBono(@Body() createBonoDto: CreateBonoDto) {
        return this.bonosService.createBono(createBonoDto);
    }

    @Get('user/:userId')
    findBonosByUserId(@Param('userId') userId: number) {
        return this.bonosService.findBonosByUserId(userId);
    }

    @Get(':id')
    findBonoById(@Param('id') id: number) {
        return this.bonosService.findBonoById(id);
    }

    @Put(':id')
    updateBono(@Param('id') id: number, @Body() updateBonoDto: UpdateBonoDto) {
        return this.bonosService.updateBono(id, updateBonoDto);
    }
}
