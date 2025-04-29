import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    BadRequestException,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import * as multer from 'multer';
  
  @Injectable()
  export class CustomFilesInterceptor implements NestInterceptor {
    constructor(
      private readonly fieldName: string,
      private readonly maxCount: number,
    ) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest();
  
      const upload = multer().array(this.fieldName); // Khởi tạo tại đây khi fieldName đã sẵn sàng
  
      return new Promise((resolve, reject) => {
        upload(request, request.res, (error) => {
          if (error) {
            return reject(new BadRequestException('Lỗi upload file: ' + error.message));
          }
  
          const files = request.files;
          if (files.length > this.maxCount) {
            return reject(
              new BadRequestException(`Chỉ được tải lên tối đa ${this.maxCount} file`),
            );
          }
  
          resolve(next.handle());
        });
      });
    }
  }
  