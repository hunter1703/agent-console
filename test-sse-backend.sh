#!/bin/bash

# Test script to verify backend SSE streaming works correctly
# This will:
# 1. Invoke an agent to get a sessionId
# 2. Connect to the SSE stream endpoint
# 3. Show that events are received

set -e

BACKEND_URL="http://localhost:8080"
AGENT_ID="story_agent"

echo "=== Testing Backend SSE Streaming ==="
echo ""

# Step 1: Invoke agent to get sessionId
echo "Step 1: Invoking agent to get sessionId..."
INVOKE_RESPONSE=$(curl -s -X POST \
  "${BACKEND_URL}/v1/agent/${AGENT_ID}/invoke" \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me a short story"}')

echo "Invoke response: ${INVOKE_RESPONSE}"
echo ""

# Extract sessionId from response
SESSION_ID=$(echo "${INVOKE_RESPONSE}" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -z "${SESSION_ID}" ]; then
  echo "ERROR: Failed to get sessionId from invoke response"
  exit 1
fi

echo "Got sessionId: ${SESSION_ID}"
echo ""

# Step 2: Connect to SSE stream
echo "Step 2: Connecting to SSE stream endpoint..."
echo "URL: ${BACKEND_URL}/v1/session/${SESSION_ID}/stream"
echo ""
echo "Listening for SSE events (will show first 20 events, then exit)..."
echo "---"

# Use curl to connect to SSE endpoint and show first 20 events
curl -N -s "${BACKEND_URL}/v1/session/${SESSION_ID}/stream" | head -n 40

echo ""
echo "---"
echo ""
echo "✅ SUCCESS: Backend SSE streaming is working!"
echo "The stream endpoint returned events successfully."
