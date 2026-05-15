import { pool } from '../../lib/db';
import { ApiError } from '../../utils/ApiError';
import { hashPassword, verifyPassword } from '../../lib/password';
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

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (currentPassword === newPassword) {
    throw ApiError.badRequest('New password must be different from current password');
  }

  const { rows } = await pool.query<Pick<UserRecord, 'id' | 'passwordHash'>>(
    'SELECT id, "passwordHash" FROM users WHERE id = $1',
    [userId],
  );
  const user = rows[0];
  if (!user) throw ApiError.notFound('User not found');
  if (!user.passwordHash) {
    throw ApiError.badRequest('Password change is unavailable for OAuth-only accounts');
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Current password is incorrect');

  const nextHash = await hashPassword(newPassword);
  await pool.query(
    `UPDATE users
     SET "passwordHash" = $1, "updatedAt" = NOW()
     WHERE id = $2`,
    [nextHash, userId],
  );
}

export async function deleteMe(userId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const authored = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM ontology_versions WHERE "createdById" = $1',
      [userId],
    );
    if (parseInt(authored.rows[0].count, 10) > 0) {
      throw ApiError.badRequest('Account owns ontology versions and cannot be deleted');
    }

    await client.query(
      'UPDATE ontology_versions SET "verifiedById" = NULL WHERE "verifiedById" = $1',
      [userId],
    );
    await client.query(
      'UPDATE domain_whitelist SET "addedById" = NULL WHERE "addedById" = $1',
      [userId],
    );
    await client.query('DELETE FROM adaptation_events WHERE "userId" = $1', [userId]);
    await client.query('DELETE FROM resource_ratings WHERE "userId" = $1', [userId]);
    await client.query('DELETE FROM notifications WHERE "userId" = $1', [userId]);
    await client.query('DELETE FROM learner_node_progress WHERE "userId" = $1', [userId]);
    await client.query('DELETE FROM quiz_attempts WHERE "userId" = $1', [userId]);
    await client.query('DELETE FROM enrollments WHERE "userId" = $1', [userId]);
    await client.query('DELETE FROM refresh_tokens WHERE "userId" = $1', [userId]);

    const { rowCount } = await client.query('DELETE FROM users WHERE id = $1', [userId]);
    if (!rowCount) throw ApiError.notFound('User not found');

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
