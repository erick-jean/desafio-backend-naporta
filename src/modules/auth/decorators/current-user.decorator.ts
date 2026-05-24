import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export type CurrentUserPayload = {
  sub: string;
  email: string;
};

type AuthenticatedRequest = Request & {
  user?: CurrentUserPayload;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user as CurrentUserPayload;
  },
);
