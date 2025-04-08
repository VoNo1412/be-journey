import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { NotificationType } from "../entities/notification.entity";

export class CreateNotificationDto {
    @IsNumber()
    @ApiProperty()
    taskId: number;

    @IsString()
    @ApiProperty()
    title: string;

    @IsNumber()
    @ApiProperty()
    senderId: number;

    @IsNumber()
    @ApiProperty()
    recipientId: number;

    @IsString()
    @ApiProperty({ enum: NotificationType })
    type: NotificationType.TASK_ASSIGNED;

    @IsBoolean()
    @ApiProperty({ default: false })
    isRead: boolean = false;

    @IsString()
    @ApiProperty({ nullable: true })
    message: string;
}
