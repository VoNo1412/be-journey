import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dayjs from 'dayjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { InjectQueue, OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';


@Injectable()
@Processor('file-upload-queue')
export class R2Service {
  private s3: S3Client;
  private bucket: string;
  private customDomain: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    @InjectQueue('file-upload-queue') private readonly fileQueue: Queue
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

  private generateKeyQueue(fieldname: string): string {
    return `${Date.now()}-${fieldname}`; // Chỉ trả về tên file, không chứa đường dẫn
  }

  async addFilesToQueue(files: Express.Multer.File[], body: any) {
    const jobIds: any = [];
    // Đảm bảo thư mục uploads tồn tại
    const uploadDir = path.join('uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    for (const file of files) {
      // Lưu file tạm thời
      const tempFilePath = path.join(uploadDir, `${this.generateKeyQueue(file.fieldname)}-${file.originalname}`);
      await fs.writeFileSync(tempFilePath, file.buffer);

      // Thêm công việc vào hàng đợi
      const job = await this.fileQueue.add('process-file', {
        tempFilePath,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        subTaskId: Number(body.subtaskId),
      },
        {
          attempts: 3, // Thử lại tối đa 3 lần
          backoff: 5000,
          // removeOnComplete: true, // Xóa công việc khỏi hàng đợi sau khi thành công
          // removeOnFail: true, // Xóa công việc khỏi hàng đợi sau khi thất bại (sau khi retry hết lần)
        },
      );

      jobIds.push(job.id);
    }

    return jobIds;
  }

  // Theo dõi khi công việc bắt đầu
  @OnQueueActive()
  onActive(job: Job) {
    Logger.log(`Job ${job.id} started: Processing file ${job.data.originalName}`);
  }

  // Theo dõi khi công việc hoàn tất
  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    Logger.log(`Job ${job.id} completed: File ${job.data.originalName} processed successfully`);
  }

  // Theo dõi khi công việc thất bại
  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    Logger.error(`Job ${job.id} failed: File ${job.data.originalName} - Error: ${err.message}`, err.stack);
  }

  @Process('process-file')
  async handleFileProcessing(job: Job) {
    const { tempFilePath, originalName, mimetype, size, subTaskId } = job.data;
    Logger.log(`Processing file: ${originalName}`);

    try {
      // Đọc file tạm
      const fileBuffer = fs.readFileSync(tempFilePath);
      const key = this.generateKey(originalName);

      // Upload lên R2
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: fileBuffer,
          ContentType: mimetype,
        }),
      );

      // Lưu thông tin file vào database
      const newFile = this.fileRepository.create({
        originalName,
        filePath: `${this.customDomain}/${key}`,
        mimeType: mimetype,
        size,
        subTaskId,
      } as any);

      await this.fileRepository.save(newFile);
      // Xóa file tạm
      fs.unlinkSync(tempFilePath);

      Logger.log(`File ${originalName} processed successfully`);
      return { status: 'success', originalName };
    } catch (error) {
      Logger.error(`Failed to process file: ${originalName}`, error.stack);
      throw error; // Bull sẽ retry nếu cấu hình
    }
  }

  // Endpoint để kiểm tra trạng thái công việc
  async getJobsStatus(jobIds: string[]) {
    const statuses = await Promise.all(
      jobIds.map(async (jobId) => {
        try {
          const job = await this.fileQueue.getJob(jobId);
          if (!job) {
            return { jobId, state: 'not_found', progress: 0, result: null, error: 'Job not found' };
          }

          const state = await job.getState();
          const progress = job.progress();
          const result = job.returnvalue;
          const error: any = job.failedReason;

          if (state === 'failed' && error) {
            let errorDetails;
            try {
              errorDetails = JSON.parse(error.message);
            } catch (parseError) {
              errorDetails = {
                message: 'Job processing failed',
                error: error.message || 'Unknown error',
                details: error.stack || 'No additional details available',
              };
            }
            return { jobId, state, progress, result: null, error: errorDetails };
          }

          return { jobId, state, progress, result, error: error ? error.message : null };
        } catch (error) {
          return { jobId, state: 'error', progress: 0, result: null, error: error.message };
        }
      }),
    );

    // Tính toán trạng thái tổng quan
    const totalJobs = statuses.length;
    const completedJobs = statuses.filter((s) => s.state === 'completed').length;
    const failedJobs = statuses.filter((s) => s.state === 'failed').length;
    const processingJobs = statuses.filter((s) => s.state === 'active' || s.state === 'waiting').length;

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      processingJobs,
      jobs: statuses,
    };
  }
}
