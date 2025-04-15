import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Repository } from "typeorm";
import { Notification, NotificationType } from './entities/notification.entity';
import convertToVietnamTime from "src/common/time";

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async create(createNotificationDto: CreateNotificationDto) {
        try {
            const { taskId, taskUserId, senderId, recipientId, type, message, isRead } = createNotificationDto;

            const normalizedBody: any = {
                taskId,
                taskUserId,
                senderId,
                recipientId,
                type,
                isRead,
                message
            };
            const notification = this.notificationRepository.create(normalizedBody);
            return await this.notificationRepository.save(notification);
        } catch (error) {
            throw new HttpException(error, HttpStatus.EXPECTATION_FAILED)
        }
    }

    generateNotificationMessage(
        type: NotificationType,
        entityName: string
    ): string {
        switch (type) {
            case NotificationType.TASK_ASSIGNED:
                return ` assigned you a task: ${entityName}`;

            case NotificationType.COMMENT:
                return ` commented on ${entityName}`;

            case NotificationType.TASK_COMPLETED:
                return ` marked the task ${entityName} as completed`;

            case NotificationType.REMINDER:
                return `Reminder: ${entityName}`;

            default:
                return ` sent you a notification`;
        }
    }

    async getNotificationsByUser(userId: number) {
        const result = await this.notificationRepository.find({ 
            where: { recipientId: userId }, relations: ["sender", "task"]});

        return result.map(x => ({
            id: x.id,
            user: x.sender.username,
            avatar: x.sender.avatar,
            message: this.generateNotificationMessage(x.type, x.task.title),
            time: convertToVietnamTime(x.createdAt),
            isRead: x.isRead
        }))
    }
}
