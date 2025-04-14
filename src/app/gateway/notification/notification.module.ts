import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./entities/notification.entity";
import { NotificationService } from "./notification.service";
import { UserModule } from "src/app/user/user.module";

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), UserModule],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule { }