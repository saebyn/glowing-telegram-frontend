# Backend Integration Requirements for Ad Timer Widget

## Overview

The Ad Timer Widget uses the `useWidgetSubscription` pattern, which means the **backend is responsible** for polling the Twitch API and managing ad schedule state. The frontend only displays the state received via WebSocket.

## Architectural Decision: Why the Backend Polls Twitch

The primary use case for this widget is display in an **OBS browser source** — a separate, standalone browser window with no user session, no React Admin context, and no access to the authenticated user's Twitch OAuth token.

The frontend *does* have the Twitch OAuth token available in the main admin app (via `fetchAccessToken('twitch')`), and it already calls the Twitch ad schedule API directly in other places (e.g., `AdManager.tsx`). So a purely frontend approach is technically possible — but only when the admin app is open.

The problem: **we cannot require the admin app to be open just so the OBS overlay works.** If the frontend were responsible for polling, the OBS browser source would depend on another browser tab running to push state into the WebSocket. That's fragile and not a real solution for a live-streaming overlay.

By having the backend poll Twitch and push state via WebSocket:
- The OBS browser source only needs the WebSocket connection (no Twitch token, no admin session)
- The overlay works independently of whether the admin app is open
- The widget follows the same pattern as all other stream widgets

## Backend Responsibilities

### 1. Widget Type Registration

Register a new widget type: `ad_timer`

**Default Configuration:**
```json
{
  "visibilityThreshold": 300,      // seconds (5 minutes) — widget hidden when further away
  "snoozeDisplayDuration": 5000,   // milliseconds (5 seconds)
  "backFromAdsDuration": 10000     // milliseconds (10 seconds)
}
```

**Default State:**
```json
{
  "nextAdAt": null,
  "snoozeCount": 0,
  "snoozedAt": null,
  "backFromAdsUntil": null
}
```

> `status` and `secondsUntilAd` are **not** part of the backend state — they are derived by the frontend every second from `nextAdAt`.

### 2. Twitch API Polling

**Endpoint to Poll:** `GET https://api.twitch.tv/helix/channels/ads?broadcaster_id={broadcasterId}`

**Polling Frequency:** Every 5 minutes (recommended)

**Response Data Needed:**
- `next_ad_at` - Unix timestamp of next scheduled ad
- `snooze_count` - Number of available snoozes
- `last_ad_at` - Unix timestamp of last ad

### 3. State Management Logic

#### A. Update next_ad_at
```python
# Pseudo-code
ad_schedule = fetch_from_twitch_api()
widget_state.nextAdAt = ad_schedule.next_ad_at.to_iso_string()
widget_state.snoozeCount = ad_schedule.snooze_count
```

#### B. Detect Snooze Events
```python
# Track previous snooze count
if widget_state.snoozeCount < previous_snooze_count:
    # User snoozed an ad - they used up a snooze
    widget_state.snoozedAt = DateTime.now().to_iso_string()
    
previous_snooze_count = widget_state.snoozeCount
```

#### C. Detect Ad Completion
```python
# When transitioning from ads running to no longer running
last_ad_at = ad_schedule.last_ad_at

if last_ad_at_changed and was_in_ad_break:
    # Ads just finished
    duration_ms = widget_config.backFromAdsDuration  # default: 10000
    widget_state.backFromAdsUntil = (
        DateTime.now() + duration_ms
    ).to_iso_string()
```

### 4. WebSocket State Updates

Push state updates to subscribed clients whenever:
1. Twitch API returns new data (every 5 minutes)
2. Snooze event detected
3. Ad completion detected

**WebSocket Message Format:**
```json
{
  "type": "WIDGET_STATE_UPDATE",
  "widgetId": "widget-123",
  "state": {
    "nextAdAt": "2024-02-17T12:30:00.000Z",
    "snoozeCount": 2,
    "snoozedAt": null,
    "backFromAdsUntil": null
  }
}
```

> **Important**: `WIDGET_STATE_UPDATE` **replaces** the entire widget state — it does not merge. Always send all four fields (`nextAdAt`, `snoozeCount`, `snoozedAt`, `backFromAdsUntil`) in every update, even if only one changed.

## Frontend Behavior

The frontend will:
1. Calculate `secondsUntilAd` every second based on `nextAdAt`
2. Determine display status based on:
   - `snoozedAt` + `snoozeDisplayDuration` → shows "Ads Snoozed"
   - `backFromAdsUntil` > now → shows "Back from Ads"
   - `secondsUntilAd` vs thresholds → shows appropriate countdown
3. Hide widget when `secondsUntilAd > visibilityThreshold`

## Status Transition Logic (Frontend)

```
if snoozedAt exists and within snoozeDisplayDuration:
    status = "ads_snoozed" (blue)
else if backFromAdsUntil exists and > now:
    status = "back_from_ads" (green)
else if nextAdAt is null or secondsUntilAd > visibilityThreshold:
    status = "invisible" (hidden)
else if secondsUntilAd <= 0:
    status = "ads_in_progress" (red, pulsing)
else:
    status = "ads_incoming" (yellow, shows countdown)
```

## Testing Checklist

- [ ] Widget type `ad_timer` registered in backend
- [ ] Twitch API polling implemented (every 5 minutes)
- [ ] Snooze detection working (tracks snooze_count decrements)
- [ ] Ad completion detection working (sets backFromAdsUntil)
- [ ] WebSocket state updates sent to clients
- [ ] Widget instance can be created in admin interface
- [ ] Widget displays correctly in OBS browser source
- [ ] Countdown updates every second
- [ ] Snooze message displays for 5 seconds
- [ ] Back from ads message displays for 10 seconds
- [ ] Widget hides when > 5 minutes from next ad

## Example Backend Implementation (Python/Django)

```python
from datetime import datetime, timedelta
import requests

class AdTimerWidgetHandler:
    def __init__(self, widget_instance):
        self.widget = widget_instance
        self.previous_snooze_count = None
        self.last_ad_at = None
        
    async def poll_twitch_api(self):
        """Poll Twitch API every 5 minutes"""
        broadcaster_id = self.widget.user.twitch_broadcaster_id
        access_token = self.widget.user.twitch_access_token
        
        response = requests.get(
            f"https://api.twitch.tv/helix/channels/ads?broadcaster_id={broadcaster_id}",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Client-Id": TWITCH_CLIENT_ID,
            }
        )
        
        ad_schedule = response.json()["data"][0]
        
        # Update state
        state_updates = {
            "nextAdAt": ad_schedule["next_ad_at"],
            "snoozeCount": ad_schedule["snooze_count"],
        }
        
        # Detect snooze
        if (self.previous_snooze_count is not None and 
            ad_schedule["snooze_count"] < self.previous_snooze_count):
            state_updates["snoozedAt"] = datetime.now().isoformat()
        
        # Detect ad completion
        current_last_ad = ad_schedule["last_ad_at"]
        if current_last_ad != self.last_ad_at and self.last_ad_at is not None:
            duration_ms = self.widget.config["backFromAdsDuration"]
            until = datetime.now() + timedelta(milliseconds=duration_ms)
            state_updates["backFromAdsUntil"] = until.isoformat()
        
        # Update tracking variables
        self.previous_snooze_count = ad_schedule["snooze_count"]
        self.last_ad_at = current_last_ad
        
        # Push to WebSocket
        await self.push_state_update(state_updates)
```

## Questions?

Contact the frontend team if you need clarification on any of these requirements.
