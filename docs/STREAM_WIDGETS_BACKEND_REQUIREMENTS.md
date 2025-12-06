# Stream Widgets Backend Requirements

## Overview

This document outlines the backend changes needed to support the stream widgets feature. Widgets are synchronized UI components that display in OBS browser sources and web interfaces, with state managed by the backend and synchronized via WebSocket.

## 1. Database: DynamoDB Table

### New Table: `stream_widgets`

**Table Configuration:**
- **Partition Key**: `id` (String) - Auto-generated UUID
- **Sort Key**: `title` (String) - User-friendly widget name
- **GSI 1**: `user_id` (String) - For user-scoped queries
- **GSI 2**: `access_token` (String) - For WebSocket authentication lookups
- **GSI 3**: `type` (String) - For querying widgets by type
- **GSI 4**: `active` (Boolean) - For querying active widgets

**Item Schema:**
```json
{
  "id": "uuid-string",
  "title": "Countdown Timer",
  "user_id": "user-uuid",
  "type": "countdown",
  "access_token": "random-uuid",
  "config": {
    "duration": 300,
    "text": "Starting soon",
    "title": "Stream Starting"
  },
  "state": {
    "duration_left": 300,
    "enabled": false,
    "last_tick_timestamp": "2025-11-22T10:00:00Z"
  },
  "active": true,
  "created_at": "2025-11-22T10:00:00Z",
  "updated_at": "2025-11-22T10:00:00Z"
}
```

**Notes:**
- `config`: Widget-specific configuration (varies by type)
- `state`: Current runtime state (varies by type)
- `access_token`: UUID used for OBS authentication
- All fields except `config` and `state` are required

## 2. CRUD API Configuration

### Add to `crud_api/src/main.rs`

**Config struct:**
```rust
pub struct Config {
    // ... existing fields
    stream_widgets_table: String,
}
```

**get_table_config() function:**
```rust
fn get_table_config(resource: &str, state: &AppState) -> Option<TableConfig> {
    match resource {
        // ... existing cases
        "stream_widgets" => Some(TableConfig {
            table_name: &state.config.stream_widgets_table,
            partition_key: "id",
            q_key: "title",
            indexes: vec!["type", "active"],
            user_scoped: true,  // Enable automatic user_id filtering/injection
        }),
        _ => None,
    }
}
```

**Notes:**
- `user_scoped: true` enables automatic filtering/injection of `user_id` based on authenticated user
- Ensure proper error handling for unauthorized access
- This is a new flag, so existing resources remain unaffected. This only applies to `stream_widgets` for now, so will will need to implement the logic and pass through the user id accordingly.

**Middleware Requirements:**
- On `POST /records/stream_widgets`: Auto-inject `user_id` from authenticated session
- On `GET /records/stream_widgets/*`: Auto-filter by `user_id` from authenticated session
- On `PUT /records/stream_widgets/:id`: Validate `user_id` matches authenticated user (403 if not)
- On `DELETE /records/stream_widgets/:id`: Validate `user_id` matches authenticated user (403 if not)


## 3. WebSocket Authentication

### Current State
WebSocket currently authenticates using Cognito JWT verified with JWKS.

### Required Changes

**Dual Authentication Support:**

- **Cognito JWT**: Full access to all widgets owned by the user (as per existing logic)
- **Widget Token**: Read-only access to a single widget identified by `access_token`

**Key Points:**
- Cognito JWT: Full access to all user's widgets, can execute actions
- Widget token: Read-only access to single widget, cannot execute actions
- Token lookup requires GSI on `access_token` field for performance
- Connection must store auth context for message validation

## 4. WebSocket Message Handlers

### New Message Types (Client → Server)

**Subscribe to Widget:**
```json
{
  "type": "WIDGET_SUBSCRIBE",
  "widgetId": "abc123"
}
```

**Validation:**
- If FullAccess: Check user owns widget (user_id matches)
- If WidgetAccess: Check token matches requested widgetId's `access_token`
- If invalid: Send error, don't subscribe

**Response:** Send `WIDGET_INITIAL_STATE` (see below)

---

**Unsubscribe from Widget:**
```json
{
  "type": "WIDGET_UNSUBSCRIBE",
  "widgetId": "abc123"
}
```

**Behavior:** Remove connection from widget's subscriber list

---

