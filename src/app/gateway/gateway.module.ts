import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AppGateway } from './app.gateway';
import { UserGateway } from './user/user.gateway';
import { NotificationModule } from './notification/notification.module';

@Module({
    imports: [UserModule, NotificationModule],
    providers: [AppGateway, UserGateway],
    exports: [UserGateway]
})
export class GatewayModule { }
