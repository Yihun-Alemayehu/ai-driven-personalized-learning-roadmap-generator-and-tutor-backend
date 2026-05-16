# Phase 3: Domain Catalog & Enrollment

**Depends on:** [Phase 2: Authentication](02-auth.md)  
**Next phase:** [Phase 4: Roadmap Visualisation](04-roadmap.md)

---

## What to Build

The domain catalog browse screen, domain detail screen, enrollment bottom sheet (with learning preferences form), unenroll action, and a "My Enrollments" section on the dashboard. This is the entry point for all learner activity.

---

## API Endpoints

| Method | Path | Notes |
|--------|------|-------|
| `GET`  | `/domains` | All published domains |
| `GET`  | `/domains/:slug` | Domain detail + ontology summary |
| `POST` | `/enrollments` | `{domainId, weeklyHours?, familiarityLevel?, learningGoal?, aboutSelf?}` |
| `GET`  | `/enrollments` | Current user's enrollments |
| `GET`  | `/enrollments/:id` | Single enrollment |
| `DELETE` | `/enrollments/:id` | Unenroll |

---

## Files to Create

```
lib/
├── core/
│   ├── api/
│   │   ├── domains_api.dart
│   │   └── enrollments_api.dart
│   ├── models/
│   │   ├── domain.dart
│   │   └── enrollment.dart
│   └── providers/
│       ├── domains_provider.dart
│       └── enrollments_provider.dart
├── features/
│   ├── catalog/
│   │   ├── catalog_screen.dart
│   │   ├── domain_card.dart
│   │   ├── domain_detail_screen.dart
│   │   └── enroll_bottom_sheet.dart
│   └── dashboard/
│       └── dashboard_screen.dart      # Update with enrollments
```

---

## Key Implementation Details

### `lib/features/catalog/catalog_screen.dart`
- `GridView` (2 columns on phone, 3 on tablet) of `DomainCard` widgets
- Each card: domain name in Cormorant Garamond 20px, description in Crimson Text 14px, `border: AppColors.border`, background `AppColors.surface`
- If domain is already enrolled: show a subtle "Enrolled" badge using mastery green
- Tap → navigate to `/catalog/:slug`

### `lib/features/catalog/domain_detail_screen.dart`
- Full-screen with `SliverAppBar` collapsing domain icon
- Domain name, description, learning outcomes list, estimated hours
- Number of nodes, current published ontology version
- "Enroll now" button (if not enrolled) → opens `EnrollBottomSheet`
- "Continue learning →" button (if enrolled) → navigates to `/enrollments/:id/roadmap`

### `lib/features/catalog/enroll_bottom_sheet.dart`
A `DraggableScrollableSheet` (modal bottom sheet) with three preference fields:

1. **Weekly hours** — `Slider` (1–40) + numeric display
2. **Familiarity level** — `SegmentedButton` with three options: Beginner / Intermediate / Advanced
3. **Learning goal** — `ChoiceChip` group: Get a job / Upskill / Hobby / Certification
4. **About yourself** — optional `TextFormField` (multi-line, max 200 chars)

Pre-fill from `SettingsProvider.learningDefaults` (same as web). "Enroll" button calls `POST /enrollments`. On success: invalidate enrollments cache, pop sheet, show a `SnackBar` confirmation, navigate to the roadmap.

### `lib/features/dashboard/dashboard_screen.dart`
Two sections:

**My Enrollments** — horizontal scroll of cards, each showing:
- Domain name
- Progress bar (mastered / total nodes) 
- Last accessed time
- "Resume" button → navigate to last learn node (from `MyLearningProvider`) or roadmap

**Decay alerts** — shown if any enrolled domain has nodes in `review_needed` or `relearn` state. Small warning card with "Review now →" CTA. Built properly in Phase 7; placeholder here.

### Providers pattern
```dart
@riverpod
Future<List<Domain>> domains(DomainsRef ref) async {
  final api = ref.read(domainsApiProvider);
  return api.getDomains();
}

@riverpod
Future<List<Enrollment>> enrollments(EnrollmentsRef ref) async {
  final api = ref.read(enrollmentsApiProvider);
  return api.getMyEnrollments();
}

@riverpod
class EnrollNotifier extends _$EnrollNotifier {
  Future<void> enroll(EnrollPayload payload) async { ... }
  Future<void> unenroll(String enrollmentId) async { ... }
}
```

Use `ref.invalidate()` after mutations to refresh dependent providers.

---

## Definition of Done

- [ ] Catalog shows all published domains in a responsive grid
- [ ] Domain detail screen loads and shows correct content
- [ ] Enroll bottom sheet opens, pre-fills learning defaults from settings
- [ ] Enrollment persists — domain appears in "My Enrollments" on dashboard
- [ ] "Continue learning" navigates to roadmap for an enrolled domain
- [ ] Unenroll removes the domain from the enrollments list
- [ ] All loading states show `LoadingShimmer`; all error states show `ErrorWidget` with retry
- [ ] `flutter analyze` zero issues