**Execute Widget Action:**
```json
{
  "type": "WIDGET_ACTION",
  "widgetId": "abc123",
  "action": "start",
  "payload": {}
}
```

**Validation:**
- If WidgetAccess (OBS): Reject with 403 (read-only)
- If FullAccess: Check user owns widget
- Validate action is valid for widget type

**Behavior:**
1. Execute action (update widget state in DynamoDB)
2. Send `WIDGET_ACTION_RESPONSE` to sender
3. Broadcast `WIDGET_STATE_UPDATE` to all subscribers

### New Message Types (Server → Client)

**Initial State (on subscription):**
```json
{
  "type": "WIDGET_INITIAL_STATE",
  "widgetId": "abc123",
  "widget": {
    "id": "abc123",
    "title": "Countdown Timer",
    "type": "countdown",
    "config": { "duration": 300 },
    "state": { "duration_left": 300, "enabled": false },
    "active": true
  }
}
```

**Sent:** Immediately after successful `WIDGET_SUBSCRIBE`

---

**State Update (broadcast to subscribers):**
```json
{
  "type": "WIDGET_STATE_UPDATE",
  "widgetId": "abc123",
  "state": {
    "duration_left": 295,
    "enabled": true,
    "last_tick_timestamp": "2025-11-22T10:00:05Z"
  },
  "timestamp": "2025-11-22T10:00:05Z"
}
```

**Sent:** When widget state changes (after action or external update)

**Broadcast:** To all connections subscribed to this widgetId

---

**Config Update (broadcast to subscribers):**
```json
{
  "type": "WIDGET_CONFIG_UPDATE",
  "widgetId": "abc123",
  "config": {
    "duration": 600,
    "text": "New text"
  }
}
```

**Sent:** When widget config is updated via HTTP API (`PUT /records/stream_widgets/:id`)

**Broadcast:** To all connections subscribed to this widgetId

---

**Action Response (to action sender only):**
```json
{
  "type": "WIDGET_ACTION_RESPONSE",
  "widgetId": "abc123",
  "action": "start",
  "success": true
}
```

**Or on error:**
```json
{
  "type": "WIDGET_ACTION_RESPONSE",
  "widgetId": "abc123",
  "action": "start",
  "success": false,
  "error": "Widget not found"
}
```

**Sent:** Only to connection that sent the action

## 5. WebSocket Subscription Management

**Data Structure:**
```rust
// Store subscriptions per widget
struct SubscriptionManager {
    // widgetId -> Set of connection IDs
    subscriptions: HashMap<String, HashSet<String>>,
}
```

**Operations:**
- `subscribe(widget_id, connection_id)`: Add connection to widget's subscribers
- `unsubscribe(widget_id, connection_id)`: Remove connection from widget's subscribers
- `broadcast(widget_id, message)`: Send message to all subscribers of widget
- `cleanup(connection_id)`: Remove connection from all subscriptions (on disconnect)

**On Connection Close:**
- Automatically unsubscribe from all widgets
- Clean up connection from subscription map

## 6. Widget Action Processing

**Notes:**
- Action handlers are widget-type-specific
- Always update database before broadcasting
- State updates should be atomic
- Include timestamp for client-side interpolation
- We will need a way to do background tasks for countdown timers to tick down state

## 7. HTTP API Triggers

### Widget Config Update

When widget is updated via HTTP:
```
PUT /records/stream_widgets/:id
{
  "config": { "duration": 600 }
}
```

**After successful update:**
1. Broadcast `WIDGET_CONFIG_UPDATE` to all WebSocket subscribers of this widget
2. This keeps OBS/web views in sync when config changes


## 8. Security Checklist

- ✅ All HTTP endpoints require authentication (Cognito JWT)
- ✅ User can only access their own widgets (user_id filtering) except for OBS access
- ✅ WebSocket requires authentication (Cognito JWT or widget token)
- ✅ Widget tokens are read-only (cannot execute actions)
- ✅ Actions validate ownership before execution
- ✅ Widget token lookup uses indexed query (performance)
- ✅ Failed auth attempts logged for monitoring
- ✅ Rate limiting on WebSocket messages (prevent spam)

## 10. Implementation Priorities

1. Create DynamoDB table with GSIs
2. Add CRUD API configuration
3. Implement user_scoped middleware for CRUD API
4. Implement dual WebSocket authentication
5. Implement basic WebSocket message handlers:
   - `WIDGET_SUBSCRIBE` / `WIDGET_UNSUBSCRIBE`
   - `WIDGET_INITIAL_STATE` message
   - Subscription management (add/remove/broadcast)
