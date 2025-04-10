import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from 'express';

// Custom decorator để lấy cookie từ request
export const CookieDecorator = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
      const request: Request = ctx.switchToHttp().getRequest();
      return data ? request.cookies[data] : request.cookies;
    }
  );