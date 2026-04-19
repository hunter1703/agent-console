# Testing the Migration

## Quick Verification Steps

### 1. Start the Development Server

```bash
cd agent-console
npm run dev
```

### 2. Open Browser Console

Open Chrome DevTools (F12) and go to the Console tab.

### 3. Test Basic Chat Flow

1. **Navigate to Chat**
   - Go to http://localhost:3000/chat?agent=<agent-id>
   - Replace `<agent-id>` with a valid agent ID from your backend

2. **Send a Message**
   - Type a message in the input
   - Click Send
   - **Watch for**:
     - ✅ No duplicate key warnings
     - ✅ No EventSource errors
     - ✅ Smooth streaming animation
     - ✅ Typing indicator appears
     - ✅ Message appears in chat

3. **Send Multiple Messages**
   - Send 3-5 messages in quick succession
   - **Watch for**:
     - ✅ All messages stream correctly
     - ✅ No state synchronization issues
     - ✅ Messages appear in correct order

4. **Refresh Page**
   - Refresh the browser (Cmd+R / Ctrl+R)
   - **Watch for**:
     - ✅ History loads correctly
     - ✅ All messages display
     - ✅ Agent names show correctly
     - ✅ No errors in console

### 4. Test Tool Execution

1. **Send a message that triggers a tool**
   - Example: "Search for information about X"
   - **Watch for**:
     - ✅ Tool execution card appears
     - ✅ Tool status updates correctly
     - ✅ Tool result displays

### 5. Test Planning

1. **Send a message that creates a plan**
   - Example: "Create a plan to build a web app"
   - **Watch for**:
     - ✅ Plan widget appears
     - ✅ Tasks display correctly
     - ✅ Plan updates as agent works

### 6. Test Confirmations

1. **Trigger a confirmation request**
   - This depends on your agent configuration
   - **Watch for**:
     - ✅ Confirmation card appears
     - ✅ Input is disabled
     - ✅ Can submit confirmation
     - ✅ Input re-enables after submission

### 7. Test Session Switching

1. **Open multiple sessions**
   - Start a new chat
   - Switch between sessions
   - **Watch for**:
     - ✅ Messages load correctly
     - ✅ No state leakage between sessions
     - ✅ Streaming works in each session

## Console Checks

### What You Should NOT See

❌ **Duplicate Key Warnings**
```
Warning: Encountered two children with the same key
```

❌ **EventSource Errors**
```
EventSource error: {}
Received 80 events before error
```

❌ **State Synchronization Errors**
```
Cannot read property 'content' of undefined
Message not found in history
```

### What You SHOULD See

✅ **Clean Event Processing**
```
AGUI Event: TEXT_MESSAGE_CHUNK { messageId: "...", delta: "..." }
AGUI Event: TEXT_MESSAGE_END { messageId: "..." }
```

✅ **Successful State Updates**
```
Loaded 5 historical messages for session abc123
Migrated temporary session temp-123 to real session abc123
```

## Performance Checks

### Streaming Performance

1. **Send a long message** (e.g., "Write a 500-word essay about AI")
2. **Watch for**:
   - ✅ Smooth character-by-character streaming
   - ✅ No frame drops
   - ✅ Responsive UI during streaming

### Memory Usage

1. **Open Chrome DevTools → Performance → Memory**
2. **Send 10-20 messages**
3. **Watch for**:
   - ✅ No memory leaks
   - ✅ Stable memory usage
   - ✅ Garbage collection working

## E2E Tests

Run the automated E2E tests:

```bash
# Run all chat tests
npm run test:e2e:chat

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

## Known Issues (Unrelated to Migration)

These errors are pre-existing and unrelated to the migration:

1. **Missing Shader Files**
   - Error: `Module not found: Can't resolve '@/lib/liquid-glass-studio/shaders/...'`
   - Impact: Only affects test-glass-button page
   - Fix: Not required for chat functionality

2. **Missing Sass**
   - Error: `To use Next.js' built-in Sass support, you first need to install 'sass'`
   - Impact: Only affects ResizableWindow component
   - Fix: `npm install sass` (optional)

## Success Criteria

The migration is successful if:

- ✅ No duplicate key warnings in console
- ✅ No EventSource errors
- ✅ Messages stream smoothly
- ✅ History loads correctly on refresh
- ✅ All features work (tools, plans, confirmations)
- ✅ No performance degradation
- ✅ E2E tests pass

## Troubleshooting

### If you see duplicate key warnings:

1. Check browser console for the exact error
2. Look for messages with the same `id` or `messageId`
3. Verify `getMessageChain()` returns unique messages
4. Check if history structure is correct

### If streaming doesn't work:

1. Check Network tab for SSE connection
2. Verify EventSource is connected
3. Check console for AGUI events
4. Verify `appendToMessage()` is being called

### If history doesn't load:

1. Check if session exists in backend
2. Verify `getSessionMessages()` returns data
3. Check if history structure is built correctly
4. Look for errors in `loadSessionHistory()`

## Reporting Issues

If you find issues:

1. **Capture**:
   - Browser console logs
   - Network tab (SSE events)
   - React DevTools state
   - Steps to reproduce

2. **Document**:
   - What you expected
   - What actually happened
   - Any error messages

3. **Share**:
   - Create a detailed bug report
   - Include screenshots/videos
   - Provide session ID if applicable

## Next Steps After Testing

Once testing is complete and successful:

1. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: migrate to Open WebUI architecture
   
   - Replace dual-array with history-based state
   - Remove DOM manipulation from SSE handler
   - Add eventsource-parser for clean SSE parsing
   - Eliminate duplicate keys and EventSource errors
   
   Fixes #<issue-number>"
   ```

2. **Deploy to Staging**
   - Test in staging environment
   - Monitor for issues
   - Get team feedback

3. **Deploy to Production**
   - Monitor error rates
   - Watch for user feedback
   - Be ready to rollback if needed

4. **Clean Up**
   - Remove old migration docs (optional)
   - Update main README
   - Archive planning documents
