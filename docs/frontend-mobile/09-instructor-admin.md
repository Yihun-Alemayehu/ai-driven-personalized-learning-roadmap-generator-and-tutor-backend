# Phase 9: Instructor & Admin Panels

**Depends on:** [Phase 8: Branching, Profile & Settings](08-branching-profile-settings.md)  
**Next phase:** [Phase 10: Polish, Tests & CI](10-polish-tests-ci.md)

---

## What to Build

Role-gated panels for instructors and admins. The instructor section mirrors the web's instructor dashboard (learner cohort, progress details, analytics charts, flagged events). The admin section covers user management, domain management, and system statistics. The ontology builder (React Flow canvas) is intentionally deferred to a future release — too complex for mobile touch input.

---

## API Endpoints

### Instructor
| Method | Path | Notes |
|--------|------|-------|
| `GET`  | `/instructor/learners` | `?domainId=` — list enrolled learners |
| `GET`  | `/instructor/learners/:userId/progress` | Enrollments + node progress per user |
| `GET`  | `/instructor/learners/:userId/quiz-history` | `?limit=50` |
| `GET`  | `/instructor/domains/:domainId/analytics` | NodeAnalytic array, masteryRate, enrollmentCount |
| `GET`  | `/instructor/flagged` | Flagged events queue |
| `PATCH`| `/instructor/flagged/:eventId/resolve` | `{resolutionNotes}` |

### Admin
| Method | Path | Notes |
|--------|------|-------|
| `GET`  | `/admin/users` | `?role=&page=&limit=` |
| `PATCH`| `/admin/users/:id/role` | `{role}` |
| `DELETE`| `/admin/users/:id` | Permanent delete |
| `GET`  | `/admin/stats` | System-wide KPI stats |
| `GET`  | `/admin/stats/domains` | Per-domain stats |
| `GET`  | `/admin/domains` | All domains |
| `POST` | `/admin/domains` | Create domain |
| `PATCH`| `/admin/domains/:id` | Update domain |

---

## Files to Create

```
lib/
├── core/
│   ├── api/
│   │   ├── instructor_api.dart
│   │   └── admin_api.dart
│   ├── models/
│   │   ├── instructor_models.dart    # InstructorEnrollment, NodeAnalytic, FlaggedEvent
│   │   └── admin_models.dart         # AdminUser, SystemStats, DomainStat
│   └── providers/
│       ├── instructor_provider.dart
│       └── admin_provider.dart
└── features/
    ├── instructor/
    │   ├── instructor_shell.dart     # Nested tab navigation for instructor section
    │   ├── learner_list_screen.dart
    │   ├── learner_progress_screen.dart
    │   ├── analytics_screen.dart
    │   └── flagged_events_screen.dart
    └── admin/
        ├── admin_shell.dart
        ├── system_stats_screen.dart
        ├── user_management_screen.dart
        └── domain_management_screen.dart
```

---

## Key Implementation Details

### Navigation for Role Panels
When the logged-in user's role is `instructor` or `admin`, the `AppShell` bottom nav adds a 5th tab ("Instructor" or "Admin" — admin sees both if role is admin). Tapping the tab navigates to the respective shell.

`InstructorShell` and `AdminShell` use a nested `TabBar` or `NavigationRail` (on tablet) for switching between sub-sections within the panel.

### Instructor — Learner List Screen
- `SearchBar` to filter by name/email
- `ListView` of `LearnerTile` widgets: avatar, full name, email, enrolled domain name, `nodeProgress` count
- Tap → `LearnerProgressScreen`

### Instructor — Learner Progress Screen
- User header card (name, email, enrollment info)
- Domain-grouped `ExpansionTile` list showing each node's mastery state, best quiz score, attempt count
- "Quiz History" tab (same screen, `TabBar`): `DataTable` of attempt rows (node title, score %, outcome, date)
- Each row tappable → `AttemptReviewScreen`

### Instructor — Analytics Screen
- Domain selector `DropdownButton` at top
- Summary stats row: enrollment count, overall mastery rate (large numbers in Cormorant Garamond)
- **Mastery Rate Chart** (`fl_chart` horizontal `BarChart`): nodes sorted by mastery rate ascending, colour-coded (green ≥70%, amber ≥40%, terracotta <40%). Matches web `MasteryRateChart`.
- **Problem nodes** section: bottom 5 nodes with lowest mastery rate displayed as `ListTile` cards

### Instructor — Flagged Events Screen
- `ListView` of `FlaggedEventCard` widgets
- Each card: user name, node title, adaptation type badge, fail count, creation date
- Unresolved events in `AppColors.surface` tinted with accent; resolved in plain surface
- Tap → opens `FlaggedEventDetailSheet` (bottom sheet): full details + "Resolve" form
- "Resolve" form: `TextFormField` for resolution notes + confirm button

### Admin — System Stats Screen
- 4 KPI `StatCard` widgets in a `GridView` (2 cols): total users, enrollments, quiz attempts, avg quiz score
- Mastery breakdown: `GridView` of 5 small badges (one per mastery state)
- Domain stats `DataTable`: domain name, enrollment count, avg completion, avg quiz score

### Admin — User Management Screen
- `SearchBar` + role filter `SegmentedButton`
- `ListView` of `UserManagementTile`: avatar, name, email, role badge
- Tap → opens `UserActionSheet` (bottom sheet):
  - Current role display
  - `DropdownButton` to change role → `PATCH /admin/users/:id/role`
  - "Delete user" destructive button with `AlertDialog` confirmation → `DELETE /admin/users/:id`

### Admin — Domain Management Screen
- `ListView` of domain cards, each with edit icon
- "Add domain" FAB → `DomainFormSheet` (bottom sheet) with name, slug, description fields
- Tap edit icon → same sheet pre-filled for editing
- Each domain card shows ontology version status badge (draft / published)

---

## Definition of Done

- [ ] Instructor tab only visible when `user.role == 'instructor' || 'admin'`
- [ ] Admin tab only visible when `user.role == 'admin'`
- [ ] Learner list loads and filters by search term
- [ ] Learner progress screen shows per-node mastery states
- [ ] Analytics chart renders correctly with `fl_chart` bar chart
- [ ] Flagged events can be resolved with resolution notes
- [ ] System stats screen shows correct KPI numbers
- [ ] Admin can change user roles and delete users
- [ ] Admin can create and edit domains
- [ ] All screens have loading shimmer and empty/error states
- [ ] `flutter analyze` zero issues
