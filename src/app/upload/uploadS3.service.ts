import { BadRequestException, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class UploadService {
    private s3: S3;
    private readonly bucket: string | any;
    private readonly maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

    constructor(private configService: ConfigService) {
        this.s3 = new S3({
            accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
            region: this.configService.get<string>('AWS_REGION'),
        });
        this.bucket = this.configService.get<string>('AWS_S3_BUCKET');
    }


    async uploadFile(file: Express.Multer.File): Promise<string> {
        // Check file size
        if (file.size > this.maxFileSize) {
            throw new BadRequestException(
                `File size exceeds limit of ${this.maxFileSize / (1024 * 1024)}MB`,
            );
        }

        const params = {
            Bucket: this.bucket,
            Key: `${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            const result = await this.s3.upload(params).promise();
            return result.Location; // Return the file URL
        } catch (error) {
            throw new BadRequestException('Failed to upload file to S3: ' + error.message);
        }
    }
}
