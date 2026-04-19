#!/bin/bash

BACKEND_URL="http://localhost:8080"
AGENT_ID="story_agent"

# Invoke to get sessionId
RESPONSE=$(curl -s -X POST "${BACKEND_URL}/v1/agent/${AGENT_ID}/invoke" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}')

SESSION_ID=$(echo "${RESPONSE}" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "SessionId: ${SESSION_ID}"
echo ""
echo "Testing SSE stream (showing headers and first few lines)..."
echo "---"

# Connect and show headers + first 20 lines
curl -N -v "${BACKEND_URL}/v1/session/${SESSION_ID}/stream" 2>&1 | head -n 50

echo ""
echo "---"
