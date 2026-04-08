# Coding Standards: Agent Console V2

**Last Updated**: April 8, 2026  
**Status**: Living Document

---

## Core Principle: No Hardcoded Values

**Rule**: Never use hardcoded pixel values, colors, or magic numbers. Always use declarative configuration.

### ❌ Bad (Hardcoded)
```tsx
<div style={{ padding: '16px', width: '280px' }}>
<div className="mt-[24px]">
```

### ✅ Good (Declarative)
```tsx
import { SPACING } from '@/lib/constants/spacing'

<div className={SPACING.container.padding}>
<div className="mt-6">
```

---

## 1. Spacing & Layout

### Use Tailwind Classes (Preferred)

```tsx
// Padding
<div className="p-4">        // 16px all sides
<div className="px-6 py-4">  // 24px horizontal, 16px vertical

// Margin
<div className="mt-6">       // 24px top margin
<div className="mb-4">       // 16px bottom margin

// Gap
<div className="gap-4">      // 16px gap
<div className="space-y-3">  // 12px vertical spacing

// Width/Height
<div className="w-16">       // 64px width
<div className="h-12">       // 48px height
```

### Use Semantic Spacing Constants

```tsx
import { SPACING } from '@/lib/constants/spacing'

// Container padding
<div className={SPACING.container.padding}>        // p-4 (16px)
<div className={SPACING.container.paddingLg}>     // p-6 (24px)

// Component gaps
<div className={SPACING.component.gap}>           // gap-4 (16px)
<div className={SPACING.list.spacing}>            // space-y-3 (12px)

// Sidebar
<div className={SPACING.sidebar.width}>           // w-[280px]
<div className={SPACING.sidebar.padding}>         // p-4
```

### When You Need Pixel Values (Rare)

```tsx
import { LAYOUT, getSpacingValue } from '@/lib/constants/spacing'

// For calculations or JavaScript logic
const sidebarWidth = LAYOUT.sidebar.width  // 280
const padding = getSpacingValue(4)         // 16

// For inline styles (only when Tailwind can't be used)
style={{ width: LAYOUT.sidebar.width }}
```

---

## 2. Colors

### Use Tailwind Color Classes (Preferred)

```tsx
// Background
<div className="bg-surface">
<div className="bg-primary">

// Text
<span className="text-text-primary">
<span className="text-text-secondary">

// Border
<div className="border-border-subtle">
<div className="border-primary">
```

### Use CSS Variables (When Needed)

```tsx
// For dynamic colors or gradients
style={{ 
  background: 'var(--color-surface)',
  borderColor: 'var(--color-primary)'
}}
```

### Never Hardcode Hex Colors

```tsx
// ❌ Bad
<div style={{ color: '#F59E0B' }}>

// ✅ Good
<div className="text-primary">
```

---

## 3. Typography

### Use Tailwind Typography Classes

```tsx
// Font size
<h1 className="text-4xl">      // 40px
<p className="text-base">       // 15px
<span className="text-sm">      // 13px

// Font weight
<span className="font-semibold"> // 600
<span className="font-medium">   // 500

// Line height
<p className="leading-relaxed">  // 1.6
<p className="leading-normal">   // 1.4
```

### Never Hardcode Font Sizes

```tsx
// ❌ Bad
<div style={{ fontSize: '16px', fontWeight: 600 }}>

// ✅ Good
<div className="text-base font-semibold">
```

---

## 4. Border Radius

### Use Tailwind Border Radius Classes

```tsx
<div className="rounded-sm">    // 8px
<div className="rounded-md">    // 12px
<div className="rounded-lg">    // 16px
<div className="rounded-xl">    // 20px
<div className="rounded-full">  // 9999px (circle)
```

---

## 5. Shadows

### Use Tailwind Shadow Classes

```tsx
<div className="shadow-sm">     // Subtle shadow
<div className="shadow-md">     // Medium shadow
<div className="shadow-lg">     // Large shadow
<div className="shadow-xl">     // Extra large shadow
```

---

## 6. Animations

### Use Animation Constants

