import { pool } from '../../lib/db';
import { ApiError } from '../../utils/ApiError';
import type { UserRecord } from '../auth/auth.types';

type PublicUser = Pick<
  UserRecord,
  'id' | 'email' | 'fullName' | 'role' | 'avatarUrl' | 'preferredLanguage' | 'createdAt'
>;

const SELECT_PUBLIC =
  `id, email, "fullName", role, "avatarUrl", "preferredLanguage", "createdAt"`;

export async function getById(id: string): Promise<PublicUser> {
  const { rows } = await pool.query<PublicUser>(
    `SELECT ${SELECT_PUBLIC} FROM users WHERE id = $1`,
    [id],
  );
  if (!rows[0]) throw ApiError.notFound('User not found');
  return rows[0];
}

export async function updateMe(
  id: string,
  data: { fullName?: string; avatarUrl?: string | null; preferredLanguage?: string },
): Promise<PublicUser> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.fullName !== undefined) {
    setClauses.push(`"fullName" = $${idx++}`);
    values.push(data.fullName);
  }
  if (data.avatarUrl !== undefined) {
    setClauses.push(`"avatarUrl" = $${idx++}`);
    values.push(data.avatarUrl);
  }
  if (data.preferredLanguage !== undefined) {
    setClauses.push(`"preferredLanguage" = $${idx++}`);
    values.push(data.preferredLanguage);
  }

  setClauses.push(`"updatedAt" = NOW()`);
  values.push(id);

  const { rows } = await pool.query<PublicUser>(
    `UPDATE users SET ${setClauses.join(', ')}
     WHERE id = $${idx}
     RETURNING ${SELECT_PUBLIC}`,
    values,
  );
  if (!rows[0]) throw ApiError.notFound('User not found');
  return rows[0];
}

export async function listUsers(
  page: number,
  limit: number,
  role?: string,
): Promise<{ users: PublicUser[]; total: number }> {
  const offset = (page - 1) * limit;
  const roleFilter = role ?? null;

  const [{ rows: users }, { rows: countRows }] = await Promise.all([
    pool.query<PublicUser>(
      `SELECT ${SELECT_PUBLIC}
       FROM users
       WHERE ($1::text IS NULL OR role = $1::"UserRole")
       ORDER BY "createdAt" DESC
       LIMIT $2 OFFSET $3`,
      [roleFilter, limit, offset],
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM users
       WHERE ($1::text IS NULL OR role = $1::"UserRole")`,
      [roleFilter],
    ),
  ]);

  return { users, total: parseInt(countRows[0].count, 10) };
}
