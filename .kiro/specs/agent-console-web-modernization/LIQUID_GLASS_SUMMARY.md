# Liquid Glass Visual Language - Quick Reference

## Core Principles

Every glass element must have **6 layers**:

1. **Background** - Vibrant gradient, animated blob, or pattern behind the glass
2. **Glass surface** - `backdrop-filter: blur()` + semi-transparent fill
3. **Border** - Directional highlight (white top-left, accent bottom-right)
4. **Content** - Typography, inputs, or data
5. **Depth** - Stacking, offset, or 3D relative to adjacent elements
6. **Motion** - Hover response, transition, or ambient animation

## Essential CSS Pattern

```css
.glass-element {
  /* 1. Background (handled by parent or body) */
  
  /* 2. Glass surface */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* REQUIRED for Safari */
  
  /* 3. Border */
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  
  /* 4. Content (handled by children) */
  
  /* 5. Depth */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  /* 6. Motion */
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.glass-element:hover {
  transform: translateY(-2px);
}
```

## Critical Rules

### Always Include Both Prefixes
```css
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px); /* Safari */
```

### Always Add @supports Fallback
```css
.glass {
  background: rgba(255, 255, 255, 0.9); /* Solid fallback */
}

@supports (backdrop-filter: blur(10px)) {
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
```

### Always Respect User Preferences
```css
@media (prefers-reduced-transparency: reduce) {
  .glass {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass {
    transition: none;
    animation: none;
  }
}
```

### Mobile Performance
```css
/* Desktop: full effect */
.glass {
  backdrop-filter: blur(12px);
}

/* Mobile: reduced blur */
@media (max-width: 768px) {
  .glass {
    backdrop-filter: blur(8px);
  }
}
```

## Blur Intensity Guidelines

- **8-12px** - Background panels (unobtrusive)
- **12-20px** - Content cards (readable)
- **20-35px** - Focal elements (prominent, e.g., forms)
- **>35px** - Avoid (performance issues)

## Color System (HSL-based)

```css
:root {
  /* Hue variables for easy theming */
  --hue-primary: 223;
  --hue-secondary: 178;
  
  /* Glass surfaces with opacity */
  --glass-light: rgba(255, 255, 255, 0.1);
  --glass-medium: rgba(255, 255, 255, 0.15);
  --glass-heavy: rgba(255, 255, 255, 0.2);
  
  /* Borders */
  --glass-border: rgba(255, 255, 255, 0.18);
  
  /* Shadows */
  --glass-shadow: rgba(0, 0, 0, 0.1);
}
```

## Directional Borders (Simulated Light)

```css
.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 1);
  border-radius: inherit;
  
  /* White highlight top-left */
  mask-image: linear-gradient(
    135deg,
    rgba(0, 0, 0, 1),
    rgba(0, 0, 0, 0) 50%
  );
}

.glass-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid hsl(var(--hue-primary), 90%, 50%);
  border-radius: inherit;
  
  /* Accent highlight bottom-right */
  mask-image: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 1)
  );
}
```

## Animated Blobs (Background)

```css
.blob {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(245, 158, 11, 0.3),
    transparent
  );
  filter: blur(40px);
  
  animation: blob-float 20s infinite alternate;
}

@keyframes blob-float {
  0% {
    transform: translate(0, 0) scale(1);
    border-radius: 60% 40% 30% 70%;
  }
  50% {
    transform: translate(100px, 50px) scale(1.1);
    border-radius: 30% 60% 70% 40%;
  }
  100% {
    transform: translate(0, 0) scale(1);
    border-radius: 60% 40% 30% 70%;
  }
}
```

## Spring Physics Animations

```typescript
const springPresets = {
  default: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  },
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 35,
  },
}
```

## Magnetic Hover Effect

```typescript
function useMagneticHover(maxDistance = 10) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    const moveX = Math.max(-maxDistance, Math.min(maxDistance, x * 0.1))
    const moveY = Math.max(-maxDistance, Math.min(maxDistance, y * 0.1))
    
    setPosition({ x: moveX, y: moveY })
  }
  
  return { position, handleMouseMove }
}
```

## Liquid Modal Morph

```typescript
<motion.div
  initial={{
    opacity: 0,
    scale: 0,
    borderRadius: '50%',
  }}
  animate={{
    opacity: 1,
    scale: 1,
    borderRadius: '16px',
  }}
  exit={{
    opacity: 0,
    scale: 0,
    borderRadius: '50%',
  }}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 25,
  }}
>
  {/* Modal content */}
</motion.div>
```

## Common Mistakes to Avoid

1. **No vibrant background** - Glass on flat/white looks transparent, not glass
2. **Missing `-webkit-` prefix** - Safari won't render glass
3. **`overflow: hidden` on parent** - Destroys `backdrop-filter` context
4. **Blur > 15px on mobile** - Performance issues
5. **No contrast testing** - Text becomes unreadable
6. **Animating blur** - Very expensive, avoid
7. **No `@supports` fallback** - Breaks in older browsers
8. **Ignoring `prefers-reduced-motion`** - Accessibility issue

## Testing Checklist

- [ ] Works on vibrant animated background
- [ ] Has both `backdrop-filter` and `-webkit-backdrop-filter`
- [ ] Has `@supports` fallback
- [ ] Text contrast passes WCAG AA (4.5:1)
- [ ] Blur ≤12px on mobile
- [ ] Respects `prefers-reduced-motion`
- [ ] Respects `prefers-reduced-transparency`
- [ ] Hover state feels responsive
- [ ] No parent has `overflow: hidden`
- [ ] Maintains 60fps during animations

## Quick Component Patterns

### Glass Button
```css
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  padding: 0.875rem 2rem;
  transition: transform 0.2s ease;
}

.glass-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
}
```

### Glass Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### Glass Input
```css
.glass-input {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  padding: 0.875rem 1rem;
  color: #fff;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}
```

### Glass Modal
```css
.glass-modal {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}
```

## Resources

- Primary reference: `liquid-glass/README.md`
- CSS techniques: `liquid-glass/04-css-techniques.md`
- Color system: `liquid-glass/02-color-palette.md`
- Components: `liquid-glass/06-components.md`
- Animations: `liquid-glass/05-animations.md`
- Visual effects: `liquid-glass/03-visual-effects.md`
- Accessibility: `liquid-glass/07-accessibility.md`
- Performance: `liquid-glass/08-performance.md`
