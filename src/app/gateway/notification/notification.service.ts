import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>
  ) { }

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = this.notificationRepository.create(createNotificationDto);
      return await this.notificationRepository.save(notification);
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      return await this.notificationRepository.find();
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateNotification(id: number, updateNotificationDto: UpdateNotificationDto) {
    try {
      await this.notificationRepository.update(id, updateNotificationDto);
      return await this.notificationRepository.findOneBy({ id });
    } catch (error) {
      throw new Error(error);
    }
  }

}
