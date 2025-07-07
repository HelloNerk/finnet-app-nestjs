import { Module } from '@nestjs/common';
import { BonosController } from './bonos.controller';
import { BonosService } from './bonos.service';
import { Bono } from './bono.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Bono])],
  controllers: [BonosController],
  providers: [BonosService],
})
export class BonosModule {}
