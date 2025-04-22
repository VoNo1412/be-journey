import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dayjs from 'dayjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class R2Service {
  private s3: S3Client;
  private bucket: string;
  private customDomain: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(File) private readonly fileRepository: Repository<File>
  ) {
    const endpoint = this.configService.get<string>('R2_S3_API');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.configService.get<string>('R2_S3_BUCKET')!;
    this.customDomain = this.configService.get<string>('R2_CUSTOM_DOMAIN')!;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    } as any);
  }

  private generateKey(filename: string): string {
    const now = dayjs();
    const folderPath = `uploads/${now.format('YYYY-MM-DD')}`; // Ví dụ: uploads/2025-04-21
    const sanitizedFileName = filename.replace(/\s+/g, '-'); // xóa khoảng trắng

    return `${folderPath}/${Date.now()}-${sanitizedFileName}`;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = this.generateKey(file.originalname);

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return `${this.customDomain}/${key}`;
    } catch (error) {
      console.error('Upload to R2 failed:', error);
      throw new HttpException(
        error?.message || 'Failed to upload file to R2',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async uploadFilesR2(files: Express.Multer.File[], body: any): Promise<any> {
    try {
      let newFiles: any = []
      for (const file of files) {
        const key = this.generateKey(file.originalname);
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );

        const newFile = this.fileRepository.create({
          originalName: file.originalname,
          filePath: `${this.customDomain}/${key}`,
          mimeType: file.mimetype,
          size: file.size,
          subTaskId: Number(body.subtaskId)
        } as any);

        newFiles.push(newFile);
      }

      return this.fileRepository.insert(newFiles);
    } catch (error) {
      console.error('Upload to R2 failed:', error);
      throw new HttpException(
        error?.message || 'Failed to upload file to R2',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getFiles() {
    return this.fileRepository.find();
  }
}