```tsx
import { springPresets, durations } from '@/lib/constants/animations'

// Framer Motion
<motion.div
  transition={springPresets.default}
  animate={{ opacity: 1 }}
/>

// CSS transitions
<div className="transition-all duration-200">
```

### Never Hardcode Animation Values

```tsx
// ❌ Bad
<motion.div transition={{ type: 'spring', stiffness: 300, damping: 30 }}>

// ✅ Good
<motion.div transition={springPresets.default}>
```

---

## 7. Breakpoints

### Use Tailwind Responsive Classes

```tsx
<div className="p-4 md:p-6 lg:p-8">
<div className="hidden md:block">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Use Media Query Hooks

```tsx
import { useIsMobile, useIsTablet } from '@/lib/hooks/useMediaQuery'

const isMobile = useIsMobile()
const isTablet = useIsTablet()
```

---

## 8. Component Sizing

### Use Semantic Size Props

```tsx
// Button sizes
<Button size="sm">   // 36px height
<Button size="md">   // 44px height
<Button size="lg">   // 52px height

// Avatar sizes
<Avatar size="sm">   // 32px
<Avatar size="md">   // 40px
<Avatar size="lg">   // 48px

// Icon sizes
<Icon size="sm">     // 16px
<Icon size="md">     // 20px
<Icon size="lg">     // 24px
```

### Never Hardcode Component Sizes

```tsx
// ❌ Bad
<button style={{ height: '44px', padding: '0 16px' }}>

// ✅ Good
<Button size="md">
```

---

## 9. Z-Index

### Use Tailwind Z-Index Classes

```tsx
<div className="z-10">      // z-index: 10
<div className="z-20">      // z-index: 20
<div className="z-30">      // z-index: 30
<div className="z-40">      // z-index: 40 (modals)
<div className="z-50">      // z-index: 50 (tooltips, dropdowns)
```

### Z-Index Hierarchy

```
1-9:   Base content
10-19: Sticky elements
20-29: Fixed elements
30-39: Overlays
40-49: Modals
50+:   Tooltips, dropdowns, toasts
```

---

## 10. Inline Styles

### When to Use Inline Styles

Inline styles should ONLY be used when:
1. The value is truly dynamic (from props, state, or calculations)
2. Tailwind doesn't support the property
3. You need to use CSS variables

### ❌ Bad (Static Inline Styles)

```tsx
<div style={{ padding: '16px', backgroundColor: '#FEFCE8' }}>
```

### ✅ Good (Tailwind Classes)

```tsx
<div className="p-4 bg-surface">
```

### ✅ Good (Dynamic Inline Styles)

```tsx
// Dynamic value from props
<div style={{ width: `${progress}%` }}>

// CSS variable
<div style={{ background: 'var(--color-surface)' }}>

// Calculation
<div style={{ height: `calc(100vh - ${headerHeight}px)` }}>
```

---

## 11. Magic Numbers

### Never Use Magic Numbers

```tsx
// ❌ Bad
if (scrollPosition > 100) {
  setShowButton(true)
}

// ✅ Good
const SCROLL_THRESHOLD = 100 // px - show button after scrolling this far

if (scrollPosition > SCROLL_THRESHOLD) {
  setShowButton(true)
}
```

### Define Constants at Module Level

```tsx
// At top of file
const DEBOUNCE_DELAY = 300 // ms
const MAX_RETRIES = 3
const ANIMATION_DURATION = 200 // ms
const SCROLL_THRESHOLD = 100 // px

// Use in code
const debouncedSearch = useDebounce(searchTerm, DEBOUNCE_DELAY)
```

---

## 12. Configuration Over Code

### Use Configuration Files

```tsx
// ❌ Bad - Hardcoded in component
const SIDEBAR_WIDTH = 280
const SIDEBAR_COLLAPSED_WIDTH = 64

// ✅ Good - Centralized configuration
import { LAYOUT } from '@/lib/constants/spacing'

const sidebarWidth = LAYOUT.sidebar.width
const collapsedWidth = LAYOUT.sidebar.widthCollapsed
```

---

## 13. Type Safety

### Always Export Types

```tsx
// spacing.ts
export type SpacingScale = keyof typeof SPACING_SCALE
export type SpacingClass = typeof SPACING[keyof typeof SPACING][keyof typeof SPACING[keyof typeof SPACING]]

