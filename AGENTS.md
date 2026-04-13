## Testing Guidelines

**CRITICAL: Always run tests in background and monitor them**

- **NEVER run tests synchronously** - they can get stuck and block the agent indefinitely
- **ALWAYS use background processes** for test execution with periodic monitoring
- **Use controlBashProcess with "start" action** for test commands like `npm test`, `playwright test`, etc.
- **Monitor test output** using getProcessOutput to check for completion or issues
- **Set reasonable timeouts** and be prepared to kill stuck processes
- **Examples of commands that MUST run in background:**
    - `npm test`, `npm run test:e2e`, `playwright test`
    - `./gradlew test`, `./gradlew integrationTest`
    - Any test suite that might hang or take unpredictable time

```bash
# WRONG - blocks agent
npm run test:e2e

# RIGHT - run in background with monitoring
# Use controlBashProcess "start" action, then monitor with getProcessOutput
```

## Test vs Production Code Framework

**CRITICAL: Don't blindly make changes to production code or tests**

When fixing test failures, follow this evaluation framework:

1. **Define Expected Behavior**: What should the actual user experience be?
2. **Evaluate Production Code**: Does it implement the expected behavior correctly?
3. **Evaluate Test Code**: Does it test for the correct expected behavior?
4. **Fix Accordingly**:
    - If production code is wrong → Fix production code
    - If test expectations are wrong → Fix tests
    - If both are misaligned → Fix both to match expected behavior

**Examples:**
- ✅ **Heading Hierarchy**: Expected = proper h1→h2→h3 structure. Production had h1→h3 (wrong). Tests checked hierarchy (correct). → Fix production code.
- ✅ **Navigation Links**: Expected = semantic links for accessibility. Production used buttons (wrong). Tests expected links (correct). → Fix production code.
- ❌ **Test Data Attributes**: Expected = semantic selectors when possible. Production had semantic elements (correct). Tests used overly specific test IDs (wrong). → Fix tests to use semantic selectors.

**Never blindly add test IDs or change production behavior just to make tests pass.**


- **E2E Testing with Playwright**: ALWAYS run npm tests in background using `controlBashProcess` and monitor periodically. Stuck tests won't finish and will block the agent. Never use `executeBash` for long-running test suites.