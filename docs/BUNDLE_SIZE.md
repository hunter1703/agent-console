# Bundle Size Analysis

This document tracks bundle size metrics and provides guidelines for keeping the application lean.

## Current Bundle Size

> **Note:** Run `npm run build` and `npm run analyze` to generate current metrics.

### Target Sizes

| Bundle | Target | Current | Status |
|--------|--------|---------|--------|
| **Initial JS** | < 200 KB | TBD | 🟡 |
| **Total JS** | < 500 KB | TBD | 🟡 |
| **CSS** | < 50 KB | TBD | 🟡 |
| **Images** | < 100 KB | TBD | 🟡 |
| **Fonts** | < 50 KB | TBD | 🟡 |

### Performance Budget

- Initial load: < 300 KB (gzipped)
- Route chunks: < 100 KB each
- Shared chunks: < 150 KB
- Vendor chunks: < 200 KB

## Bundle Analysis Setup

### Install Bundle Analyzer

```bash
npm install --save-dev @next/bundle-analyzer
```

### Configure Next.js

```javascript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // Your Next.js config
})
```

### Add Scripts

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "build:analyze": "npm run build && npm run analyze"
  }
}
```

### Run Analysis

```bash
npm run analyze
```

This will:
1. Build the production bundle
2. Generate interactive visualizations
3. Open reports in your browser

## Optimization Strategies

### 1. Code Splitting

Split large components into separate chunks:

```typescript
// ✅ Good: Lazy load heavy components
const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'))
const CodeBlock = lazy(() => import('./CodeBlock'))
const MermaidDiagram = lazy(() => import('./MermaidDiagram'))

// ❌ Bad: Import everything upfront
import MarkdownRenderer from './MarkdownRenderer'
import CodeBlock from './CodeBlock'
import MermaidDiagram from './MermaidDiagram'
```

**Impact:** Reduces initial bundle by 30-40%

### 2. Tree Shaking

Ensure imports are tree-shakeable:

```typescript
// ✅ Good: Named imports
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

// ❌ Bad: Default imports
import * as FramerMotion from 'framer-motion'
import * as Icons from 'lucide-react'
```

**Impact:** Reduces bundle by 10-20%

### 3. Dynamic Imports

Use dynamic imports for route-specific code:

```typescript
// ✅ Good: Dynamic import
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <Skeleton />,
})

// ❌ Bad: Static import
import AdminPanel from './AdminPanel'
```

**Impact:** Reduces initial bundle by 20-30%

### 4. Optimize Dependencies

Replace heavy dependencies with lighter alternatives:

| Heavy | Light | Savings |
|-------|-------|---------|
| `moment` | `date-fns` | ~70 KB |
| `lodash` | Native JS | ~50 KB |
| `axios` | `fetch` | ~15 KB |
| `react-icons` | `lucide-react` | ~100 KB |

### 5. Remove Unused Code

Regularly audit and remove unused code:

```bash
# Find unused exports
npx ts-prune

# Find unused dependencies
npx depcheck
```

### 6. Optimize Images

Use Next.js Image optimization:

```typescript
// ✅ Good: Optimized images
<Image
  src="/avatar.jpg"
  width={40}
  height={40}
  quality={85}
  loading="lazy"
/>

// ❌ Bad: Unoptimized images
<img src="/avatar.jpg" />
```

**Impact:** Reduces image size by 50-70%

### 7. Minimize CSS

Use Tailwind's purge feature:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // This removes unused CSS
}
```

**Impact:** Reduces CSS by 80-90%

## Large Dependencies

### Current Large Dependencies

> Run `npm run analyze` to see actual sizes

**Expected Large Dependencies:**
- `react` + `react-dom`: ~130 KB
- `framer-motion`: ~80 KB
- `next`: ~200 KB (framework)
- `shiki`: ~50 KB (syntax highlighting)
- `mermaid`: ~100 KB (diagrams)

### Optimization Opportunities

#### 1. Framer Motion

Only import what you need:

```typescript
// ✅ Good: Import specific functions
import { motion, AnimatePresence } from 'framer-motion'

// ❌ Bad: Import everything
import * as Motion from 'framer-motion'
```

