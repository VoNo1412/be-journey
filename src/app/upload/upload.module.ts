import { Module } from '@nestjs/common';
import { UploadService } from './uploadS3.service';
import { UploadController } from './upload.controller';
import { R2Service } from './uploadR2.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entites/files.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [UploadController],
  providers: [UploadService, R2Service]
})
export class UploadModule {}
