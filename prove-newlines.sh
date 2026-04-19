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
echo "=== RAW BYTES (showing newlines as visible characters) ==="
echo ""

# Get first 2000 bytes and show newlines explicitly
curl -N -s "${BACKEND_URL}/v1/session/${SESSION_ID}/stream" 2>/dev/null | head -c 2000 | cat -A

echo ""
echo ""
echo "=== EXPLANATION ==="
echo "In cat -A output:"
echo "  $ = newline (LF)"
echo "  ^M$ = carriage return + newline (CRLF)"
echo ""
echo "SSE spec requires: data:...\$ followed by another \$ (blank line)"
echo "If you see: data:...\$ immediately followed by data:... (NO blank line)"
echo "Then the backend is missing the required double newline."
