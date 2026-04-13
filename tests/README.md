# Agent Console E2E Testing Suite

Comprehensive end-to-end testing for the Agent Console production pages using Playwright.

## 🎯 Test Coverage

### Core Functionality Tests
- **Dashboard** (`dashboard.spec.ts`) - Landing page, statistics, agent grid, recent sessions
- **Chat Interface** (`chat.spec.ts`) - Real-time messaging, SSE streaming, tool execution, planning cards, confirmations
- **Agent Management** (`agents.spec.ts`) - Agent CRUD operations, search, filtering
- **Session Browser** (`sessions.spec.ts`) - Session management, hierarchical relationships, navigation

### Quality Assurance Tests
- **Navigation** (`navigation.spec.ts`) - Cross-page navigation, routing, breadcrumbs
- **Accessibility** (`accessibility.spec.ts`) - WCAG 2.1 AA compliance, keyboard navigation, screen readers
- **Performance** (`performance.spec.ts`) - Core Web Vitals, load times, resource optimization

## 🚀 Quick Start

### Prerequisites

1. **Agent Engine Backend** - Must be running at `localhost:8080`
   ```bash
   cd agent-engine
   ./gradlew bootRun
   ```

2. **Story Agent** - Ensure a story agent exists for chat testing
   - The tests will automatically detect available agents
   - Prefers agents with "story" in the name/ID
   - Falls back to first available agent if no story agent found

3. **Node.js & npm** - For running the frontend and tests

### Installation

```bash
# Install dependencies (if not already done)
npm install

# Install Playwright browsers
npm run test:e2e:install
```

### Running Tests

#### Full Test Suite (Recommended)
```bash
# Run comprehensive test suite with reporting
npm run test:e2e:full
```

#### Individual Test Suites
```bash
# Core functionality
npm run test:e2e:dashboard
npm run test:e2e:chat
npm run test:e2e:agents
npm run test:e2e:sessions

# Quality assurance
npm run test:e2e:navigation
npm run test:e2e:accessibility
npm run test:e2e:performance
```

#### Interactive Testing
```bash
# Run with UI (great for debugging)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug
```

#### View Test Reports
```bash
# Open HTML report
npm run test:e2e:report
```

## 📋 Test Scenarios

### Chat Interface Testing with Story Agent

The chat tests use different prompts to evoke various responses from the story agent:

#### Basic Story Prompts
- **Simple Request**: "Hello! Can you tell me a short story?"
- **Robot Story**: "Write a story about a robot learning to paint"
- **Mystery Story**: "Tell me a mystery story with a detective"
- **Fantasy Adventure**: "Create a fantasy adventure with magic"

#### Tool Execution Testing
- **Web Research**: "Can you research the latest news about AI and then tell me a story based on what you find?"
- **Planning**: "Can you create a plan for writing a multi-chapter fantasy novel?"
- **Confirmation**: "Please help me delete all my old files. This is a destructive action that needs confirmation."
- **Multi-Agent**: "Can you spawn a helper agent to research a topic while you work on the story?"

### Expected Behaviors

#### SSE Streaming
- ✅ Real-time message streaming
- ✅ Typing indicators during agent responses
- ✅ Connection status monitoring
- ✅ Auto-reconnection on failures

#### Tool Execution
- ✅ Tool call display with arguments and results
- ✅ Status transitions (pending → running → completed/failed)
- ✅ Collapsible JSON viewers
- ✅ Copy functionality for arguments/results

#### Planning Integration
- ✅ Planning card display with task hierarchies
- ✅ Task status indicators (TODO, IN_PROGRESS, COMPLETED)
- ✅ Progress tracking and animations
- ✅ Expandable task details

#### Confirmation Requests
- ✅ DECISION type confirmations (Yes/No)
- ✅ TEXT type confirmations (free text input)
- ✅ Multiple choice options
- ✅ Pending confirmation banners

#### Multi-Agent Sessions
- ✅ Session tab management
- ✅ Parent-child session relationships
- ✅ Tab switching and navigation

## 🔧 Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
// Key settings
baseURL: 'http://localhost:3000'
timeout: 60000
retries: process.env.CI ? 2 : 0
workers: process.env.CI ? 1 : undefined

