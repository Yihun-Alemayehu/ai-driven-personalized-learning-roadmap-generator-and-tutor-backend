import { pool } from '../../lib/db';
import { ApiError } from '../../utils/ApiError';
import type { UserRole } from '../auth/auth.types';

const SELECT_PUBLIC =
  `id, email, "fullName", role, "avatarUrl", "preferredLanguage", "createdAt"`;

const VALID_ROLES: UserRole[] = ['learner', 'instructor', 'admin', 'domain_expert'];

export async function changeUserRole(adminId: string, targetId: string, role: string) {
  if (!VALID_ROLES.includes(role as UserRole)) {
    throw ApiError.badRequest(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`);
  }
  if (adminId === targetId) {
    throw ApiError.badRequest('Admin cannot change their own role');
  }

  const { rows } = await pool.query(
    `UPDATE users SET role = $1::"UserRole", "updatedAt" = NOW()
     WHERE id = $2
     RETURNING ${SELECT_PUBLIC}`,
    [role, targetId],
  );
  if (!rows[0]) throw ApiError.notFound('User not found');
  return rows[0];
}

export async function deleteUser(adminId: string, targetId: string) {
  if (adminId === targetId) {
    throw ApiError.badRequest('Admin cannot delete their own account');
  }

  const { rowCount } = await pool.query(
    `DELETE FROM users WHERE id = $1`,
    [targetId],
  );
  if (!rowCount) throw ApiError.notFound('User not found');
}

export async function listUsers(
  page: number,
  limit: number,
  role?: string,
): Promise<{ users: unknown[]; total: number }> {
  const offset = (page - 1) * limit;
  const roleFilter = role ?? null;

  const [{ rows: users }, { rows: countRows }] = await Promise.all([
    pool.query(
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
