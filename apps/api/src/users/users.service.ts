import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PG_POOL } from '../database/database.constants';
import { Pool } from 'pg';
import { UserType } from './types/userType';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { handleUserWriteError } from './utils/handle-user-write-error';

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
  } as const satisfies Record<keyof UpdateUserDto, string>;

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

  public async createUser(body: CreateUserDto) {
    const { organizationId, email, displayName, role } = body;

    const query = {
      text: `
        INSERT INTO users (organization_id, email, display_name, role) 
        VALUES ($1, $2, $3, $4)
        RETURNING ${this.USER_PROJECTION}
      `,
      values: [organizationId ?? null, email, displayName, role],
    };

    try {
      const result = await this.pool.query<UserType>(query);
      const newUser = result.rows[0];

      if (!newUser) {
        throw new InternalServerErrorException(
          'User was created but not returned',
        );
      }
      return newUser;
    } catch (e: unknown) {
      handleUserWriteError(e);
    }
  }

  public async updateUser(
    id: number,
    changes: UpdateUserDto,
  ): Promise<UserType> {
    const assignments: string[] = [];
    const values: Array<null | number | string | boolean> = [];

    type UserUpdateKey = keyof typeof this.USER_UPDATE_COLUMNS;

    const keys = Object.keys(this.USER_UPDATE_COLUMNS) as UserUpdateKey[];

    for (const key of keys) {
      const value = changes[key];

      if (value === undefined) continue;

      values.push(value);

      assignments.push(`${this.USER_UPDATE_COLUMNS[key]} = $${values.length}`);
    }

    if (assignments.length === 0) {
      throw new BadRequestException('No changes provided.');
    }

    values.push(id);

    const idPlaceholder = `$${values.length}`;

    const query = {
      text: `
        UPDATE users
        SET ${assignments.join(', ')}
        WHERE id = ${idPlaceholder}
        RETURNING ${this.USER_PROJECTION}
      `,
      values: values,
    };

    try {
      const result = await this.pool.query<UserType>(query);
      const user = result.rows[0];

      if (!user) {
        throw new NotFoundException(`User ${id} not found`);
      }

      return user;
    } catch (e: unknown) {
      handleUserWriteError(e);
    }
  }

  public async deleteUser(id: number): Promise<void> {
    const query = {
      text: `
        DELETE FROM users
        WHERE id = $1
        RETURNING id
      `,
      values: [id],
    };

    const result = await this.pool.query<{ id: number }>(query);
    const deletedUser = result.rows[0];

    if (!deletedUser) {
      throw new NotFoundException(`User ${id} not found.`);
    }
  }
}
