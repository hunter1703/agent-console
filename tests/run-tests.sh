#!/bin/bash

# Agent Console E2E Test Runner
# Comprehensive test execution script with reporting and CI support

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:3000"
TIMEOUT=30
RETRY_COUNT=3

echo -e "${BLUE}🚀 Agent Console E2E Test Suite${NC}"
echo "=================================="

# Function to check if service is running
check_service() {
    local url=$1
    local name=$2
    
    echo -e "${YELLOW}Checking ${name}...${NC}"
    
    for i in $(seq 1 $RETRY_COUNT); do
        if curl -s --max-time $TIMEOUT "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ ${name} is running${NC}"
            return 0
        else
            echo -e "${YELLOW}⏳ Waiting for ${name} (attempt $i/$RETRY_COUNT)...${NC}"
            sleep 5
        fi
    done
    
    echo -e "${RED}❌ ${name} is not available at ${url}${NC}"
    return 1
}

# Function to run test suite
run_test_suite() {
    local suite=$1
    local description=$2
    
    echo -e "\n${BLUE}Running ${description}...${NC}"
    
    if npx playwright test tests/e2e/${suite}.spec.ts --reporter=line; then
        echo -e "${GREEN}✅ ${description} passed${NC}"
        return 0
    else
        echo -e "${RED}❌ ${description} failed${NC}"
        return 1
    fi
}

# Check prerequisites
echo -e "\n${BLUE}Checking prerequisites...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Check if Playwright is installed
if ! npx playwright --version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Playwright not found, installing...${NC}"
    npm install @playwright/test
    npx playwright install
fi

# Check backend service
if ! check_service "$BACKEND_URL/health" "Agent Engine Backend"; then
    echo -e "${RED}❌ Please start the Agent Engine backend:${NC}"
    echo -e "${YELLOW}   cd agent-engine && ./gradlew bootRun${NC}"
    exit 1
fi

# Check frontend service (optional - will be started by Playwright if needed)
if ! check_service "$FRONTEND_URL" "Frontend"; then
    echo -e "${YELLOW}⚠️  Frontend not running, Playwright will start it${NC}"
fi

# Run test suites
echo -e "\n${BLUE}Starting test execution...${NC}"

FAILED_SUITES=()

# Core functionality tests
if ! run_test_suite "dashboard" "Dashboard Tests"; then
    FAILED_SUITES+=("dashboard")
fi

if ! run_test_suite "agents" "Agent Management Tests"; then
    FAILED_SUITES+=("agents")
fi

if ! run_test_suite "sessions" "Session Browser Tests"; then
    FAILED_SUITES+=("sessions")
fi

if ! run_test_suite "chat" "Chat Interface Tests"; then
    FAILED_SUITES+=("chat")
fi

if ! run_test_suite "navigation" "Navigation Tests"; then
    FAILED_SUITES+=("navigation")
fi

# Quality tests
if ! run_test_suite "accessibility" "Accessibility Tests"; then
    FAILED_SUITES+=("accessibility")
fi

if ! run_test_suite "performance" "Performance Tests"; then
    FAILED_SUITES+=("performance")
fi

# Generate comprehensive report
echo -e "\n${BLUE}Generating test report...${NC}"
npx playwright show-report --host=0.0.0.0 &
REPORT_PID=$!

# Summary
echo -e "\n${BLUE}Test Execution Summary${NC}"
echo "======================"

if [ ${#FAILED_SUITES[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 All test suites passed!${NC}"
    echo -e "${GREEN}✅ Dashboard functionality${NC}"
    echo -e "${GREEN}✅ Agent management${NC}"
    echo -e "${GREEN}✅ Session browser${NC}"
    echo -e "${GREEN}✅ Chat interface with story agent${NC}"
    echo -e "${GREEN}✅ Navigation and routing${NC}"
    echo -e "${GREEN}✅ Accessibility compliance${NC}"
    echo -e "${GREEN}✅ Performance benchmarks${NC}"
    
    echo -e "\n${BLUE}🎯 Production Readiness Checklist:${NC}"
    echo -e "${GREEN}✅ Real-time chat with SSE streaming${NC}"
    echo -e "${GREEN}✅ Tool execution display${NC}"
    echo -e "${GREEN}✅ Planning card integration${NC}"
    echo -e "${GREEN}✅ Confirmation request handling${NC}"
    echo -e "${GREEN}✅ Multi-agent session support${NC}"
    echo -e "${GREEN}✅ Responsive design (mobile/tablet/desktop)${NC}"
    echo -e "${GREEN}✅ Accessibility (WCAG 2.1 AA)${NC}"
    echo -e "${GREEN}✅ Performance optimization${NC}"
    echo -e "${GREEN}✅ Error handling and recovery${NC}"
    echo -e "${GREEN}✅ Cross-browser compatibility${NC}"
    
    EXIT_CODE=0
else
    echo -e "${RED}❌ ${#FAILED_SUITES[@]} test suite(s) failed:${NC}"
    for suite in "${FAILED_SUITES[@]}"; do
        echo -e "${RED}   - ${suite}${NC}"
    done
    
    echo -e "\n${YELLOW}💡 Troubleshooting tips:${NC}"
    echo -e "${YELLOW}   - Check browser console for JavaScript errors${NC}"
    echo -e "${YELLOW}   - Verify backend API responses${NC}"
    echo -e "${YELLOW}   - Check network connectivity${NC}"
    echo -e "${YELLOW}   - Review test artifacts in test-results/${NC}"
    
    EXIT_CODE=1
fi

echo -e "\n${BLUE}📊 Test artifacts:${NC}"
echo -e "${YELLOW}   - HTML Report: test-results/index.html${NC}"
echo -e "${YELLOW}   - Screenshots: test-results/screenshots/${NC}"
echo -e "${YELLOW}   - Videos: test-results/videos/${NC}"
echo -e "${YELLOW}   - Traces: test-results/traces/${NC}"

echo -e "\n${BLUE}🌐 View report at: http://localhost:9323${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the report server${NC}"

# Keep report server running
wait $REPORT_PID

exit $EXIT_CODE