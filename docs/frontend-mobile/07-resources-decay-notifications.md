# Phase 7: Resources, Decay & Notifications

**Depends on:** [Phase 6: Quiz & Gatekeeper](06-quiz.md)  
**Next phase:** [Phase 8: Branching, Profile & Settings](08-branching-profile-settings.md)

---

## What to Build

Three systems that complete the learner experience loop:

1. **Resources** — tabbed resource panel per node (documentation, tutorial, video, etc.) with ratings
2. **Decay** — dashboard widget showing topics with decayed mastery; decay panel with micro-quiz flow
3. **Notifications** — in-app notification list with unread badge; local notification scheduling for decay reminders

---

## API Endpoints

| Method | Path | Notes |
|--------|------|-------|
| `GET`    | `/nodes/:nodeId/resources` | Resources sorted by rating |
| `POST`   | `/nodes/:nodeId/resources/discover` | Trigger PSE discovery |
| `POST`   | `/resources/:id/rate` | `{rating: 1-5}` |
| `GET`    | `/enrollments/:id/decay-status` | All nodes with decay metadata |
| `POST`   | `/nodes/:nodeId/micro-quiz` | Generate 2–3 question micro-quiz |
| `GET`    | `/notifications` | `?limit=20&offset=0` |
| `PATCH`  | `/notifications/:id/read` | Mark one read |
| `PATCH`  | `/notifications/read-all` | Mark all read |

---

## Files to Create

```
lib/
├── core/
│   ├── api/
│   │   ├── resources_api.dart
│   │   ├── decay_api.dart
│   │   └── notifications_api.dart
│   ├── models/
│   │   ├── resource.dart
│   │   ├── decay_status.dart
│   │   └── notification.dart
│   └── providers/
│       ├── resources_provider.dart
│       ├── decay_provider.dart
│       └── notifications_provider.dart
└── features/
    ├── resources/
    │   ├── resources_panel.dart       # Shown as bottom sheet from NodeDetailSheet
    │   ├── resource_card.dart
    │   └── modality_tabs.dart         # Tab bar: All | Docs | Tutorial | Video | ...
    ├── decay/
    │   ├── decay_panel.dart           # Dashboard widget
    │   ├── decay_node_card.dart
    │   └── micro_quiz_sheet.dart      # Bottom sheet with micro-quiz
    └── notifications/
        ├── notifications_screen.dart
        ├── notification_tile.dart
        └── notifications_badge.dart   # Unread count badge on app bar icon
```

---

## Key Implementation Details

### Resources Panel
A `DraggableScrollableSheet` (modal bottom sheet). Tab bar at top using `TabBar` with modality labels. Each tab shows a `ListView` of `ResourceCard` widgets.

`ResourceCard`:
- Title (Crimson Text 15px, bold)
- Source domain + modality chip (JetBrains Mono 11px)
- Star rating row: 5 tappable `Icon(Icons.star)` icons; tapping calls `POST /resources/:id/rate`
- External link icon → `url_launcher` opens the resource URL

"Discover more resources" button at bottom triggers `POST /nodes/:nodeId/resources/discover` and refreshes the list.

### Decay Panel (on Dashboard)
A `Card` widget shown only when the `decayProvider` has nodes in `review_needed` or `relearn` state.

- Header: "Topics need review" in Cormorant Garamond
- List of up to 3 `DecayNodeCard` widgets, each showing:
  - Node title
  - Days since last review
  - Mastery state badge (review_needed / relearn)
  - "Review now" button → opens `MicroQuizSheet`
- "See all →" link to a full list

### Micro Quiz Sheet
A `showModalBottomSheet` with `isScrollControlled: true`. Behaviour identical to the main quiz (Phase 6) but with only 2–3 questions from `POST /nodes/:nodeId/micro-quiz`. After completion:
- Pass: dismiss sheet, update roadmap provider, show `SnackBar` "Mastery confirmed"
- Fail: show simplified outcome in-sheet with "Try again" option

### Notifications Screen
`NotificationsScreen` route (`/notifications`):
- `ListView` of `NotificationTile` widgets
- Each tile: icon based on `type`, title, body text, timestamp (relative: "2 hours ago"), read/unread indicator
- Unread tiles have `AppColors.surface` tinted background; read tiles plain
- Swipe-to-dismiss marks as read (updates `PATCH /notifications/:id/read`)
- App bar action: "Mark all read"

`NotificationsBadge` widget:
- Wraps the bell icon in the `AppShell` bottom nav / app bar
- Shows a red dot with count when `unreadCount > 0`
- Reads from `notificationsProvider` which polls every 60 seconds (or uses `ref.listen`)

### Local Notifications
Schedule a daily local notification (via `flutter_local_notifications`) if the user has `decayReminders` enabled in `SettingsProvider` and there are nodes in decay. Schedule it for 9 AM each day. Cancel on logout.

---

## Definition of Done

- [ ] Resources bottom sheet opens from node detail, shows tabbed list by modality
- [ ] Rating a resource persists (re-loading shows updated average)
- [ ] "Discover more" triggers PSE discovery and refreshes resource list
- [ ] Dashboard shows decay card when topics need review
- [ ] Micro-quiz bottom sheet launches for a decay node, functions like a mini quiz
- [ ] Roadmap mastery states update after successful micro-quiz
- [ ] Notifications screen loads and shows unread/read notifications
- [ ] Swipe to dismiss marks a notification as read
- [ ] "Mark all read" clears unread badge in bottom nav
- [ ] Notification badge shows correct unread count
- [ ] `flutter analyze` zero issues
