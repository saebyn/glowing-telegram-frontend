# Stream Widgets Expansion Plan

## Executive Summary

This plan outlines the architecture and implementation strategy for expanding the stream widgets capability to support:
1. **Persistent backend state** - Widget state survives browser restarts
2. **Cross-instance synchronization** - OBS and web views stay in sync
3. **Multiple widget types** - Extensible architecture for various widget types
4. **Backend integration** - Secure access to Twitch and other APIs
5. **Real-time updates** - Immediate synchronization across all instances

## Current State Analysis

### What We Have
- **CountdownTimerWidget**: Basic countdown timer display
- **BroadcastChannel**: Cross-tab synchronization (browser-only)
- **TimerManager**: Client-side state management
- **WebSocket infrastructure**: Already connected to backend for task updates
- **Route-based widget loading**: `/widgets/:widget/:params` pattern

### Current Limitations
1. ❌ State stored only in memory (lost on browser restart)
2. ❌ BroadcastChannel doesn't work across OBS + web browser
3. ❌ No backend persistence layer
4. ❌ Only one widget type (countdown timer)
5. ❌ Direct API access requires frontend credentials
6. ❌ No widget configuration management

## Architecture Design

### 1. Backend State Management

#### New Backend Endpoints

**CRUD API Resource (automatically available via existing infrastructure):**
```
GET    /records/stream_widgets                          # List current user's widgets (auto-filtered by user_id)
POST   /records/stream_widgets                          # Create widget instance(s) - user_id auto-injected
GET    /records/stream_widgets/:id                      # Get single widget (validates ownership)
PUT    /records/stream_widgets/:id                      # Update widget (validates ownership)
DELETE /records/stream_widgets/:id                      # Delete widget (validates ownership)
GET    /records/stream_widgets/many?id=a&id=b          # Batch get (only returns user's widgets)
GET    /records/stream_widgets/type/:type               # Query by type (scoped to current user)
```

**User Isolation:**
- ✅ All endpoints automatically filter by authenticated `user_id` from JWT/session
- ✅ Backend injects `user_id` on CREATE operations
- ✅ Backend validates ownership on GET/PUT/DELETE operations
- ✅ No user_id parameters exposed in API - security by design
- ✅ Prevents users from accessing or modifying other users' widgets

**WebSocket-Only Communication:**
- All widget actions (start, pause, reset, etc.) sent via WebSocket messages
- No additional HTTP endpoints needed for actions
- Lower latency for real-time interactions
- Simpler architecture - one connection for both state updates and actions

**Backend Configuration Required (in `crud_api/src/main.rs`):**
```rust
// Add to Config struct:
stream_widgets_table: String,

// Add to get_table_config():
"stream_widgets" => TableConfig {
    table_name: &state.config.stream_widgets_table,
    partition_key: "id",
    q_key: "title",
    indexes: vec!["type", "active"],  // Note: user_id used for filtering but not as queryable index
    user_scoped: true,                // Enable automatic user_id filtering/injection
},
```

**User Scoping Implementation:**
```rust
// Middleware automatically:
// 1. Extracts user_id from authenticated session/JWT
// 2. On LIST/GET: Adds user_id filter to query
// 3. On CREATE: Injects user_id into record
// 4. On UPDATE/DELETE: Validates user_id matches authenticated user
// 5. Returns 403 Forbidden if user tries to access another user's widget
```

#### Widget State Schema
```typescript
interface WidgetInstance {
  id: string;                           // DynamoDB partition key
  title: string;                        // DynamoDB q_key - User-friendly name
  user_id: string;                      // Indexed - owner of the widget
  type: string;                         // Indexed - 'countdown', 'follower-alert', etc.
  access_token: string;                 // Static secret for OBS authentication (auto-generated)
  config: Record<string, unknown>;      // Widget-specific configuration
  state: Record<string, unknown>;       // Current runtime state
  active: boolean;                      // Indexed - Is widget currently active
  created_at: string;                   // ISO timestamp
  updated_at: string;                   // ISO timestamp
}
```

**Note**: 
- The existing CRUD API uses snake_case for field names and provides automatic `id` generation, `created_at`, and `updated_at` timestamps.
- `access_token` is generated once when widget is created (e.g., `crypto.randomUUID()`)
- User can regenerate token if needed (updates the field)

#### Example: Countdown Timer State
```typescript
interface CountdownTimerConfig {
  timerId: string;
  text: string;
  title: string;
  duration: number;                     // Total duration in seconds
}

interface CountdownTimerState {
  duration_left: number;                 // Remaining time in seconds
  enabled: boolean;                     // Is timer running
  last_tick_timestamp: string;            // ISO timestamp of last tick
}
```

### 2. Real-Time Synchronization

#### WebSocket Events
Extend existing WebSocket connection to handle widget updates:

