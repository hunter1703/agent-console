#!/bin/bash

# This script proves whether the backend SSE stream has proper formatting
# by showing the exact bytes and checking for double newlines

BACKEND_URL="http://localhost:8080"
AGENT_ID="story_agent"

echo "=== SSE Format Verification Script ==="
echo ""

# Step 1: Invoke to get sessionId
echo "Step 1: Getting sessionId..."
RESPONSE=$(curl -s -X POST "${BACKEND_URL}/v1/agent/${AGENT_ID}/invoke" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}')

SESSION_ID=$(echo "${RESPONSE}" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -z "${SESSION_ID}" ]; then
  echo "ERROR: Failed to get sessionId"
  exit 1
fi

echo "SessionId: ${SESSION_ID}"
echo ""

# Step 2: Capture raw SSE output to a file
echo "Step 2: Capturing SSE stream output..."
TEMP_FILE=$(mktemp)
curl -N -s "${BACKEND_URL}/v1/session/${SESSION_ID}/stream" 2>/dev/null | head -c 3000 > "${TEMP_FILE}"

echo "Captured $(wc -c < "${TEMP_FILE}") bytes"
echo ""

# Step 3: Show the raw output with line numbers
echo "=== RAW OUTPUT (first 30 lines) ==="
head -n 30 "${TEMP_FILE}"
echo ""

# Step 4: Check for double newlines using hexdump
echo "=== CHECKING FOR DOUBLE NEWLINES ==="
echo ""
echo "Looking for pattern: 0a 0a (two consecutive newlines in hex)"
echo ""

# Show hex dump of first 1000 bytes
echo "Hex dump (first 1000 bytes, showing newlines as '0a'):"
hexdump -C "${TEMP_FILE}" | head -n 30
echo ""

# Count consecutive newlines
DOUBLE_NEWLINES=$(hexdump -ve '1/1 "%02x\n"' "${TEMP_FILE}" | grep -c "^0a$" | head -n 1)
echo "Analysis:"
echo "- Looking for '0a 0a' pattern (double newline)"
echo ""

# Check if we see the pattern data:...0a data:... (single newline) or data:...0a 0a data:... (double newline)
if hexdump -C "${TEMP_FILE}" | grep -q "0a  64 61 74 61"; then
  echo "❌ FOUND: Single newline between events (0a followed immediately by 'data')"
  echo "   This violates SSE spec which requires double newlines"
elif hexdump -C "${TEMP_FILE}" | grep -q "0a 0a"; then
  echo "✅ FOUND: Double newlines present (0a 0a pattern exists)"
  echo "   This is correct SSE format"
else
  echo "⚠️  Unable to determine - check hex dump above"
fi

echo ""
echo "=== SSE SPEC REQUIREMENT ==="
echo "According to W3C SSE spec, each event must end with TWO newlines:"
echo "  data: {json}\\n\\n"
echo ""
echo "If the backend sends:"
echo "  data: {json}\\n"
echo "  data: {json}\\n"
echo ""
echo "Then EventSource will fail with ERR_INCOMPLETE_CHUNKED_ENCODING"
echo "because it's waiting for the second newline to know the event is complete."

# Cleanup
rm -f "${TEMP_FILE}"
