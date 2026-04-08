# Configuration Guide

This document describes all configurable values in the Agent Console V2 application.

## Environment Variables

Environment variables are defined in `.env.local` (create from `.env.local.example`).

### API Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8080` | No |
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | `30000` | No |
| `NEXT_PUBLIC_DEBUG` | Enable debug logging | `false` | No |

### Example `.env.local`

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_DEBUG=false
```

## Design System Configuration

All design values are centralized in configuration files - **no hardcoded values in components**.

### Spacing & Layout

**File**: `lib/constants/spacing.ts`

- Tailwind spacing scale (0-96)
- Semantic spacing constants (container, card, list, etc.)
- Layout constants (sidebar width, header height, etc.)

```typescript
import { SPACING, LAYOUT } from '@/lib/constants/spacing'

// Use semantic constants
<div className={SPACING.container.padding}>

// Use layout constants
const sidebarWidth = LAYOUT.sidebar.width // 280
```

### Colors & Theme

**File**: `app/globals.css` (CSS variables in `@theme` block)

All colors are defined as CSS variables:
- `--color-background`
- `--color-surface`
- `--color-text-primary`
- `--color-primary`
- etc.

Use Tailwind classes:
```tsx
<div className="bg-surface text-text-primary border-border-subtle">
```

### Typography

**File**: `app/globals.css`

Font sizes, weights, and families are defined as CSS variables:
- `--font-size-xs` through `--font-size-4xl`
- `--font-sans`, `--font-mono`, `--font-serif`

Use Tailwind classes:
```tsx
<p className="text-base font-medium">
```

### Animations

**File**: `lib/constants/animations.ts`

All animation values are centralized:

```typescript
import { springPresets, durations, sidebarSlideIn } from '@/lib/constants/animations'

// Use spring presets
<motion.div transition={springPresets.default}>

// Use duration constants
transition={{ duration: durations.normal }}

// Use motion variants
<motion.div variants={sidebarSlideIn} initial="initial" animate="animate">
```

Available presets:
- `springPresets`: instant, snappy, default, gentle, bouncy, heavy
- `durations`: instant, fast, normal, slow, slower
- `easings`: easeOut, easeIn, easeInOut, emphasized, bounce
- Motion variants: fadeIn, slideUp, slideDown, slideLeft, slideRight, scaleIn, etc.

### Breakpoints

**File**: `lib/constants/breakpoints.ts` (if created) or use Tailwind defaults

```tsx
// Responsive classes
<div className="p-4 md:p-6 lg:p-8">

// Media query hooks
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
const isMobile = useMediaQuery('(max-width: 767px)')
```

## API Client Configuration

**File**: `lib/api/client.ts`

The API client can be configured at instantiation:

```typescript
import { APIClient } from '@/lib/api/client'

const client = new APIClient({
  baseURL: 'https://api.example.com',
  timeout: 60000,
  headers: {
    'Authorization': 'Bearer token',
  },
})
```

Or use the singleton with environment variables:

```typescript
import { apiClient } from '@/lib/api/client'

// Uses NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_API_TIMEOUT
const agents = await apiClient.listAgents()
```

## Component Configuration

### Sidebar

```typescript
<Sidebar
  isOpen={true}
  isCollapsed={false}
  onClose={() => {}}
  onToggleCollapse={() => {}}
>
  {/* content */}
</Sidebar>
```

Width is configured in `LAYOUT.sidebar.width` (280px).

### Button

```typescript
<Button
  variant="primary" // primary | secondary | ghost | danger
  size="md"         // sm | md | lg
  loading={false}
  icon={<Plus />}
  iconPosition="left" // left | right
  magnetic={false}
  liquidBorder={false}
>
  Click me
</Button>
```

### Modal

```typescript
<Modal
  isOpen={true}
  onClose={() => {}}
  size="md" // sm | md | lg
>
  {/* content */}
</Modal>
```

## Best Practices

### ✅ DO

- Use Tailwind classes for spacing, colors, typography
- Use semantic constants from `lib/constants/`
- Use environment variables for API configuration
- Use motion variants for animations
- Document any new configuration values

### ❌ DON'T

- Hardcode pixel values (`16px`, `280px`)
- Hardcode colors (`#F59E0B`, `rgb(245, 158, 11)`)
- Hardcode animation values (`duration: 300`, `stiffness: 400`)
- Hardcode API URLs or timeouts
- Use magic numbers without constants

## Adding New Configuration

1. **Spacing/Layout**: Add to `lib/constants/spacing.ts`
2. **Colors**: Add to `app/globals.css` `@theme` block
3. **Animations**: Add to `lib/constants/animations.ts`
4. **Environment**: Add to `lib/config/env.ts` and `.env.local.example`
5. **Component Props**: Use TypeScript interfaces with defaults

## Deployment

### Development

```bash
npm run dev
```

Uses `.env.local` for configuration.

### Production

Set environment variables in your deployment platform:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.production.com
NEXT_PUBLIC_API_TIMEOUT=30000
```

Then build and start:

```bash
npm run build
npm start
```

## Troubleshooting

### API requests failing

1. Check `NEXT_PUBLIC_API_BASE_URL` is correct
2. Verify backend CORS is configured
3. Check network tab in browser DevTools
4. Enable debug mode: `NEXT_PUBLIC_DEBUG=true`

### Animations not working

1. Check `prefers-reduced-motion` setting
2. Verify Framer Motion is installed
3. Check browser console for errors

### Styling issues

1. Verify Tailwind CSS is configured correctly
2. Check `app/globals.css` for CSS variable definitions
3. Ensure no hardcoded values override Tailwind classes