Consider alternatives for simple animations:
- CSS transitions for basic animations
- `react-spring` for physics-based animations (smaller)

#### 2. Shiki (Syntax Highlighting)

Lazy load and use only needed languages:

```typescript
// ✅ Good: Lazy load with specific languages
const CodeBlock = lazy(() => import('./CodeBlock'))

// In CodeBlock.tsx
import { codeToHtml } from 'shiki'
// Only load languages as needed
```

#### 3. Mermaid (Diagrams)

Lazy load and only render when needed:

```typescript
// ✅ Good: Lazy load
const MermaidDiagram = lazy(() => import('./MermaidDiagram'))

// Only render if diagram syntax detected
{hasMermaid && <MermaidDiagram code={code} />}
```

#### 4. DOMPurify

Consider alternatives for simple sanitization:

```typescript
// For simple cases, use native browser APIs
const sanitize = (html: string) => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

// Only use DOMPurify for complex HTML
```

## Monitoring Bundle Size

### CI/CD Integration

Add bundle size checks to CI:

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Size Limit Configuration

```json
// package.json
{
  "size-limit": [
    {
      "path": ".next/static/chunks/pages/_app.js",
      "limit": "200 KB"
    },
    {
      "path": ".next/static/chunks/pages/index.js",
      "limit": "100 KB"
    }
  ]
}
```

### Automated Alerts

Set up alerts for bundle size increases:

```javascript
// scripts/check-bundle-size.js
const fs = require('fs')
const path = require('path')

const THRESHOLD = 0.1 // 10% increase

const previousSize = JSON.parse(
  fs.readFileSync('bundle-size.json', 'utf8')
)

const currentSize = getCurrentBundleSize()

const increase = (currentSize - previousSize) / previousSize

if (increase > THRESHOLD) {
  console.error(`Bundle size increased by ${(increase * 100).toFixed(2)}%`)
  process.exit(1)
}
```

## Best Practices

### 1. Lazy Load Heavy Components

```typescript
// ✅ Good
const HeavyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### 2. Use Dynamic Imports

```typescript
// ✅ Good
const loadFeature = async () => {
  const module = await import('./feature')
  return module.default
}
```

### 3. Optimize Images

```typescript
// ✅ Good
<Image
  src="/image.jpg"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
  placeholder="blur"
/>
```

### 4. Tree Shake Dependencies

```typescript
// ✅ Good: Named imports
import { debounce } from 'lodash-es'

// ❌ Bad: Default import
import _ from 'lodash'
```

### 5. Use Modern JavaScript

```typescript
// ✅ Good: Native methods
const unique = [...new Set(array)]

// ❌ Bad: External library
import { uniq } from 'lodash'
const unique = uniq(array)
```

### 6. Minimize Polyfills

Target modern browsers to reduce polyfills:

```javascript
// next.config.js
module.exports = {
  experimental: {
    browsersListForSwc: true,
  },
  // Target modern browsers
  target: 'es2020',
}
```

### 7. Analyze Regularly

```bash
# Weekly bundle analysis
npm run analyze

# Check for unused dependencies
npx depcheck

# Find unused exports
npx ts-prune
```

## Checklist

### Before Merging PR

- [ ] Run bundle analyzer
- [ ] Check bundle size increase (< 10%)
- [ ] Verify code splitting works
- [ ] Check for duplicate dependencies
- [ ] Ensure tree shaking is effective
- [ ] Test lazy loading
- [ ] Verify images are optimized

### Monthly Audit

- [ ] Run full bundle analysis
- [ ] Review large dependencies
- [ ] Check for unused code
- [ ] Update dependencies
- [ ] Optimize images
- [ ] Review code splitting strategy
- [ ] Check for duplicate code

## Resources

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Size Limit](https://github.com/ai/size-limit)
- [Bundle Phobia](https://bundlephobia.com/)
- [Import Cost](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost)

## Conclusion

Keeping bundle size small is crucial for performance. Regular monitoring and optimization ensure fast load times and better user experience.

**Key Takeaways:**
1. Lazy load heavy components
2. Use code splitting effectively
3. Optimize dependencies
4. Monitor bundle size regularly
5. Set up automated checks
6. Review and optimize monthly
