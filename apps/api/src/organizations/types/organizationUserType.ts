import { UserRole } from '../../users/types/userType';

export type OrganizationUserType = {
  userId: number;
  displayName: string;
  role: UserRole;
  email: string;
  organizationId: number;
  organizationName: string;
};
