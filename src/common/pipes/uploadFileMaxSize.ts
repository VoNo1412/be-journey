import {
    Injectable,
    PipeTransform,
    BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseFileWithMaxSizePipe implements PipeTransform {
    constructor(private maxSizeInMB: number) { }

    transform(file: Express.Multer.File) {
        const maxSizeInBytes = this.maxSizeInMB * 1024 * 1024;

        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        if (file.size > maxSizeInBytes) {
            throw new BadRequestException(
                `File size exceeds the maximum allowed size of ${this.maxSizeInMB}MB`,
            );
        }

        return file;
    }
}
