# Cognito Authentication Flow - Problem and Solution

This document illustrates how the application uses AWS Cognito for authentication, the reauth loop problem that existed, and how this PR fixes it.

## Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Application"
        App[React App]
        AuthProvider[Auth Provider]
        UserManager[OIDC UserManager]
        LocalStorage[(Browser LocalStorage)]
    end
    
    subgraph "AWS Cognito"
        CognitoIdP[Cognito Identity Provider]
        CognitoHostedUI[Cognito Hosted UI]
    end
    
    subgraph "Backend API"
        API[REST API]
    end
    
    App -->|uses| AuthProvider
    AuthProvider -->|uses| UserManager
    UserManager -->|stores tokens| LocalStorage
    UserManager -->|OIDC protocol| CognitoIdP
    AuthProvider -->|redirects to| CognitoHostedUI
    App -->|API calls with token| API
    API -->|401 on expired token| App
    
    style LocalStorage fill:#ffcccc
    style UserManager fill:#ccffcc
```

## The Problem: Reauth Loop

### Before This PR - Infinite Loop Scenario

```mermaid
sequenceDiagram
    participant User
    participant App
    participant AuthProvider
    participant UserManager
    participant LocalStorage
    participant API
    participant Cognito

    Note over User,Cognito: User has been logged in, session expires after some time
    
    User->>App: Tries to access resource
    App->>API: GET /resource (with expired token)
    API-->>App: 401 Unauthorized
    App->>AuthProvider: checkError(401)
    AuthProvider-->>App: Promise.reject()
    
    Note over App: React Admin triggers logout on rejection
    
    App->>AuthProvider: logout()
    Note over AuthProvider: ⚠️ PROBLEM: Token not cleared!
    AuthProvider->>Cognito: Redirect to logout URL
    Cognito-->>App: Redirect back to app
    
    App->>AuthProvider: checkAuth()
    AuthProvider->>UserManager: getUser()
    UserManager->>LocalStorage: Read stored user
    LocalStorage-->>UserManager: ⚠️ Returns EXPIRED user object
    UserManager-->>AuthProvider: Expired user object
    
    Note over AuthProvider: User exists, so no redirect to login
    
    App->>API: GET /resource (with same expired token)
    API-->>App: 401 Unauthorized
    
    Note over User,Cognito: 🔄 INFINITE LOOP STARTS HERE
    
    App->>AuthProvider: checkError(401)
    AuthProvider-->>App: Promise.reject()
    App->>AuthProvider: logout()
    Note over AuthProvider: Still doesn't clear token...
    
    rect rgb(255, 200, 200)
        Note over User,Cognito: Loop continues indefinitely!<br/>User is stuck and cannot log in
    end
```

### Key Issue

The problem occurred because:
1. **Token stored in LocalStorage**: The `oidc-client-ts` library stores user tokens in browser LocalStorage
2. **Logout didn't clear storage**: The `logout()` method only redirected to Cognito but didn't clear local tokens
3. **checkAuth found expired token**: After logout redirect, `checkAuth()` called `userManager.getUser()` which found the expired token still in LocalStorage
4. **No fresh login triggered**: Since a user object existed (even though expired), the app didn't redirect to the login page
5. **Same expired token reused**: The app tried to use the same expired token, got 401, and the cycle repeated

## The Solution: Clear Token on Logout

### After This PR - Clean Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant AuthProvider
    participant UserManager
    participant LocalStorage
    participant API
    participant Cognito

    Note over User,Cognito: User has been logged in, session expires after some time
    
    User->>App: Tries to access resource
    App->>API: GET /resource (with expired token)
    API-->>App: 401 Unauthorized
    App->>AuthProvider: checkError(401)
    AuthProvider-->>App: Promise.reject()
    
    Note over App: React Admin triggers logout on rejection
    
    App->>AuthProvider: logout()
    
    rect rgb(200, 255, 200)
        Note over AuthProvider: ✅ FIX: Clear token before redirect
        AuthProvider->>UserManager: removeUser()
        UserManager->>LocalStorage: Delete stored user
        LocalStorage-->>UserManager: ✓ User data cleared
        UserManager-->>AuthProvider: ✓ Token removed
    end
    
    AuthProvider->>Cognito: Redirect to logout URL
    Cognito-->>App: Redirect back to app
    
    App->>AuthProvider: checkAuth()
    AuthProvider->>UserManager: getUser()
    UserManager->>LocalStorage: Read stored user
    LocalStorage-->>UserManager: null (no user found)
    UserManager-->>AuthProvider: null
    
    Note over AuthProvider: No user found, trigger fresh login
    
    AuthProvider->>Cognito: signinRedirect()
    Cognito->>User: Show login page
    User->>Cognito: Enter credentials
    Cognito->>UserManager: Return fresh tokens via redirect
    UserManager->>LocalStorage: Store new user tokens
    
    Note over User,Cognito: ✓ User successfully logged in with fresh session
    
    App->>API: GET /resource (with new valid token)
    API-->>App: 200 OK with data
```

