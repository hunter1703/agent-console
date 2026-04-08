# Animation Techniques for Agent Console V2

**Source**: https://www.svgator.com/blog/website-animation-examples-and-effects/  
**Date**: April 8, 2026  
**Purpose**: Learning document for modern web animation techniques applicable to Agent Console

---

## Applicable Techniques (High Priority)

### 1. ✅ Hover Effects (Already Implemented)
**Status**: Partially implemented  
**Current**: Button scale, card magnetic hover  
**Enhancement Opportunities**:
- Link hover with underline animation
- Icon hover with rotation/bounce
- Avatar hover with scale + glow
- Card hover with tilt effect

**Implementation**:
```tsx
// Link with animated underline
<motion.a
  whileHover={{ x: 4 }}
  className="relative group"
>
  <span>Link Text</span>
  <motion.span
    className="absolute bottom-0 left-0 h-0.5 bg-primary"
    initial={{ width: 0 }}
    whileHover={{ width: '100%' }}
    transition={{ duration: 0.3 }}
  />
</motion.a>
```

---

### 2. ✅ Loading Animations (Already Implemented)
**Status**: Basic spinner implemented  
**Enhancement Opportunities**:
- Skeleton screens for content loading
- Creative loaders (animated logo, morphing shapes)
- Progress indicators with smooth transitions
- Shimmer effects for loading states

**Use Cases**:
- Agent list loading
- Session list loading
- Message streaming (thinking indicator)
- File uploads

**Implementation**:
```tsx
// Skeleton screen
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-surface rounded w-3/4" />
  <div className="h-4 bg-surface rounded w-1/2" />
</div>

// Shimmer effect
<div className="relative overflow-hidden">
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
    animate={{ x: ['-100%', '100%'] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  />
</div>
```

---

### 3. 🎯 Page Transition Effects (High Priority)
**Status**: Not implemented  
**Applicability**: HIGH - Essential for smooth navigation

**Use Cases**:
- Switching between agent/session views
- Opening/closing sidebar
- Modal enter/exit
- Route transitions

**Implementation**:
```tsx
// Fade + slide transition
<AnimatePresence mode="wait">
  <motion.div
    key={currentView}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {content}
  </motion.div>
</AnimatePresence>
```

---

### 4. 🎯 Scroll-Triggered Animations (Medium Priority)
**Status**: Partially implemented (useInView hook exists)  
**Applicability**: MEDIUM - Good for long content

**Use Cases**:
- Message list (fade in as you scroll)
- Agent cards (stagger animation)
- Planning tasks (reveal on scroll)

**Implementation**:
```tsx
// Scroll-triggered fade in
const ref = useRef(null)
const isInView = useInView(ref, { once: true })

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 50 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.5 }}
>
  {content}
</motion.div>
```

---

### 5. ✅ Glassmorphism (Already Implemented)
**Status**: Implemented in Card component  
**Enhancement Opportunities**:
- Modal backgrounds
- Sidebar overlay on mobile
- Dropdown menus
- Tooltips

**Current Implementation**: Card variant="glass"

---

### 6. 🎯 Microinteractions (High Priority)
**Status**: Partially implemented  
**Applicability**: HIGH - Essential for UX feedback

**Examples**:
- Button press (squash & stretch) ✅
- Toggle switches with smooth slide
- Checkbox with checkmark animation
- Radio button with ripple
- Input focus with glow
- Success/error feedback animations

**Implementation**:
```tsx
// Toggle switch
<motion.div
  className="relative w-12 h-6 rounded-full bg-surface"
  animate={{ backgroundColor: isOn ? '#F59E0B' : '#27272A' }}
>
  <motion.div
    className="absolute w-5 h-5 rounded-full bg-white top-0.5"
    animate={{ x: isOn ? 24 : 2 }}
    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
  />
</motion.div>
```

---

### 7. 🎯 Stagger Animations (High Priority)
**Status**: Not implemented  
**Applicability**: HIGH - Great for lists

