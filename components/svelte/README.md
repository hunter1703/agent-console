# Svelte Components

This directory contains Svelte components that can be used to embed agent console functionality in Svelte applications.

## Chat.svelte

A standalone Svelte chat component that provides basic chat UI functionality.

### Usage

```svelte
<script>
  import Chat from './components/svelte/Chat.svelte'
  
  function handleMessage(message) {
    console.log('New message:', message)
    // Send to your backend API
  }
</script>

<Chat 
  sessionId="session-123"
  agentId="agent-456"
  onMessage={handleMessage}
/>
```

### Props

- `sessionId` (string): The session ID for the chat
- `agentId` (string): The agent ID to chat with
- `onMessage` (function): Callback function called when a message is sent

### Build

The Svelte components are built separately using Vite:

```bash
npm run dev:svelte  # Watch mode
npm run build:svelte  # Production build
```

The built component will be available in `components/svelte/dist/` and can be imported as a web component or ES module.

## Integration with Next.js

The main agent console application uses Next.js with React. These Svelte components are provided as an alternative integration option for Svelte-based applications that want to embed chat functionality.