```typescript
// Client → Server: Subscribe to widget updates
interface WidgetSubscribeMessage {
  type: 'WIDGET_SUBSCRIBE';
  widgetId: string;
}

// Client → Server: Unsubscribe from widget updates
interface WidgetUnsubscribeMessage {
  type: 'WIDGET_UNSUBSCRIBE';
  widgetId: string;
}

// Client → Server: Execute widget action
interface WidgetActionMessage {
  type: 'WIDGET_ACTION';
  widgetId: string;
  action: string;                       // 'start', 'pause', 'reset', etc.
  payload?: Record<string, unknown>;
}

// Server → Client: Widget state update (broadcast to all subscribers)
interface WidgetStateUpdateMessage {
  type: 'WIDGET_STATE_UPDATE';
  widgetId: string;
  state: Record<string, unknown>;
  timestamp: string;
}

// Server → Client: Widget config update (when config changes via API)
interface WidgetConfigUpdateMessage {
  type: 'WIDGET_CONFIG_UPDATE';
  widgetId: string;
  config: Record<string, unknown>;
}

// Server → Client: Action acknowledgment/error
interface WidgetActionResponseMessage {
  type: 'WIDGET_ACTION_RESPONSE';
  widgetId: string;
  action: string;
  success: boolean;
  error?: string;
}

// Server → Client: Initial state after subscription
interface WidgetInitialStateMessage {
  type: 'WIDGET_INITIAL_STATE';
  widgetId: string;
  widget: WidgetInstance;               // Full widget record including config and state
}
```

#### Synchronization Flow
1. Widget loaded in OBS/browser → Connect to WebSocket (authenticated)
2. Client sends `WIDGET_SUBSCRIBE` with `widgetId`
3. Backend validates user owns the widget (checks user_id from auth)
4. Backend sends `WIDGET_INITIAL_STATE` with current widget data
5. User takes action (e.g., starts timer) → Client sends `WIDGET_ACTION` via WebSocket
6. Backend validates ownership and action, updates DynamoDB state
7. Backend sends `WIDGET_ACTION_RESPONSE` to action sender (success/error)
8. Backend broadcasts `WIDGET_STATE_UPDATE` to all subscribed clients
9. All instances (OBS + web) update simultaneously

#### WebSocket Authentication Strategy

**Two Connection Types:**

1. **Stream Manager (Web App)** - Full authenticated session:
   ```typescript
   // Normal web app - uses existing auth
   const ws = new WebSocket(`${WEBSOCKET_URL}`);
   // Session cookie or JWT automatically included
   // User can subscribe to all their widgets
   // Can execute actions on all their widgets
   ```

2. **OBS Browser Source** - Token-based read-only:
   ```typescript
   // Widget URL: /widgets/abc123?token=eyJhbGc...
   // Extract token from URL
   const urlParams = new URLSearchParams(window.location.search);
   const token = urlParams.get('token');
   
   // Connect with token in URL
   const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);
   // Token grants read-only access to specific widget
   // Cannot execute actions (display only)
   ```

**Backend Token Validation:**
```rust
// On WebSocket connection, check token parameter:

1. Cognito JWT (Stream Manager) - verified with JWKS from Cognito
   - Validate JWT signature using Cognito JWKS endpoint
   - Extract user_id from JWT claims (sub or custom claim)
   - Grant full access: Can subscribe to all user's widgets
   - Can execute actions on all user's widgets
   - Token format: Standard Cognito JWT (starts with "eyJ")
   
2. Widget access token (OBS) - static secret stored in widget record
   - Token format: Random UUID string (e.g., "a1b2c3d4-...")
   - Query widgets table: SELECT * WHERE access_token = ?
   - If found: Grant read-only access to that specific widget
   - No expiration (static per widget, regenerate if compromised)
   - Can only subscribe to widget updates (cannot execute actions)

3. If neither valid: Reject connection with 401 Unauthorized

// Pseudo-code for backend:
async fn authenticate_websocket(token: &str) -> Result<AuthContext> {
    // Try Cognito JWT first (starts with "eyJ")
    if token.starts_with("eyJ") {
        if let Ok(cognito_claims) = verify_cognito_jwt(token).await {
            return Ok(AuthContext::FullAccess {
                user_id: cognito_claims.sub,
            });
        }
    }
    
    // Try widget access token (look up in widgets table)
    if let Some(widget) = db.find_widget_by_access_token(token).await? {
        return Ok(AuthContext::WidgetAccess {
            widget_id: widget.id,
            user_id: widget.user_id,
            read_only: true,  // OBS tokens are always read-only
        });
    }
    
    Err(AuthError::Unauthorized)
}
```

**Security Considerations:**
- OBS tokens are read-only by default (display widgets only)
- Actions (start/pause/reset) only allowed from authenticated sessions
- Token embedded in widget URL generated in Stream Manager
- Token expires after configurable period (e.g., 1 year for OBS stability)
- User can revoke/regenerate token from Stream Manager
- Token valid for ONE widget only, not user's other widgets

