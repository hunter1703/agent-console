#!/bin/bash
set -e

BACKEND_URL="http://localhost:8080"
AGENT_ID="story_agent"

echo "Testing if there's a timing issue..."

# Invoke to get sessionId
RESPONSE=$(curl -s -X POST "${BACKEND_URL}/v1/agent/${AGENT_ID}/invoke" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}')

SESSION_ID=$(echo "${RESPONSE}" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "Got sessionId: ${SESSION_ID}"

# Try to connect immediately
echo "Trying to connect immediately..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -N "${BACKEND_URL}/v1/session/${SESSION_ID}/stream" &)
CURL_PID=$!
sleep 1
kill $CURL_PID 2>/dev/null || true
echo "HTTP Code: ${HTTP_CODE}"

# Try after 1 second
echo "Trying after 1 second delay..."
sleep 1
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -N "${BACKEND_URL}/v1/session/${SESSION_ID}/stream" &)
CURL_PID=$!
sleep 1
kill $CURL_PID 2>/dev/null || true
echo "HTTP Code: ${HTTP_CODE}"
