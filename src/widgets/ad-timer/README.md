# Ad Timer Widget

## Overview

The Ad Timer Widget displays a countdown timer showing when the next Twitch ad break is scheduled. It automatically shows/hides based on proximity to the ad break and provides visual feedback for different ad-related states.

## Features

### Status States

The widget supports five different status states:

1. **Invisible** - Hidden when next ad is more than 5 minutes away or no ad is scheduled
2. **Ads Incoming** (⚠️) - Yellow warning shown 2-5 minutes before ad break
3. **Ads in Progress** (📺) - Red pulsing indicator during ad break
4. **Back from Ads** (✅) - Green confirmation after returning from ads
5. **Ads Snoozed** (😴) - Blue message displayed for 5 seconds after snoozing ads

### Key Behaviors

- **Automatic Visibility**: Widget only appears when ad break is within 5 minutes
- **Smooth Animations**: Scales up briefly (300ms) when transitioning between states
- **Countdown Timer**: Shows time remaining until next ad in MM:SS format
- **Snooze Detection**: Automatically detects when ads are snoozed and displays confirmation
- **Real-time Updates**: Polls Twitch API every 5 minutes, updates display every second

## Configuration

### Constants

Located in `AdTimerWidget.tsx`:

```typescript
VISIBILITY_THRESHOLD_SECONDS = 300  // 5 minutes - hide when further away
SNOOZE_DISPLAY_DURATION_MS = 5000   // Show snooze message for 5 seconds
INCOMING_THRESHOLD_SECONDS = 120    // 2 minutes - show "incoming" status
IN_PROGRESS_THRESHOLD_SECONDS = 0   // When next_ad_at is in the past
```

### Widget Definition

Located in `ad-timer/index.ts`:

```typescript
{
  type: 'ad_timer',
  name: 'Ad Timer',
  description: 'Display a timer showing when the next ad break is scheduled...',
  defaultConfig: {
    visibilityThreshold: 300,  // seconds (5 minutes)
    incomingThreshold: 120,    // seconds (2 minutes)
  },
  defaultState: {
    status: 'invisible',
    secondsUntilAd: null,
  }
}
```

## Technical Implementation

### Dependencies

- **Luxon**: DateTime and Duration handling
- **Twitch API**: Ad schedule fetching via `getAdSchedule()`
- **useProfile Hook**: Access to Twitch credentials

### Component Structure

```
AdTimerWidget.tsx         - Main widget component
ad-timer/
  ├── index.ts           - Widget registration
  ├── AdTimerSkeleton.tsx - Loading skeleton
```

### State Management

The widget maintains internal state for:
- Current status (invisible, incoming, in_progress, back_from_ads, snoozed)
- Seconds until next ad
- Ad schedule data from Twitch API
- Error state
- Snooze timestamp for detection

### Display Position

The widget is positioned using Tailwind CSS classes:
- `fixed top-4 right-4` - Top-right corner
- `z-50` - Above most other elements

## Usage

### In Application

The widget is registered in the widget registry and can be used like any other widget:

```tsx
<AdTimerWidget widgetId="my-ad-timer" />
```

### For OBS

The widget can be embedded in OBS as a browser source using the stream widget URL with the ad_timer type.

## Color Scheme

- **Snoozed**: Blue (`bg-blue-600`)
- **Incoming**: Yellow (`bg-yellow-600`)
- **In Progress**: Red with pulse animation (`bg-red-600 animate-pulse`)
- **Back from Ads**: Green (`bg-green-600`)

## Testing

The widget includes Storybook stories for different states:
- `AdTimerWidget.stories.tsx` - Various state demonstrations

To test locally:
```bash
npm run storybook
```

Note: Full functionality requires Twitch authentication and live ad schedule data.

## Future Enhancements

Potential improvements:
- Configurable thresholds via widget config
- Custom color schemes
- Sound alerts
- Position configuration
- Integration with OBS scene switching
