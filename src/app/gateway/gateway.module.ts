import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UserGateway } from './user/user.gateway';
import { NotificationModule } from './notification/notification.module';

@Module({
    imports: [UserModule, NotificationModule],
    providers: [UserGateway],
    exports: [UserGateway]
})
export class GatewayModule { }
