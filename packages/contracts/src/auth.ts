import type { ApiResponse } from "./api.js";

export type UserRole = 'member' | 'admin' | 'super_admin';

export type AuthenticatedUser = {
    id: number;
    organizationId: number | null;
    displayName: string;
    email: string;
    role: UserRole;
    active: boolean
}

export type LoginRequest = {
    email: string;
    password: string;
}

export type LoginData = {
    user: AuthenticatedUser
}

export type LoginResponse = ApiResponse<LoginData>

export type ProfileResponse = ApiResponse<AuthenticatedUser>