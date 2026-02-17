# Ad Timer Widget

## Overview

The Ad Timer Widget displays a countdown timer showing when the next Twitch ad break is scheduled. It automatically shows/hides based on proximity to the ad break and provides visual feedback for different ad-related states.

**Important**: This widget uses the `useWidgetSubscription` pattern, meaning the backend must provide ad schedule data via WebSocket. The widget does not directly call the Twitch API.

## Features

### Status States

The widget supports five different status states:

1. **Invisible** - Hidden when next ad is more than configured threshold away or no ad is scheduled
2. **Ads Incoming** (⚠️) - Yellow warning shown within incoming threshold before ad break
3. **Ads in Progress** (📺) - Red pulsing indicator during ad break
4. **Back from Ads** (✅) - Green confirmation displayed for configured duration after ads complete
5. **Ads Snoozed** (😴) - Blue message displayed for configured duration after snoozing ads

### Key Behaviors

- **Automatic Visibility Control**: Widget only appears when ad break is within visibility threshold
- **Smooth Animations**: 300ms scale-up animation on state changes with proper cleanup
- **Countdown Timer**: Shows time remaining until next ad in MM:SS format
- **Snooze Detection**: Backend detects snooze events and updates widget state
- **Back from Ads**: Displays confirmation for configurable duration after ads complete
- **Real-time Updates**: Updates display every second based on WebSocket state

## Configuration

### Widget Config (via `defaultConfig`)

```typescript
{
  visibilityThreshold: 300,      // seconds (5 minutes) - hide when further away
  incomingThreshold: 120,        // seconds (2 minutes) - show "incoming" status
  snoozeDisplayDuration: 5000,   // milliseconds (5 seconds) - show snooze message
  backFromAdsDuration: 10000,    // milliseconds (10 seconds) - show back message
}
```

### Widget State (managed by backend)

```typescript
{
  status: 'invisible' | 'ads_incoming' | 'ads_in_progress' | 'back_from_ads' | 'ads_snoozed',
  secondsUntilAd: number | null,        // Calculated on frontend
  nextAdAt: string | null,              // ISO timestamp from Twitch API
  snoozeCount: number,                  // Current snooze count
  snoozedAt: string | null,             // ISO timestamp when snooze detected
  backFromAdsUntil: string | null,      // ISO timestamp until when to show back message
}
```

## Technical Implementation

### Architecture

- **Widget Pattern**: Uses `useWidgetSubscription` hook for WebSocket communication
- **Backend Responsibility**: Backend polls Twitch API and pushes state updates
- **Frontend Responsibility**: Display logic and countdown calculations only
- **OBS Compatible**: Works in OBS browser sources without React Admin context

### Dependencies

- **Luxon**: DateTime handling for timestamps
- **useWidgetSubscription Hook**: WebSocket state management
- **WidgetInstance Type**: TypeScript interface for widget data

### Component Structure

```
AdTimerWidget.tsx         - Main widget component
ad-timer/
  ├── index.ts           - Widget registration with lazy loading
  ├── AdTimerSkeleton.tsx - Loading skeleton
  └── README.md          - This documentation
```

### State Management

The widget maintains minimal local state:
- `displayStatus`: Current status for display (derived from widget state)
- `secondsUntilAd`: Calculated seconds until ad (updated every second)
- `animateChange`: Boolean for animation trigger
- `animationTimeoutRef`: Ref for timeout cleanup

### Backend Requirements

The backend must:
1. Poll Twitch API for ad schedule data (recommended: every 5 minutes)
2. Detect snooze events by tracking `snooze_count` decrements
3. Set `snoozedAt` timestamp when snooze detected
4. Set `backFromAdsUntil` timestamp when ads complete
5. Update widget state via WebSocket

## Usage

### In Application

The widget is registered in the widget registry and can be used like any other widget:

```tsx
<AdTimerWidget widgetId="my-ad-timer" />
```

### For OBS

The widget can be embedded in OBS as a browser source using the stream widget URL:

```
https://your-app.com/stream-widget/WIDGET_ID?token=TOKEN&type=ad_timer
```

## Display Position

The widget is positioned using Tailwind CSS classes:
- `fixed top-4 right-4` - Top-right corner
- `z-50` - Above most other elements
- Scales to 110% on status change for 300ms

## Color Scheme

- **Snoozed**: Blue (`bg-blue-600`)
- **Incoming**: Yellow (`bg-yellow-600`)
- **In Progress**: Red with pulse animation (`bg-red-600 animate-pulse`)
- **Back from Ads**: Green (`bg-green-600`)

## Code Splitting

The widget uses React lazy loading for code splitting, ensuring it doesn't increase the initial bundle size.

## Testing

Widget requires backend WebSocket connection and ad schedule state updates to function. For testing:

1. **Backend Mock**: Mock WebSocket state updates in development
2. **Storybook**: Requires decorator to provide WebSocket context (see Storybook decorators)

## Future Enhancements

Potential improvements:
- Sound alerts configurable via widget config
- Custom positioning via widget config
- Integration with OBS scene switching
- Configurable color themes
