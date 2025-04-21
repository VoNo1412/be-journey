import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TaskModule } from './app/task/task.module';
import { UserModule } from './app/user/user.module';
import { CategoryModule } from './app/category/category.module';
import { AuthModule } from './app/auth/auth.module';
import { GatewayModule } from './app/gateway/gateway.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UploadModule } from './app/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.production', '.env'], // Load the env.dev file
    }),
    UserModule,
    CategoryModule,
    TaskModule,
    DatabaseModule,
    AuthModule,
    GatewayModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware).forRoutes("*")
    }
 }