**Action Permissions:**
```
Stream Manager → WebSocket (session auth)
  ✅ Subscribe to widgets
  ✅ Execute actions (start/pause/reset)
  ✅ Full control

OBS Browser Source → WebSocket (token auth)
  ✅ Subscribe to widget (specific widget only)
  ❌ Execute actions (403 Forbidden)
  ⚠️  Display only
```

**Note on Widget Actions from OBS:**
Widget access tokens are read-only for security. If you need to control widgets from OBS (e.g., Stream Deck hotkeys), you have two options:

1. **Use Cognito JWT** - Authenticate OBS browser source with full session (more complex)
2. **Control via Stream Manager** - Keep OBS as display-only, control from web app
3. **Future Enhancement** - Add optional write permission flag to widget if needed

**Benefits of WebSocket-Only Actions:**
- ✅ Lower latency (no HTTP request/response cycle)
- ✅ Immediate feedback to user
- ✅ Automatic fan-out to all connected instances
- ✅ Simpler infrastructure (no additional endpoints)
- ✅ Better for real-time interactions
- ✅ Connection already authenticated, no token management for actions

### 3. Frontend Architecture

#### Extending Existing WebSocket Hook

The existing `useWebsocket` hook can be extended to support widget messages alongside task updates:

```typescript
// src/hooks/useWebsocket.tsx - Extended version

// Add widget message types to existing TaskStatusWebsocketMessage
export type WebsocketMessage = 
  | TaskStatusWebsocketMessage 
  | WidgetStateUpdateMessage
  | WidgetInitialStateMessage
  | WidgetActionResponseMessage
  | WidgetConfigUpdateMessage;

export interface WidgetStateUpdateMessage {
  type: 'WIDGET_STATE_UPDATE';
  widgetId: string;
  state: Record<string, unknown>;
  timestamp: string;
}

export interface WidgetInitialStateMessage {
  type: 'WIDGET_INITIAL_STATE';
  widgetId: string;
  widget: WidgetInstance;
}

export interface WidgetActionResponseMessage {
  type: 'WIDGET_ACTION_RESPONSE';
  widgetId: string;
  action: string;
  success: boolean;
  error?: string;
}

export interface WidgetConfigUpdateMessage {
  type: 'WIDGET_CONFIG_UPDATE';
  widgetId: string;
  config: Record<string, unknown>;
}

// Update callback type to handle all message types
type Callback = (message: WebsocketMessage) => void;

// Extend context to add widget-specific helpers
const WebsocketContext = createContext<
  | {
      subscribe: (callback: Callback) => SubscriptionHandle;
      unsubscribe: (id: SubscriptionHandle) => void;
      // New: Send widget messages
      send: (message: object) => void;
    }
  | undefined
>(undefined);

export const WebsocketProvider: FC<{
  children: ReactNode;
  url: string | null;
  token?: string;  // NEW: Optional widget token for OBS mode
}> = ({ url, token, children }) => {
  const websocket = useRef<WebSocket | undefined>(undefined);
  const subscriptions = useRef<Map<SubscriptionHandle, Callback>>(new Map());

  const value = {
    subscribe: (callback: Callback) => {
      let id = Math.random();
      while (subscriptions.current.has(id)) {
        id = Math.random();
      }
      subscriptions.current.set(id, callback);
      return id;
    },
    unsubscribe: (id: SubscriptionHandle) => {
      subscriptions.current.delete(id);
    },
    // NEW: Send messages to server
    send: (message: object) => {
      if (websocket.current?.readyState === WebSocket.OPEN) {
        websocket.current.send(JSON.stringify(message));
      } else {
        console.warn('⚠️ WebSocket not open, cannot send message');
      }
    },
  };

  useEffect(() => {
    if (!url) {
      console.debug('🚨 No websocket URL provided');
      return;
    }

    // NEW: Add token to URL if provided (for OBS mode)
    const wsUrl = token ? `${url}?token=${token}` : url;

    if (websocket.current === undefined) {
      websocket.current = new WebSocket(wsUrl);
      
      websocket.current.addEventListener('open', function (event) {
        console.log('🔗 Connected to websocket', event);
        this.send(JSON.stringify({ event: 'subscribe' }));
      });

      websocket.current.addEventListener('message', (event) => {
        console.log('📩 Message from server', event.data);
        const message = JSON.parse(event.data);

        // Broadcast to all subscribers
        for (const callback of subscriptions.current.values()) {
          callback(message);
        }
      });

      websocket.current.addEventListener('close', (event) => {
        console.log('❌ Disconnected from websocket', event);
      });

      websocket.current.addEventListener('error', (event) => {
        console.error('⚠️ WebSocket error', event);
      });
    }

    return () => {
      console.log('🔌 Closing websocket connection');
      websocket.current?.close();
    };
  }, [url, token]);

  return (
    <WebsocketContext.Provider value={value}>
      {children}
    </WebsocketContext.Provider>
  );
};
```

#### Custom Hook for Widget Subscriptions

Create a convenience hook for widgets to use:

