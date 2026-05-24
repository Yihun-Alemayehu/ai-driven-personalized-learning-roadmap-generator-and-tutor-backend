# Phase 10: Gamification System

**Depends on:** [Phase 9: Instructor & Admin Panels](09-instructor-admin.md)  
**Next phase:** [Phase 11: Insights Dashboard](11-insights-dashboard.md)

---

## What to Build

Gamification features to increase learner engagement: XP leveling system, daily streaks, achievement badges, and weekly learning goals. Mirrors the web Achievements page with mobile-optimized layouts.

---

## API Endpoints

| Method | Path | Notes |
|--------|------|-------|
| `GET`  | `/me/gamification` | Full summary: XP, level, streak, badges, weekly goal |

### Response includes:
- **XP**: total, level (1-10), xpIntoLevel, xpForNextLevel
- **Streak**: current day count
- **Badges**: 8 types (first_mastery, streak_5, streak_14, quiz_ace, speed_learner, completionist, consistent, comeback)
- **Weekly Goal**: target XP, progress, percentDone, weekLabel
- **Recent XP Events**: source, amount, timestamp

Level thresholds: `[0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400]`

---

## Files to Create

```
lib/
├── core/
│   ├── api/
│   │   └── gamification_api.dart       # GET /me/gamification
│   ├── models/
│   │   └── gamification_models.dart    # GamificationSummary, XpInfo, BadgeMeta, etc.
│   └── providers/
│       └── gamification_provider.dart  # gamificationProvider, earnedBadgesProvider
└── features/
    └── gamification/
        ├── widgets/
        │   ├── xp_bar.dart             # Linear progress with level text
        │   ├── streak_badge.dart       # Fire icon with day count
        │   ├── badge_grid.dart         # 4-column grid of badges
        │   ├── weekly_goal_card.dart   # Progress card with week label
        │   └── xp_events_list.dart     # Recent activity feed
        └── achievements_screen.dart    # Main screen combining all widgets
```

---

## Key Implementation Details

### Navigation Integration
- Add "Achievements" tab to `AppShell` bottom nav for learners
- Route: `/achievements`

### XP Bar Widget
- Shows `Level X` on left, `current/max XP` on right
- Linear progress indicator with primary app color
- Updates after quiz completion, node mastery, etc.

### Streak Badge
- Fire icon (`Icons.local_fire_department`)
- Orange when active, grey when no streak
- Shows "X days" or "No streak" text

### Badge Grid
- 4-column grid using `GridView`
- Earned badges: full color (amber icons)
- Unearned badges: 40% opacity, grey
- Icons map: first_mastery→trophy, streak→fire, quiz_ace→star, etc.

### Weekly Goal Card
- Card with week label (e.g., "May 20 - May 26")
- Linear progress bar
- Shows "progress/target XP (%)"
- Green text when complete

### XP Events List
- Shows last 10-15 XP earning events
- Source labels: "Node mastered", "Quiz attempt", etc.
- Amount with + prefix
- Timestamp (relative: "2 hours ago")

### Screen Layout
```
AchievementsScreen (ScrollView)
├── XpBar
├── StreakBadge (centered)
├── WeeklyGoalCard
├── "Badges" header
├── BadgeGrid
├── "Recent Activity" header  
└── XpEventsList
```

### State Management
- `gamificationProvider`: Fetches full summary
- Pull-to-refresh invalidates provider
- Display loading shimmer while loading

---

## Testing Checklist

- [ ] XP bar shows correct progress percentage
- [ ] Level calculation matches backend thresholds
- [ ] Streak badge displays correctly for 0, 1, 5+ days
- [ ] Earned badges appear full color, unearned grayed out
- [ ] Weekly goal progress updates after earning XP
- [ ] Pull-to-refresh reloads gamification data
- [ ] XP events list shows source labels correctly
