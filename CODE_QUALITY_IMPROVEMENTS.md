# Code Quality - Next Steps

**Date**: April 12, 2026  
**Status**: Critical improvements completed, remaining tasks documented below

---

## ✅ Completed

- Security: CSP headers, input sanitization (DOMPurify), rate limiting
- Error Handling: Typed errors, retry logic, API client
- Code Quality: Shared variants, UI constants, environment config
- State Management: API integration in all stores
- Testing: 85+ unit tests for utilities

---

## 🔄 Remaining High Priority Tasks

### 1. Error Monitoring Integration
**Estimated**: 1-2 days

Install and configure error tracking:
```bash
npm install @sentry/nextjs
```

Update `lib/utils/apiErrors.ts`:
```typescript
import * as Sentry from '@sentry/nextjs'

export function logError(error: ApiError, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context })
  }
}
```

Add `sentry.client.config.ts` and `sentry.server.config.ts`

---

### 2. Increase Test Coverage
**Estimated**: 2-3 weeks  
**Current**: ~20% | **Target**: 80%+

Priority areas:
- API services tests (`lib/api/services.ts`)
- Store tests (agent, session, chat stores)
- Component integration tests
- E2E tests with Playwright

---

### 3. Performance Optimization
**Estimated**: 1-2 weeks

**Code Splitting**:
```typescript
// Lazy load heavy components
const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
  loading: () => <Skeleton />,
  ssr: false,
})
```

**Bundle Analysis**:
```bash
npm install @next/bundle-analyzer
# Add to next.config.ts
```

**Image Optimization**:
- Use Next.js Image component
- Implement lazy loading
- Add blur placeholders

---

### 4. Backend API Integration
**Estimated**: 2-3 weeks

- Implement real API endpoints in backend
- Connect frontend components to stores
- Test end-to-end flows
- Handle authentication/authorization
- Implement WebSocket for streaming

---

## 📋 Medium Priority Tasks

### 5. CI/CD Pipeline
**Estimated**: 1 week

Set up GitHub Actions:
- Run tests on PR
- Type checking
- Linting
- Build verification
- Deploy to staging/production

---

### 6. Documentation
**Estimated**: 1 week

- Add JSDoc comments to all utilities
- Create component usage examples
- Document API endpoints
- Add architecture decision records

---

### 7. Analytics Integration
**Estimated**: 3-5 days

Choose and integrate analytics:
- PostHog / Google Analytics / Mixpanel
- Track user interactions
- Monitor performance metrics
- Set up dashboards

---

## 📚 Resources

### New Utilities Created
- `lib/api/services.ts` - API service functions
- `lib/api/client.ts` - Centralized HTTP client
- `lib/utils/sanitize.ts` - Input sanitization (DOMPurify)
- `lib/utils/rateLimit.ts` - Rate limiting
- `lib/utils/apiErrors.ts` - Error handling
- `lib/config/env.ts` - Environment configuration
- `lib/constants/motionVariants.ts` - Animation variants
- `lib/constants/uiConstants.ts` - UI constants

### Documentation
- `.env.example` - Environment variables template
- `TASKS_COMPLETED_SUMMARY.md` - Recent work summary

---

**Last Updated**: April 12, 2026