```typescript
// src/hooks/useWidgetSubscription.ts
import { useEffect, useState } from 'react';
import { useWebsocket } from './useWebsocket';
import type { WidgetInstance } from '@/types';

export function useWidgetSubscription(widgetId: string) {
  const websocket = useWebsocket();
  const [widget, setWidget] = useState<WidgetInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!websocket) {
      console.warn('useWidgetSubscription used outside WebsocketProvider');
      return;
    }

    // Subscribe to widget updates
    websocket.send({
      type: 'WIDGET_SUBSCRIBE',
      widgetId,
    });

    // Listen for widget messages
    const handleId = websocket.subscribe((message) => {
      switch (message.type) {
        case 'WIDGET_INITIAL_STATE':
          if (message.widgetId === widgetId) {
            setWidget(message.widget);
            setLoading(false);
          }
          break;
          
        case 'WIDGET_STATE_UPDATE':
          if (message.widgetId === widgetId) {
            setWidget((prev) => prev ? {
              ...prev,
              state: message.state,
            } : null);
          }
          break;
          
        case 'WIDGET_CONFIG_UPDATE':
          if (message.widgetId === widgetId) {
            setWidget((prev) => prev ? {
              ...prev,
              config: message.config,
            } : null);
          }
          break;
          
        case 'WIDGET_ACTION_RESPONSE':
          if (message.widgetId === widgetId && !message.success) {
            setError(message.error || 'Action failed');
          }
          break;
      }
    });

    // Cleanup: unsubscribe from widget and remove listener
    return () => {
      websocket.send({
        type: 'WIDGET_UNSUBSCRIBE',
        widgetId,
      });
      websocket.unsubscribe(handleId);
    };
  }, [websocket, widgetId]);

  // Helper to execute actions
  const executeAction = (action: string, payload?: Record<string, unknown>) => {
    if (!websocket) {
      throw new Error('WebSocket not available');
    }
    
    websocket.send({
      type: 'WIDGET_ACTION',
      widgetId,
      action,
      payload,
    });
  };

  return {
    widget,
    loading,
    error,
    executeAction,
  };
}
```

#### Usage in Widget Components

**Refactored CountdownTimerWidget:**

```typescript
// src/widgets/CountdownTimerWidget.tsx
import { useWidgetSubscription } from '@/hooks/useWidgetSubscription';
import useTextJumble from '@/hooks/useTextJumble';
import { useRef } from 'react';

interface CountdownTimerWidgetProps {
  widgetId: string;  // Changed from individual props to widgetId
}

function CountdownTimerWidget({ widgetId }: CountdownTimerWidgetProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useTextJumble(titleRef);

  // Subscribe to widget via WebSocket
  const { widget, loading, error } = useWidgetSubscription(widgetId);

  if (loading) {
    return <div className="screen-content">Loading...</div>;
  }

  if (error || !widget) {
    return <div className="screen-content">Error loading widget</div>;
  }

  // Extract config and state
  const { text, title } = widget.config as {
    text: string;
    title: string;
  };
  
  const { duration_left, enabled } = widget.state as {
    duration_left: number;
    enabled: boolean;
  };

  const countdownTimeFormatted = new Date(duration_left * 1000)
    .toISOString()
    .substring(14, 14 + 5);

  return (
    <div className="screen-content">
      <p>{text}</p>
      <h1 ref={titleRef}>{title}</h1>
      <p className="countdown">
        <span className="countdown-time">{countdownTimeFormatted}</span>
      </p>
    </div>
  );
}

export default CountdownTimerWidget;
```

**Stream Manager Control Interface:**

```typescript
// src/components/molecules/TimerControls.tsx
import { useWidgetSubscription } from '@/hooks/useWidgetSubscription';
import { Button, Stack } from '@mui/material';

interface TimerControlsProps {
  widgetId: string;
}

export function TimerControls({ widgetId }: TimerControlsProps) {
  const { widget, executeAction, loading } = useWidgetSubscription(widgetId);

  if (loading || !widget) {
    return null;
  }

  const { enabled } = widget.state as { enabled: boolean };

  return (
    <Stack direction="row" spacing={2}>
      <Button
        variant="contained"
        color={enabled ? "error" : "success"}
        onClick={() => executeAction(enabled ? 'pause' : 'start')}
      >
        {enabled ? 'Pause' : 'Start'}
      </Button>
      <Button
        variant="outlined"
        onClick={() => executeAction('reset')}
      >
        Reset
      </Button>
    </Stack>
  );
}
```

**Updated StreamWidget Router:**

```typescript
// src/components/pages/StreamWidget.tsx
import CountdownTimerWidget from '@/widgets/CountdownTimerWidget';
import { useParams } from 'react-router-dom';

function StreamWidget() {
  const { widgetId } = useParams<{ widgetId: string }>();

  if (!widgetId) {
    return <p>No widget ID provided</p>;
  }

  // Widget type will be determined from backend state
  // For now, render countdown (later use registry pattern)
  return <CountdownTimerWidget widgetId={widgetId} />;
}

export default StreamWidget;
```

