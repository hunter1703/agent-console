#!/bin/bash

# This script proves the SSE format issue by comparing backend output with browser behavior

BACKEND_URL="http://localhost:8080"
AGENT_ID="story_agent"

echo "=== SSE Format Proof Script ==="
echo ""

# Get sessionId
RESPONSE=$(curl -s -X POST "${BACKEND_URL}/v1/agent/${AGENT_ID}/invoke" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}')

SESSION_ID=$(echo "${RESPONSE}" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "SessionId: ${SESSION_ID}"
echo ""

# Create a simple Node.js script to test EventSource
cat > /tmp/test-eventsource.js << 'EOJS'
const sessionId = process.argv[2];
const url = `http://localhost:8080/v1/session/${sessionId}/stream`;

console.log('Testing EventSource connection to:', url);
console.log('');

const EventSource = require('eventsource');
const es = new EventSource(url);

let eventCount = 0;
let hasOpened = false;

es.onopen = () => {
  hasOpened = true;
  console.log('✅ EventSource.onopen fired - connection established');
};

es.onmessage = (event) => {
  eventCount++;
  console.log(`✅ Event #${eventCount} received:`, event.data.substring(0, 80) + '...');
};

es.onerror = (error) => {
  console.log('❌ EventSource.onerror fired');
  console.log('   readyState:', es.readyState, '(0=CONNECTING, 1=OPEN, 2=CLOSED)');
  console.log('   hasOpened:', hasOpened);
  
  if (!hasOpened) {
    console.log('');
    console.log('DIAGNOSIS: Connection never reached OPEN state');
    console.log('This indicates the SSE format is incorrect.');
    console.log('EventSource is waiting for proper event termination (double newline).');
  }
  
  es.close();
  process.exit(hasOpened ? 0 : 1);
};

// Timeout after 5 seconds
setTimeout(() => {
  console.log('');
  console.log('Timeout after 5 seconds');
  console.log('Events received:', eventCount);
  console.log('Connection opened:', hasOpened);
  es.close();
  process.exit(eventCount > 0 ? 0 : 1);
}, 5000);
EOJS

echo "=== Test 1: Using curl (low-level, works with any format) ==="
echo ""
curl -N -s "${BACKEND_URL}/v1/session/${SESSION_ID}/stream" 2>/dev/null | head -n 5
echo ""
echo "✅ curl receives data (curl doesn't validate SSE format)"
echo ""

echo "=== Test 2: Using EventSource (strict SSE validation) ==="
echo ""

# Check if Node.js is available
if command -v node >/dev/null 2>&1; then
  # Check if eventsource package is available
  if node -e "require('eventsource')" 2>/dev/null; then
    node /tmp/test-eventsource.js "${SESSION_ID}"
    EXIT_CODE=$?
    echo ""
    if [ $EXIT_CODE -ne 0 ]; then
      echo "❌ EventSource FAILED - SSE format is incorrect"
      echo ""
      echo "CONCLUSION: Backend SSE format violates the spec."
      echo "The backend needs to send double newlines (\\n\\n) after each event."
    else
      echo "✅ EventSource SUCCESS - SSE format is correct"
    fi
  else
    echo "⚠️  Node.js 'eventsource' package not installed"
    echo "   Install with: npm install -g eventsource"
    echo ""
    echo "Falling back to manual hex analysis..."
    
    # Fallback: capture and analyze hex
    TEMP_FILE=$(mktemp)
    (curl -N -s "${BACKEND_URL}/v1/session/${SESSION_ID}/stream" 2>/dev/null | head -c 2000) > "${TEMP_FILE}" &
    CURL_PID=$!
    sleep 3
    kill $CURL_PID 2>/dev/null || true
    wait $CURL_PID 2>/dev/null || true
    
    if [ -s "${TEMP_FILE}" ]; then
      echo ""
      echo "First 500 bytes in hex:"
      hexdump -C "${TEMP_FILE}" | head -n 20
      echo ""
      echo "Looking for '0a 0a' (double newline) vs '0a 64' (newline followed by 'd' from 'data'):"
      if hexdump -C "${TEMP_FILE}" | grep -q "0a  64 61 74 61"; then
        echo "❌ FOUND: '0a 64' pattern - single newline before 'data'"
        echo "   This means: data:...\\n data:... (WRONG)"
      fi
      if hexdump -C "${TEMP_FILE}" | grep -q "0a 0a"; then
        echo "✅ FOUND: '0a 0a' pattern - double newline present"
        echo "   This means: data:...\\n\\n (CORRECT)"
      fi
    fi
    rm -f "${TEMP_FILE}"
  fi
else
  echo "⚠️  Node.js not installed, cannot test EventSource"
  echo ""
  echo "To prove the issue, install Node.js and run:"
  echo "  npm install -g eventsource"
  echo "  node /tmp/test-eventsource.js ${SESSION_ID}"
fi

rm -f /tmp/test-eventsource.js
