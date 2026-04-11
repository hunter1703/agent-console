# Liquid Glass Migration Plan

## Overview

This document outlines the migration of the Agent Console webapp from the current design system to a **liquid glass / glassmorphic visual language**. This is a visual design change only - all functional requirements remain unchanged.

## What Changes

### Visual Design System
- **From**: Warm light/cool dark themes with solid surfaces
- **To**: Liquid glass material system with layered depth, ambient motion, and tactile interactions

### Design Tokens
- **Colors**: HSL-based palette with opacity variants for glass surfaces
- **Surfaces**: All cards, panels, modals use `backdrop-filter: blur()` + semi-transparent fills
- **Borders**: Directional highlights (white top-left, accent bottom-right)
- **Depth**: Stacking, offset, and 3D perspective for spatial hierarchy
- **Motion**: Organic blob animations, liquid morphing, spring physics

### Component Architecture
- Every glass element must have 6 layers:
  1. **Background**: Vibrant gradient, animated blob, or pattern
  2. **Glass surface**: `backdrop-filter` + semi-transparent fill
  3. **Border**: Directional highlight
  4. **Content**: Typography, inputs, data
  5. **Depth**: Stacking or 3D relative to adjacent elements
  6. **Motion**: Hover response, transition, or ambient animation

## What Stays the Same

### Functional Requirements
- All 30 requirements in requirements.md remain unchanged
- Chat interface behavior
- Agent management functionality
- Session hierarchy
- Message streaming
- Planning cards
- Keyboard shortcuts
- Accessibility features

### Component Structure
- React component hierarchy
- State management (Zustand stores)
- API integration
- Routing and navigation
- Form validation
- Error handling

## Migration Strategy

### Phase 1: Design System Foundation
1. Update design tokens with HSL color system
2. Add glass-specific CSS variables (blur, opacity, borders)
3. Create vibrant background patterns (animated blobs)
4. Set up `@supports` fallbacks for non-supporting browsers

### Phase 2: Core Components
1. Convert Button → Liquid Button with blob morphing
2. Convert Card → Glass Card with magnetic hover
3. Convert Modal → Liquid Modal with morph entrance
4. Convert Input → Glass Input with animated underlines
5. Convert Navigation → Glass Nav with scroll effects

### Phase 3: Layout & Surfaces
1. Sidebar → Dark glass panel with backdrop blur
2. Chat column → Glass message bubbles with 3D tilt
3. Planning cards → Glass document with blob background
4. Forms → Glass surfaces with transparent inputs

### Phase 4: Motion & Interaction
1. Add custom cursor with smooth follow
2. Implement magnetic hover on cards
3. Add parallax tilt on messages
4. Implement liquid toggle switches
5. Add blob background animations

### Phase 5: Polish & Optimization
1. Reduce blur on mobile (performance)
2. Test contrast ratios (WCAG AA)
3. Implement `prefers-reduced-motion` support
4. Optimize `backdrop-filter` performance
5. Add `will-change` for animations

## Key Technical Requirements

### Browser Support
```css
/* Always include both prefixes */
.glass {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari */
}
```

### Progressive Enhancement
```css
/* Solid fallback */
.glass-card {
  background: rgba(255, 255, 255, 0.9);
}

/* Glass enhancement */
@supports (backdrop-filter: blur(10px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
```

### Accessibility
```css
/* Respect user preferences */
@media (prefers-reduced-transparency: reduce) {
  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass-card {
    transition: none;
  }
}
```

### Performance
```css
/* Limit blur area */
.glass-header {
  width: min(1200px, 90%);
  backdrop-filter: blur(10px);
}

/* Mobile optimization */
@media (max-width: 768px) {
  .glass-card {
    backdrop-filter: blur(8px); /* Reduced from 12px */
  }
}

/* Hardware acceleration */
.glass-card {
  transform: translateZ(0);
  will-change: transform, backdrop-filter;
}
```

## Quality Checklist

Before marking any component complete, verify:

- [ ] Has `backdrop-filter` AND `-webkit-backdrop-filter`
- [ ] Has `@supports` fallback with solid background
- [ ] Has vibrant background behind glass (gradient/blob)
- [ ] Has directional border highlights
- [ ] Has hover/focus state with motion
- [ ] Respects `prefers-reduced-motion`
- [ ] Respects `prefers-reduced-transparency`
- [ ] Text contrast passes WCAG AA (4.5:1)
- [ ] Blur reduced on mobile (≤12px)
- [ ] No `overflow: hidden` on parent (breaks backdrop-filter)
- [ ] Uses spring physics for animations
- [ ] Maintains 60fps during interactions

## Reference Documents

Primary reference: `/agent-console/liquid-glass/README.md`

Build order:
1. `04-css-techniques.md` - CSS architecture and tokens
2. `02-color-palette.md` - HSL color system
3. `06-components.md` - Component patterns
4. `05-animations.md` - Motion and interaction
5. `03-visual-effects.md` - Visual polish
6. `07-accessibility.md` - Accessibility audit
7. `08-performance.md` - Performance optimization

## Success Criteria

The migration is complete when:

1. **Every surface feels like living glass**
   - Layered depth with backdrop blur
   - Ambient motion (blobs, gradients)
   - Responsive borders and highlights

2. **Interactions are delightful**
   - Magnetic hover on cards
   - 3D tilt on messages
   - Liquid morphing on modals
   - Spring physics on all animations

3. **Performance is excellent**
   - 60fps on all interactions
   - Smooth on mobile devices
   - No jank or stutter

4. **Accessibility is maintained**
   - WCAG AA contrast ratios
   - Reduced motion support
   - Reduced transparency support
   - Keyboard navigation works

5. **All functional requirements still met**
   - Chat works
   - Agents work
   - Sessions work
   - Planning cards work
   - Everything from requirements.md works

## Timeline Estimate

- **Phase 1**: 1 week (design tokens, backgrounds)
- **Phase 2**: 2 weeks (core components)
- **Phase 3**: 2 weeks (layout surfaces)
- **Phase 4**: 1 week (motion & interaction)
- **Phase 5**: 1 week (polish & optimization)

**Total**: 7 weeks

## Next Steps

1. Read `liquid-glass/README.md` in full
2. Update `design.md` with liquid glass specifications
3. Update `tasks.md` with new implementation tasks
4. Begin Phase 1: Design System Foundation