**App.tsx Route Update:**

```typescript
// src/App.tsx
// OLD: /widgets/:widget/:params (params was base64 encoded config)
// NEW: /widgets/:widgetId (config comes from backend)

<Route
  path="/widgets/:widgetId"
  element={<StreamWidget />}
/>
```

#### Integration with App Root

Update `main.tsx` to pass optional token to WebsocketProvider:

```typescript
// src/main.tsx
import { WebsocketProvider } from '@/hooks/useWebsocket';

// Check if running in OBS mode (token in URL)
const urlParams = new URLSearchParams(window.location.search);
const widgetToken = urlParams.get('token');

root.render(
  <React.StrictMode>
    <WebsocketProvider 
      url={import.meta.env.VITE_WEBSOCKET_URL}
      token={widgetToken || undefined}
    >
      <App />
    </WebsocketProvider>
  </React.StrictMode>
);
```

#### Benefits of This Approach:

✅ **Reuses existing infrastructure** - Same WebSocket connection for tasks and widgets  
✅ **Minimal changes** - Extends existing hook rather than replacing  
✅ **Type-safe** - All message types properly typed  
✅ **Backwards compatible** - Existing task subscription still works  
✅ **Clean API** - `useWidgetSubscription` hook encapsulates complexity  
✅ **Automatic cleanup** - Unsubscribes when component unmounts  
✅ **Real-time updates** - State changes immediately reflected across all instances

#### Widget Registry Pattern
```typescript
// src/widgets/registry.ts
interface WidgetDefinition {
  type: string;
  name: string;
  description: string;
  component: React.ComponentType<WidgetProps>;
  configSchema: JSONSchema;              // For configuration UI
  defaultConfig: Record<string, unknown>;
  actions: WidgetAction[];
}

interface WidgetAction {
  name: string;
  label: string;
  icon?: string;
  payloadSchema?: JSONSchema;
}

export const widgetRegistry = new Map<string, WidgetDefinition>();

// Register widgets
widgetRegistry.set('countdown', {
  type: 'countdown',
  name: 'Countdown Timer',
  description: 'Display a countdown timer',
  component: CountdownTimerWidget,
  configSchema: { /* ... */ },
  defaultConfig: { duration: 300 },
  actions: [
    { name: 'start', label: 'Start' },
    { name: 'pause', label: 'Pause' },
    { name: 'reset', label: 'Reset' },
  ],
});
```

### 4. Widget Types to Implement

#### Phase 1: Core Widgets (MVP)
1. **Countdown Timer** (existing, needs refactor)
   - Persistent state
   - Synchronized across instances
   
2. **Now Playing** (music/media)
   - Current song/track
   - Artist and title
   - Album art
   - Progress bar
   - **Primary Integration**: Pretzel.rocks API (`https://api.pretzel.rocks/playing/twitch/<twitch_streamer_id>`)
   - Optional: Spotify/Last.fm as fallback or alternative sources

3. **Recent Follower**
   - Shows latest follower
   - Animated entrance
   - Requires Twitch API backend integration

4. **Goal Tracker**
   - Progress bar toward a goal
   - Custom text and images
   - Updated manually or via API

#### Phase 2: Interactive Widgets
5. **Poll Widget**
   - Display active poll
   - Real-time vote counts
   - Twitch Polls API integration

6. **Chat Widget**
   - Recent chat messages
   - Filtered/moderated view
   - Requires Twitch Chat API

7. **Donation Goal**
   - Track donations toward goal
   - Multiple sources (StreamLabs, StreamElements, etc.)
   - Requires backend aggregation

#### Phase 3: Advanced Widgets
8. **Schedule Widget**
   - Upcoming streams
   - Pull from your stream plans
   - Auto-updates

9. **Stats Widget**
   - Viewer count
   - Follower count
   - Stream uptime
   - Twitch API integration

10. **Custom Alert Widget**
    - Follow/sub/donation alerts
    - Customizable animations
    - Sound effects
    - Queue system

### 5. Backend Integration Requirements

#### Service Architecture
```typescript
// Backend services needed
interface WidgetServiceProvider {
  type: string;                          // 'twitch', 'spotify', 'youtube', etc.
  
  // Fetch data for widget
  fetchData(widgetId: string, config: any): Promise<any>
  
  // Subscribe to real-time updates
  subscribe(widgetId: string, callback: Callback): Unsubscribe
  
  // Execute action through service
  executeAction(widgetId: string, action: string, payload: any): Promise<any>
}
```

#### Twitch Integration
- Use existing Twitch OAuth credentials
- Backend proxies Twitch API requests
- Handles EventSub subscriptions
- Caches data to reduce API calls

