-- Certificates: one per completed enrollment, claimed manually at 100% mastery.
-- Applied via raw SQL (not `prisma db push`) to avoid reconciling unrelated
-- enum drift (UserRole.instructor still present on existing users).

CREATE TABLE IF NOT EXISTS certificates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id       varchar(20)  NOT NULL UNIQUE,
  user_id         uuid         NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
  enrollment_id   uuid         NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
  domain_id       uuid         NOT NULL REFERENCES domains(id),
  recipient_name  varchar(255) NOT NULL,
  course_name     varchar(255) NOT NULL,
  hours_invested  numeric(6,1),
  average_score   numeric(5,2),
  completed_at    timestamptz(6) NOT NULL,
  issued_at       timestamptz(6) NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON certificates(user_id);