6. Implement `WIDGET_ACTION` handler
7. Implement countdown timer actions (start/pause/reset)
8. Implement state persistence to DynamoDB
9. Implement `WIDGET_STATE_UPDATE` broadcasting
10. Implement `WIDGET_ACTION_RESPONSE` messages
11. Hook HTTP PUT endpoint to trigger `WIDGET_CONFIG_UPDATE` broadcasts

## 11. Testing Requirements

**Unit Tests:**
- Widget token authentication logic
- Cognito JWT authentication logic (existing)
- Widget ownership validation
- Action handler logic


## 12. Example Widget Flow (End-to-End)

### Setup: Create Widget
```bash
POST /records/stream_widgets
Authorization: Bearer {cognito_jwt}

{
  "title": "Countdown Timer",
  "type": "countdown",
  "access_token": "1a2b3c4d-5e6f-7890-abcd-ef1234567890",
  "config": {
    "duration": 300,
    "text": "Starting soon",
    "title": "Stream Starting"
  },
  "state": {
    "duration_left": 300,
    "enabled": false
  },
  "active": true
}

# Backend auto-generates:
# - id: "abc123"
# - user_id: "user456" (from JWT)
# - created_at, updated_at

Response:
{
  "id": "abc123",
  ...
}
```

### OBS: Display Widget
```
1. OBS loads: https://domain.com/widgets/abc123?token=1a2b3c4d-5e6f-7890-abcd-ef1234567890
2. Frontend connects WebSocket: wss://api.domain.com?token=1a2b3c4d-5e6f-7890-abcd-ef1234567890
3. Backend validates token → WidgetAccess{widget_id: "abc123", read_only: true}
4. Frontend sends: {"type": "WIDGET_SUBSCRIBE", "widgetId": "abc123"}
5. Backend validates: token's widget_id matches requested widgetId
6. Backend sends: {"type": "WIDGET_INITIAL_STATE", "widgetId": "abc123", "widget": {...}}
7. OBS displays countdown timer with current state
```

### Stream Manager: Control Widget
```
1. User authenticated with Cognito JWT
2. WebSocket already connected (no token param)
3. Backend validates JWT → FullAccess{user_id: "user456"}
4. Frontend sends: {"type": "WIDGET_SUBSCRIBE", "widgetId": "abc123"}
5. Backend validates: user_id owns widget
6. Backend sends: {"type": "WIDGET_INITIAL_STATE", ...}
7. User clicks "Start" button
8. Frontend sends: {"type": "WIDGET_ACTION", "widgetId": "abc123", "action": "start"}
9. Backend validates: FullAccess, user owns widget
10. Backend updates DynamoDB: state.enabled = true
11. Backend sends to sender: {"type": "WIDGET_ACTION_RESPONSE", "success": true}
12. Backend broadcasts to all (OBS + Stream Manager): 
    {"type": "WIDGET_STATE_UPDATE", "widgetId": "abc123", "state": {"enabled": true, ...}}
13. Both OBS and Stream Manager update UI simultaneously
```

## 13. Questions for Backend Team

1. **Rate Limiting**: What rate limits should we apply to WebSocket messages?
2. **Monitoring**: What metrics should we track for widget operations?

## 14. API Summary

**HTTP Endpoints (auto-generated by CRUD API):**
- `GET /records/stream_widgets` - List user's widgets
- `POST /records/stream_widgets` - Create widget
- `GET /records/stream_widgets/:id` - Get widget
- `PUT /records/stream_widgets/:id` - Update widget (triggers config broadcast)
- `DELETE /records/stream_widgets/:id` - Delete widget

**WebSocket Messages (Client → Server):**
- `WIDGET_SUBSCRIBE` - Subscribe to widget updates
- `WIDGET_UNSUBSCRIBE` - Unsubscribe from widget
- `WIDGET_ACTION` - Execute widget action

**WebSocket Messages (Server → Client):**
- `WIDGET_INITIAL_STATE` - Full widget data on subscription
- `WIDGET_STATE_UPDATE` - State change broadcast
- `WIDGET_CONFIG_UPDATE` - Config change broadcast
- `WIDGET_ACTION_RESPONSE` - Action result

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**Status**: Ready for Backend Implementation