#### Pretzel.rocks Integration
- **Endpoint**: `GET https://api.pretzel.rocks/playing/twitch/<twitch_streamer_id>`
- **Authentication**: Public API, no authentication required
- **Response Format**: JSON with track info (artist, title, album, etc.)
- **Polling Strategy**: Backend polls every 10-30 seconds to detect song changes
- **Widget Updates**: Push updates via WebSocket when song changes
- **Caching**: Cache current song to minimize redundant API calls
- **Error Handling**: Graceful fallback if API is unavailable (show "No music playing" or last known track)

#### Security Considerations
- Widget URLs should include secure tokens
- Backend validates all widget actions
- Rate limiting per widget instance
- Credential isolation (frontend never sees API keys)

### 6. Widget Configuration UI

#### Admin Interface (React Admin)
Create new resource: `/widgets` in React Admin

```typescript
// src/resources/widgets/WidgetList.tsx
// src/resources/widgets/WidgetCreate.tsx
// src/resources/widgets/WidgetEdit.tsx
```

Features:
- Create/edit/delete widget instances
- Configure widget parameters
- Preview widget rendering
- Generate OBS browser source URLs
- Copy embed code
- Test actions (start/stop/reset)

#### Widget Preview
- Live preview in admin interface
- Shows actual widget rendering
- Test actions without affecting stream

#### OBS Integration Guide
Documentation for setting up browser sources:
```
URL: https://your-domain.com/widgets/{widgetId}
Width: 1920
Height: 1080
FPS: 30
Custom CSS: (optional)
Shutdown source when not visible: No (keeps connection alive)
Refresh browser when scene becomes active: No
```

### 7. Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- [ ] **Backend Setup:**
  - [ ] Add `stream_widgets_table` to `crud_api/src/main.rs` Config
  - [ ] Configure stream_widgets table in `get_table_config()` with `user_scoped: true`
  - [ ] Configure indexes: `["type", "active"]` (user_id handled by scoping)
  - [ ] Implement user_id middleware for auto-filtering/injection
  - [ ] Create DynamoDB table: `stream_widgets` with:
    - [ ] user_id as indexed field (for scoping queries)
    - [ ] access_token as indexed field (for WebSocket auth lookups)
- [ ] **WebSocket Integration:**
  - [ ] Update WebSocket authentication to support dual token types:
    - [ ] Detect token format (JWT starts with "eyJ", widget token is UUID)
    - [ ] If Cognito JWT: Verify with JWKS, extract user_id → Full access
    - [ ] If widget token: Query widgets table WHERE access_token = token → Read-only access to that widget
    - [ ] Store auth context (full vs widget-specific) in connection state
  - [ ] Implement WebSocket message handlers:
    - [ ] `WIDGET_SUBSCRIBE` - Subscribe client to widget updates
      - Validate: Full access can subscribe to any owned widget
      - Validate: Widget token can only subscribe to its specific widget
    - [ ] `WIDGET_UNSUBSCRIBE` - Unsubscribe client from widget updates
    - [ ] `WIDGET_ACTION` - Handle widget actions (start, pause, reset)
      - Validate: Full access can act on any owned widget
      - Validate: Widget token needs "write" permission
  - [ ] Implement server-side message broadcasting:
    - [ ] `WIDGET_INITIAL_STATE` - Send full widget on subscription
    - [ ] `WIDGET_STATE_UPDATE` - Broadcast state changes to subscribers
    - [ ] `WIDGET_ACTION_RESPONSE` - Send action result to sender
    - [ ] `WIDGET_CONFIG_UPDATE` - Broadcast config changes (when updated via API)
  - [ ] Add subscription tracking per widget (Map<widgetId, Set<connectionId>>)
  - [ ] Integrate with DynamoDB for state persistence
- [ ] **Frontend Infrastructure:**
  - [ ] Create WidgetManager service frontend
  - [ ] Add React Admin data provider methods for `/records/stream_widgets`
  - [ ] Refactor CountdownTimerWidget to use new architecture
  - [ ] Build widget configuration UI in React Admin
    - [ ] Add auto-generation of `access_token` field on widget creation (UUID)
- [ ] **Testing:**
  - [ ] Test CRUD operations via existing endpoints
  - [ ] Test synchronization between multiple browser instances
  - [ ] Verify indexed queries work correctly

#### Phase 2: Infrastructure (Week 3-4)
- [ ] Implement widget registry pattern
- [ ] Create base Widget component with common functionality
- [ ] Add widget preview functionality
- [ ] Generate secure widget URLs with tokens
- [ ] Documentation for OBS setup

#### Phase 3: New Widgets (Week 5-6)
- [ ] Implement Now Playing widget
- [ ] Implement Recent Follower widget
- [ ] Implement Goal Tracker widget
- [ ] Create Twitch service integration
- [ ] Test all widgets in OBS

#### Phase 4: Advanced Features (Week 7-8)
- [ ] Implement Poll widget
- [ ] Implement Chat widget
- [ ] Implement Donation Goal widget
- [ ] Add widget analytics (view counts, interaction metrics)
- [ ] Performance optimization

