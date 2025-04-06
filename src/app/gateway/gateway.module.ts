import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification/entities/notification.entity';
import { NotificationService } from './notification/notification.service';
import { AppGateway } from './app.gateway';

@Module({
    imports: [UserModule, TypeOrmModule.forFeature([Notification])],
    providers: [AppGateway, NotificationService],
    exports: [NotificationService],
})
export class GatewayModule { }
