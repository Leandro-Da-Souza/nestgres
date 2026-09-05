export const USER_ROLES = ['member', 'admin', 'super_admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserType = {
  id: number;
  organizationId: number | null;
  email: string;
  displayName: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export type AuthUserWithPass = Pick<
  UserType,
  'id' | 'organizationId' | 'email' | 'role' | 'displayName' | 'active'
> & {
  passwordHash: string | null;
};