// Browsers tested
- Desktop Chrome, Firefox, Safari
- Mobile Chrome, Safari
- Microsoft Edge
```

### Environment Variables

```bash
# Backend URL (default: http://localhost:8080)
BACKEND_URL=http://localhost:8080

# Frontend URL (default: http://localhost:3000)
FRONTEND_URL=http://localhost:3000

# Story agent ID (auto-detected if not set)
STORY_AGENT_ID=story-agent
```

## 📊 Test Artifacts

After running tests, artifacts are available in `test-results/`:

- **HTML Report** - Interactive test results with screenshots and videos
- **Screenshots** - Captured on test failures
- **Videos** - Full test execution recordings
- **Traces** - Detailed execution traces for debugging

## 🐛 Troubleshooting

### Common Issues

#### Backend Not Available
```
❌ Agent Engine backend is not available at localhost:8080
```
**Solution**: Start the Agent Engine backend:
```bash
cd agent-engine && ./gradlew bootRun
```

#### No Story Agent Found
```
⚠️ No story agent found, tests will use first available agent
```
**Solution**: Create a story agent or ensure agents exist in the backend

#### Frontend Connection Issues
```
⚠️ Frontend not running, Playwright will start it
```
**Solution**: This is normal - Playwright will start the frontend automatically

#### Test Timeouts
```
Test timeout of 60000ms exceeded
```
**Solutions**:
- Check backend response times
- Verify network connectivity
- Increase timeout in `playwright.config.ts`

#### Browser Installation Issues
```
Executable doesn't exist at /path/to/browser
```
**Solution**: Reinstall Playwright browsers:
```bash
npm run test:e2e:install
```

### Debugging Tests

#### Visual Debugging
```bash
# Run with browser visible
npm run test:e2e:headed

# Step through tests interactively
npm run test:e2e:debug
```

#### Console Logging
Tests include extensive console logging for debugging:
- API response times
- Memory usage tracking
- Animation performance metrics
- Core Web Vitals measurements

#### Test Artifacts
- Check `test-results/` for screenshots and videos of failures
- Use trace viewer for detailed execution analysis
- Review HTML report for comprehensive test results

## 🎯 Production Readiness Checklist

The test suite validates production readiness across multiple dimensions:

### ✅ Functionality
- [ ] Real-time chat with SSE streaming
- [ ] Tool execution display and interaction
- [ ] Planning card integration and animations
- [ ] Confirmation request handling
- [ ] Multi-agent session management
- [ ] Agent CRUD operations
- [ ] Session browser and navigation
- [ ] Dashboard statistics and navigation

### ✅ User Experience
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Smooth animations and transitions
- [ ] Loading states and error handling
- [ ] Empty states and helpful messaging
- [ ] Keyboard navigation support
- [ ] Theme switching persistence

### ✅ Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader compatibility
- [ ] Keyboard-only navigation
- [ ] Proper ARIA labels and roles
- [ ] Color contrast requirements
- [ ] Focus management

### ✅ Performance
- [ ] Core Web Vitals (LCP, FID, CLS)
- [ ] Page load times < 3 seconds
- [ ] Bundle size optimization
- [ ] Image optimization
- [ ] Memory leak prevention
- [ ] Animation performance (60 FPS)

### ✅ Reliability
- [ ] Error state handling
- [ ] Network failure recovery
- [ ] Cross-browser compatibility
- [ ] Mobile device support
- [ ] Backend integration stability

## 📈 Continuous Integration

### GitHub Actions Integration

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e:install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: test-results/
```

### Local CI Simulation

```bash
# Run tests in CI mode (with retries)
CI=true npm run test:e2e

# Generate coverage reports
npm run test:e2e -- --reporter=junit,html
```

## 🔄 Test Maintenance

### Adding New Tests

1. **Create test file** in `tests/e2e/`
2. **Follow naming convention**: `feature.spec.ts`
3. **Use page object pattern** for complex interactions
4. **Add to test runner** script if needed
5. **Update documentation**

### Test Data Management

- Tests use real backend data when available
- Graceful fallbacks for missing data
- No test data cleanup required (read-only operations)
- Mock data for edge cases and error scenarios

### Performance Baselines

Update performance thresholds in `performance.spec.ts` based on:
- Target hardware specifications
- Network conditions
- User experience requirements
- Business performance goals

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Agent Engine API Documentation](../agent-engine/docs/)
- [Agent Console Architecture](../ARCHITECTURE.md)