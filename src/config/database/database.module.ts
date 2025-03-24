import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/app/category/entities/category.entity';
import { Task } from 'src/app/task/entities/task.entity';
import { User } from 'src/app/user/entities/user.entity';


@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('MYSQL_USER'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
        // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        entities: [Task, Category, User],
        synchronize: true,
      }),
    }),
  ],
  exports: [], 
})
export class DatabaseModule {}
