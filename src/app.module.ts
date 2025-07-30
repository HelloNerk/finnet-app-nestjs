import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './suscriptions/subscriptions.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    // 👇 Carga automática de .env
    ConfigModule.forRoot({ isGlobal: true }),

    // 👇 Carga asíncrona de la config de TypeORM desde .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') ?? '5432', 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        ssl: config.get<string>('NODE_ENV') === 'production'
        ? { rejectUnauthorized: false }
        : false,
      }),
    }),

    UsersModule,
    AuthModule,
    SubscriptionsModule,
    CoursesModule
  ],
})
export class AppModule {}