## Code Changes

### Key Change in `authProvider.ts`

**Before:**
```typescript
async logout(_params: unknown) {
  console.log('logout');

  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  return signoutRedirect();
}
```

**After:**
```typescript
async logout(_params: unknown) {
  console.log('logout');

  // Clear the stored OIDC token to prevent reauth loop when session expires
  if (!MOCKS_ENABLED) {
    await userManager.removeUser();  // ← NEW: Clears token from LocalStorage
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  return signoutRedirect();
}
```

## How OIDC UserManager Works

```mermaid
graph LR
    subgraph "oidc-client-ts UserManager"
        UM[UserManager]
        Storage[Internal Storage Manager]
    end
    
    subgraph "Browser"
        LS[(LocalStorage)]
    end
    
    subgraph "Storage Keys"
        K1["oidc.user:authority:clientId"]
    end
    
    UM -->|getUser| Storage
    UM -->|removeUser| Storage
    Storage -->|read/write/delete| LS
    LS -->|stores| K1
    
    Note1["getUser() reads from LocalStorage"]
    Note2["removeUser() deletes from LocalStorage"]
    
    style Note1 fill:#e1f5ff
    style Note2 fill:#e8f5e9
```

### What `removeUser()` Does

The `userManager.removeUser()` method from `oidc-client-ts`:
1. Removes the user object from browser LocalStorage
2. Clears the stored access token, id token, and refresh token
3. Clears any associated session state
4. Returns a Promise that resolves when cleanup is complete

This ensures that subsequent calls to `userManager.getUser()` return `null`, triggering a fresh login flow.

## Authentication Flow Components

### Components Used

1. **oidc-client-ts**: OIDC (OpenID Connect) client library that handles:
   - Token storage in LocalStorage
   - Silent token renewal
   - OIDC protocol communication with Cognito
   - Authorization code flow

2. **AWS Cognito**: Identity provider that:
   - Manages user authentication
   - Issues JWT tokens (id_token, access_token)
   - Provides hosted UI for login/logout
   - Validates tokens

3. **React Admin AuthProvider**: Application auth interface that:
   - Implements `login`, `logout`, `checkAuth`, `checkError`
   - Integrates with React Admin framework
   - Manages auth state and navigation

## Summary

### Problem
- Expired tokens remained in LocalStorage after logout
- App attempted to reuse expired tokens
- Created infinite loop of 401 errors and failed logout attempts

### Solution  
- Call `userManager.removeUser()` during logout
- Ensures LocalStorage is cleared before redirect
- Subsequent `checkAuth()` finds no token → triggers fresh login
- User can successfully log in with new valid session

### Impact
- ✅ No more infinite reauth loops
- ✅ Clean logout behavior
- ✅ Proper session expiration handling
- ✅ No breaking changes to existing functionality
