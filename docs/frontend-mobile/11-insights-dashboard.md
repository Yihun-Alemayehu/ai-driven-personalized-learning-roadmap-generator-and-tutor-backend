# Phase 11: Insights Dashboard

**Depends on:** [Phase 10: Gamification System](10-gamification.md)  
**Next phase:** [Phase 12: Polish, Tests & CI](12-polish-tests-ci.md)

---

## What to Build

Personalized learning analytics dashboard for each enrollment showing activity patterns, progress statistics, weak areas, and learning velocity. Helps learners understand their study habits and identify focus areas.

---

## API Endpoints

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/enrollments/:id/insights` | Profile stats, weak areas, velocity, achievements |
| `GET` | `/enrollments/:id/activity` | Daily activity heatmap (last 30 days) |
| `GET` | `/enrollments/:id/progress-stats` | Detailed progress by mastery state |
| `GET` | `/enrollments/:id/timeline` | Learning timeline events |

### Response includes:
- **Profile**: totalNodes, masteredNodes, inProgressNodes, completionPercentage
- **WeakAreas**: nodeId, nodeTitle, failCount, lastAttemptAt (sorted by failCount desc)
- **Velocity**: nodesPerWeek, quizzesPerWeek, trend ('improving'|'stable'|'declining')
- **ActivityDay**: date, xpEarned, hasActivity (for heatmap)

---

## Files to Create

```
lib/
├── core/
│   ├── api/
│   │   └── insights_api.dart         # Enrollment-scoped insights endpoints
│   ├── models/
│   │   └── insights_models.dart    # InsightsData, ProfileStats, WeakArea, ActivityDay
│   └── providers/
│       └── insights_provider.dart  # Family providers by enrollmentId
└── features/
    └── insights/
        ├── widgets/
        │   ├── activity_heatmap.dart    # 30-day grid with color intensity
        │   ├── profile_card.dart        # Completion % + mastery breakdown
        │   ├── weak_areas_panel.dart   # List of topics needing practice
        │   └── velocity_card.dart       # Stats with trend indicator
        └── insights_screen.dart        # Main screen with pull-to-refresh
```

---

## Key Implementation Details

### Navigation
- Route: `/enrollments/:id/insights`
- Access from Roadmap screen "Insights" button or Enrollment detail

### Activity Heatmap
- Grid showing last 30 days of activity
- Color intensity: grey (none) → light green → medium green → dark green
- Based on `xpEarned`: 0, <50, <100, <200, 200+
- Tooltip on tap showing date and XP earned
- Legend below grid explaining colors

### Profile Card
- Shows domain name as title
- Linear progress bar for completion percentage
- Three stat columns: Mastered (green), In Progress (blue), Not Started (grey)
- Large numbers in Cormorant Garamond font

### Weak Areas Panel
- Title: "Focus Areas" with subtitle "Topics that need more practice"
- Shows top 5 weak areas sorted by failCount
- Warning icon: red if failCount ≥ 2, orange otherwise
- Displays node title and "X failed attempts"
- Tappable → navigates to node detail for review
- Empty state: encouraging message "No weak areas - you're doing great!"

### Velocity Card
- Two columns: Nodes/week and Quizzes/week
- Large icons (account_tree, quiz)
- Values as "X.X" with labels below
- Trend indicator at bottom:
  - Improving: green trending_up icon
  - Declining: red trending_down icon  
  - Stable: orange trending_flat icon

### Screen Layout
```
InsightsScreen (ScrollView + RefreshIndicator)
├── ProfileCard (domain name, completion %, mastery stats)
├── ActivityHeatmap (30-day activity grid)
├── VelocityCard (pace + trend)
└── WeakAreasPanel (focus topics)
```

### State Management
- Family providers keyed by enrollmentId
- Pull-to-refresh invalidates all insight providers
- AsyncValue handling for loading/error states

---

## Testing Checklist

- [ ] Activity heatmap shows correct color intensity based on XP earned
- [ ] Profile card displays accurate completion percentage
- [ ] Weak areas sorted by fail count (highest first)
- [ ] Velocity card shows correct trend indicator icon/color
- [ ] Pull-to-refresh updates all data simultaneously
- [ ] Empty weak areas shows encouraging message instead of blank
- [ ] Tapping weak area navigates to node detail screen
- [ ] Loading shimmer while data fetches
- [ ] Error state handled gracefully with retry option
