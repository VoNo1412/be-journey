import { Module } from '@nestjs/common';
import { UploadService } from './uploadS3.service';
import { UploadController } from './upload.controller';
import { R2Service } from './uploadR2.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entites/files.entity';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'file-upload-queue',
    }),
    TypeOrmModule.forFeature([File])
  ],
  controllers: [UploadController],
  providers: [UploadService, R2Service]
})
export class UploadModule {}
