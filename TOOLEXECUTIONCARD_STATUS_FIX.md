# ToolExecutionCard Status Error Fix

## Problem
The `ToolExecutionCard` component was crashing with the error:
```
Cannot read properties of undefined (reading 'icon')
at ToolExecutionCard (components/chat/ToolExecutionCard.tsx:169:43)
```

## Root Cause
There was a mismatch between the status values used in the store and the status values expected by the component:

**Store (`lib/store/chat.ts`):**
```typescript
status: 'pending' | 'running' | 'completed' | 'failed'
```

**Component (`components/chat/ToolExecutionCard.tsx`):**
```typescript
status: 'pending' | 'executing' | 'completed' | 'failed' | 'awaiting_confirmation'
```

When the backend sent a tool call with status `'running'`, the component tried to access `statusConfig['running'].icon`, which didn't exist, causing the crash.

## Solution
Applied defensive programming with the following changes:

### 1. Added 'running' Status to statusConfig
Added a `running` status configuration that mirrors the `executing` status:
```typescript
running: {
  icon: Loader2,
  label: 'Running',
  color: config?.color || '#6B7280',
  animate: true,
}
```

### 2. Created Safe Status Config Getter
Added a `getStatusConfig()` function that provides a fallback for unknown status values:
```typescript
const getStatusConfig = () => {
  const statusKey = status as keyof typeof statusConfig
  if (statusConfig[statusKey]) {
    return statusConfig[statusKey]
  }
  
  // Fallback for unknown status values
  console.warn('Unknown tool execution status:', status, 'for tool:', toolName)
  return {
    icon: Clock,
    label: status || 'Unknown',
    color: '#6B7280', // Gray
  }
}

const currentStatusConfig = getStatusConfig()
const StatusIcon = currentStatusConfig.icon
```

### 3. Updated All References
Replaced all direct `statusConfig[status]` accesses with `currentStatusConfig`:
- `statusConfig[status].icon` → `currentStatusConfig.icon`
- `statusConfig[status].color` → `currentStatusConfig.color`
- `statusConfig[status].animate` → `currentStatusConfig.animate`

### 4. Updated TypeScript Interface
Updated the `ToolExecutionProps` interface to include all possible status values:
```typescript
status: 'pending' | 'executing' | 'running' | 'completed' | 'failed' | 'awaiting_confirmation'
```

## Benefits
1. **No More Crashes**: Component handles any status value gracefully
2. **Better Debugging**: Console warnings when unknown status values are encountered
3. **Flexible**: Can handle future status values without code changes
4. **Type Safety**: TypeScript interface documents all expected status values

## Testing
The component now:
- ✅ Handles `'running'` status (the original issue)
- ✅ Handles `'executing'` status
- ✅ Handles all other defined statuses
- ✅ Gracefully falls back for any unknown status values
- ✅ Logs warnings for debugging when unknown statuses are encountered
