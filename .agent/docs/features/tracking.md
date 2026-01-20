---
title: Tracking Feature
date: "2026-01-19"
type: feature
status: shipped
---

# Tracking Feature

Only allowing users to track habits and daily counts (streaks) was a highly requested feature to improve user engagement. This feature introduces a flexible tracking system.

## Capabilities

- **Create Trackers**: Users can create multiple trackers with custom names, icons, and colors.
- **Log Entries**: Users can toggle daily completion (for habits) or log values.
- **View History**: A calendar view shows past activity.
- **Streak Calculation**: Visual feedback on consecutive days.
- **Optimized UI**: Grid layout with "Tracker Cards" for quick access.

## Technical Implementation

### Database
Added two models to `prisma/schema.prisma`:
- `Tracker`: Stores metadata (title, icon, color, goal).
- `TrackingEntry`: Stores daily logs (date, value).

### API
- `GET /api/trackers`: Returns trackers with optimized `include` for recent entries.
- `POST /api/trackers`: Creates a new tracker.
- `POST /api/trackers/[id]/entries`: Upserts entries for a specific date.

### Frontend
- **TrackingView**: Main container (`src/components/tracking/tracking-view.tsx`).
- **TrackerCard**: Reusable component for individual habit status.
- **NewTrackerModal**: Form for creation using `Dialog`.

## Usage
Access via the **Tracking** tab in the sidebar (Activity icon).

## Future Improvements
- [ ] Detailed analytics view (graphs).
- [ ] Notification reminders.
- [ ] "Count" type trackers (e.g., 8 glasses of water) instead of just boolean toggles.
