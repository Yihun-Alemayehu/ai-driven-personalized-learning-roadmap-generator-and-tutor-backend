# Phase 2: Database Schema

**Depends on:** [Phase 1: Scaffold](01-scaffold.md)  
**Next phase:** [Phase 3: Authentication](03-auth.md)

---

## What to Build

Full PostgreSQL schema derived from the project's data model. All tables, constraints, indexes, and enums — defined in the Prisma schema and applied via Prisma migrations.

---

## Schema Design

### Enums

See [00-shared-concepts.md](00-shared-concepts.md#database-enums) for all 8 enum definitions.

### Tables

**users**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NULLABLE (null for OAuth-only users) |
| full_name | VARCHAR(255) | NOT NULL |
| role | user_role | NOT NULL, DEFAULT 'learner' |
| avatar_url | TEXT | NULLABLE |
| oauth_provider | VARCHAR(50) | NULLABLE ('google', 'github') |
| oauth_provider_id | VARCHAR(255) | NULLABLE |
| preferred_language | VARCHAR(10) | DEFAULT 'en' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**domains**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL (e.g., 'Frontend Development') |
| slug | VARCHAR(100) | UNIQUE, NOT NULL (e.g., 'frontend') |
| description | TEXT | |
| icon_url | TEXT | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**ontology_versions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| domain_id | UUID | FK → domains.id, NOT NULL |
| version_number | INTEGER | NOT NULL |
| status | ontology_status | DEFAULT 'draft' |
| created_by | UUID | FK → users.id |
| verified_by | UUID | FK → users.id, NULLABLE |
| verified_at | TIMESTAMPTZ | NULLABLE |
| published_at | TIMESTAMPTZ | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (domain_id, version_number) |

**learning_nodes**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| ontology_version_id | UUID | FK → ontology_versions.id, NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| learning_outcomes | JSONB | NOT NULL (array of outcome strings) |
| estimated_hours | DECIMAL(4,1) | |
| difficulty_level | INTEGER | 1-5 |
| is_branching_point | BOOLEAN | DEFAULT false |
| is_convergence_point | BOOLEAN | DEFAULT false |
| branch_path | branch_path | NULLABLE (which path this node belongs to) |
| position_x | FLOAT | For DAG layout |
| position_y | FLOAT | For DAG layout |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (ontology_version_id, slug) |

**node_prerequisites** (edges of the DAG)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| prerequisite_node_id | UUID | FK → learning_nodes.id, NOT NULL |
| UNIQUE | | (node_id, prerequisite_node_id) |
| CHECK | | node_id != prerequisite_node_id |

**enrollments**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| domain_id | UUID | FK → domains.id, NOT NULL |
| ontology_version_id | UUID | FK → ontology_versions.id, NOT NULL |
| selected_branch_path | branch_path | NULLABLE |
| enrolled_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (user_id, domain_id) |

**learner_node_progress**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| enrollment_id | UUID | FK → enrollments.id, NOT NULL |
| mastery_state | mastery_state | DEFAULT 'not_started' |
| best_quiz_score | DECIMAL(5,2) | NULLABLE (percentage) |
| attempts_count | INTEGER | DEFAULT 0 |
| mastered_at | TIMESTAMPTZ | NULLABLE |
| last_reviewed_at | TIMESTAMPTZ | NULLABLE |
| decay_notified_at | TIMESTAMPTZ | NULLABLE |
| unlocked | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (user_id, node_id) |

**quizzes**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| is_micro_quiz | BOOLEAN | DEFAULT false |
| generated_by | VARCHAR(50) | 'static', 'ai_tutor' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**quiz_questions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| quiz_id | UUID | FK → quizzes.id, NOT NULL, ON DELETE CASCADE |
| question_type | question_type | NOT NULL |
| question_text | TEXT | NOT NULL |
| options | JSONB | NULLABLE (for MCQ: array of option objects) |
| correct_answer | TEXT | NOT NULL |
| explanation | TEXT | NULLABLE |
| order_index | INTEGER | NOT NULL |

**quiz_attempts**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| quiz_id | UUID | FK → quizzes.id, NOT NULL |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| score_percent | DECIMAL(5,2) | NOT NULL |
| outcome | quiz_outcome | NOT NULL |
| answers | JSONB | NOT NULL (array of {question_id, user_answer, is_correct}) |
| started_at | TIMESTAMPTZ | NOT NULL |
| completed_at | TIMESTAMPTZ | NOT NULL |

**resources**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| title | VARCHAR(500) | NOT NULL |
| url | TEXT | NOT NULL |
| source_domain | VARCHAR(255) | NOT NULL (e.g., 'freecodecamp.org') |
| modality | resource_modality | NOT NULL |
| description | TEXT | NULLABLE |
| is_primary | BOOLEAN | DEFAULT false |
| last_validated_at | TIMESTAMPTZ | NULLABLE |
| is_valid | BOOLEAN | DEFAULT true |
| avg_rating | DECIMAL(3,2) | DEFAULT 0.00 |
| rating_count | INTEGER | DEFAULT 0 |
| fetched_via | VARCHAR(50) | 'manual', 'pse_api' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**resource_ratings**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| resource_id | UUID | FK → resources.id, NOT NULL |
| user_id | UUID | FK → users.id, NOT NULL |
| rating | INTEGER | NOT NULL, CHECK (1-5) |
| comment | TEXT | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (resource_id, user_id) |

**domain_whitelist**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| domain_id | UUID | FK → domains.id, NOT NULL |
| source_domain | VARCHAR(255) | NOT NULL (e.g., 'developer.mozilla.org') |
| source_name | VARCHAR(255) | NOT NULL (e.g., 'MDN Web Docs') |
| default_modality | resource_modality | NOT NULL |
| added_by | UUID | FK → users.id |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (domain_id, source_domain) |

**adaptation_events**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| quiz_attempt_id | UUID | FK → quiz_attempts.id, NULLABLE |
| adaptation_type | adaptation_type | NOT NULL |
| details | JSONB | (e.g., {from_resource_id, to_resource_id, reason}) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**challenge_projects**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| title | VARCHAR(500) | NOT NULL |
| description | TEXT | NOT NULL |
| difficulty_level | INTEGER | 1-5 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**notifications**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| type | VARCHAR(50) | NOT NULL ('decay_reminder', 'quiz_available', 'path_unlocked') |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | |
| data | JSONB | NULLABLE (e.g., {node_id}) |
| read | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**refresh_tokens**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL, ON DELETE CASCADE |
| token_hash | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## Prisma Schema

All models are defined in `services/learning-service/prisma/schema.prisma`. The Prisma schema declaratively defines models, enums, relations, and indexes. Prisma generates migrations automatically from schema changes via `npx prisma migrate dev`.

The api-gateway service imports the generated Prisma Client from the learning-service (via a shared package or direct path reference) for user-related queries.

---

## Key Indexes

```sql
-- Fast lookups for learner progress
CREATE INDEX idx_learner_progress_user_enrollment ON learner_node_progress(user_id, enrollment_id);
CREATE INDEX idx_learner_progress_mastery_state ON learner_node_progress(mastery_state) WHERE mastery_state IN ('mastered', 'review_needed', 'relearn');
CREATE INDEX idx_learner_progress_last_reviewed ON learner_node_progress(last_reviewed_at) WHERE mastery_state = 'mastered';

-- DAG traversal
CREATE INDEX idx_node_prerequisites_node ON node_prerequisites(node_id);
CREATE INDEX idx_node_prerequisites_prereq ON node_prerequisites(prerequisite_node_id);

-- Quiz lookups
CREATE INDEX idx_quiz_attempts_user_node ON quiz_attempts(user_id, node_id);
CREATE INDEX idx_quizzes_node ON quizzes(node_id);

-- Resource lookups
CREATE INDEX idx_resources_node_modality ON resources(node_id, modality);
CREATE INDEX idx_domain_whitelist_domain ON domain_whitelist(domain_id);

-- Notification lookups
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read = false;
```

---

## Tests to Write

| Test | Asserts |
|------|---------|
| Prisma migrations apply | `npx prisma migrate dev` completes without error |
| Prisma schema reset works | `npx prisma migrate reset` completes without error |
| Foreign key constraints hold | Inserting a learner_node_progress with invalid user_id throws FK violation |
| Unique constraints hold | Duplicate (user_id, node_id) in learner_node_progress throws unique violation |
| Check constraints hold | node_prerequisites with node_id = prerequisite_node_id is rejected |
| JSONB columns accept valid data | learning_outcomes stores and retrieves an array of strings |

---

## Definition of Done

- [ ] Prisma schema defines all models, enums, relations, and indexes
- [ ] `npx prisma migrate dev` applies the schema successfully
- [ ] `npx prisma migrate reset` resets and re-applies cleanly
- [ ] Schema matches every entity described above — verified by inspecting `\dt` and `\d+ <table>` in psql
- [ ] All constraint tests pass
- [ ] Schema diagram (auto-generated or manual) reviewed against project UML class diagram
