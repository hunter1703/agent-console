#!/bin/bash

# Script to reproduce the duplicate key issue by examining SSE events

BACKEND_URL="http://localhost:8080"
AGENT_ID="story_agent"

echo "=== Reproducing Duplicate Key Issue ==="
echo ""

# Step 1: Invoke agent
echo "Step 1: Invoking agent..."
RESPONSE=$(curl -s -X POST "${BACKEND_URL}/v1/agent/${AGENT_ID}/invoke" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}')

SESSION_ID=$(echo "${RESPONSE}" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "SessionId: ${SESSION_ID}"
echo ""

# Step 2: Capture SSE events and analyze for duplicate message IDs
echo "Step 2: Capturing SSE events and checking for duplicate message IDs..."
echo ""

TEMP_FILE=$(mktemp)

# Capture events for 5 seconds
(curl -N -s "${BACKEND_URL}/v1/session/${SESSION_ID}/stream" 2>/dev/null) > "${TEMP_FILE}" &
CURL_PID=$!
sleep 5
kill $CURL_PID 2>/dev/null || true
wait $CURL_PID 2>/dev/null || true

# Extract all messageId values from the events
echo "Analyzing message IDs from events..."
echo ""

# Count occurrences of each messageId
MESSAGE_IDS=$(grep -o '"messageId":"[^"]*"' "${TEMP_FILE}" | cut -d'"' -f4 | sort)

if [ -z "${MESSAGE_IDS}" ]; then
  echo "No message IDs found in events"
  rm -f "${TEMP_FILE}"
  exit 0
fi

# Count duplicates
echo "Message ID occurrence count:"
echo "${MESSAGE_IDS}" | uniq -c | sort -rn

echo ""
echo "=== Analysis ==="

# Check if any message ID appears more than once
DUPLICATES=$(echo "${MESSAGE_IDS}" | uniq -d)

if [ -z "${DUPLICATES}" ]; then
  echo "✅ NO DUPLICATES: Each message ID appears exactly once"
  echo "   This is correct - no duplicate key errors should occur"
else
  echo "❌ DUPLICATES FOUND: The following message IDs appear multiple times:"
  echo "${DUPLICATES}" | while read -r msg_id; do
    COUNT=$(echo "${MESSAGE_IDS}" | grep -c "^${msg_id}$")
    echo "   - ${msg_id}: ${COUNT} times"
  done
  echo ""
  echo "This explains the React duplicate key errors."
  echo "The same messageId is being sent in multiple events."
fi

echo ""
echo "=== Event Types for Duplicate Messages ==="
if [ -n "${DUPLICATES}" ]; then
  echo "${DUPLICATES}" | head -n 1 | while read -r msg_id; do
    echo "Events containing messageId: ${msg_id}"
    grep "\"messageId\":\"${msg_id}\"" "${TEMP_FILE}" | head -n 5 | while read -r line; do
      EVENT_TYPE=$(echo "${line}" | grep -o '"type":"[^"]*"' | head -n 1 | cut -d'"' -f4)
      echo "  - Event type: ${EVENT_TYPE}"
    done
  done
fi

rm -f "${TEMP_FILE}"
