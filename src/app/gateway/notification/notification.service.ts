import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Repository } from "typeorm";
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async create(createNotificationDto: CreateNotificationDto) {
        try {
            const { taskId, senderId, recipientId, type, message, isRead } = createNotificationDto;

            const normalizedBody: any = {
                taskId,
                senderId,
                recipientId,
                type,
                isRead,
                message
            };
            const notification = this.notificationRepository.create(normalizedBody);
            console.time('notification-save');
            const saved: any = await this.notificationRepository.save(notification);
            console.timeEnd('notification-save');
            return saved;
        } catch (error) {
            throw new HttpException(error, HttpStatus.EXPECTATION_FAILED)
        }
    }
}