**Use Cases**:
- Agent list items appearing
- Session list items appearing
- Message bubbles appearing
- Planning tasks appearing

**Implementation**:
```tsx
// Stagger container
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

### 8. 🎯 Doodle Animations (Low Priority)
**Status**: Not implemented  
**Applicability**: LOW - Could be used for empty states

**Use Cases**:
- Empty agent list illustration
- Empty session list illustration
- Error state illustrations
- Onboarding illustrations

---

### 9. ❌ Stop-Motion Effects (Not Applicable)
**Applicability**: NONE - Too heavy for web app

---

### 10. ❌ Claymorphism (Not Applicable)
**Applicability**: NONE - Doesn't fit design aesthetic

---

### 11. ❌ Neumorphism (Not Applicable)
**Applicability**: NONE - Outdated trend, accessibility issues

---

## Recommended Implementation Priority

### Phase 3: Essential Animations (Week 1)
1. **Stagger Animations** - For lists (agents, sessions, messages)
2. **Page Transitions** - For view switching
3. **Microinteractions** - Toggle, checkbox, radio animations
4. **Skeleton Screens** - For loading states

### Phase 4: Enhanced Interactions (Week 2)
5. **Scroll-Triggered Animations** - For long content
6. **Link Hover Effects** - Animated underlines
7. **Icon Hover Effects** - Rotation, bounce
8. **Shimmer Effects** - For loading content

### Phase 5: Polish (Week 3)
9. **Doodle Animations** - For empty states
10. **Advanced Transitions** - Morphing, reveals
11. **Parallax Effects** - For hero sections (if applicable)

---

## Animation Performance Guidelines

### Best Practices
1. **Use GPU-accelerated properties**: transform, opacity
2. **Avoid animating**: width, height, top, left, margin, padding
3. **Use will-change sparingly**: Only for animations about to start
4. **Respect reduced motion**: Always check prefers-reduced-motion
5. **Keep animations under 300ms**: For UI feedback
6. **Use spring physics**: For natural, organic feel
7. **Limit simultaneous animations**: Max 3-5 at once

### Performance Checklist
- [ ] All animations use transform/opacity
- [ ] will-change is removed after animation
- [ ] Reduced motion is respected
- [ ] Animations are under 300ms (or intentionally longer)
- [ ] No layout thrashing (read then write)
- [ ] No forced synchronous layouts
- [ ] Animations run at 60fps

---

## Code Examples Library

### Skeleton Screen Component
```tsx
export function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-4 bg-surface rounded w-3/4" />
      <div className="h-4 bg-surface rounded w-1/2" />
      <div className="h-4 bg-surface rounded w-5/6" />
    </div>
  )
}
```

### Shimmer Effect Component
```tsx
export function ShimmerEffect({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
```

### Stagger List Component
```tsx
export function StaggerList({ items }: { items: any[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.1 }
        }
      }}
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

### Toggle Switch Component
```tsx
export function Toggle({ isOn, onToggle }: ToggleProps) {
  return (
    <motion.button
      className="relative w-12 h-6 rounded-full"
      animate={{ backgroundColor: isOn ? '#F59E0B' : '#27272A' }}
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute w-5 h-5 rounded-full bg-white top-0.5"
        animate={{ x: isOn ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )
}
```

### Page Transition Wrapper
```tsx
export function PageTransition({ children, pageKey }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

---

## Resources for Reference

### Inspiration Sites
- **Awwwards**: https://www.awwwards.com/websites/animation/
- **Dribbble**: https://dribbble.com/tags/web-animation
- **Framer Gallery**: https://www.framer.com/gallery/styles/animations

### Tools
- **SVGator**: For SVG animations (if needed)
- **Framer Motion**: Already using (React animation library)
- **Lottie**: For complex animations (if needed)

### Learning
- **Framer Motion Docs**: https://www.framer.com/motion/
- **Animation Principles**: Disney's 12 principles
- **Performance**: Web.dev animation guide

---

**Last Updated**: April 8, 2026  
**Status**: Learning document - reference for implementation
