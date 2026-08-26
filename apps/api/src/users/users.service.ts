import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PG_POOL } from '../database/database.constants';
import { Pool } from 'pg';
import { UserType } from './types/userType';

@Injectable()
export class UsersService {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
  ) {}

  private readonly USER_UPDATE_COLUMNS = {
    organizationId: 'organization_id',
    email: 'email',
    displayName: 'display_name',
    role: 'role',
    active: 'active',
    lastLoginAt: 'last_login_at',
    createdAt: 'created_at',
  };

  private readonly USER_PROJECTION = `
    id,
    organization_id AS "organizationId",
    email,
    display_name AS "displayName",
    role,
    active,
    last_login_at AS "lastLoginAt",
    created_at AS "createdAt"
  `;

  public async getAllUsers(): Promise<UserType[]> {
    const query = {
      text: `
        SELECT 
          ${this.USER_PROJECTION}
        FROM users
        ORDER BY id
      `,
    };

    const result = await this.pool.query<UserType>(query);
    return result.rows;
  }

  public async getUserById(id: number): Promise<UserType> {
    const query = {
      text: `
        SELECT ${this.USER_PROJECTION}
        FROM users
        WHERE id = $1
      `,
      values: [id],
    };

    const result = await this.pool.query<UserType>(query);
    const user = result.rows[0];

    if (!user) {
      throw new NotFoundException(`User ${id} could not be found.`);
    }

    return user;
  }
}
