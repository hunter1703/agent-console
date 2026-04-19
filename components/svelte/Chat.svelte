<script>
  /**
   * Svelte Chat Component
   * 
   * This is a Svelte wrapper component that can be used to embed
   * the chat functionality in Svelte applications.
   */
  
  // Props - marked as const since they're for external reference
  export const sessionId = ''
  export const agentId = ''
  export let onMessage = null
  
  // Component state
  let messages = []
  let inputValue = ''
  let isLoading = false
  
  // Handle message sending
  function handleSend() {
    if (!inputValue.trim()) return
    
    const message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date().toISOString()
    }
    
    messages = [...messages, message]
    
    if (onMessage) {
      onMessage(message)
    }
    
    inputValue = ''
  }
  
  // Handle key press
  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }
</script>

<div class="svelte-chat-container">
  <div class="svelte-chat-messages">
    {#each messages as message (message.id)}
      <div class="svelte-chat-message" data-role={message.role}>
        <div class="svelte-chat-message-content">
          {message.content}
        </div>
        <div class="svelte-chat-message-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    {/each}
  </div>
  
  <div class="svelte-chat-input-container">
    <textarea
      bind:value={inputValue}
      on:keypress={handleKeyPress}
      placeholder="Type your message..."
      rows="3"
      disabled={isLoading}
    ></textarea>
    <button
      on:click={handleSend}
      disabled={isLoading || !inputValue.trim()}
    >
      Send
    </button>
  </div>
</div>

<style>
  .svelte-chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 600px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .svelte-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .svelte-chat-message {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .svelte-chat-message[data-role="user"] {
    align-items: flex-end;
  }
  
  .svelte-chat-message[data-role="assistant"] {
    align-items: flex-start;
  }
  
  .svelte-chat-message-content {
    max-width: 70%;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    word-wrap: break-word;
  }
  
  .svelte-chat-message[data-role="user"] .svelte-chat-message-content {
    background-color: #3b82f6;
    color: white;
  }
  
  .svelte-chat-message[data-role="assistant"] .svelte-chat-message-content {
    background-color: #f3f4f6;
    color: #1f2937;
  }
  
  .svelte-chat-message-time {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .svelte-chat-input-container {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background-color: #f9fafb;
  }
  
  textarea {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.875rem;
    resize: none;
  }
  
  textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  textarea:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
</style>
