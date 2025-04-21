import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './uploadS3.service';
import { R2Service } from './uploadR2.service';
import { ParseFileWithMaxSizePipe } from 'src/common/pipes/uploadFileMaxSize';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly s3UploadService: UploadService,
    private readonly r2Service: R2Service

  ) {}

  @Post('file-awsS3')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileS3(@UploadedFile(new ParseFileWithMaxSizePipe(5)) file: Express.Multer.File) {
    const fileUrl = await this.s3UploadService.uploadFile(file);
    return { message: 'File uploaded successfully', url: fileUrl };
  }

  @Post('file-cloudflareR2')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileR2(@UploadedFile(new ParseFileWithMaxSizePipe(10)) file: Express.Multer.File) {
    const fileUrl = await this.r2Service.uploadFile(file);
    return { message: 'File uploaded successfully', url: fileUrl };
  }
}