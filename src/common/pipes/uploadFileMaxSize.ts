import {
    Injectable,
    PipeTransform,
    BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseFileWithMaxSizePipe implements PipeTransform {
    constructor(private maxSizeInMB: number) { }

    transform(files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        const maxSizeBytes = this.maxSizeInMB * 1024 * 1024;

        for (const file of files) {
            if (file.size > maxSizeBytes) {
                throw new BadRequestException(
                    `File "${file.originalname}" exceeds the maximum size of ${this.maxSizeInMB}MB`,
                );
            }
        }

        return files;
    }
}
