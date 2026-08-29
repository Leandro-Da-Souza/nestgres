import { UserRole } from '../../users/types/userType';
import { Request } from 'express';

export type JwtPayloadType = {
  sub: number;
  email: string;
  role: UserRole;
  organizationId: number | null;
  iat?: number;
  exp?: number;
};

export type AuthenticatedRequestType = Request & {
  user: JwtPayloadType;
};
