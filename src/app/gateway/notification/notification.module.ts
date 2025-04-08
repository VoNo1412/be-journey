import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./entities/notification.entity";
import { NotificationService } from "./notification.service";
import { NotificationGateway } from "./notification.gateway";
import { UserModule } from "src/app/user/user.module";

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), UserModule],
    providers: [NotificationService, NotificationGateway],
    exports: [NotificationService, NotificationGateway],
})
export class NotificationModule { }