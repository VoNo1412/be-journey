import { Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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

  ) { }

  @Get('file')
  async getFiles() {
    return this.r2Service.getFiles();
  }

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

  @Post('multi')
  @UseInterceptors(
    FilesInterceptor('files', 4), // Tối đa 10 file
  )
  async uploadMultipleFiles(
    @UploadedFiles(new ParseFileWithMaxSizePipe(20)) files: Express.Multer.File[],
    @Body() body: any, // hoặc number nếu bạn ép kiểu
  ) {
    return this.r2Service.uploadFilesR2(files, body);
  }
}