// Usage
import type { SpacingScale } from '@/lib/constants/spacing'

function getSpacing(scale: SpacingScale) {
  return SPACING_SCALE[scale]
}
```

---

## 14. Documentation

### Document All Constants

```tsx
/**
 * Sidebar width in pixels
 * Used for: Sidebar component, layout calculations
 * @constant {number}
 */
export const SIDEBAR_WIDTH = 280

/**
 * Debounce delay for search input
 * Prevents excessive API calls while user is typing
 * @constant {number} milliseconds
 */
export const SEARCH_DEBOUNCE_DELAY = 300
```

---

## 15. Deprecation Strategy

### Mark Old Constants as Deprecated

```tsx
/**
 * @deprecated Use SPACING from '@/lib/constants/spacing' instead
 * This is kept for backward compatibility only
 */
export const spacing = {
  // ... old values
} as const
```

---

## Quick Reference

### Import Paths

```tsx
// Spacing & Layout
import { SPACING, LAYOUT, getSpacingValue } from '@/lib/constants/spacing'

// Colors & Theme
import { lightTheme, darkTheme } from '@/lib/constants/theme'

// Animations
import { springPresets, durations, easings } from '@/lib/constants/animations'

// Breakpoints
import { breakpoints, mediaQueries } from '@/lib/constants/breakpoints'

// Hooks
import { useIsMobile, useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { useTheme } from '@/lib/hooks/useTheme'
```

### Common Patterns

```tsx
// Container with standard padding
<div className={SPACING.container.padding}>

// List with standard spacing
<div className={SPACING.list.spacing}>

// Card with standard padding
<div className={SPACING.card.padding}>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">

// Dynamic width
<div style={{ width: LAYOUT.sidebar.width }}>
```

---

## Enforcement

### Code Review Checklist

- [ ] No hardcoded pixel values
- [ ] No hardcoded hex colors
- [ ] No magic numbers
- [ ] No inline styles for static values
- [ ] Uses Tailwind classes where possible
- [ ] Uses semantic spacing constants
- [ ] All constants are documented
- [ ] Types are exported
- [ ] Configuration is centralized

### Automated Checks

```bash
# Search for hardcoded values (should return minimal results)
grep -r "style={{.*px" components/
grep -r "#[0-9A-Fa-f]{6}" components/
grep -r "width: [0-9]" components/
```

---

## Migration Guide

### Migrating Existing Code

1. **Identify hardcoded values**
   ```bash
   grep -r "style={{" components/
   ```

2. **Replace with Tailwind classes**
   ```tsx
   // Before
   <div style={{ padding: '16px' }}>
   
   // After
   <div className="p-4">
   ```

3. **Use semantic constants for complex cases**
   ```tsx
   // Before
   <div style={{ width: '280px' }}>
   
   // After
   import { SPACING } from '@/lib/constants/spacing'
   <div className={SPACING.sidebar.width}>
   ```

4. **Extract magic numbers**
   ```tsx
   // Before
   if (scrollY > 100) { ... }
   
   // After
   const SCROLL_THRESHOLD = 100
   if (scrollY > SCROLL_THRESHOLD) { ... }
   ```

---

## Benefits

### Why Follow These Standards?

1. **Consistency**: All spacing/colors/sizes are consistent across the app
2. **Maintainability**: Change once, update everywhere
3. **Type Safety**: TypeScript catches errors at compile time
4. **Performance**: Tailwind classes are optimized and cached
5. **Readability**: Semantic names are self-documenting
6. **Scalability**: Easy to add new values or update existing ones
7. **Theming**: Easy to switch between light/dark themes
8. **Responsive**: Tailwind responsive classes work seamlessly

---

## Conclusion

By following these standards, we ensure:
- ✅ No hardcoded values anywhere in the codebase
- ✅ Consistent spacing, colors, and typography
- ✅ Easy maintenance and updates
- ✅ Type-safe configuration
- ✅ Self-documenting code
- ✅ Scalable architecture

**Remember**: If you find yourself typing a pixel value or hex color, stop and use a constant or Tailwind class instead!
