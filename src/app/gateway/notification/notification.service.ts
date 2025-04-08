import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Repository } from "typeorm";
import { Notification } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly notificationGateway: NotificationGateway,
    ) { }

    async create(createNotificationDto: CreateNotificationDto) {
        try {
            const { taskId, senderId, recipientId, type, message, isRead, title } = createNotificationDto;

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
            // const saved: any = await this.notificationRepository.save(notification);

            const sendNotification = {
                title,
                message: saved.message,
                type: saved.type,
                taskId,
                isRead,
                recipientId,
                senderId
            }

            // Emit notification to the user
            this.notificationGateway.sendNotificationToUser(createNotificationDto.recipientId.toString(), sendNotification);
        } catch (error) {
            throw new HttpException(error, HttpStatus.EXPECTATION_FAILED)
        }
    }
}