#### Phase 5: Polish (Week 9-10)
- [ ] Widget marketplace/library UI
- [ ] Widget templates and presets
- [ ] Advanced styling options
- [ ] Export/import widget configurations
- [ ] Comprehensive testing

### 8. Technical Considerations

#### Performance
- **Widget polling**: Backend should poll external APIs, not frontend
- **WebSocket connection pooling**: Reuse connections across widgets
- **State caching**: Cache widget state in memory with TTL
- **Lazy loading**: Only load active widget code
- **Throttling**: Limit state update frequency (e.g., max 10/second)

#### Scalability
- **Database indexes**: Index on `widget_id`, `active`, `type`
- **Connection limits**: Monitor WebSocket connections per user
- **Rate limiting**: Prevent spam actions
- **Cleanup job**: Archive inactive widgets after 30 days

#### Reliability
- **Reconnection logic**: Auto-reconnect WebSocket on disconnect
- **State recovery**: Fetch latest state on reconnection
- **Error boundaries**: Graceful degradation if widget fails
- **Fallback rendering**: Show placeholder if data unavailable

#### Testing Strategy
- **Unit tests**: Widget components, WidgetManager service
- **Integration tests**: Backend API endpoints, WebSocket events
- **E2E tests**: Full flow from creation to OBS display
- **Load tests**: Multiple widgets, multiple clients
- **Browser compatibility**: Test in OBS browser (CEF), Chrome, Firefox

### 9. Data Models

#### Database Schema (DynamoDB)

**Widget Instances Table** (configured via environment variable `STREAM_WIDGETS_TABLE`):
```typescript
// DynamoDB Item Structure
{
  id: string;                    // Partition key (auto-generated UUID)
  title: string;                 // Sort key (q_key)
  user_id: string;               // GSI - Index for querying user's widgets
  type: string;                  // GSI - Index for querying by widget type
  active: boolean;               // GSI - Index for querying active widgets
  config: {                      // Widget-specific configuration (JSON)
    // Countdown example:
    duration: number,
    text: string,
    // ... other widget-specific fields
  },
  state: {                       // Current runtime state (JSON)
    // Countdown example:
    duration_left: number,
    enabled: boolean,
    last_tick_timestamp: string,
    // ... other widget-specific fields
  },
  created_at: string;            // ISO timestamp (auto-generated)
  updated_at: string;            // ISO timestamp (auto-updated)
}
```

**Query Patterns (All Automatically Scoped to Current User):**
- Get all my widgets: `GET /records/stream_widgets`
- Get my widgets of a type: `GET /records/stream_widgets/type/countdown`
- List with filters: `GET /records/stream_widgets?filter={"active":true,"type":"countdown"}`
- Pagination: `GET /records/stream_widgets?perPage=20&cursor={token}`
- **Note**: No user_id in URLs - backend automatically filters by authenticated user

**Widget Service Credentials** (for external APIs like Twitch, Spotify):
```typescript
{
  id: string;                    // Partition key
  user_id: string;               // GSI - Index by user
  service: string;               // Sort key - 'twitch', 'spotify', etc.
  credentials: {                 // Encrypted credentials (JSON)
    access_token?: string,
    refresh_token?: string,
    expires_at?: string,
    // ... service-specific fields
  },
  created_at: string,
  updated_at: string,
}
```

**Backend Configuration Required:**
```rust
// In crud_api/src/main.rs Config struct:
stream_widgets_table: String,              // e.g., "stream-widgets-prod"
widget_service_credentials_table: String,  // e.g., "widget-credentials-prod"

// Cognito configuration (already exists):
cognito_jwks_url: String,                  // e.g., "https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json"

// Note: Widget access tokens stored directly in stream_widgets_table as "access_token" field
```

### 10. Security Model

#### Widget Access Tokens
For OBS browser sources and public widget URLs:

```typescript
interface WidgetAccessToken {
  widgetId: string;
  userId: string;               // Widget owner
  permissions: string[];        // ['read'] for display-only, ['read', 'write'] for interactive
  expiresAt: string;
  token: string;                // JWT signed by backend
}

// JWT Payload Example:
{
  widget_id: "abc123",
  user_id: "user456",
  permissions: ["read"],        // Or ["read", "write"] for interactive
  exp: 1735689600,             // Unix timestamp
  iat: 1704153600,
}
```

**Token Strategy:**
- Generate read-only token when user copies widget URL from Stream Manager
- Token embedded in widget URL: `/widgets/{widgetId}?token={jwt}`
- Token grants access ONLY to that specific widget (not other user widgets)
- Validate token on page load and WebSocket connection
- Long expiration (e.g., 1 year) for OBS stability - no need to update URLs frequently
- User can revoke/regenerate tokens from widget management UI
- Revoked tokens stored in database or use short-lived tokens with refresh mechanism

