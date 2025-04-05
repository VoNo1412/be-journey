import { Module } from '@nestjs/common';
import { UserGateway } from './user/user.gateway';
import { UserModule } from '../user/user.module';

@Module({
    imports: [UserModule],
    providers: [UserGateway],
})
export class GatewayModule { }