**Token Generation Flow:**
```
User creates widget in Stream Manager
  ↓
Backend API call: POST /records/stream_widgets
  {
    title: "Countdown Timer",
    type: "countdown",
    config: {...}
  }
  ↓
Backend auto-generates access_token field (crypto.randomUUID())
  ↓
Backend stores widget with access_token:
  {
    id: "abc123",
    title: "Countdown Timer",
    user_id: "user456",
    access_token: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",  // Auto-generated
    type: "countdown",
    config: {...},
    state: {...}
  }
  ↓
Frontend receives widget record including access_token
  ↓
User clicks "Copy OBS URL"
  ↓
Frontend generates URL: https://domain.com/widgets/abc123?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890
  ↓
User adds to OBS Browser Source
  ↓
OBS loads page, JavaScript extracts token from URL
  ↓
WebSocket connects: wss://api.domain.com?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890
  ↓
Backend checks if token matches Cognito JWT pattern (starts with "eyJ"):
  - If yes: Verify with Cognito JWKS (full access)
  - If no: Query widgets table WHERE access_token = token (widget-specific access)
  ↓
Backend validates token, allows subscription to that widget only
```

**Token Regeneration (if compromised):**
```
User in Stream Manager
  ↓
Click "Regenerate Token" for widget
  ↓
Backend API call: PUT /records/stream_widgets/{widget_id}
  {
    access_token: "new-generated-uuid"  // Or backend auto-generates on special endpoint
  }
  ↓
Old OBS URLs stop working
  ↓
User updates OBS with new URL
```

**Token Types Comparison:**

| Aspect | Cognito JWT (Stream Manager) | Widget Access Token (OBS) |
|--------|------------------------------|---------------------------|
| Format | JWT (eyJhbGc...) | Random UUID string |
| Validation | Verify signature with Cognito JWKS | Query widgets table by access_token |
| Expiration | Short-lived (1 hour typical) | No expiration (static per widget) |
| Scope | All user's widgets | Single widget only |
| Permissions | Full (read + write) | Read-only (display only) |
| Regeneration | N/A (refreshed automatically) | User can regenerate if compromised |
| Storage | Not stored (verified cryptographically) | Stored in widget record (access_token field) |
| Use Case | Web app authenticated user | OBS browser source |

**User Isolation at Every Layer:**
```
Frontend Query: GET /records/stream_widgets
    ↓
Middleware: Extract user_id from session/JWT
    ↓
Backend: SELECT * FROM widgets WHERE user_id = {authenticated_user_id}
    ↓
Response: Only widgets belonging to authenticated user
```

#### API Security
- ✅ All HTTP endpoints require authentication (session/JWT)
- ✅ Backend middleware auto-injects/validates `user_id` on all operations
- ✅ Widget tokens grant access to single widget only (not user's other widgets)
- ✅ WebSocket connections must be authenticated
- ✅ Service credentials (Twitch, etc.) encrypted at rest
- ✅ OAuth refresh tokens handled securely
- ✅ No user_id exposed in API URLs - prevents enumeration attacks

### 11. Future Enhancements

#### Advanced Ideas
1. **Widget Marketplace**: Share widget configurations with community
2. **Custom Widget Builder**: Visual editor for creating widgets
3. **Widget Interactions**: Widgets can trigger each other
4. **Conditional Rendering**: Show/hide based on rules
5. **A/B Testing**: Test different widget configurations
6. **Analytics Dashboard**: Track widget performance
7. **Mobile App**: Control widgets from phone
8. **Widget Scenes**: Group widgets into preset layouts
9. **Voice Commands**: Control widgets via voice
10. **AI-Generated Content**: Dynamic widget content from AI

#### Integration Opportunities
- **Pretzel.rocks**: Currently playing music (Primary music source) - `GET https://api.pretzel.rocks/playing/twitch/<twitch_streamer_id>`
- **Discord**: Server stats, recent messages
- **YouTube**: Subscriber count, latest video
- **Twitter/X**: Latest tweets, follower count
- **Patreon**: Patron count, goal progress
- **Streamlabs/StreamElements**: Alert queue
- **Spotify**: Full Now Playing with controls (alternative/fallback to Pretzel)
- **Steam**: Currently playing game, achievements
- **Weather**: Local weather display

## Next Steps

1. **Review & Feedback**: Discuss this plan with team/stakeholders
2. **Prioritize Features**: Decide which widgets are most important
3. **Backend Design**: Finalize API contracts and database schema
4. **Prototype**: Build minimal countdown timer with backend persistence
5. **Iterate**: Test with real OBS usage and refine

## Questions to Resolve

1. **Storage costs**: How many widgets per user? Storage limits?
2. **Rate limiting**: What's reasonable for API calls per widget?
3. **Pricing model**: Are widgets part of base plan or premium feature?
4. **Widget sharing**: Can users share widget configurations publicly?
5. **Backup/restore**: Do users need to backup widget configurations?
6. **Multi-stream**: Can same widget appear on multiple streams simultaneously?

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**Author**: GitHub Copilot  
**Status**: Draft - Awaiting Review
