# Design Document: Agent Console Web Modernization

## Overview

This document provides detailed technical specifications for implementing the Agent Console redesign. It translates the requirements and wireframes into concrete implementation guidance covering design tokens, component specifications, animation systems, and state management patterns.

The design follows a premium, production-ready aesthetic inspired by Claude's simplicity, Unseen.co's animation quality, and Apple's restrained elegance. Every specification prioritizes visual coherence, smooth interactions, and maintainable code.

## Design Philosophy

### Core Principles

1. **Restrained Elegance**: Use color sparingly. 90% neutral grays, color only for state and interaction.
2. **Smooth Motion**: Every animation uses spring physics for natural, organic feel. 60fps minimum.
3. **Typography-First Hierarchy**: Establish importance through font weight and size, not color.
4. **Generous Spacing**: Breathing room between elements creates calm, focused experience.
5. **Immediate Feedback**: Every interaction provides subtle, clear visual response.

### CRITICAL: Spacing & Padding Principles

**These principles MUST be followed in ALL components to prevent cramped, unprofessional layouts:**

#### Container Padding Rules
1. **All container components MUST have 16px padding** using `p-4` class
2. **Sidebar sections** (header, content, footer): `p-4` (16px padding each)
3. **Modal/Dialog content**: `p-6` (24px padding minimum)
4. **Card interiors**: `p-4` (16px padding minimum)
5. **Form containers**: `p-4` to `p-6` (16px-24px padding)

#### Component Spacing Rules
1. **Between major sections**: `space-y-6` (24px gap minimum)
2. **Between related components**: `space-y-4` (16px gap) - buttons in a group, form fields
3. **Between list items**: `space-y-3` (12px gap minimum) - agent cards, session items
4. **Between form elements**: `space-y-4` (16px gap)
5. **Between heading and content**: `space-y-3` (12px gap)

#### Tailwind v4 Spacing Classes
```tsx
// Padding
p-4   // 16px all sides
p-6   // 24px all sides
px-4  // 16px horizontal
py-4  // 16px vertical

// Gaps (for flex/grid containers)
gap-3  // 12px gap
gap-4  // 16px gap
gap-6  // 24px gap

// Vertical spacing (for stacked elements)
space-y-3  // 12px between children
space-y-4  // 16px between children
space-y-6  // 24px between children
```

#### Visual Breathing Room Checklist
Before marking any component complete, verify:
- [ ] No components touching container edges (16px minimum padding with `p-4`)
- [ ] Clear visual separation between sections (16-24px gaps with `space-y-4` or `space-y-6`)
- [ ] List items have space between them (12px minimum with `space-y-3`)
- [ ] Buttons/inputs not cramped together (16px gaps with `space-y-4`)
- [ ] Content doesn't feel "hugging" or cramped

### Visual Language

- **Warm Light Mode**: Cream surfaces (#FEFCE8), amber accents (#F59E0B), inviting and soft
- **Cool Dark Mode**: Deep blacks (#09090B), near-white accents (#FAFAFA), sophisticated and focused
- **Monochrome Base**: Interface is primarily grayscale; color signals meaning
- **Subtle Depth**: Minimal shadows, prefer borders and spacing for separation

---

## Design Tokens

### Color System

#### Light Mode (Warm & Inviting)

```typescript
const lightTheme = {
  // Backgrounds
  background: '#FFFFFF',        // Main background - pure white
  surface: '#FEFCE8',          // Sidebar, cards, elevated elements - warm cream
  surfaceHover: '#FEF9E7',     // Hover state for surface elements
  surfaceElevated: '#FEF3C7',  // Elevated cards (modals, planning cards)
  
  // Text
  text: {
    primary: '#1C1917',        // Body text, headings - warm black
    secondary: '#78716C',      // Secondary text, metadata - warm gray
    tertiary: '#A8A29E',       // Disabled, placeholder text - light warm gray
    inverse: '#FAFAFA',        // Text on dark backgrounds
  },
  
  // Accents
  primary: '#F59E0B',          // Active states, CTAs, user message indicator - amber
  primaryHover: '#D97706',     // Hover state for primary actions - darker amber
  primaryLight: '#FEF3C7',     // Subtle backgrounds for primary elements - light amber
  primaryGlow: 'rgba(245, 158, 11, 0.2)', // Glow effect for primary elements
  
  secondary: '#F97316',        // Secondary accent - orange (for variety)
  secondaryLight: '#FFEDD5',   // Light orange backgrounds
  
  // Borders
  border: {
    subtle: '#F5F5F4',         // Default borders - barely visible
    medium: '#E7E5E4',         // Emphasized borders
    strong: '#D6D3D1',         // Strong borders, dividers
    accent: '#F59E0B',         // Accent borders (active states)
  },
  
  // Semantic
  success: '#10B981',          // Green - success states
  successLight: '#D1FAE5',     // Light green backgrounds
  error: '#EF4444',            // Red - error states
  errorLight: '#FEE2E2',       // Light red backgrounds
  warning: '#F59E0B',          // Amber - warning states
  warningLight: '#FEF3C7',     // Light amber backgrounds
  info: '#3B82F6',             // Blue - info states
  infoLight: '#DBEAFE',        // Light blue backgrounds
  
  // Special Effects
  gradient: {
    primary: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
    subtle: 'linear-gradient(135deg, #FEFCE8 0%, #FEF9E7 100%)',
    glow: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
  },
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.1)',
  glass: 'rgba(255, 255, 255, 0.8)', // Glassmorphism background
}
```

#### Dark Mode (Cool & Sophisticated)

```typescript
const darkTheme = {
  // Backgrounds
  background: '#09090B',        // Main background - deep black
  surface: '#18181B',          // Sidebar, cards, elevated elements - dark gray
  surfaceHover: '#27272A',     // Hover state for surface elements
  surfaceElevated: '#1F1F23',  // Elevated cards (modals, planning cards)
  
  // Text
  text: {
    primary: '#FAFAFA',        // Body text, headings - near white
    secondary: '#A1A1AA',      // Secondary text, metadata - cool gray
    tertiary: '#71717A',       // Disabled, placeholder text - darker gray
    inverse: '#09090B',        // Text on light backgrounds
  },
  
  // Accents
  primary: '#FAFAFA',          // Active states, CTAs - near white
  primaryHover: '#E4E4E7',     // Hover state for primary actions
  primaryLight: '#27272A',     // Subtle backgrounds for primary elements
  primaryGlow: 'rgba(250, 250, 250, 0.1)', // Glow effect for primary elements
  
  secondary: '#60A5FA',        // Secondary accent - cool blue (sparingly)
  secondaryLight: '#1E3A5F',   // Dark blue backgrounds
  
  // Borders
  border: {
    subtle: '#27272A',         // Default borders - barely visible
    medium: '#3F3F46',         // Emphasized borders
    strong: '#52525B',         // Strong borders, dividers
    accent: '#FAFAFA',         // Accent borders (active states)
  },
  
  // Semantic
  success: '#10B981',          // Green - success states
  successLight: '#064E3B',     // Dark green backgrounds
  error: '#EF4444',            // Red - error states
  errorLight: '#7F1D1D',       // Dark red backgrounds
  warning: '#F59E0B',          // Amber - warning states
  warningLight: '#78350F',     // Dark amber backgrounds
  info: '#60A5FA',             // Blue - info states
  infoLight: '#1E3A8A',        // Dark blue backgrounds
  
  // Special Effects
  gradient: {
    primary: 'linear-gradient(135deg, #FAFAFA 0%, #E4E4E7 100%)',
    subtle: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
    glow: 'radial-gradient(circle, rgba(250, 250, 250, 0.08) 0%, transparent 70%)',
  },
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.3)',
  glass: 'rgba(24, 24, 27, 0.8)', // Glassmorphism background
}
```

#### Color Usage Guidelines

**Restrained Color Philosophy**
- 90% of interface uses neutral grays (backgrounds, borders, text)
- 8% uses primary accent (amber in light, white in dark)
- 2% uses semantic colors (success, error, warning, info)
- Color signals meaning, not decoration

**When to Use Primary Color**
- Active/selected states (tabs, buttons, list items)
- User message indicators (left border)
- Primary CTAs (send button, create agent)
- Focus states (input rings)
- Working indicators (pulsing dots)

**When to Use Secondary Color**
- Hover states (subtle)
- Secondary actions
- Informational badges
- Links (sparingly)

**When to Use Semantic Colors**
- Success: Completed tasks, successful operations
- Error: Failed operations, validation errors
- Warning: Abandoned tasks, caution states
- Info: Informational messages, tips

**Gradient Usage**
- Primary gradient: Hero sections, special CTAs
- Subtle gradient: Card backgrounds, surface variations
- Glow gradient: Hover effects, focus states (very subtle)

### Typography System

```typescript
const typography = {
  // Font Families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Menlo, Monaco, "Courier New", monospace',
  },
  
  // Font Sizes (px)
  fontSize: {
    xs: '11px',    // Tiny labels, metadata
    sm: '13px',    // Secondary text, captions
    base: '15px',  // Body text, UI elements
    lg: '17px',    // Emphasized body text
    xl: '20px',    // Small headings
    '2xl': '24px', // Medium headings
    '3xl': '32px', // Large headings
    '4xl': '40px', // Hero text
  },
  
  // Font Weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,    // Large headings
    normal: 1.4,   // UI text, small headings
    relaxed: 1.6,  // Body content, chat messages
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: '-0.02em',  // Headings
    normal: '0',       // Body text
    wide: '0.01em',    // Uppercase labels
  },
}
```

### Spacing System

```typescript
const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
}
```

### Border Radius

```typescript
const borderRadius = {
  none: '0',
  sm: '8px',     // Buttons, inputs, small cards
  md: '12px',    // Cards, dropdowns
  lg: '16px',    // Modals, large cards
  full: '9999px', // Pills, avatars
}
```

### Shadows

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
}
```

### Breakpoints

```typescript
const breakpoints = {
  // Mobile devices
  mobile: {
    sm: '320px',   // Small phones (iPhone SE)
    md: '375px',   // Standard phones (iPhone 12/13)
    lg: '414px',   // Large phones (iPhone 12 Pro Max)
  },
  
  // Tablets
  tablet: {
    sm: '768px',   // iPad Mini, small tablets
    md: '834px',   // iPad Air
    lg: '1024px',  // iPad Pro 11"
  },
  
  // Desktop
  desktop: {
    sm: '1280px',  // Small laptops
    md: '1440px',  // Standard desktop
    lg: '1920px',  // Large desktop
    xl: '2560px',  // 4K displays
  },
}

// Tailwind-style breakpoint system
const screens = {
  'xs': '320px',    // Extra small phones
  'sm': '640px',    // Small devices
  'md': '768px',    // Tablets
  'lg': '1024px',   // Small laptops
  'xl': '1280px',   // Desktop
  '2xl': '1536px',  // Large desktop
}
```

#### Responsive Design Strategy

**Mobile-First Approach**
- Design for 375px first (iPhone standard)
- Progressive enhancement for larger screens
- Touch-friendly targets (minimum 44x44px)
- Simplified navigation (hamburger menu)
- Single column layouts
- Reduced spacing and padding

**Tablet Optimization (768px+)**
- Sidebar becomes visible
- Two-column layouts where appropriate
- Increased spacing
- Hover states enabled
- Keyboard shortcuts active

**Desktop Excellence (1024px+)**
- Full sidebar with collapse option
- Multi-column layouts
- Maximum content width constraints
- Rich hover interactions
- Advanced keyboard shortcuts
- Cursor effects and parallax

**Large Display (1920px+)**
- Content remains centered (max-width)
- Increased margins
- Optional sidebar expansion
- Enhanced visual effects

#### Responsive Patterns

**Sidebar Behavior**
```typescript
// Mobile (< 768px)
- Hidden by default
- Slide-in overlay with backdrop
- Full-screen on small phones
- Swipe gestures to open/close

// Tablet (768px - 1024px)
- Visible, 280px width
- Can be collapsed to icons
- Persistent across navigation

// Desktop (1024px+)
- Visible, 280px width
- Smooth collapse animation
- Keyboard shortcut (Cmd+B)
```

**Chat Column Width**
```typescript
// Mobile: Full width minus padding (16px each side)
// Tablet: 768px max-width, centered
// Desktop: 768px max-width, centered
// Large: 768px max-width, centered (never wider)
```

**Planning Card**
```typescript
// Mobile: Full width, reduced padding (16px)
// Tablet: Full width, standard padding (24px)
// Desktop: Full width, standard padding (24px)
// Tasks: Stack vertically on mobile, maintain hierarchy
```

**Session Tabs**
```typescript
// Mobile: Horizontal scroll, compact tabs
// Tablet: Horizontal scroll, standard tabs
// Desktop: Horizontal scroll with fade indicators
```

---

## Cursor & Mouse Interactions (Unseen.co Inspired)

### Custom Cursor

**Design**
- Replace default cursor with custom animated dot
- Size: 12px diameter (outer ring), 4px diameter (inner dot)
- Color: `primary` with 40% opacity (outer), `primary` solid (inner)
- Smooth follow with slight lag (lerp factor: 0.15)

**States**
```typescript
// Default
cursor: {
  outer: 12px,
  inner: 4px,
  opacity: 0.4,
}

// Hover (clickable elements)
cursor: {
  outer: 24px,
  inner: 8px,
  opacity: 0.6,
  scale: 1.5,
}

// Active (clicking)
cursor: {
  outer: 8px,
  inner: 2px,
  scale: 0.8,
}

// Text selection
cursor: {
  outer: 0px,
  inner: 2px,
  height: 20px, // Vertical line
}
```

**Implementation**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [cursorVariant, setCursorVariant] = useState('default')
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 25, stiffness: 300 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)
  
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        setCursorVariant('hover')
      } else {
        setCursorVariant('default')
      }
    }
    
    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleMouseOver)
    
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])
  
  const variants = {
    default: {
      width: 12,
      height: 12,
    },
    hover: {
      width: 24,
      height: 24,
    },
  }
  
  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="custom-cursor-outer"
        variants={variants}
        animate={cursorVariant}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 9999,
          border: `2px solid ${theme.primary}`,
          borderRadius: '50%',
          opacity: 0.4,
        }}
      />
      
      {/* Inner dot */}
      <motion.div
        className="custom-cursor-inner"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 4,
          height: 4,
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 10000,
          background: theme.primary,
          borderRadius: '50%',
        }}
      />
    </>
  )
}
```

### Magnetic Hover Effects

**Agent Cards**
```typescript
// Card follows cursor within bounds
function MagneticCard({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    // Limit movement to 10px in each direction
    const moveX = Math.max(-10, Math.min(10, x * 0.1))
    const moveY = Math.max(-10, Math.min(10, y * 0.1))
    
    setPosition({ x: moveX, y: moveY })
  }
  
  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}
```

**Buttons with Magnetic Pull**
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    e.currentTarget.style.transform = `
      translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)
    `
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translate(0, 0) scale(1)'
  }}
>
  {children}
</motion.button>
```

### Parallax Hover Effects

**Message Bubbles with 3D Tilt**
```typescript
function ParallaxMessage({ children }: { children: React.ReactNode }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * -5 // Max 5deg
    const rotateY = ((x - centerX) / centerX) * 5
    
    setRotateX(rotateX)
    setRotateY(rotateY)
  }
  
  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setRotateX(0)
        setRotateY(0)
      }}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {children}
    </motion.div>
  )
}
```

### Gradient Tracking

**Cursor Spotlight Effect**
```typescript
function SpotlightSurface({ children }: { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  return (
    <div
      className="surface-with-spotlight"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }}
      style={{
        position: 'relative',
        background: theme.surface,
      }}
    >
      {/* Spotlight layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(
              600px circle at ${mousePosition.x}px ${mousePosition.y}px,
              rgba(245, 158, 11, 0.06),
              transparent 40%
            )
          `,
          pointerEvents: 'none',
        }}
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
```

---

## Animation System

### Framer Motion Configuration

#### Spring Presets

```typescript
const springPresets = {
  // Default spring for most animations
  default: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  
  // Snappy spring for quick interactions
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  },
  
  // Gentle spring for large movements
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 35,
  },
  
  // Bouncy spring for playful interactions
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
}
```

#### Easing Curves

```typescript
const easings = {
  easeOut: [0.0, 0.0, 0.2, 1.0],      // Entrances
  easeInOut: [0.4, 0.0, 0.2, 1.0],    // Transitions
  easeIn: [0.4, 0.0, 1.0, 1.0],       // Exits
}
```

#### Duration Standards

```typescript
const durations = {
  instant: 0,
  fast: 150,      // Hover effects, micro-interactions
  normal: 250,    // View switching, standard transitions
  slow: 300,      // Page transitions, theme switching
  slower: 400,    // Large movements, complex animations
}
```


#### Motion Variants

```typescript
// Reusable animation variants for Framer Motion
const motionVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Slide animations
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  
  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  
  // Button press
  buttonPress: {
    whileTap: { scale: 0.98 },
  },
  
  // Hover lift
  hoverLift: {
    whileHover: { y: -2 },
  },
  
  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
}
```

#### Animation Guidelines

1. **Performance**: Only animate `transform` and `opacity` properties for 60fps
2. **Reduced Motion**: Always check `prefers-reduced-motion` and disable decorative animations
3. **Exit Animations**: Use `AnimatePresence` for smooth unmounting
4. **Layout Animations**: Use `layout` prop for automatic layout transitions
5. **Scroll Animations**: Use `useInView` hook with `once: true` for scroll-triggered effects

---

## Liquid & Organic Animations (Unseen.co Signature)

### Liquid Button Morphs

**Send Button Liquid State**
```typescript
function LiquidSendButton({ onClick, isLoading }: ButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="liquid-button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Liquid blob background */}
      <motion.div
        className="liquid-blob"
        animate={{
          borderRadius: isLoading 
            ? ['50% 50% 50% 50%', '40% 60% 60% 40%', '60% 40% 40% 60%', '50% 50% 50% 50%']
            : ['50% 50% 50% 50%', '45% 55% 55% 45%', '55% 45% 45% 55%', '50% 50% 50% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          inset: 0,
          background: theme.gradient.primary,
          zIndex: 0,
        }}
      />
      
      {/* Button content */}
      <span style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{
                rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
              }}
            >
              <Loader2 size={16} />
            </motion.div>
          ) : (
            <motion.div
              key="send"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Send size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  )
}
```

**Primary CTA with Flowing Gradient**
```typescript
function LiquidCTA({ children, onClick }: CTAProps) {
  const [gradientPosition, setGradientPosition] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 200)
    }, 30)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: `linear-gradient(
          ${gradientPosition}deg,
          ${theme.primary} 0%,
          ${theme.secondary} 50%,
          ${theme.primary} 100%
        )`,
        backgroundSize: '200% 200%',
      }}
    >
      {children}
    </motion.button>
  )
}
```

### Blob Backgrounds

**Animated Organic Blobs**
```typescript
function BlobBackground() {
  return (
    <div className="blob-container">
      {/* Blob 1 */}
      <motion.div
        className="blob blob-1"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          borderRadius: [
            '60% 40% 30% 70%',
            '30% 60% 70% 40%',
            '60% 40% 30% 70%',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${theme.primaryLight}, transparent)`,
          opacity: 0.3,
          filter: 'blur(40px)',
        }}
      />
      
      {/* Blob 2 */}
      <motion.div
        className="blob blob-2"
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
          rotate: [0, -180, -360],
          borderRadius: [
            '40% 60% 60% 40%',
            '60% 40% 40% 60%',
            '40% 60% 60% 40%',
          ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          background: `radial-gradient(circle, ${theme.secondaryLight}, transparent)`,
          opacity: 0.2,
          filter: 'blur(40px)',
        }}
      />
    </div>
  )
}
```

**Planning Card Blob Background**
```typescript
// Subtle animated gradient blobs behind planning card
<div className="planning-card-wrapper">
  <motion.div
    className="planning-blob"
    animate={{
      scale: [1, 1.05, 1],
      opacity: [0.1, 0.15, 0.1],
      borderRadius: [
        '50% 50% 50% 50%',
        '45% 55% 55% 45%',
        '50% 50% 50% 50%',
      ],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    style={{
      position: 'absolute',
      inset: -20,
      background: theme.gradient.glow,
      filter: 'blur(30px)',
      zIndex: 0,
    }}
  />
  
  <div className="planning-card" style={{ position: 'relative', zIndex: 1 }}>
    {/* Card content */}
  </div>
</div>
```

### Morphing Transitions

**Modal Liquid Entry**
```typescript
// Modal morphs from trigger button
function LiquidModal({ isOpen, triggerRef, children }: ModalProps) {
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }
  }, [isOpen])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
          />
          
          {/* Modal */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0,
              x: origin.x,
              y: origin.y,
              borderRadius: '50%',
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              borderRadius: '16px',
            }}
            exit={{
              opacity: 0,
              scale: 0,
              x: origin.x,
              y: origin.y,
              borderRadius: '50%',
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className="modal"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

**Tab Liquid Underline**
```typescript
// Flowing underline between tabs
function LiquidTabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="tabs-container">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="tab"
        >
          {tab.label}
          
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTabIndicator"
              className="tab-indicator"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: theme.primary,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
```

**Theme Toggle Liquid Morph**
```typescript
function LiquidThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="theme-toggle"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Morphing background */}
      <motion.div
        animate={{
          background: theme === 'light' 
            ? 'linear-gradient(135deg, #FEF3C7, #F59E0B)'
            : 'linear-gradient(135deg, #18181B, #27272A)',
        }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
        }}
      />
      
      {/* Morphing icon */}
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
            }}
          >
            <Sun size={20} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
            }}
          >
            <Moon size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
```

### Organic Loading States

**Blob Spinner**
```typescript
function BlobSpinner() {
  return (
    <motion.div
      className="blob-spinner"
      animate={{
        rotate: 360,
        borderRadius: [
          '60% 40% 30% 70%',
          '30% 60% 70% 40%',
          '60% 40% 30% 70%',
        ],
      }}
      transition={{
        rotate: {
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        },
        borderRadius: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      style={{
        width: '40px',
        height: '40px',
        background: theme.gradient.primary,
      }}
    />
  )
}
```

**Liquid Progress Bar**
```typescript
function LiquidProgress({ progress }: { progress: number }) {
  return (
    <div className="liquid-progress-container">
      <motion.div
        className="liquid-progress-fill"
        animate={{
          width: `${progress}%`,
          borderRadius: [
            '0 50% 50% 0',
            '0 40% 60% 0',
            '0 60% 40% 0',
            '0 50% 50% 0',
          ],
        }}
        transition={{
          width: { duration: 0.5, ease: 'easeOut' },
          borderRadius: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        style={{
          height: '100%',
          background: theme.gradient.primary,
        }}
      />
    </div>
  )
}
```

---

## Enhanced Icon System

### Icon Library: Lucide React

**Why Lucide**
- 1,200+ icons with consistent 24x24 grid
- Clean, modern stroke-based design
- Excellent React integration
- Regular updates and community support
- Smaller bundle size than alternatives
- Customizable stroke width

### Icon Sizes & Usage

```typescript
const iconSizes = {
  xs: 14,   // Inline with small text, badges
  sm: 16,   // Inline with body text, small buttons
  md: 20,   // Navigation, primary actions, standard buttons
  lg: 24,   // Large buttons, headings, feature icons
  xl: 32,   // Hero sections, empty states
  '2xl': 48, // Large empty states, illustrations
}
```

**Usage Guidelines**
- xs (14px): Status indicators, inline badges
- sm (16px): Message actions, inline buttons
- md (20px): Sidebar navigation, tab icons
- lg (24px): Primary CTAs, modal headers
- xl (32px): Empty state icons
- 2xl (48px): Hero illustrations

### Icon Component

```typescript
interface IconProps {
  name: keyof typeof icons
  size?: keyof typeof iconSizes
  color?: string
  className?: string
  animate?: boolean
}

function Icon({ name, size = 'md', color, className, animate }: IconProps) {
  const IconComponent = icons[name]
  const sizeValue = iconSizes[size]
  
  return (
    <motion.div
      className={className}
      whileHover={animate ? { scale: 1.1, rotate: 5 } : undefined}
      transition={springPresets.snappy}
    >
      <IconComponent
        size={sizeValue}
        color={color || 'currentColor'}
        strokeWidth={2}
      />
    </motion.div>
  )
}
```

### Icon Animations

**Spin Animation** (for loaders)
```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  }}
>
  <Loader2 size={20} />
</motion.div>
```

**Pulse Animation** (for notifications)
```typescript
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
  <Bell size={20} />
</motion.div>
```

**Bounce Animation** (for success states)
```typescript
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{
    type: 'spring',
    stiffness: 400,
    damping: 15,
  }}
>
  <CheckCircle size={24} />
</motion.div>
```

### Icon Color System

```typescript
const iconColors = {
  // Default states
  default: theme.text.secondary,
  hover: theme.text.primary,
  active: theme.primary,
  disabled: theme.text.tertiary,
  
  // Semantic colors
  success: theme.success,
  error: theme.error,
  warning: theme.warning,
  info: theme.info,
  
  // Special states
  working: theme.primary, // Pulsing/spinning
  completed: theme.success,
  abandoned: theme.warning,
}
```

### Common Icon Mappings

```typescript
const icons = {
  // Navigation
  menu: Menu,
  close: X,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  
  // Actions
  send: Send,
  plus: Plus,
  edit: Edit2,
  trash: Trash2,
  copy: Copy,
  check: Check,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  
  // Content
  messageSquare: MessageSquare,
  users: Users,
  user: User,
  settings: Settings,
  search: Search,
  filter: Filter,
  moreVertical: MoreVertical,
  moreHorizontal: MoreHorizontal,
  
  // Theme
  sun: Sun,
  moon: Moon,
  
  // Status
  loader: Loader2,
  alertCircle: AlertCircle,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  info: Info,
  helpCircle: HelpCircle,
  
  // Media
  image: Image,
  file: File,
  fileText: FileText,
  code: Code,
  
  // Planning
  circle: Circle, // Todo
  checkCircle2: CheckCircle2, // Done
  alertTriangle: AlertTriangle, // Abandoned
  
  // Session
  gitBranch: GitBranch, // Session hierarchy
  layers: Layers, // Multi-agent
}
```

---

## Sound Design (Optional, User-Controlled)

### Audio Philosophy

**Principles**
- Subtle and non-intrusive
- Enhances feedback, doesn't distract
- User can disable globally
- Respects system sound settings
- Spatial audio for context

### Sound Library

```typescript
const sounds = {
  // UI Interactions
  click: '/sounds/click.mp3',           // Button clicks (soft)
  hover: '/sounds/hover.mp3',           // Hover over interactive elements (very subtle)
  whoosh: '/sounds/whoosh.mp3',         // Transitions, modal open/close
  pop: '/sounds/pop.mp3',               // Dropdown open, tooltip appear
  
  // Notifications
  messageReceived: '/sounds/message.mp3',     // New message (gentle chime)
  taskComplete: '/sounds/complete.mp3',       // Task completion (success tone)
  error: '/sounds/error.mp3',                 // Error state (subtle alert)
  
  // Ambient (very subtle)
  ambientLight: '/sounds/ambient-light.mp3',  // Light mode background
  ambientDark: '/sounds/ambient-dark.mp3',    // Dark mode background
}
```

### Sound Implementation

```typescript
class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private enabled: boolean = true
  private volume: number = 0.3
  
  constructor() {
    // Load sounds
    Object.entries(sounds).forEach(([key, path]) => {
      const audio = new Audio(path)
      audio.volume = this.volume
      this.sounds.set(key, audio)
    })
    
    // Check user preference
    this.enabled = localStorage.getItem('soundEnabled') !== 'false'
  }
  
  play(soundName: keyof typeof sounds) {
    if (!this.enabled) return
    
    const sound = this.sounds.get(soundName)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(() => {
        // Ignore autoplay errors
      })
    }
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    localStorage.setItem('soundEnabled', String(enabled))
  }
  
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach((sound) => {
      sound.volume = this.volume
    })
  }
}

export const soundManager = new SoundManager()
```

### Sound Usage Examples

**Button Click**
```typescript
<button
  onClick={() => {
    soundManager.play('click')
    handleClick()
  }}
>
  Click me
</button>
```

**Message Received**
```typescript
useEffect(() => {
  if (newMessage) {
    soundManager.play('messageReceived')
  }
}, [newMessage])
```

**Modal Open**
```typescript
<AnimatePresence>
  {isOpen && (
    <motion.div
      onAnimationStart={() => soundManager.play('whoosh')}
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Haptic Feedback (Mobile)

```typescript
class HapticManager {
  vibrate(pattern: number | number[]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }
  
  light() {
    this.vibrate(10)
  }
  
  medium() {
    this.vibrate(20)
  }
  
  heavy() {
    this.vibrate(30)
  }
  
  success() {
    this.vibrate([10, 50, 10])
  }
  
  error() {
    this.vibrate([20, 100, 20])
  }
}

export const hapticManager = new HapticManager()
```

**Usage**
```typescript
// Button press
<button
  onTouchStart={() => hapticManager.light()}
  onClick={handleClick}
>
  Press me
</button>

// Success action
const handleSuccess = () => {
  hapticManager.success()
  soundManager.play('taskComplete')
  showSuccessToast()
}
```

### Sound Settings UI

```typescript
function SoundSettings() {
  const [enabled, setEnabled] = useState(soundManager.enabled)
  const [volume, setVolume] = useState(soundManager.volume)
  
  return (
    <div className="sound-settings">
      <div className="setting-row">
        <label>Enable Sounds</label>
        <Switch
          checked={enabled}
          onChange={(checked) => {
            setEnabled(checked)
            soundManager.setEnabled(checked)
          }}
        />
      </div>
      
      <div className="setting-row">
        <label>Volume</label>
        <Slider
          value={volume}
          onChange={(value) => {
            setVolume(value)
            soundManager.setVolume(value)
          }}
          min={0}
          max={1}
          step={0.1}
        />
      </div>
      
      <button onClick={() => soundManager.play('click')}>
        Test Sound
      </button>
    </div>
  )
}
```

---

## Layout Architecture
2. **Reduced Motion**: Always check `prefers-reduced-motion` and disable decorative animations
3. **Exit Animations**: Use `AnimatePresence` for smooth unmounting
4. **Layout Animations**: Use `layout` prop for automatic layout transitions
5. **Scroll Animations**: Use `useInView` hook with `once: true` for scroll-triggered effects

---

## Layout Architecture

### Grid System

```typescript
const layout = {
  // Sidebar
  sidebar: {
    width: '280px',
    widthCollapsed: '64px',
    padding: '12px',
    gap: '8px',
  },
  
  // Chat Interface
  chat: {
    maxWidth: '768px',
    padding: {
      mobile: '16px',
      desktop: '24px',
    },
    messageSpacing: '24px',
  },
  
  // Container
  container: {
    maxWidth: '1920px',
    margin: '0 auto',
  },
}
```

### Responsive Behavior

#### Mobile (< 768px)
- Sidebar hidden by default, accessible via hamburger menu
- Sidebar slides in from left with overlay
- Chat takes full width with 16px horizontal padding
- Touch targets minimum 44x44px
- Swipe gestures for sidebar

#### Tablet (768px - 1024px)
- Sidebar visible, 280px width
- Chat centered with max-width 768px
- Standard touch targets
- Hover states enabled

#### Desktop (1024px+)
- Sidebar visible, 280px width with collapse option
- Chat centered with max-width 768px
- Full hover and keyboard interactions
- Generous spacing

---

## Component Specifications

### Button Component

#### Variants

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
  onClick?: () => void
}
```

#### Styles

**Primary Button**
- Background: `primary` color
- Text: White (light mode) / `background` (dark mode)
- Height: 44px (md), 36px (sm), 52px (lg)
- Padding: 16px horizontal
- Border radius: 12px
- Font: 15px medium weight
- Hover: Scale 1.02, brightness increase
- Active: Scale 0.98
- Disabled: 50% opacity, no hover effects
- Loading: Spinner + disabled state

**Secondary Button**
- Background: Transparent
- Border: 1px solid `border.medium`
- Text: `text.primary`
- Same sizing as primary
- Hover: Background `surfaceHover`
- Active: Scale 0.98

**Ghost Button**
- Background: Transparent
- No border
- Text: `text.secondary`
- Hover: Background `surfaceHover`, text `text.primary`
- Active: Scale 0.98

**Danger Button**
- Background: `error` color
- Text: White
- Same behavior as primary

#### Animation

```typescript
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={springPresets.snappy}
>
  {children}
</motion.button>
```

### Input Component

#### Variants

```typescript
interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  type?: 'text' | 'email' | 'password' | 'textarea'
  rows?: number // for textarea
}
```

#### Styles

- Height: 44px (input), auto (textarea)
- Padding: 12px horizontal, 10px vertical
- Border: 1px solid `border.subtle`
- Border radius: 12px
- Font: 15px regular
- Background: `background`
- Focus: 2px ring in `primary`, border color `primary`
- Error: Border color `error`, show error message below
- Disabled: 50% opacity, cursor not-allowed

#### Label

- Position: Above input
- Font: 13px medium
- Color: `text.primary`
- Margin bottom: 8px

#### Error Message

- Font: 13px regular
- Color: `error`
- Margin top: 4px

#### Animation

```typescript
// Focus ring expansion
<motion.div
  animate={{
    boxShadow: isFocused 
      ? `0 0 0 2px ${theme.primary}` 
      : 'none'
  }}
  transition={{ duration: 0.15 }}
/>
```

### Card Component

#### Variants

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'sm' | 'md' | 'lg'
  children: ReactNode
  onClick?: () => void
  hoverable?: boolean
}
```

#### Styles

**Default Card**
- Background: `surface`
- Border: None
- Border radius: 16px
- Padding: 16px (md), 12px (sm), 24px (lg)
- Shadow: None

**Elevated Card**
- Background: `surface`
- Border: None
- Border radius: 16px
- Shadow: `shadows.md`
- Hover: Shadow `shadows.lg` (if hoverable)

**Outlined Card**
- Background: Transparent
- Border: 1px solid `border.subtle`
- Border radius: 16px
- Hover: Border color `border.medium` (if hoverable)

#### Animation

```typescript
<motion.div
  whileHover={hoverable ? { y: -2 } : undefined}
  transition={springPresets.default}
>
  {children}
</motion.div>
```

### Modal Component

#### Structure

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}
```

#### Styles

- Width: 480px (sm), 560px (md), 720px (lg)
- Max height: 90vh
- Background: `surface`
- Border radius: 16px
- Shadow: `shadows.xl`
- Padding: 24px
- Overlay: `overlay` color with backdrop blur

#### Layout

```
┌─────────────────────────────┐
│ Title                   [X] │ ← Header (24px padding)
├─────────────────────────────┤
│                             │
│ Content                     │ ← Body (24px padding, scrollable)
│                             │
├─────────────────────────────┤
│ [Cancel]  [Primary Action]  │ ← Footer (24px padding)
└─────────────────────────────┘
```

#### Animation

```typescript
<AnimatePresence>
  {isOpen && (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={springPresets.default}
      />
    </>
  )}
</AnimatePresence>
```

#### Behavior

- Escape key closes modal
- Click outside closes modal
- Focus trap within modal
- Restore focus on close
- Prevent body scroll when open


### Toast Component

#### Variants

```typescript
type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  variant: ToastVariant
  message: string
  duration?: number // milliseconds, default 3000
  onClose?: () => void
}
```

#### Styles

- Width: 360px max
- Background: `surface`
- Border: 1px solid `border.medium`
- Border radius: 12px
- Padding: 12px 16px
- Shadow: `shadows.lg`
- Position: Fixed, top-right, 24px from edges
- Icon: 20px, colored by variant
- Font: 15px regular

#### Colors by Variant

- Success: Green icon (#10B981)
- Error: Red icon (#EF4444)
- Warning: Amber icon (#F59E0B)
- Info: Blue icon (#3B82F6)

#### Animation

```typescript
<motion.div
  initial={{ opacity: 0, y: -20, x: 20 }}
  animate={{ opacity: 1, y: 0, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
  transition={springPresets.default}
/>
```

#### Behavior

- Auto-dismiss after duration
- Click to dismiss
- Stack multiple toasts vertically with 8px gap
- Maximum 3 toasts visible at once

### Avatar Component

#### Variants

```typescript
interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'user' | 'agent'
}
```

#### Styles

- Size: 32px (sm), 40px (md), 48px (lg)
- Border radius: `full`
- Background: `primary` (user) or `surface` (agent)
- Text: First letter of name, uppercase
- Font: 15px semibold (md), 13px (sm), 17px (lg)
- Text color: White (user) or `text.primary` (agent)

#### Fallback

If no image provided, show first letter of name with colored background:
- User avatars: `primary` background
- Agent avatars: `surface` background with `border.medium` border

### Icon System

#### Library

Use Lucide React exclusively for consistency.

#### Sizes

```typescript
const iconSizes = {
  xs: 14,   // Inline with small text
  sm: 16,   // Inline with body text, small buttons
  md: 20,   // Navigation, primary actions
  lg: 24,   // Large buttons, headings
  xl: 32,   // Hero sections, empty states
}
```

#### Colors

- Default: `text.secondary`
- Hover: `text.primary`
- Active: `primary`
- Disabled: `text.tertiary`

#### Stroke Width

Consistent 2px stroke width across all icons.

#### Common Icons

```typescript
const icons = {
  // Navigation
  menu: Menu,
  close: X,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  
  // Actions
  send: Send,
  plus: Plus,
  edit: Edit2,
  trash: Trash2,
  copy: Copy,
  check: Check,
  
  // Content
  messageSquare: MessageSquare,
  users: Users,
  settings: Settings,
  search: Search,
  
  // Theme
  sun: Sun,
  moon: Moon,
  
  // Status
  loader: Loader2, // with spin animation
  alertCircle: AlertCircle,
  checkCircle: CheckCircle,
  info: Info,
}
```

---

## Feature-Specific Designs

### Sidebar Design

#### Structure

```
┌─────────────────────────┐
│ [My Agents][Recent Chats]│ ← Toggle (44px height)
├─────────────────────────┤
│ [+ New Agent/Chat]      │ ← Action button (44px)
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ Agent/Session Item  │ │ ← List items
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Agent/Session Item  │ │
│ └─────────────────────┘ │
│                         │
│         ...             │
│                         │
├─────────────────────────┤
│ [🌙 Theme Toggle]       │ ← Footer (44px)
└─────────────────────────┘
```

#### Toggle Buttons

- Height: 44px
- Display: Inline flex, equal width
- Font: 15px medium
- Inactive: `text.secondary`, transparent background
- Active: `text.primary`, `primary` color indicator (bottom border 2px)
- Hover: `text.primary`
- Transition: Smooth crossfade between views (250ms)

#### Agent Card (My Agents View)

```typescript
interface AgentCardProps {
  id: string
  name: string
  description: string
  avatar?: string
  isActive: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}
```

**Layout**
- Padding: 12px
- Border radius: 12px
- Gap: 8px between elements
- Background: Transparent
- Hover: `surfaceHover`
- Active: Left border 2px `primary`

**Content**
- Avatar: 40px, top-left
- Name: 15px semibold, `text.primary`
- Description: 13px regular, `text.secondary`, truncate to 2 lines
- Actions: Edit/Delete icons (16px), fade in on hover

#### Session Item (Recent Chats View)

```typescript
interface SessionItemProps {
  id: string
  agentName: string
  agentAvatar?: string
  lastMessage: string
  timestamp: string
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}
```

**Layout**
- Padding: 12px
- Border radius: 12px
- Gap: 8px
- Background: Transparent
- Hover: `surfaceHover`
- Active: Left border 2px `primary`

**Content**
- Avatar: 32px, top-left
- Agent name: 13px medium, `text.primary`
- Last message: 13px regular, `text.secondary`, truncate to 1 line
- Timestamp: 11px regular, `text.tertiary`, relative format
- Delete icon: 16px, fade in on hover

#### Collapse Button (Desktop)

- Position: Top-right of sidebar
- Size: 32x32px
- Icon: ChevronLeft/ChevronRight (16px)
- Hover: `surfaceHover`
- Collapsed state: Sidebar width 64px, show only icons

#### Mobile Behavior

- Sidebar slides in from left: `translateX(-280px)` → `translateX(0)`
- Overlay: `overlay` color, click to close
- Close button: Top-left, 44x44px
- Swipe right gesture to close
- Animation: 300ms spring

### Chat Interface Design

#### Message Structure

```typescript
interface MessageProps {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  isStreaming?: boolean
}
```

#### User Message

**Styles**
- Background: Transparent
- Left border: 2px `primary`
- Padding: 16px
- Border radius: 12px
- Margin: 24px vertical spacing
- Max width: 100% of chat column

**Content**
- Avatar: 32px, top-left
- Text: 15px regular, `text.primary`, line-height 1.6
- Timestamp: 11px regular, `text.tertiary`, below message
- Max line length: 65 characters for readability

**Animation**
```typescript
<motion.div
  variants={motionVariants.slideUp}
  initial="initial"
  animate="animate"
  transition={springPresets.default}
/>
```

#### Agent Message

**Styles**
- Background: Transparent
- No border (quieter presence)
- Padding: 16px
- Border radius: 12px
- Margin: 24px vertical spacing

**Content**
- Avatar: 32px, top-left
- Text: 15px regular, `text.primary`, line-height 1.6
- Timestamp: 11px regular, `text.tertiary`
- Action buttons: Copy, Regenerate (fade in on hover)

**Streaming State**
- Cursor blink animation at end of content
- Smooth text append without flicker
- Disable actions until complete

**Animation**
```typescript
<motion.div
  variants={motionVariants.slideUp}
  initial="initial"
  animate="animate"
  transition={{ ...springPresets.default, delay: 0.05 }}
/>
```

#### Typing Indicator

**Styles**
- Three dots (6px each)
- Color: `text.tertiary`
- Gap: 4px between dots
- Padding: 16px
- Background: `surface`
- Border radius: 12px

**Animation**
```typescript
// Staggered pulse animation
const dotVariants = {
  animate: {
    y: [0, -4, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Stagger each dot by 0.1s
<motion.div variants={dotVariants} transition={{ delay: 0 }} />
<motion.div variants={dotVariants} transition={{ delay: 0.1 }} />
<motion.div variants={dotVariants} transition={{ delay: 0.2 }} />
```

#### Message Actions

**Buttons**
- Size: 32x32px
- Icon: 16px
- Background: Transparent
- Hover: `surfaceHover`
- Color: `text.secondary` → `text.primary` on hover
- Position: Top-right of message
- Fade in on message hover (opacity 0 → 1, 150ms)

**Actions**
- Copy: Copy message content to clipboard, show checkmark for 2s
- Regenerate: Re-run agent response (agent messages only)
- Delete: Remove message with confirmation


#### Message Input

**Structure**
```
┌─────────────────────────────────────────┐
│ Type a message...              [Send]   │
└─────────────────────────────────────────┘
```

**Styles**
- Height: 44px minimum, auto-expand for multiline
- Max height: 200px (scrollable beyond)
- Padding: 12px 16px
- Border: 1px solid `border.subtle`
- Border radius: 12px
- Background: `background`
- Font: 15px regular
- Focus: 2px ring `primary`

**Send Button**
- Position: Right side, vertically centered
- Size: 36x36px
- Icon: Send (16px)
- Background: `primary`
- Color: White (light) / `background` (dark)
- Disabled: When input empty or sending
- Hover: Scale 1.05
- Active: Scale 0.95

**Behavior**
- Auto-resize as user types
- Cmd/Ctrl+Enter to send
- Shift+Enter for new line
- Show character count if approaching limit
- Disable during streaming

#### Code Block Rendering

**Structure**
```
┌─────────────────────────────────────┐
│ typescript                   [Copy] │ ← Header
├─────────────────────────────────────┤
│ import React from 'react'           │
│                                     │ ← Code content
│ const App = () => {                 │
│   return <div>Hello</div>           │
│ }                                   │
└─────────────────────────────────────┘
```

**Styles**
- Background: `surface` (light) / `#18181B` (dark)
- Border: 1px solid `border.subtle`
- Border radius: 12px
- Padding: 16px
- Font: SF Mono, 13px
- Line height: 1.6
- Horizontal scroll for long lines

**Header**
- Height: 32px
- Padding: 8px 12px
- Background: Slightly darker than code background
- Border bottom: 1px solid `border.subtle`
- Language label: 11px uppercase, `text.tertiary`, letter-spacing wide
- Copy button: 28x28px, icon 14px, right-aligned

**Syntax Highlighting**
- Library: Shiki
- Light theme: `github-light`
- Dark theme: `github-dark`
- Match application theme automatically

**Copy Button**
- Default: Copy icon, `text.secondary`
- Hover: `text.primary`, `surfaceHover` background
- Clicked: Check icon for 2s, show "Copied!" tooltip
- Animation: Icon swap with fade (150ms)

#### Empty State

**Chat Empty State**

```
┌─────────────────────────────────────┐
│                                     │
│           [Large Icon]              │
│                                     │
│     Start a conversation            │
│                                     │
│  Try asking:                        │
│  • "How do I implement auth?"       │
│  • "Explain React hooks"            │
│  • "Write a sorting algorithm"      │
│                                     │
└─────────────────────────────────────┘
```

**Styles**
- Centered vertically and horizontally
- Icon: 48px, `text.tertiary`
- Heading: 20px semibold, `text.primary`
- Suggestions: 15px regular, `text.secondary`
- Suggestion items: Clickable, hover `primary`
- Spacing: 24px between sections

**Animation**
```typescript
<motion.div
  variants={motionVariants.fadeIn}
  initial="initial"
  animate="animate"
  transition={{ duration: 0.3 }}
/>
```

### Markdown Rendering

#### Supported Elements

**Headings**
- H1: 32px bold, margin 24px top, 16px bottom
- H2: 24px semibold, margin 20px top, 12px bottom
- H3: 20px semibold, margin 16px top, 8px bottom
- H4-H6: 17px medium, margin 12px top, 8px bottom
- Color: `text.primary`

**Paragraphs**
- Font: 15px regular
- Line height: 1.6
- Margin: 12px bottom
- Color: `text.primary`

**Lists**
- Unordered: Disc bullets, 24px left padding
- Ordered: Decimal numbers, 24px left padding
- Nested: Support up to 3 levels
- Item spacing: 8px between items
- Font: 15px regular

**Blockquotes**
- Left border: 2px solid `primary`
- Padding: 12px 16px
- Background: `surface`
- Font: 15px regular, italic
- Color: `text.secondary`
- Margin: 16px vertical

**Inline Code**
- Background: `surface`
- Padding: 2px 6px
- Border radius: 4px
- Font: SF Mono, 13px
- Color: `text.primary`

**Links**
- Color: `primary`
- Underline: None by default
- Hover: Underline, slightly darker
- Visited: Same as default (no distinction)
- External: Show external link icon (12px) after text

**Tables**
- Border: 1px solid `border.subtle`
- Header background: `surface`
- Header font: 13px semibold
- Cell padding: 12px
- Row hover: `surfaceHover`
- Alignment: Respect markdown alignment (left, center, right)

**Horizontal Rule**
- Height: 1px
- Background: `border.subtle`
- Margin: 24px vertical

#### Math Rendering (KaTeX)

**Inline Math**
- Render inline with text
- Font size: Match surrounding text
- Color: `text.primary`

**Block Math**
- Display: Block, centered
- Padding: 16px
- Background: `surface`
- Border radius: 12px
- Margin: 16px vertical
- Scrollable horizontally if needed

#### Mermaid Diagrams

**Rendering**
- Display: Block, centered
- Background: `surface`
- Padding: 24px
- Border radius: 12px
- Margin: 16px vertical
- Theme: Match application theme (light/dark)
- Interactive: Allow zoom and pan

---

## State Management

### Store Architecture

Use Zustand with separate stores for logical separation.

#### UI Store

```typescript
interface UIState {
  // Sidebar
  sidebarView: 'agents' | 'chats'
  sidebarCollapsed: boolean
  sidebarOpen: boolean // mobile only
  
  // Theme
  theme: 'light' | 'dark'
  
  // Modals
  activeModal: string | null
  
  // Actions
  setSidebarView: (view: 'agents' | 'chats') => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  openModal: (modalId: string) => void
  closeModal: () => void
}

const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarView: 'agents',
      sidebarCollapsed: false,
      sidebarOpen: false,
      theme: 'light',
      activeModal: null,
      
      setSidebarView: (view) => set({ sidebarView: view }),
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      setTheme: (theme) => set({ theme }),
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarView: state.sidebarView,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)
```

#### Agent Store

```typescript
interface Agent {
  id: string
  name: string
  description: string
  systemPrompt: string
  modelId: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

interface AgentState {
  agents: Agent[]
  activeAgentId: string | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchAgents: () => Promise<void>
  createAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>
  deleteAgent: (id: string) => Promise<void>
  setActiveAgent: (id: string) => void
}

const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  activeAgentId: null,
  loading: false,
  error: null,
  
  fetchAgents: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('http://localhost:8080/v1/agents')
      const agents = await response.json()
      set({ agents, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  createAgent: async (agent) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('http://localhost:8080/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent),
      })
      const newAgent = await response.json()
      set((state) => ({ 
        agents: [...state.agents, newAgent],
        loading: false,
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  updateAgent: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`http://localhost:8080/v1/agents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const updatedAgent = await response.json()
      set((state) => ({
        agents: state.agents.map((a) => a.id === id ? updatedAgent : a),
        loading: false,
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  deleteAgent: async (id) => {
    set({ loading: true, error: null })
    try {
      await fetch(`http://localhost:8080/v1/agents/${id}`, {
        method: 'DELETE',
      })
      set((state) => ({
        agents: state.agents.filter((a) => a.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  setActiveAgent: (id) => set({ activeAgentId: id }),
}))
```


#### Session Store

```typescript
interface Session {
  id: string
  agentId: string
  agentName: string
  title: string
  lastMessage: string
  lastActivity: Date
  createdAt: Date
}

interface SessionState {
  sessions: Session[]
  activeSessionId: string | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchSessions: () => Promise<void>
  createSession: (agentId: string) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  setActiveSession: (id: string) => void
}

const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  activeSessionId: null,
  loading: false,
  error: null,
  
  fetchSessions: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('http://localhost:8080/v1/sessions')
      const sessions = await response.json()
      set({ sessions, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  createSession: async (agentId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('http://localhost:8080/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      })
      const newSession = await response.json()
      set((state) => ({
        sessions: [newSession, ...state.sessions],
        activeSessionId: newSession.id,
        loading: false,
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  deleteSession: async (id) => {
    set({ loading: true, error: null })
    try {
      await fetch(`http://localhost:8080/v1/sessions/${id}`, {
        method: 'DELETE',
      })
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  setActiveSession: (id) => set({ activeSessionId: id }),
}))
```

#### Chat Store

```typescript
interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
  status: 'sending' | 'sent' | 'error'
}

interface ChatState {
  messages: Record<string, Message[]> // sessionId -> messages
  streamingMessage: string | null
  isStreaming: boolean
  error: string | null
  
  // Actions
  fetchMessages: (sessionId: string) => Promise<void>
  sendMessage: (sessionId: string, content: string) => Promise<void>
  stopStreaming: () => void
  clearMessages: (sessionId: string) => void
}

const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  streamingMessage: null,
  isStreaming: false,
  error: null,
  
  fetchMessages: async (sessionId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/v1/sessions/${sessionId}/messages`
      )
      const messages = await response.json()
      set((state) => ({
        messages: { ...state.messages, [sessionId]: messages },
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },
  
  sendMessage: async (sessionId, content) => {
    // Add user message optimistically
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
    }
    
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: [...(state.messages[sessionId] || []), userMessage],
      },
      isStreaming: true,
      streamingMessage: '',
    }))
    
    try {
      // Establish SSE connection
      const eventSource = new EventSource(
        `http://localhost:8080/v1/sessions/${sessionId}/chat?message=${encodeURIComponent(content)}`
      )
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'text_delta') {
          set((state) => ({
            streamingMessage: (state.streamingMessage || '') + data.content,
          }))
        } else if (data.type === 'done') {
          // Add complete agent message
          const agentMessage: Message = {
            id: crypto.randomUUID(),
            role: 'agent',
            content: get().streamingMessage || '',
            timestamp: new Date(),
            status: 'sent',
          }
          
          set((state) => ({
            messages: {
              ...state.messages,
              [sessionId]: [...state.messages[sessionId], agentMessage],
            },
            streamingMessage: null,
            isStreaming: false,
          }))
          
          eventSource.close()
        }
      }
      
      eventSource.onerror = () => {
        set({ error: 'Connection lost', isStreaming: false })
        eventSource.close()
      }
      
      // Mark user message as sent
      set((state) => ({
        messages: {
          ...state.messages,
          [sessionId]: state.messages[sessionId].map((m) =>
            m.id === userMessage.id ? { ...m, status: 'sent' } : m
          ),
        },
      }))
    } catch (error) {
      set({ error: error.message, isStreaming: false })
    }
  },
  
  stopStreaming: () => {
    // Implementation to cancel SSE connection
    set({ isStreaming: false, streamingMessage: null })
  },
  
  clearMessages: (sessionId) => {
    set((state) => ({
      messages: { ...state.messages, [sessionId]: [] },
    }))
  },
}))
```

### Optimistic Updates

For better perceived performance, implement optimistic updates:

1. **Creating Agent**: Add to list immediately, show loading state on card
2. **Deleting Agent**: Remove from list immediately, revert if API fails
3. **Sending Message**: Add user message immediately, show sending status
4. **Creating Session**: Add to list immediately, navigate to it

### Error Recovery

When optimistic updates fail:
1. Show toast notification with error message
2. Revert UI state to previous state
3. Provide retry action in toast
4. Log error for debugging

---

## Custom Hooks

### useKeyboardShortcuts

```typescript
interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  callback: () => void
}

function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrlKey, shiftKey, callback }) => {
        const isCtrlMatch = ctrlKey ? event.ctrlKey || event.metaKey : true
        const isShiftMatch = shiftKey ? event.shiftKey : true
        
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          isCtrlMatch &&
          isShiftMatch
        ) {
          event.preventDefault()
          callback()
        }
      })
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Usage
useKeyboardShortcuts([
  { key: 'k', ctrlKey: true, callback: () => focusSearch() },
  { key: 'n', ctrlKey: true, callback: () => createNewChat() },
  { key: 'Enter', ctrlKey: true, callback: () => sendMessage() },
  { key: 'Escape', callback: () => closeModal() },
])
```

### useTheme

```typescript
function useTheme() {
  const { theme, setTheme } = useUIStore()
  
  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'light' ? '#FFFFFF' : '#09090B'
      )
    }
  }, [theme])
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }
  
  return { theme, setTheme, toggleTheme }
}
```

### useMediaQuery

```typescript
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [query])
  
  return matches
}

// Usage
const isMobile = useMediaQuery('(max-width: 768px)')
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
```

### useAutoScroll

```typescript
function useAutoScroll(
  containerRef: RefObject<HTMLElement>,
  dependencies: any[]
) {
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  
  useEffect(() => {
    const container = containerRef.current
    if (!container || isUserScrolling) return
    
    // Auto-scroll to bottom
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, dependencies)
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100
      setIsUserScrolling(!isAtBottom)
    }
    
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])
  
  return { isUserScrolling }
}
```

### useDebounce

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

// Usage for search
const [searchQuery, setSearchQuery] = useState('')
const debouncedQuery = useDebounce(searchQuery, 300)

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery)
  }
}, [debouncedQuery])
```


---

## API Integration

### API Client

```typescript
class APIClient {
  private baseURL = 'http://localhost:8080'
  private defaultTimeout = 10000
  
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.defaultTimeout)
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }
  
  // Agent endpoints
  async getAgents() {
    return this.request<Agent[]>('/v1/agents')
  }
  
  async createAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request<Agent>('/v1/agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    })
  }
  
  async updateAgent(id: string, updates: Partial<Agent>) {
    return this.request<Agent>(`/v1/agents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }
  
  async deleteAgent(id: string) {
    return this.request<void>(`/v1/agents/${id}`, {
      method: 'DELETE',
    })
  }
  
  // Session endpoints
  async getSessions() {
    return this.request<Session[]>('/v1/sessions')
  }
  
  async createSession(agentId: string) {
    return this.request<Session>('/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    })
  }
  
  async deleteSession(id: string) {
    return this.request<void>(`/v1/sessions/${id}`, {
      method: 'DELETE',
    })
  }
  
  // Message endpoints
  async getMessages(sessionId: string) {
    return this.request<Message[]>(`/v1/sessions/${sessionId}/messages`)
  }
  
  // SSE for streaming
  createChatStream(sessionId: string, message: string): EventSource {
    const url = `${this.baseURL}/v1/sessions/${sessionId}/chat?message=${encodeURIComponent(message)}`
    return new EventSource(url)
  }
}

export const apiClient = new APIClient()
```

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw lastError
}

// Usage
const agents = await withRetry(() => apiClient.getAgents())
```

### Error Handling

```typescript
function handleAPIError(error: Error): string {
  if (error.message.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }
  
  if (error.message.includes('HTTP 401')) {
    return 'Unauthorized. Please log in again.'
  }
  
  if (error.message.includes('HTTP 404')) {
    return 'Resource not found.'
  }
  
  if (error.message.includes('HTTP 500')) {
    return 'Server error. Please try again later.'
  }
  
  if (error.message.includes('Failed to fetch')) {
    return 'Cannot connect to server. Please check your connection.'
  }
  
  return 'An unexpected error occurred. Please try again.'
}
```

---

## Accessibility Implementation

### Focus Management

```typescript
// Focus trap for modals
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isActive) return
    
    const container = containerRef.current
    if (!container) return
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    container.addEventListener('keydown', handleTab)
    firstElement?.focus()
    
    return () => container.removeEventListener('keydown', handleTab)
  }, [isActive])
  
  return containerRef
}
```

### ARIA Live Regions

```typescript
// Announce dynamic content to screen readers
function LiveRegion({ message, priority = 'polite' }: {
  message: string
  priority?: 'polite' | 'assertive'
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Usage
{isStreaming && <LiveRegion message="Agent is typing" />}
{messageSent && <LiveRegion message="Message sent" />}
```

### Skip Links

```typescript
function SkipLinks() {
  return (
    <div className="sr-only focus:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>
      <a
        href="#sidebar"
        className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-md"
      >
        Skip to navigation
      </a>
    </div>
  )
}
```

### Reduced Motion

```typescript
// Respect prefers-reduced-motion
function useReducedMotion() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  
  return {
    transition: prefersReducedMotion
      ? { duration: 0 }
      : springPresets.default,
    shouldAnimate: !prefersReducedMotion,
  }
}

// Usage
const { transition, shouldAnimate } = useReducedMotion()

<motion.div
  animate={shouldAnimate ? { opacity: 1 } : undefined}
  transition={transition}
/>
```

---

## Performance Optimizations

### Code Splitting

```typescript
// Lazy load heavy components
const MarkdownRenderer = lazy(() => import('./components/MarkdownRenderer'))
const CodeBlock = lazy(() => import('./components/CodeBlock'))
const MermaidDiagram = lazy(() => import('./components/MermaidDiagram'))

// Usage with Suspense
<Suspense fallback={<Skeleton />}>
  <MarkdownRenderer content={message.content} />
</Suspense>
```

### Virtual Scrolling

```typescript
// For long message lists (100+ messages)
import { useVirtualizer } from '@tanstack/react-virtual'

function MessageList({ messages }: { messages: Message[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated message height
    overscan: 5, // Render 5 extra items above/below viewport
  })
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <Message message={messages[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Memoization

```typescript
// Memoize expensive components
const Message = memo(({ message }: { message: Message }) => {
  return (
    <div className="message">
      <Avatar name={message.role} />
      <MarkdownRenderer content={message.content} />
    </div>
  )
}, (prev, next) => {
  // Custom comparison
  return prev.message.id === next.message.id &&
         prev.message.content === next.message.content
})

// Memoize expensive calculations
const sortedSessions = useMemo(() => {
  return sessions.sort((a, b) => 
    b.lastActivity.getTime() - a.lastActivity.getTime()
  )
}, [sessions])
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={agent.avatar}
  alt={agent.name}
  width={40}
  height={40}
  className="rounded-full"
  loading="lazy"
  placeholder="blur"
/>
```

---

## Testing Strategy

### Component Tests

```typescript
// Example: Button component test
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('should call onClick when clicked', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
  
  it('should be disabled when loading', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
  
  it('should show spinner when loading', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })
})
```

### Integration Tests

```typescript
// Example: Chat flow test
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInterface } from './ChatInterface'

describe('ChatInterface', () => {
  it('should send message and display response', async () => {
    const user = userEvent.setup()
    render(<ChatInterface sessionId="test-session" />)
    
    // Type message
    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Hello, agent!')
    
    // Send message
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)
    
    // User message should appear
    expect(screen.getByText('Hello, agent!')).toBeInTheDocument()
    
    // Wait for agent response
    await waitFor(() => {
      expect(screen.getByText(/agent response/i)).toBeInTheDocument()
    })
  })
})
```

### E2E Tests (Playwright)

```typescript
// Example: Create agent flow
import { test, expect } from '@playwright/test'

test('should create new agent', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Open sidebar
  await page.click('[aria-label="Open sidebar"]')
  
  // Switch to agents view
  await page.click('text=My Agents')
  
  // Click new agent button
  await page.click('text=New Agent')
  
  // Fill form
  await page.fill('[name="name"]', 'Test Agent')
  await page.fill('[name="description"]', 'A test agent')
  await page.fill('[name="systemPrompt"]', 'You are a helpful assistant')
  await page.selectOption('[name="modelId"]', 'gpt-4')
  
  // Submit
  await page.click('text=Create Agent')
  
  // Verify agent appears in list
  await expect(page.locator('text=Test Agent')).toBeVisible()
})
```

### Accessibility Tests

```typescript
// Example: Accessibility audit
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from './Button'

expect.extend(toHaveNoViolations)

describe('Button accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

---

## File Structure

```
agent-console/
├── app/
│   ├── layout.tsx                 # Root layout with theme provider
│   ├── page.tsx                   # Home page (redirects to chat)
│   ├── chat/
│   │   └── [sessionId]/
│   │       └── page.tsx           # Chat page
│   └── globals.css                # Global styles, Tailwind imports
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Avatar.tsx
│   │   └── Icon.tsx
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── SidebarToggle.tsx
│   │   ├── AgentCard.tsx
│   │   ├── SessionItem.tsx
│   │   └── ThemeToggle.tsx
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   ├── Message.tsx
│   │   ├── MessageInput.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── EmptyState.tsx
│   └── markdown/
│       ├── MarkdownRenderer.tsx
│       ├── CodeBlock.tsx
│       ├── MermaidDiagram.tsx
│       └── MathRenderer.tsx
├── lib/
│   ├── api/
│   │   └── client.ts              # API client
│   ├── stores/
│   │   ├── uiStore.ts
│   │   ├── agentStore.ts
│   │   ├── sessionStore.ts
│   │   └── chatStore.ts
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useTheme.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useAutoScroll.ts
│   │   └── useDebounce.ts
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── truncate.ts
│   │   └── cn.ts                  # classnames utility
│   └── constants/
│       ├── theme.ts               # Design tokens
│       ├── animations.ts          # Motion variants
│       └── breakpoints.ts
├── types/
│   ├── agent.ts
│   ├── session.ts
│   ├── message.ts
│   └── api.ts
└── public/
    └── icons/                     # Static icons if needed
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up design tokens (colors, typography, spacing)
- Implement theme system with next-themes
- Create base components (Button, Input, Card, Modal)
- Set up Framer Motion with motion variants
- Configure Tailwind with custom theme

### Phase 2: Layout & Navigation (Week 2)
- Implement sidebar with toggle functionality
- Create agent cards and session items
- Add mobile responsive behavior
- Implement keyboard shortcuts
- Add theme toggle

### Phase 3: Chat Interface (Week 3)
- Build message list with virtual scrolling
- Implement message input with auto-resize
- Add typing indicator
- Create empty states
- Implement auto-scroll behavior

### Phase 4: Markdown & Rich Content (Week 4)
- Integrate Shiki for syntax highlighting
- Add KaTeX for math rendering
- Implement Mermaid diagrams
- Create code block with copy functionality
- Style all markdown elements

### Phase 5: State Management & API (Week 5)
- Set up Zustand stores
- Implement API client
- Add SSE for message streaming
- Implement optimistic updates
- Add error handling and retry logic

### Phase 6: Polish & Animations (Week 6)
- Add all Framer Motion animations
- Implement scroll-triggered effects
- Add micro-interactions
- Optimize performance
- Test reduced motion support

### Phase 7: Testing & Accessibility (Week 7)
- Write component tests
- Add integration tests
- Create E2E tests with Playwright
- Run accessibility audits
- Fix any issues

### Phase 8: Final Polish (Week 8)
- Performance optimization
- Cross-browser testing
- Mobile device testing
- Documentation
- Deployment preparation

---

## Additional Micro-Interactions & Enhancements

### Enhanced Skeleton Loading

**Shimmer Effect**
- Use wave shimmer animation (not pulse or fade)
- Direction: Left to right
- Duration: 1.5s
- Easing: Linear
- Color: Gradient from `surface` to `surfaceHover` to `surface`

```typescript
<motion.div
  className="skeleton"
  animate={{
    backgroundPosition: ['200% 0', '-200% 0'],
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  }}
  style={{
    background: `linear-gradient(
      90deg,
      ${theme.surface} 0%,
      ${theme.surfaceHover} 50%,
      ${theme.surface} 100%
    )`,
    backgroundSize: '200% 100%',
  }}
/>
```

**Skeleton Shapes**
- Agent card: Avatar circle + 2 text lines
- Session item: Avatar circle + 2 text lines + timestamp
- Message: Avatar circle + 3-5 text lines (varying widths)
- Planning card: Title line + progress bar + 3-4 task lines

### Message Bubble Animations

**Entry Animation**
```typescript
// User message: Slide up from bottom
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    type: 'spring',
    stiffness: 400,
    damping: 30,
  }}
>
  {/* User message content */}
</motion.div>

// Agent message: Slide up with slight delay
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    type: 'spring',
    stiffness: 400,
    damping: 30,
    delay: 0.1,
  }}
>
  {/* Agent message content */}
</motion.div>
```

**Streaming Message Cursor**
```typescript
// Blinking cursor at end of streaming text
<motion.span
  animate={{ opacity: [1, 0, 1] }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  }}
  style={{
    display: 'inline-block',
    width: '2px',
    height: '1em',
    background: 'currentColor',
    marginLeft: '2px',
  }}
/>
```

**Message Action Buttons**
```typescript
// Fade in on message hover
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.15 }}
  style={{
    position: 'absolute',
    top: '8px',
    right: '8px',
    display: 'flex',
    gap: '4px',
  }}
>
  <IconButton icon={<Copy />} />
  <IconButton icon={<RotateCcw />} />
  <IconButton icon={<Trash2 />} />
</motion.div>
```

### Button Micro-Interactions

**Squash & Stretch**
```typescript
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ 
    scale: 0.98,
    scaleY: 0.95, // Slight squash
  }}
  transition={{
    type: 'spring',
    stiffness: 400,
    damping: 20,
  }}
>
  {children}
</motion.button>
```

**Loading State**
```typescript
// Spinner with fade transition
<AnimatePresence mode="wait">
  {loading ? (
    <motion.div
      key="spinner"
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: 1, rotate: 360 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.2 },
        rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
      }}
    >
      <Loader2 size={16} />
    </motion.div>
  ) : (
    <motion.span
      key="text"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  )}
</AnimatePresence>
```

### Input Focus Animations

**Focus Ring Expansion**
```typescript
<motion.div
  animate={{
    boxShadow: isFocused
      ? `0 0 0 3px ${theme.primaryLight}`
      : '0 0 0 0px transparent',
  }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  <input {...props} />
</motion.div>
```

**Label Float**
```typescript
// Floating label animation
<motion.label
  animate={{
    y: isFocused || hasValue ? -20 : 0,
    scale: isFocused || hasValue ? 0.85 : 1,
    color: isFocused ? theme.primary : theme.text.secondary,
  }}
  transition={springPresets.snappy}
  style={{
    position: 'absolute',
    left: '12px',
    transformOrigin: 'left top',
  }}
>
  {label}
</motion.label>
```

### Toast Notifications

**Stack Animation**
```typescript
// Toasts stack with stagger
<AnimatePresence>
  {toasts.map((toast, index) => (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ 
        opacity: 1, 
        y: index * 72, // Stack vertically
        x: 0,
      }}
      exit={{ opacity: 0, x: 20 }}
      transition={springPresets.default}
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
      }}
    >
      <Toast {...toast} />
    </motion.div>
  ))}
</AnimatePresence>
```

**Progress Bar (Auto-Dismiss)**
```typescript
// Shrinking progress bar
<motion.div
  initial={{ scaleX: 1 }}
  animate={{ scaleX: 0 }}
  transition={{
    duration: duration / 1000,
    ease: 'linear',
  }}
  style={{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: theme.primary,
    transformOrigin: 'left',
  }}
/>
```

### Modal Animations

**Backdrop Blur**
```typescript
<motion.div
  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
  animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
  transition={{ duration: 0.2 }}
  style={{
    position: 'fixed',
    inset: 0,
    background: theme.overlay,
  }}
/>
```

**Modal Scale & Fade**
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 20 }}
  transition={{
    type: 'spring',
    stiffness: 400,
    damping: 30,
  }}
>
  {/* Modal content */}
</motion.div>
```

### Sidebar Animations

**Mobile Slide-In**
```typescript
<motion.div
  initial={{ x: -280 }}
  animate={{ x: 0 }}
  exit={{ x: -280 }}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 30,
  }}
  style={{
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: '280px',
  }}
>
  {/* Sidebar content */}
</motion.div>
```

**View Switching Crossfade**
```typescript
<AnimatePresence mode="wait">
  {sidebarView === 'agents' ? (
    <motion.div
      key="agents"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.25 }}
    >
      <AgentList />
    </motion.div>
  ) : (
    <motion.div
      key="chats"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.25 }}
    >
      <SessionList />
    </motion.div>
  )}
</AnimatePresence>
```

### Theme Toggle Animation

**Icon Morph**
```typescript
<AnimatePresence mode="wait">
  {theme === 'light' ? (
    <motion.div
      key="sun"
      initial={{ rotate: -90, scale: 0 }}
      animate={{ rotate: 0, scale: 1 }}
      exit={{ rotate: 90, scale: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Sun size={20} />
    </motion.div>
  ) : (
    <motion.div
      key="moon"
      initial={{ rotate: 90, scale: 0 }}
      animate={{ rotate: 0, scale: 1 }}
      exit={{ rotate: -90, scale: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Moon size={20} />
    </motion.div>
  )}
</AnimatePresence>
```

**Color Transition**
```typescript
// Smooth color interpolation across entire app
<motion.div
  animate={{
    backgroundColor: theme === 'light' ? '#FFFFFF' : '#09090B',
    color: theme === 'light' ? '#1C1917' : '#FAFAFA',
  }}
  transition={{ duration: 0.3, ease: 'easeInOut' }}
>
  {/* App content */}
</motion.div>
```

### Scroll-Triggered Animations

**Fade In on Scroll**
```typescript
import { useInView } from 'framer-motion'

function AnimatedSection({ children }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  )
}
```

### Drag & Drop (Future Enhancement)

**Task Reordering**
```typescript
import { Reorder } from 'framer-motion'

<Reorder.Group values={tasks} onReorder={setTasks}>
  {tasks.map((task) => (
    <Reorder.Item
      key={task.id}
      value={task}
      whileDrag={{ 
        scale: 1.05,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        cursor: 'grabbing',
      }}
      transition={springPresets.default}
    >
      <TaskRow task={task} />
    </Reorder.Item>
  ))}
</Reorder.Group>
```

### Copy Feedback Animation

**Success Checkmark**
```typescript
const [copied, setCopied] = useState(false)

const handleCopy = async () => {
  await navigator.clipboard.writeText(content)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

<motion.button
  onClick={handleCopy}
  whileTap={{ scale: 0.95 }}
>
  <AnimatePresence mode="wait">
    {copied ? (
      <motion.div
        key="check"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 20,
        }}
      >
        <Check size={16} />
      </motion.div>
    ) : (
      <motion.div
        key="copy"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        <Copy size={16} />
      </motion.div>
    )}
  </AnimatePresence>
</motion.button>
```

### Empty State Animations

**Illustration Fade-In**
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    duration: 0.4,
    ease: 'easeOut',
  }}
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
  }}
>
  <motion.div
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <Icon size={64} />
  </motion.div>
  <h3>No messages yet</h3>
  <p>Start a conversation to get started</p>
</motion.div>
```

### Performance Optimizations

**Layout Animations**
```typescript
// Use layout prop for automatic layout transitions
<motion.div layout>
  {items.map(item => (
    <motion.div key={item.id} layout>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**Reduced Motion Support**
```typescript
import { useReducedMotion } from 'framer-motion'

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : springPresets.default}
    >
      {children}
    </motion.div>
  )
}
```

---

## Session Hierarchy Design (REQ-29)

### Overview

Session hierarchy enables orchestrator agents to spawn child sessions with different agents, creating multi-agent workflows. The design uses "Nested Cards with Depth Indicators" for clarity and spatial understanding.

### Visual Structure

**Depth Indicators**
- Depth 0 (root): No left indicator
- Depth 1: 2px amber left border
- Depth 2: 4px amber left border  
- Depth 3+: 6px amber left border (max visual weight)

**Session Card Layout**
```
┌─────────────────────────────────────┐
│ ║ Orchestrator Session               │ ← 2px amber indicator
│ ║ GPT-4 • 2 children • 5m ago        │
│ ║                                    │
│ ║   ┌─────────────────────────────┐  │
│ ║   │ ║║ Research Agent           │  │ ← 4px amber indicator
│ ║   │ ║║ Claude • Active • 2m ago │  │
│ ║   └─────────────────────────────┘  │
│ ║                                    │
│ ║   ┌─────────────────────────────┐  │
│ ║   │ ║║ Writing Agent            │  │
│ ║   │ ║║ GPT-4 • Idle • 3m ago    │  │
│ ║   └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Session Card Component

```typescript
interface SessionCardProps {
  session: Session
  depth: number
  isActive: boolean
  isWorking: boolean
  hasChildren: boolean
  childCount: number
  onExpand: () => void
}

interface Session {
  id: string
  agentId: string
  agentName: string
  rootSessionId: string
  parentSessionId?: string
  depth: number
  spawnedByAgentId?: string
  lastActivity: Date
  hasChildren?: boolean
  children?: Session[]
}
```

**Styles**
- Padding: 12px
- Border radius: 12px
- Background: Transparent (default), `surfaceHover` (hover), `surface` (active)
- Left border: Width based on depth (0px, 2px, 4px, 6px), color `primary`
- Margin left: 16px per depth level (indentation)
- Gap: 8px between child sessions

**Content Structure**
- Agent name: 15px semibold, `text.primary`
- Metadata row: 13px regular, `text.secondary`
  - Agent model name
  - Child count badge (if has children)
  - Relative timestamp
  - Working indicator (pulsing dot if active)
- Expand chevron: 16px icon, rotates 90° when expanded

### Expand/Collapse Animation

```typescript
// Parent session with children
<motion.div layout>
  <SessionHeader onClick={toggleExpand}>
    <motion.div
      animate={{ rotate: isExpanded ? 90 : 0 }}
      transition={springPresets.snappy}
    >
      <ChevronRight />
    </motion.div>
    {/* Session info */}
  </SessionHeader>
  
  <AnimatePresence>
    {isExpanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={springPresets.gentle}
      >
        {children.map((child, index) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              ...springPresets.default,
              delay: index * 0.05, // 50ms stagger
            }}
          >
            <SessionCard session={child} depth={depth + 1} />
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

### Child Count Badge

**Appearance**
- Size: 20px height, auto width
- Padding: 4px 6px
- Border radius: 10px (pill shape)
- Background: `primaryLight`
- Text: 11px semibold, `primary`
- Position: Inline with metadata

**New Child Spawn Animation**
```typescript
// When new child spawns via SSE
<motion.span
  key={childCount}
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ 
    scale: [0.8, 1.2, 1],
    opacity: 1,
  }}
  transition={{
    duration: 0.4,
    times: [0, 0.6, 1],
    ease: 'easeOut',
  }}
>
  {childCount}
</motion.span>

// Pulse animation for 3-4 seconds
<motion.div
  animate={{
    boxShadow: [
      '0 0 0 0 rgba(245, 158, 11, 0.4)',
      '0 0 0 8px rgba(245, 158, 11, 0)',
    ],
  }}
  transition={{
    duration: 1.5,
    repeat: 2,
    ease: 'easeOut',
  }}
/>
```

### Working Indicator

**Pulsing Dot**
- Size: 6px diameter
- Color: `#60A5FA` (blue)
- Position: Inline before timestamp
- Animation: Breathing pulse

```typescript
<motion.div
  className="working-dot"
  animate={{
    scale: [1, 1.3, 1],
    opacity: [0.6, 1, 0.6],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

### Currently Viewed Session

**Visual Treatment**
- Left border: 2px `primary` (in addition to depth indicator)
- Background: `surface` with subtle elevation
- Shadow: `shadows.sm`
- All other sessions: Transparent background

### Chat View Tabs Design

**Tab Container**
- Position: Below chat header, above message list
- Height: 44px
- Background: `surface`
- Border bottom: 1px solid `border.subtle`
- Overflow: Horizontal scroll with hidden scrollbar
- Padding: 0 16px

**Tab Structure**
```
┌─────────────────────────────────────────────────┐
│ [Overview] [Orchestrator] [Research] [Writing]  │ ← Scrollable
│ ━━━━━━━━━                                       │ ← Active indicator
└─────────────────────────────────────────────────┘
```

**Individual Tab**
- Height: 44px
- Padding: 0 16px
- Border radius: 8px (top only)
- Font: 13px medium
- Color: `text.secondary` (inactive), `text.primary` (active)
- Background: Transparent (inactive), `background` (active)
- Gap: 4px between tabs
- Working indicator: 6px pulsing dot (if session is streaming)
- Close button: 16px X icon, appears on hover (except Overview tab)

**Active Tab Indicator**
- Position: Bottom of tab
- Height: 2px
- Width: 100% of tab width
- Color: `primary`
- Animation: Morphing underline that slides between tabs

```typescript
<motion.div
  className="tab-indicator"
  layoutId="activeTab"
  style={{
    position: 'absolute',
    bottom: 0,
    height: '2px',
    background: theme.primary,
  }}
  transition={springPresets.snappy}
/>
```

**Scroll Behavior**
- Auto-scroll to show newly selected tab
- Smooth scroll with easing
- Gradient fade at edges when scrollable (left/right)
- Scroll arrows appear on hover at edges

```typescript
// Gradient fade overlay
<div className="scroll-fade-left" style={{
  position: 'absolute',
  left: 0,
  width: '32px',
  height: '100%',
  background: 'linear-gradient(to right, surface, transparent)',
  pointerEvents: 'none',
  opacity: canScrollLeft ? 1 : 0,
  transition: 'opacity 0.2s',
}} />
```

**Tab Animations**
```typescript
// Tab entry animation
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={springPresets.default}
>
  {/* Tab content */}
</motion.div>

// Close button animation
<motion.button
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
>
  <X size={16} />
</motion.button>
```

### Overview Tab Behavior

**Message Attribution**
- Each message shows agent name and avatar
- Agent name: 13px medium, `text.secondary`, above message content
- Messages from different agents have subtle visual separation
- Chronological order across all sessions in the graph

**Agent Transition Indicator**
```typescript
// When agent switches mid-conversation
<motion.div
  className="agent-transition"
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  style={{
    padding: '8px 16px',
    background: 'surfaceHover',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'text.tertiary',
    textAlign: 'center',
    margin: '16px 0',
  }}
>
  <ArrowRight size={14} /> Switched to {newAgentName}
</motion.div>
```

---

## Planning Card Design (REQ-30)

### Overview

Planning cards display agent plans and tasks inline in the conversation. The design uses a document-style card with frosted glass effect, liquid progress visualization, and delightful animations.

### Card Structure

```typescript
interface PlanningCardProps {
  plan: Plan
  onTaskClick: (taskId: string) => void
}

interface Plan {
  planId: string
  title: string
  goal: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ABANDONED'
  result?: string
  tasks: Task[]
}

interface Task {
  taskId: string
  parentId?: string
  name: string
  goal: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ABANDONED'
  result?: string
}
```

### Visual Layout

```
┌──────────────────────────────────────────────────┐
│  Valiant King Story                [In Progress] │ ← Title + Status badge
│  Create a short story about a valiant king       │ ← Goal (muted)
│                                                  │
│  ●━━━━●━━━━○━━━━○━━━━○━━━━○  2/6 tasks         │ ← Liquid progress
│                                                  │
│  ✓  Protagonist Profile                          │ ← Task name
│     Create protagonist profile                   │ ← Goal (always visible)
│     [Click to view result]                       │ ← Result (if done)
│                                                  │
│  ⟳  Character Profiles        ← Active task     │
│     Define all character profiles                │
│     [Subtle left glow, breathing animation]      │
│                                                  │
│  ○  Theme                                        │
│     Determine the core theme                     │
│                                                  │
│  ○  Plot Outline                    [+]          │ ← Parent task
│     │                                            │
│     ├─ ○  Act 1                                 │ ← Children (collapsed)
│     ├─ ○  Act 2                                 │
│     └─ ○  Act 3                                 │
└──────────────────────────────────────────────────┘
```

### Card Container

**Styles**
- Max width: 100% of chat column
- Padding: 24px
- Border radius: 16px
- Background: `surface` with backdrop blur (12px)
- Border: 1px solid `border.subtle`
- Shadow: `shadows.md`
- Margin: 24px vertical (same as messages)

**Frosted Glass Effect**
```typescript
<motion.div
  style={{
    background: 'rgba(255, 255, 255, 0.8)', // light mode
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  }}
>
  {/* Card content */}
</motion.div>
```

### Plan Header

**Title**
- Font: 20px semibold
- Color: `text.primary`
- Line height: 1.3

**Goal**
- Font: 15px regular
- Color: `text.secondary`
- Line height: 1.5
- Margin top: 4px

**Status Badge**
- Position: Top-right, absolute
- Padding: 6px 12px
- Border radius: 12px
- Font: 11px semibold, uppercase, letter-spacing 0.05em
- Colors by status:
  - TODO: Grey background, grey text
  - IN_PROGRESS: Blue background, blue text
  - DONE: Green background, green text
  - ABANDONED: Amber background, amber text

### Liquid Progress Bar

**Structure**
- Height: 32px
- Margin: 20px vertical
- Display: Flex row with gap 8px between segments

**Progress Segment (Dot)**
- Size: 12px diameter
- Border radius: Full circle
- States:
  - Completed: Solid `success` color with glow
  - Active: Pulsing `primary` color with breathing animation
  - Todo: Outline only, `border.medium` color

**Connecting Line**
- Height: 2px
- Width: Flexible (fills space between dots)
- Background: Gradient from left dot color to right dot color
- Animation: Liquid flow effect when transitioning

```typescript
// Liquid progress animation
<motion.div className="progress-container">
  {tasks.map((task, index) => (
    <React.Fragment key={task.taskId}>
      {/* Dot */}
      <motion.div
        className="progress-dot"
        animate={{
          scale: task.status === 'IN_PROGRESS' ? [1, 1.2, 1] : 1,
          boxShadow: task.status === 'DONE' 
            ? '0 0 8px rgba(16, 185, 129, 0.6)'
            : 'none',
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: task.status === 'DONE' ? '#10B981' : 
                     task.status === 'IN_PROGRESS' ? '#F59E0B' : 
                     'transparent',
          border: task.status === 'TODO' ? '2px solid #D4D4D4' : 'none',
        }}
      />
      
      {/* Connecting line */}
      {index < tasks.length - 1 && (
        <motion.div
          className="progress-line"
          initial={{ scaleX: 0 }}
          animate={{ 
            scaleX: task.status === 'DONE' ? 1 : 0,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
          style={{
            flex: 1,
            height: '2px',
            background: 'linear-gradient(to right, #10B981, #D4D4D4)',
            transformOrigin: 'left',
          }}
        />
      )}
    </React.Fragment>
  ))}
</motion.div>

// Progress text
<div style={{
  fontSize: '13px',
  color: 'text.secondary',
  marginTop: '8px',
}}>
  {completedCount} / {totalCount} tasks
</div>
```

### Task Row Component

**Layout**
- Padding: 12px 16px
- Border radius: 8px
- Background: Transparent (default), `surfaceHover` (hover)
- Margin: 4px vertical
- Cursor: Pointer (if has result or description)

**Content Structure**
1. Status icon (left, 20px)
2. Task content (flex-grow)
   - Name: 15px semibold, `text.primary`
   - Goal: 13px regular, `text.secondary`, always visible
   - Description: 13px regular, `text.tertiary`, expandable
   - Result: 13px regular, `text.primary`, expandable (if done)
3. Expand chevron (right, 16px, if has children)

**Task States**

**TODO**
```typescript
<Circle size={20} color="text.tertiary" strokeWidth={2} />
```

**IN_PROGRESS**
```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'linear',
  }}
>
  <Loader2 size={20} color="primary" strokeWidth={2} />
</motion.div>

// Left border accent
<motion.div
  style={{
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
    background: 'primary',
    borderRadius: '0 4px 4px 0',
  }}
  animate={{
    opacity: [0.4, 1, 0.4],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

**DONE**
```typescript
// Checkmark with draw animation
<motion.svg width="20" height="20" viewBox="0 0 20 20">
  <motion.circle
    cx="10"
    cy="10"
    r="9"
    stroke="#10B981"
    strokeWidth="2"
    fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
  />
  <motion.path
    d="M6 10 L9 13 L14 7"
    stroke="#10B981"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
  />
</motion.svg>

// Strikethrough name
<span style={{
  textDecoration: 'line-through',
  opacity: 0.6,
}}>
  {task.name}
</span>
```

**ABANDONED**
```typescript
<AlertTriangle size={20} color="#F59E0B" strokeWidth={2} />
```

### Status Icon Morphing

**Circle → Spinner Transition**
```typescript
// When task starts
<motion.svg width="20" height="20" viewBox="0 0 20 20">
  <motion.circle
    cx="10"
    cy="10"
    r="9"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    animate={{
      strokeDasharray: ['0 100', '75 100'],
      rotate: [0, 360],
    }}
    transition={{
      strokeDasharray: { duration: 0.6, ease: 'easeInOut' },
      rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
    }}
  />
</motion.svg>
```

**Spinner → Checkmark Transition**
```typescript
// When task completes
<AnimatePresence mode="wait">
  {status === 'IN_PROGRESS' ? (
    <motion.div
      key="spinner"
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Loader2 />
    </motion.div>
  ) : (
    <motion.div
      key="checkmark"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 20,
      }}
    >
      {/* Checkmark SVG with draw animation */}
    </motion.div>
  )}
</AnimatePresence>
```

### Task Hierarchy (Parent/Child)

**Parent Task Indicator**
- Expand chevron: 16px, right-aligned
- Rotates 90° when expanded
- Child count badge: Small pill showing number of children

**Collapsed State**
```
○  Plot Outline                    [+3]
   Create the story outline
```

**Expanded State**
```
○  Plot Outline                    [−]
   Create the story outline
   │
   ├─ ○  Act 1
   │     First act of the story
   │
   ├─ ○  Act 2
   │     Second act of the story
   │
   └─ ○  Act 3
         Final act of the story
```

**Connector Lines**
- Width: 1px
- Color: `border.medium`
- Style: Solid vertical line with L-shaped branches
- Margin left: 10px from parent task icon

**Expand/Collapse Animation**
```typescript
<motion.div layout>
  <TaskRow onClick={toggleExpand}>
    <motion.div
      animate={{ rotate: isExpanded ? 90 : 0 }}
      transition={springPresets.snappy}
    >
      <ChevronRight />
    </motion.div>
    {/* Task content */}
  </TaskRow>
  
  <AnimatePresence>
    {isExpanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          bounce: 0.2,
        }}
      >
        {children.map((child, index) => (
          <motion.div
            key={child.taskId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 0.05,
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
          >
            <TaskRow task={child} depth={depth + 1} />
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

### Task Content Expansion

**Collapsed (Default)**
- Show: Name + Goal
- Hide: Description + Result

**Expanded (On Click)**
- Show: Name + Goal + Description (if exists) + Result (if done)
- Animation: Smooth height transition with fade-in

```typescript
<motion.div layout>
  <div onClick={() => setExpanded(!expanded)}>
    <h4>{task.name}</h4>
    <p className="goal">{task.goal}</p>
  </div>
  
  <AnimatePresence>
    {expanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={springPresets.gentle}
      >
        {task.description && (
          <p className="description">{task.description}</p>
        )}
        {task.result && (
          <div className="result">
            <strong>Result:</strong>
            <p>{task.result}</p>
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

### Real-Time Updates

**Task Status Change**
```typescript
// Animate status icon morph
<AnimatePresence mode="wait">
  <motion.div
    key={task.status}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {getStatusIcon(task.status)}
  </motion.div>
</AnimatePresence>

// Update progress bar
<motion.div
  animate={{
    scaleX: completedCount / totalCount,
  }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
/>
```

**New Task Added**
```typescript
<motion.div
  initial={{ opacity: 0, y: -10, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
    type: 'spring',
    stiffness: 400,
    damping: 25,
  }}
>
  <TaskRow task={newTask} />
</motion.div>
```

### Completion Celebration (Optional)

**All Tasks Complete**
```typescript
// Confetti burst (can be disabled in settings)
import confetti from 'canvas-confetti'

useEffect(() => {
  if (allTasksComplete && !celebrationShown) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#F59E0B', '#60A5FA'],
    })
    setCelebrationShown(true)
  }
}, [allTasksComplete])

// Status badge animation
<motion.div
  animate={{
    scale: [1, 1.1, 1],
  }}
  transition={{
    duration: 0.4,
    ease: 'easeOut',
  }}
>
  Completed
</motion.div>
```

---

## Enhanced Message Bubble Design

### Message Structure with Tails

**User Message Bubble**
```typescript
interface UserMessageProps {
  content: string
  timestamp: Date
  status: 'sending' | 'sent' | 'error'
  avatar?: string
}

function UserMessage({ content, timestamp, status, avatar }: UserMessageProps) {
  return (
    <motion.div
      className="user-message-container"
      initial={{ opacity: 0, y: 20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={springPresets.default}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '24px',
      }}
    >
      <div className="message-content-wrapper">
        {/* Message bubble with tail */}
        <div
          className="message-bubble user-bubble"
          style={{
            position: 'relative',
            maxWidth: '70%',
            padding: '12px 16px',
            background: theme.surface,
            borderLeft: `2px solid ${theme.primary}`,
            borderRadius: '12px',
          }}
        >
          {/* Subtle tail */}
          <svg
            className="message-tail"
            width="8"
            height="13"
            viewBox="0 0 8 13"
            style={{
              position: 'absolute',
              right: '-8px',
              bottom: '8px',
              fill: theme.surface,
            }}
          >
            <path d="M0 0 L8 6.5 L0 13 Z" />
          </svg>
          
          {/* Content */}
          <div className="message-text">{content}</div>
          
          {/* Timestamp */}
          <div
            className="message-timestamp"
            style={{
              fontSize: '11px',
              color: theme.text.tertiary,
              marginTop: '4px',
              textAlign: 'right',
            }}
          >
            {formatTime(timestamp)}
            {status === 'sending' && ' • Sending...'}
            {status === 'error' && ' • Failed'}
          </div>
        </div>
        
        {/* Avatar */}
        <Avatar
          src={avatar}
          name="You"
          size="sm"
          style={{ marginLeft: '8px' }}
        />
      </div>
    </motion.div>
  )
}
```

**Agent Message Bubble**
```typescript
function AgentMessage({ content, timestamp, agentName, avatar, isStreaming }: AgentMessageProps) {
  return (
    <motion.div
      className="agent-message-container"
      initial={{ opacity: 0, y: 20, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ ...springPresets.default, delay: 0.05 }}
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '24px',
      }}
    >
      <div className="message-content-wrapper">
        {/* Avatar */}
        <Avatar
          src={avatar}
          name={agentName}
          size="sm"
          variant="agent"
          style={{ marginRight: '8px' }}
        />
        
        {/* Message bubble with tail */}
        <div
          className="message-bubble agent-bubble"
          style={{
            position: 'relative',
            maxWidth: '70%',
            padding: '12px 16px',
            background: theme.surface,
            borderRadius: '12px',
          }}
        >
          {/* Subtle tail */}
          <svg
            className="message-tail"
            width="8"
            height="13"
            viewBox="0 0 8 13"
            style={{
              position: 'absolute',
              left: '-8px',
              bottom: '8px',
              fill: theme.surface,
              transform: 'scaleX(-1)',
            }}
          >
            <path d="M0 0 L8 6.5 L0 13 Z" />
          </svg>
          
          {/* Agent name (for multi-agent sessions) */}
          <div
            className="agent-name"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: theme.text.secondary,
              marginBottom: '4px',
            }}
          >
            {agentName}
          </div>
          
          {/* Content with markdown */}
          <MarkdownRenderer content={content} />
          
          {/* Streaming cursor */}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                display: 'inline-block',
                width: '2px',
                height: '1em',
                background: theme.primary,
                marginLeft: '2px',
                verticalAlign: 'middle',
              }}
            />
          )}
          
          {/* Timestamp */}
          <div
            className="message-timestamp"
            style={{
              fontSize: '11px',
              color: theme.text.tertiary,
              marginTop: '4px',
            }}
          >
            {formatTime(timestamp)}
          </div>
        </div>
      </div>
      
      {/* Action buttons (appear on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="message-actions"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              display: 'flex',
              gap: '4px',
              marginLeft: '8px',
            }}
          >
            <IconButton icon={<Copy />} onClick={handleCopy} />
            <IconButton icon={<RotateCcw />} onClick={handleRegenerate} />
            <IconButton icon={<Trash2 />} onClick={handleDelete} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

### Message Clustering

**Clustered Messages**
```typescript
// Messages from same sender within 1 minute cluster together
function MessageCluster({ messages, sender }: MessageClusterProps) {
  return (
    <div className="message-cluster">
      {/* First message with avatar */}
      <Message
        {...messages[0]}
        showAvatar={true}
        showTimestamp={false}
      />
      
      {/* Subsequent messages without avatar */}
      {messages.slice(1).map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...springPresets.default,
            delay: index * 0.05,
          }}
          style={{
            marginTop: '4px',
            marginLeft: sender === 'user' ? '0' : '40px', // Avatar width + gap
          }}
        >
          <Message
            {...message}
            showAvatar={false}
            showTimestamp={index === messages.length - 2} // Show on last
          />
        </motion.div>
      ))}
    </div>
  )
}
```

### Reaction System

**Emoji Reactions**
```typescript
function MessageReactions({ messageId, reactions }: ReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)
  
  return (
    <div className="message-reactions">
      {/* Existing reactions */}
      <div className="reactions-list">
        {reactions.map((reaction) => (
          <motion.button
            key={reaction.emoji}
            className="reaction-bubble"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggleReaction(reaction.emoji)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              background: reaction.hasReacted ? theme.primaryLight : theme.surface,
              border: `1px solid ${reaction.hasReacted ? theme.primary : theme.border.subtle}`,
              borderRadius: '12px',
              fontSize: '14px',
            }}
          >
            <span>{reaction.emoji}</span>
            <span style={{ fontSize: '11px', color: theme.text.secondary }}>
              {reaction.count}
            </span>
          </motion.button>
        ))}
      </div>
      
      {/* Add reaction button */}
      <motion.button
        className="add-reaction"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPicker(!showPicker)}
      >
        <Plus size={14} />
      </motion.button>
      
      {/* Emoji picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            className="emoji-picker"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={springPresets.snappy}
          >
            {/* Emoji picker content */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

**Reaction Animation**
```typescript
// Particle burst when adding reaction
function ReactionBurst({ emoji, position }: ReactionBurstProps) {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 8,
  }))
  
  return (
    <div
      className="reaction-burst"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
      }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: Math.cos((particle.angle * Math.PI) / 180) * 30,
            y: Math.sin((particle.angle * Math.PI) / 180) * 30,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            fontSize: '16px',
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  )
}
```

### Typing Indicator Enhancement

**Advanced Typing Indicator**
```typescript
function TypingIndicator({ agentName, avatar }: TypingIndicatorProps) {
  return (
    <motion.div
      className="typing-indicator"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={springPresets.default}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: theme.surface,
        borderRadius: '12px',
        width: 'fit-content',
      }}
    >
      <Avatar src={avatar} name={agentName} size="xs" />
      
      <div className="typing-dots" style={{ display: 'flex', gap: '4px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -8, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: theme.text.tertiary,
            }}
          />
        ))}
      </div>
      
      <span
        style={{
          fontSize: '13px',
          color: theme.text.secondary,
        }}
      >
        {agentName} is thinking...
      </span>
    </motion.div>
  )
}
```

---

## Advanced Interactions & Gestures

### Pull to Refresh

**Message List Pull to Refresh**
```typescript
function PullToRefreshMessages() {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  
  const handleTouchStart = (e: TouchEvent) => {
    startY.current = e.touches[0].clientY
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    const currentY = e.touches[0].clientY
    const distance = currentY - startY.current
    
    // Only allow pull down when scrolled to top
    if (distance > 0 && scrollTop === 0) {
      setPullDistance(Math.min(distance, 100))
    }
  }
  
  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      setIsRefreshing(true)
      refreshMessages().then(() => {
        setIsRefreshing(false)
        setPullDistance(0)
      })
    } else {
      setPullDistance(0)
    }
  }
  
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="pull-indicator"
        animate={{
          height: pullDistance,
          opacity: pullDistance / 60,
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{
            rotate: isRefreshing ? 360 : pullDistance * 3.6,
          }}
          transition={{
            rotate: isRefreshing
              ? { duration: 1, repeat: Infinity, ease: 'linear' }
              : { duration: 0 },
          }}
        >
          <RefreshCw size={20} color={theme.primary} />
        </motion.div>
      </motion.div>
      
      {/* Message list */}
      <div className="messages">{/* Messages */}</div>
    </div>
  )
}
```

### Swipe Gestures

**Swipe to Delete Session**
```typescript
function SwipeableSessionItem({ session, onDelete }: SwipeableSessionProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [showDelete, setShowDelete] = useState(false)
  
  return (
    <motion.div
      className="swipeable-session"
      drag="x"
      dragConstraints={{ left: -80, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x < -60) {
          setSwipeX(-80)
          setShowDelete(true)
        } else {
          setSwipeX(0)
          setShowDelete(false)
        }
      }}
      animate={{ x: swipeX }}
      style={{
        position: 'relative',
      }}
    >
      {/* Delete button (revealed on swipe) */}
      <motion.div
        className="delete-action"
        initial={{ opacity: 0 }}
        animate={{ opacity: showDelete ? 1 : 0 }}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '80px',
          background: theme.error,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
        }}
        onClick={() => onDelete(session.id)}
      >
        <Trash2 size={20} color="white" />
      </motion.div>
      
      {/* Session item content */}
      <div className="session-content">
        <SessionItem {...session} />
      </div>
    </motion.div>
  )
}
```

**Swipe Between Tabs**
```typescript
function SwipeableTabs({ tabs, activeIndex, onChange }: SwipeableTabsProps) {
  const [[page, direction], setPage] = useState([activeIndex, 0])
  
  const paginate = (newDirection: number) => {
    const newIndex = page + newDirection
    if (newIndex >= 0 && newIndex < tabs.length) {
      setPage([newIndex, newDirection])
      onChange(newIndex)
    }
  }
  
  return (
    <div className="swipeable-tabs">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={{
            enter: (direction: number) => ({
              x: direction > 0 ? 1000 : -1000,
              opacity: 0,
            }),
            center: {
              zIndex: 1,
              x: 0,
              opacity: 1,
            },
            exit: (direction: number) => ({
              zIndex: 0,
              x: direction < 0 ? 1000 : -1000,
              opacity: 0,
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)
            
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1)
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1)
            }
          }}
        >
          {tabs[page].content}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}
```

### Keyboard Shortcuts Overlay

**Shortcuts Help Modal**
```typescript
function KeyboardShortcutsOverlay({ isOpen, onClose }: ShortcutsOverlayProps) {
  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Focus search' },
    { keys: ['⌘', 'N'], description: 'New chat' },
    { keys: ['⌘', 'Enter'], description: 'Send message' },
    { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
    { keys: ['⌘', '/'], description: 'Show shortcuts' },
    { keys: ['Esc'], description: 'Close modal' },
    { keys: ['↑', '↓'], description: 'Navigate list' },
    { keys: ['Tab'], description: 'Next field' },
  ]
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="shortcuts-backdrop"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: theme.overlay,
              zIndex: 1000,
            }}
          />
          
          {/* Shortcuts panel */}
          <motion.div
            className="shortcuts-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={springPresets.default}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '500px',
              maxHeight: '80vh',
              background: theme.glass,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.border.subtle}`,
              borderRadius: '16px',
              padding: '24px',
              zIndex: 1001,
              overflow: 'auto',
            }}
          >
            <h2 style={{ marginBottom: '24px' }}>Keyboard Shortcuts</h2>
            
            <div className="shortcuts-list">
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={index}
                  className="shortcut-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    ...springPresets.default,
                    delay: index * 0.05,
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ color: theme.text.secondary }}>
                    {shortcut.description}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={i}
                        style={{
                          padding: '4px 8px',
                          background: theme.surface,
                          border: `1px solid ${theme.border.medium}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500,
                        }}
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

### Long Press Actions

**Long Press Context Menu**
```typescript
function useLongPress(callback: () => void, ms = 500) {
  const [startLongPress, setStartLongPress] = useState(false)
  
  useEffect(() => {
    let timerId: NodeJS.Timeout
    if (startLongPress) {
      timerId = setTimeout(callback, ms)
    }
    
    return () => {
      clearTimeout(timerId)
    }
  }, [startLongPress, callback, ms])
  
  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  }
}

// Usage
function SessionItemWithLongPress({ session }: SessionItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  const longPressProps = useLongPress(() => {
    setShowMenu(true)
    hapticManager.medium()
  })
  
  return (
    <div {...longPressProps}>
      <SessionItem {...session} />
      
      {/* Context menu */}
      <AnimatePresence>
        {showMenu && (
          <ContextMenu
            items={[
              { label: 'Rename', icon: <Edit2 />, onClick: handleRename },
              { label: 'Duplicate', icon: <Copy />, onClick: handleDuplicate },
              { label: 'Delete', icon: <Trash2 />, onClick: handleDelete, danger: true },
            ]}
            onClose={() => setShowMenu(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## Theme Transition Effects

### Ripple Theme Transition

**Ripple Effect from Toggle Button**
```typescript
function RippleThemeTransition({ theme, togglePosition }: ThemeTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [rippleOrigin, setRippleOrigin] = useState({ x: 0, y: 0 })
  
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    // Get toggle button position
    const toggleButton = document.querySelector('.theme-toggle')
    if (toggleButton) {
      const rect = toggleButton.getBoundingClientRect()
      setRippleOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }
    
    setIsTransitioning(true)
    
    // Apply theme after ripple starts
    setTimeout(() => {
      applyTheme(newTheme)
    }, 300)
    
    // End transition
    setTimeout(() => {
      setIsTransitioning(false)
    }, 800)
  }
  
  return (
    <>
      {/* Ripple overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="theme-ripple"
            initial={{
              scale: 0,
              opacity: 1,
            }}
            animate={{
              scale: 50,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
            style={{
              position: 'fixed',
              left: rippleOrigin.x,
              top: rippleOrigin.y,
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: theme === 'light' ? '#09090B' : '#FFFFFF',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
```

### Particle Theme Transition

**Floating Particles During Transition**
```typescript
function ParticleThemeTransition({ theme }: { theme: 'light' | 'dark' }) {
  const [particles, setParticles] = useState<Particle[]>([])
  
  const generateParticles = () => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 2 + 1,
    }))
    setParticles(newParticles)
    
    // Clear particles after animation
    setTimeout(() => setParticles([]), 2000)
  }
  
  useEffect(() => {
    generateParticles()
  }, [theme])
  
  return (
    <div className="particle-container">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              y: particle.y - 100,
              scale: 1,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: particle.duration,
              ease: 'easeOut',
            }}
            style={{
              position: 'fixed',
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: theme === 'light' ? '#F59E0B' : '#60A5FA',
              pointerEvents: 'none',
              zIndex: 9998,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
```

### Staggered Element Transition

**Individual Element Morphing**
```typescript
function StaggeredThemeTransition({ theme }: { theme: 'light' | 'dark' }) {
  const elements = [
    '.sidebar',
    '.chat-header',
    '.message',
    '.input',
    '.button',
  ]
  
  useEffect(() => {
    elements.forEach((selector, index) => {
      const els = document.querySelectorAll(selector)
      els.forEach((el) => {
        setTimeout(() => {
          el.classList.add('theme-transitioning')
          setTimeout(() => {
            el.classList.remove('theme-transitioning')
          }, 300)
        }, index * 50)
      })
    })
  }, [theme])
  
  return null
}

// CSS
/*
.theme-transitioning {
  animation: themeFlash 0.3s ease-out;
}

@keyframes themeFlash {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
  100% {
    filter: brightness(1);
  }
}
*/
```

### Smooth Color Interpolation

**Gradual Color Morphing**
```typescript
function SmoothThemeTransition({ theme }: { theme: 'light' | 'dark' }) {
  const colors = theme === 'light' ? lightTheme : darkTheme
  
  return (
    <motion.div
      className="app-container"
      animate={{
        backgroundColor: colors.background,
        color: colors.text.primary,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      {/* App content */}
      <motion.div
        className="sidebar"
        animate={{
          backgroundColor: colors.surface,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="chat"
        animate={{
          backgroundColor: colors.background,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  )
}
```

---

## API Requirements & Enhancements

### Additional Backend APIs Needed

**1. Reaction API**
```typescript
// Add reaction to message
POST /v1/sessions/{sessionId}/messages/{messageId}/reactions
{
  emoji: string
}

// Remove reaction
DELETE /v1/sessions/{sessionId}/messages/{messageId}/reactions/{emoji}

// Get reactions for message
GET /v1/sessions/{sessionId}/messages/{messageId}/reactions
Response: {
  reactions: Array<{
    emoji: string
    count: number
    users: string[]
    hasReacted: boolean
  }>
}
```

**2. Message Clustering API**
```typescript
// Get messages with clustering metadata
GET /v1/sessions/{sessionId}/messages?cluster=true
Response: {
  clusters: Array<{
    senderId: string
    senderType: 'user' | 'agent'
    messages: Message[]
    startTime: Date
    endTime: Date
  }>
}
```

**3. Session Preview API**
```typescript
// Get session preview (last N messages)
GET /v1/sessions/{sessionId}/preview?limit=3
Response: {
  sessionId: string
  lastMessages: Message[]
  participantCount: number
  lastActivity: Date
}
```

**4. User Preferences API**
```typescript
// Save user preferences
PUT /v1/user/preferences
{
  soundEnabled: boolean
  soundVolume: number
  reducedMotion: boolean
  theme: 'light' | 'dark' | 'system'
  customCursor: boolean
}

// Get user preferences
GET /v1/user/preferences
```

**5. Session Statistics API**
```typescript
// Get session statistics
GET /v1/sessions/{sessionId}/stats
Response: {
  messageCount: number
  participantCount: number
  duration: number
  tokensUsed: number
  toolCallsCount: number
}
```

---

## Advanced Interactions & Gestures

### Pull to Refresh (Mobile)

**Behavior**
- Available on message list only
- Pull down from top to refresh messages
- Minimum pull distance: 80px
- Release to trigger refresh

**Visual Feedback**
```typescript
function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const threshold = 80
  
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startY = touch.clientY
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    if (containerRef.current.scrollTop > 0) return
    
    const touch = e.touches[0]
    const distance = Math.max(0, touch.clientY - startY)
    setPullDistance(Math.min(distance, threshold * 1.5))
  }
  
  const handleTouchEnd = async () => {
    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullDistance(0)
  }
  
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        style={{
          height: pullDistance,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        animate={{
          opacity: pullDistance / threshold,
        }}
      >
        <motion.div
          animate={{
            rotate: isRefreshing ? 360 : (pullDistance / threshold) * 360,
          }}
          transition={{
            rotate: isRefreshing 
              ? { duration: 1, repeat: Infinity, ease: 'linear' }
              : { duration: 0 },
          }}
        >
          <RefreshCw size={24} color={theme.primary} />
        </motion.div>
      </motion.div>
      
      {children}
    </div>
  )
}
```

### Swipe to Delete (Mobile)

**Session Items**
```typescript
function SwipeableSessionItem({ session, onDelete }: SwipeableSessionProps) {
  const [swipeX, setSwipeX] = useState(0)
  const deleteThreshold = -100
  
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: deleteThreshold * 1.5, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, info) => {
        if (info.offset.x < deleteThreshold) {
          onDelete(session.id)
        } else {
          setSwipeX(0)
        }
      }}
      animate={{ x: swipeX }}
      style={{ position: 'relative' }}
    >
      {/* Delete background */}
      <motion.div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '100px',
          background: theme.error,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
        }}
        animate={{
          opacity: Math.abs(swipeX) / 100,
        }}
      >
        <Trash2 size={20} color="white" />
      </motion.div>
      
      {/* Session item content */}
      <SessionItem session={session} />
    </motion.div>
  )
}
```

### Swipe Between Tabs (Mobile)

**Horizontal Swipe Navigation**
```typescript
function SwipeableTabs({ tabs, activeTab, onChange }: SwipeableTabsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, info) => {
        const swipeThreshold = 50
        
        if (info.offset.x > swipeThreshold && currentIndex > 0) {
          // Swipe right - previous tab
          const newIndex = currentIndex - 1
          setCurrentIndex(newIndex)
          onChange(tabs[newIndex].id)
        } else if (info.offset.x < -swipeThreshold && currentIndex < tabs.length - 1) {
          // Swipe left - next tab
          const newIndex = currentIndex + 1
          setCurrentIndex(newIndex)
          onChange(tabs[newIndex].id)
        }
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={springPresets.default}
        >
          {tabs[currentIndex].content}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
```

### Keyboard Shortcuts Overlay

**Shortcut Display**
```typescript
function KeyboardShortcutsOverlay({ isOpen, onClose }: OverlayProps) {
  const shortcuts = [
    { key: '⌘K', description: 'Focus search' },
    { key: '⌘N', description: 'New chat' },
    { key: '⌘B', description: 'Toggle sidebar' },
    { key: '⌘Enter', description: 'Send message' },
    { key: '⌘/', description: 'Show shortcuts' },
    { key: 'Esc', description: 'Close modal' },
    { key: '⌘1-9', description: 'Switch tabs' },
    { key: '⌘T', description: 'Toggle theme' },
  ]
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: theme.overlay,
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
            }}
          />
          
          {/* Shortcuts panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={springPresets.default}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '480px',
              maxHeight: '80vh',
              background: theme.surface,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: theme.shadows.xl,
              zIndex: 1001,
            }}
          >
            <h2 style={{ marginBottom: '24px' }}>Keyboard Shortcuts</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={shortcut.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    ...springPresets.default,
                    delay: index * 0.03,
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: theme.background,
                  }}
                >
                  <span style={{ color: theme.text.primary }}>
                    {shortcut.description}
                  </span>
                  <kbd
                    style={{
                      padding: '4px 8px',
                      background: theme.surface,
                      border: `1px solid ${theme.border.medium}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: theme.fontFamily.mono,
                      color: theme.text.secondary,
                    }}
                  >
                    {shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Trigger with ⌘/
useKeyboardShortcuts([
  {
    key: '/',
    ctrlKey: true,
    callback: () => setShortcutsOpen(true),
  },
])
```

### Long Press Context Menu (Mobile)

**Message Long Press**
```typescript
function LongPressMessage({ message, children }: LongPressProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const longPressTimer = useRef<NodeJS.Timeout>()
  
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    setMenuPosition({ x: touch.clientX, y: touch.clientY })
    
    longPressTimer.current = setTimeout(() => {
      hapticManager.medium()
      setMenuOpen(true)
    }, 500) // 500ms long press
  }
  
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }
  
  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        {children}
      </div>
      
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999,
              }}
            />
            
            {/* Context menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={springPresets.snappy}
              style={{
                position: 'fixed',
                left: menuPosition.x,
                top: menuPosition.y,
                background: theme.surface,
                borderRadius: '12px',
                padding: '8px',
                boxShadow: theme.shadows.lg,
                zIndex: 1000,
              }}
            >
              <ContextMenuItem icon={<Copy />} label="Copy" onClick={handleCopy} />
              <ContextMenuItem icon={<RotateCcw />} label="Regenerate" onClick={handleRegenerate} />
              <ContextMenuItem icon={<Trash2 />} label="Delete" onClick={handleDelete} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
```

---

## Conclusion

This design document provides comprehensive specifications for implementing the Agent Console redesign. Every component, animation, and interaction has been carefully considered to create a premium, production-ready experience.

The design prioritizes:
- **Visual coherence** through restrained color usage and consistent spacing
- **Smooth interactions** with spring-based animations and immediate feedback
- **Maintainability** through well-organized code and clear patterns
- **Accessibility** with keyboard navigation, screen reader support, and reduced motion
- **Performance** with code splitting, memoization, and virtual scrolling

Follow the implementation phases sequentially, testing thoroughly at each stage. The result will be a beautiful, functional interface that delights users and sets a high standard for AI agent interaction.


---

## Theme Transition Effects

### Ripple Theme Transition

**Ripple Effect from Toggle Button**
```typescript
function RippleThemeTransition({ theme, togglePosition }: RippleProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const handleThemeToggle = () => {
    setIsTransitioning(true)
    
    // Trigger ripple animation
    const ripple = document.createElement('div')
    ripple.style.position = 'fixed'
    ripple.style.left = `${togglePosition.x}px`
    ripple.style.top = `${togglePosition.y}px`
    ripple.style.width = '0'
    ripple.style.height = '0'
    ripple.style.borderRadius = '50%'
    ripple.style.background = theme === 'light' ? '#09090B' : '#FFFFFF'
    ripple.style.transform = 'translate(-50%, -50%)'
    ripple.style.pointerEvents = 'none'
    ripple.style.zIndex = '9999'
    
    document.body.appendChild(ripple)
    
    // Animate ripple expansion
    const maxDimension = Math.max(window.innerWidth, window.innerHeight) * 2
    ripple.animate([
      { width: '0', height: '0' },
      { width: `${maxDimension}px`, height: `${maxDimension}px` },
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }).onfinish = () => {
      // Switch theme
      toggleTheme()
      
      // Remove ripple
      setTimeout(() => {
        ripple.remove()
        setIsTransitioning(false)
      }, 100)
    }
  }
  
  return handleThemeToggle
}
```

**Implementation**
```typescript
function ThemeToggleWithRipple() {
  const { theme, toggleTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const handleClick = () => {
    if (!buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    
    // Create ripple effect
    const ripple = document.createElement('div')
    ripple.className = 'theme-ripple'
    ripple.style.cssText = `
      position: fixed;
      left: ${position.x}px;
      top: ${position.y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: ${theme === 'light' ? '#09090B' : '#FFFFFF'};
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 9999;
    `
    
    document.body.appendChild(ripple)
    
    const maxSize = Math.max(window.innerWidth, window.innerHeight) * 2.5
    
    ripple.animate([
      { width: '0', height: '0', opacity: 1 },
      { width: `${maxSize}px`, height: `${maxSize}px`, opacity: 1 },
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }).onfinish = () => {
      toggleTheme()
      setTimeout(() => ripple.remove(), 50)
    }
  }
  
  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </motion.button>
  )
}
```

### Floating Particles During Transition

**Particle System**
```typescript
function ThemeTransitionParticles({ isTransitioning, theme }: ParticlesProps) {
  const particleCount = 20
  
  return (
    <AnimatePresence>
      {isTransitioning && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        >
          {Array.from({ length: particleCount }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 20,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                y: -20,
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.05,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                borderRadius: '50%',
                background: theme === 'light' ? '#F59E0B' : '#FAFAFA',
                boxShadow: `0 0 ${Math.random() * 20 + 10}px ${
                  theme === 'light' ? '#F59E0B' : '#FAFAFA'
                }`,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
```

### Staggered Element Morphing

**Color Transition with Stagger**
```typescript
function StaggeredThemeTransition({ children }: StaggeredProps) {
  const { theme } = useTheme()
  const [elements, setElements] = useState<HTMLElement[]>([])
  
  useEffect(() => {
    // Find all animatable elements
    const animatableElements = document.querySelectorAll(
      '[data-theme-animate]'
    ) as NodeListOf<HTMLElement>
    
    setElements(Array.from(animatableElements))
  }, [])
  
  useEffect(() => {
    // Stagger color transitions
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        element.classList.toggle('light')
        element.classList.toggle('dark')
      }, index * 20) // 20ms stagger
    })
  }, [theme, elements])
  
  return children
}
```

### Smooth Color Interpolation

**Color Lerp Animation**
```typescript
function ColorInterpolation({ fromColor, toColor, duration }: ColorLerpProps) {
  const [currentColor, setCurrentColor] = useState(fromColor)
  
  useEffect(() => {
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Interpolate RGB values
      const from = hexToRgb(fromColor)
      const to = hexToRgb(toColor)
      
      const r = Math.round(from.r + (to.r - from.r) * progress)
      const g = Math.round(from.g + (to.g - from.g) * progress)
      const b = Math.round(from.b + (to.b - from.b) * progress)
      
      setCurrentColor(`rgb(${r}, ${g}, ${b})`)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [fromColor, toColor, duration])
  
  return currentColor
}

// Helper function
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 }
}
```

### Theme Toggle with Sound

**Audio Feedback**
```typescript
function ThemeToggleWithSound() {
  const { theme, toggleTheme } = useTheme()
  
  const handleToggle = () => {
    // Play sound
    soundManager.play(theme === 'light' ? 'themeSwitch' : 'themeSwitch')
    
    // Haptic feedback
    hapticManager.light()
    
    // Toggle theme
    toggleTheme()
  }
  
  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={20} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: -90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
```


---

## Enhanced Typing Indicator

### Breathing Dots Animation

**Advanced Typing Indicator**
```typescript
function BreathingTypingIndicator() {
  return (
    <motion.div
      className="typing-indicator"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '12px 16px',
        background: theme.surface,
        borderRadius: '12px',
        width: 'fit-content',
      }}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.15,
            ease: 'easeInOut',
          }}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: theme.text.tertiary,
          }}
        />
      ))}
    </motion.div>
  )
}
```

### Pulsing Container

**Container Breathing Effect**
```typescript
function PulsingTypingContainer({ children }: ContainerProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 0 0 0 rgba(245, 158, 11, 0)',
          '0 0 0 4px rgba(245, 158, 11, 0.1)',
          '0 0 0 0 rgba(245, 158, 11, 0)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        padding: '12px 16px',
        background: theme.surface,
        borderRadius: '12px',
      }}
    >
      {children}
    </motion.div>
  )
}
```

### Wave Animation

**Wave-Style Typing Indicator**
```typescript
function WaveTypingIndicator() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        padding: '12px 16px',
        background: theme.surface,
        borderRadius: '12px',
      }}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          animate={{
            height: ['4px', '16px', '4px'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
            ease: 'easeInOut',
          }}
          style={{
            width: '3px',
            background: theme.primary,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  )
}
```

### Morphing Dots

**Dots that Morph Between Shapes**
```typescript
function MorphingTypingIndicator() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '12px 16px',
        background: theme.surface,
        borderRadius: '12px',
      }}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{
            borderRadius: ['50%', '20%', '50%'],
            rotate: [0, 180, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
          style={{
            width: '8px',
            height: '8px',
            background: theme.primary,
          }}
        />
      ))}
    </div>
  )
}
```

---

## Emoji Reaction System

### Reaction Picker

**Floating Reaction Picker**
```typescript
function ReactionPicker({ messageId, onReact }: ReactionPickerProps) {
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🎉']
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={springPresets.snappy}
      style={{
        display: 'flex',
        gap: '8px',
        padding: '8px 12px',
        background: theme.surface,
        borderRadius: '24px',
        boxShadow: theme.shadows.lg,
        border: `1px solid ${theme.border.subtle}`,
      }}
    >
      {reactions.map((emoji, index) => (
        <motion.button
          key={emoji}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            ...springPresets.bouncy,
            delay: index * 0.05,
          }}
          whileHover={{ scale: 1.3, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onReact(messageId, emoji)}
          style={{
            fontSize: '20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  )
}
```

### Reaction Display

**Reactions Below Message**
```typescript
function MessageReactions({ reactions }: MessageReactionsProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginTop: '8px',
      }}
    >
      {Object.entries(reactions).map(([emoji, users]) => (
        <motion.button
          key={emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: theme.primaryLight,
            border: `1px solid ${theme.primary}`,
            borderRadius: '12px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <span>{emoji}</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: theme.primary,
            }}
          >
            {users.length}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
```

### Particle Burst on React

**Celebration Animation**
```typescript
function ReactionParticleBurst({ emoji, position }: ParticleBurstProps) {
  const particleCount = 12
  
  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2
        const distance = 50
        
        return (
          <motion.div
            key={i}
            initial={{
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              fontSize: '16px',
            }}
          >
            {emoji}
          </motion.div>
        )
      })}
    </div>
  )
}
```

---

## Loading States & Skeletons

### Shimmer Skeleton

**Wave Shimmer Effect**
```typescript
function ShimmerSkeleton({ width, height, borderRadius }: SkeletonProps) {
  return (
    <motion.div
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        width,
        height,
        borderRadius: borderRadius || '8px',
        background: `linear-gradient(
          90deg,
          ${theme.surface} 0%,
          ${theme.surfaceHover} 50%,
          ${theme.surface} 100%
        )`,
        backgroundSize: '200% 100%',
      }}
    />
  )
}
```

### Agent Card Skeleton

**Structured Skeleton**
```typescript
function AgentCardSkeleton() {
  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '12px',
        background: theme.surface,
      }}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Avatar skeleton */}
        <ShimmerSkeleton width="40px" height="40px" borderRadius="50%" />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Name skeleton */}
          <ShimmerSkeleton width="60%" height="16px" />
          
          {/* Description skeleton */}
          <ShimmerSkeleton width="100%" height="12px" />
          <ShimmerSkeleton width="80%" height="12px" />
        </div>
      </div>
    </div>
  )
}
```

### Message Skeleton

**Varying Width Skeletons**
```typescript
function MessageSkeleton({ isUser }: MessageSkeletonProps) {
  const widths = ['90%', '75%', '85%', '70%']
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '24px',
      }}
    >
      <div style={{ maxWidth: '70%', display: 'flex', gap: '8px' }}>
        {!isUser && <ShimmerSkeleton width="32px" height="32px" borderRadius="50%" />}
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {widths.map((width, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ShimmerSkeleton width={width} height="14px" />
            </motion.div>
          ))}
        </div>
        
        {isUser && <ShimmerSkeleton width="32px" height="32px" borderRadius="50%" />}
      </div>
    </div>
  )
}
```

### Planning Card Skeleton

**Complex Skeleton Structure**
```typescript
function PlanningCardSkeleton() {
  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: theme.surface,
        border: `1px solid ${theme.border.subtle}`,
      }}
    >
      {/* Title */}
      <ShimmerSkeleton width="60%" height="20px" />
      
      {/* Goal */}
      <div style={{ marginTop: '8px' }}>
        <ShimmerSkeleton width="100%" height="14px" />
        <div style={{ marginTop: '4px' }}>
          <ShimmerSkeleton width="80%" height="14px" />
        </div>
      </div>
      
      {/* Progress bar */}
      <div style={{ marginTop: '20px' }}>
        <ShimmerSkeleton width="100%" height="32px" borderRadius="16px" />
      </div>
      
      {/* Tasks */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ShimmerSkeleton width="20px" height="20px" borderRadius="50%" />
            <div style={{ flex: 1 }}>
              <ShimmerSkeleton width="70%" height="14px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```


---

## Scroll Animations

### Fade In on Scroll

**Intersection Observer with Framer Motion**
```typescript
function FadeInOnScroll({ children, delay = 0 }: FadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px',
  })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        ...springPresets.default,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
```

### Stagger Children on Scroll

**List Items Stagger**
```typescript
function StaggerList({ items }: StaggerListProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={springPresets.default}
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

### Parallax Scroll Effect

**Background Parallax**
```typescript
function ParallaxBackground({ children }: ParallaxProps) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -200])
  
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          y,
          zIndex: 0,
        }}
      >
        {/* Background content */}
      </motion.div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
```

### Scale on Scroll

**Zoom Effect**
```typescript
function ScaleOnScroll({ children }: ScaleProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3])
  
  return (
    <motion.div
      ref={ref}
      style={{
        scale,
        opacity,
      }}
    >
      {children}
    </motion.div>
  )
}
```

### Sticky Header with Blur

**Scroll-Triggered Blur**
```typescript
function StickyHeaderWithBlur() {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <motion.header
      animate={{
        backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
        background: scrolled 
          ? `${theme.surface}CC` // 80% opacity
          : 'transparent',
        boxShadow: scrolled 
          ? theme.shadows.sm
          : 'none',
      }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 24px',
      }}
    >
      {/* Header content */}
    </motion.header>
  )
}
```

---

## Micro-Interactions Library

### Button Ripple Effect

**Material-Style Ripple**
```typescript
function RippleButton({ children, onClick }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    
    const ripple = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    
    setRipples([...ripples, ripple])
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
    }, 600)
    
    onClick?.(e)
  }
  
  return (
    <button
      onClick={handleClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{
            width: 0,
            height: 0,
            opacity: 0.5,
          }}
          animate={{
            width: 300,
            height: 300,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'currentColor',
            pointerEvents: 'none',
          }}
        />
      ))}
      {children}
    </button>
  )
}
```

### Checkbox Animation

**Smooth Check Animation**
```typescript
function AnimatedCheckbox({ checked, onChange }: CheckboxProps) {
  return (
    <motion.button
      onClick={() => onChange(!checked)}
      animate={{
        background: checked ? theme.primary : 'transparent',
        borderColor: checked ? theme.primary : theme.border.medium,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '6px',
        border: '2px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <AnimatePresence>
        {checked && (
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.path
              d="M2 6 L5 9 L10 3"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
```

### Toggle Switch

**Smooth Toggle Animation**
```typescript
function AnimatedToggle({ checked, onChange }: ToggleProps) {
  return (
    <motion.button
      onClick={() => onChange(!checked)}
      animate={{
        background: checked ? theme.primary : theme.border.medium,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        border: 'none',
      }}
    >
      <motion.div
        animate={{
          x: checked ? 20 : 0,
        }}
        transition={springPresets.snappy}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '10px',
          background: 'white',
        }}
      />
    </motion.button>
  )
}
```

### Number Counter

**Animated Number Increment**
```typescript
function AnimatedCounter({ value, duration = 1 }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(startValue + (value - startValue) * easeOutQuart)
      
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [value, duration])
  
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.2, color: theme.primary }}
      animate={{ scale: 1, color: theme.text.primary }}
      transition={{ duration: 0.3 }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  )
}
```

### Progress Ring

**Circular Progress**
```typescript
function ProgressRing({ progress, size = 100 }: ProgressRingProps) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  
  return (
    <svg width={size} height={size}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={theme.border.subtle}
        strokeWidth={strokeWidth}
        fill="none"
      />
      
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={theme.primary}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          strokeDasharray: circumference,
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
      
      {/* Percentage text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.3em"
        fontSize="24"
        fontWeight="600"
        fill={theme.text.primary}
      >
        {Math.round(progress)}%
      </text>
    </svg>
  )
}
```

---

## Error States & Empty States

### Error Message with Retry

**Friendly Error Display**
```typescript
function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        textAlign: 'center',
      }}
    >
      <motion.div
        animate={{
          rotate: [0, -10, 10, -10, 0],
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
        }}
      >
        <AlertCircle size={64} color={theme.error} />
      </motion.div>
      
      <h3 style={{ marginTop: '24px', color: theme.text.primary }}>
        Oops! Something went wrong
      </h3>
      
      <p style={{ marginTop: '8px', color: theme.text.secondary }}>
        {error.message}
      </p>
      
      <motion.button
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          marginTop: '24px',
          padding: '12px 24px',
          background: theme.primary,
          color: 'white',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 500,
        }}
      >
        Try Again
      </motion.button>
    </motion.div>
  )
}
```

### Empty State with Illustration

**Engaging Empty State**
```typescript
function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
      }}
    >
      {/* Floating illustration */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <MessageSquare size={80} color={theme.text.tertiary} strokeWidth={1.5} />
      </motion.div>
      
      <h3 style={{ marginTop: '24px', fontSize: '20px', color: theme.text.primary }}>
        {title}
      </h3>
      
      <p style={{ marginTop: '8px', color: theme.text.secondary, maxWidth: '400px' }}>
        {description}
      </p>
      
      {action && (
        <motion.button
          onClick={action.onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            background: theme.primary,
            color: 'white',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
          }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
```

### Network Error with Offline Indicator

**Offline Banner**
```typescript
function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={springPresets.default}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            padding: '12px 24px',
            background: theme.warning,
            color: 'white',
            textAlign: 'center',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <WifiOff size={20} />
          <span>You're offline. Some features may not be available.</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```


---

## Agent Tool Execution Display

### Overview

Agent tools have distinct visual treatments to make multi-agent orchestration clear and engaging. Each tool type has its own icon, color scheme, and animation pattern.

### Tool Categories

**Agent Management Tools**
- `spawn_agent` - Creates a new child agent session
- `send_message` - Sends follow-up message to existing child
- `await_agent` - Waits for child agent to complete

**Research Tools**
- `web_research` - Searches the web for information

### Tool Execution Card

**Base Structure**
```typescript
interface ToolExecutionProps {
  toolCallId: string
  toolName: string
  parameters: Record<string, any>
  result?: Record<string, any>
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'awaiting_confirmation'
  timestamp: Date
  duration?: number
}

function ToolExecutionCard({ tool }: { tool: ToolExecutionProps }) {
  const config = getToolConfig(tool.toolName)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.default}
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: config.background,
        border: `1px solid ${config.borderColor}`,
        marginBottom: '16px',
      }}
    >
      {/* Tool header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Animated icon */}
        <motion.div
          animate={tool.status === 'executing' ? {
            rotate: 360,
            scale: [1, 1.1, 1],
          } : {}}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {config.icon}
        </motion.div>
        
        {/* Tool name */}
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            fontSize: '15px', 
            fontWeight: 600, 
            color: config.color 
          }}>
            {config.displayName}
          </h4>
          <p style={{ 
            fontSize: '13px', 
            color: theme.text.secondary,
            marginTop: '2px',
          }}>
            {config.description}
          </p>
        </div>
        
        {/* Status badge */}
        <StatusBadge status={tool.status} />
      </div>
      
      {/* Parameters */}
      {tool.status !== 'pending' && (
        <ToolParameters parameters={tool.parameters} config={config} />
      )}
      
      {/* Result */}
      {tool.result && (
        <ToolResult result={tool.result} config={config} />
      )}
      
      {/* Duration */}
      {tool.duration && (
        <div style={{ 
          marginTop: '8px', 
          fontSize: '11px', 
          color: theme.text.tertiary 
        }}>
          Completed in {formatDuration(tool.duration)}
        </div>
      )}
    </motion.div>
  )
}
```

### Spawn Agent Tool Design

**Visual Identity**
- Icon: GitBranch (branching tree)
- Color: #8B5CF6 (Purple)
- Background: rgba(139, 92, 246, 0.05)
- Border: rgba(139, 92, 246, 0.2)

**Animation: Branching Effect**
```typescript
function SpawnAgentAnimation() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      {/* Main branch */}
      <motion.line
        x1="12" y1="4" x2="12" y2="12"
        stroke="#8B5CF6"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* New branch */}
      <motion.line
        x1="12" y1="12" x2="18" y2="18"
        stroke="#8B5CF6"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      />
      
      {/* Branch nodes */}
      <motion.circle
        cx="12" cy="4" r="3"
        fill="#8B5CF6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      />
      <motion.circle
        cx="18" cy="18" r="3"
        fill="#8B5CF6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8 }}
      />
    </svg>
  )
}
```

**Parameters Display**
```typescript
function SpawnAgentParameters({ parameters }: ParametersProps) {
  return (
    <div style={{ marginTop: '12px' }}>
      {/* Agent ID */}
      <ParamRow 
        label="Agent" 
        value={parameters.agent_id}
        icon={<User size={14} />}
      />
      
      {/* Initial message */}
      <ParamRow 
        label="Message" 
        value={parameters.message}
        icon={<MessageSquare size={14} />}
        expandable
      />
    </div>
  )
}
```

**Result Display**
```typescript
function SpawnAgentResult({ result }: ResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={springPresets.gentle}
      style={{
        marginTop: '12px',
        padding: '12px',
        background: 'rgba(139, 92, 246, 0.08)',
        borderRadius: '8px',
        borderLeft: '3px solid #8B5CF6',
      }}
    >
      {result.error ? (
        <div style={{ color: theme.error }}>
          <AlertCircle size={16} style={{ marginRight: '8px' }} />
          {result.error}
        </div>
      ) : (
        <div>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: 500, 
            color: '#8B5CF6',
            marginBottom: '4px',
          }}>
            Child Session Created
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: theme.text.secondary,
            fontFamily: theme.fontFamily.mono,
          }}>
            {result.child_session_id}
          </div>
          
          {/* Link to child session */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateToSession(result.child_session_id)}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              background: '#8B5CF6',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            View Child Session →
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
```

### Send Message Tool Design

**Visual Identity**
- Icon: Send (paper plane)
- Color: #3B82F6 (Blue)
- Background: rgba(59, 130, 246, 0.05)
- Border: rgba(59, 130, 246, 0.2)

**Animation: Message Flying**
```typescript
function SendMessageAnimation() {
  return (
    <motion.div
      animate={{
        x: [0, 20, 0],
        y: [0, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Send size={20} color="#3B82F6" />
    </motion.div>
  )
}
```

**Parameters Display**
```typescript
function SendMessageParameters({ parameters }: ParametersProps) {
  return (
    <div style={{ marginTop: '12px' }}>
      {/* Child session ID */}
      <ParamRow 
        label="Target Session" 
        value={parameters.child_session_id}
        icon={<Link size={14} />}
        mono
      />
      
      {/* Message */}
      <ParamRow 
        label="Message" 
        value={parameters.message}
        icon={<MessageSquare size={14} />}
        expandable
      />
    </div>
  )
}
```

### Await Agent Tool Design

**Visual Identity**
- Icon: Clock (waiting)
- Color: #F59E0B (Amber)
- Background: rgba(245, 158, 11, 0.05)
- Border: rgba(245, 158, 11, 0.2)

**Animation: Pulsing Clock**
```typescript
function AwaitAgentAnimation({ status }: AnimationProps) {
  return (
    <motion.div
      animate={status === 'executing' ? {
        scale: [1, 1.2, 1],
        opacity: [0.6, 1, 0.6],
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Clock size={20} color="#F59E0B" />
    </motion.div>
  )
}
```

**Waiting State Display**
```typescript
function AwaitAgentWaiting({ childSessionId }: WaitingProps) {
  return (
    <motion.div
      animate={{
        background: [
          'rgba(245, 158, 11, 0.05)',
          'rgba(245, 158, 11, 0.12)',
          'rgba(245, 158, 11, 0.05)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        marginTop: '12px',
        padding: '12px',
        borderRadius: '8px',
        borderLeft: '3px solid #F59E0B',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={16} color="#F59E0B" />
        </motion.div>
        <span style={{ fontSize: '13px', color: theme.text.secondary }}>
          Waiting for child agent to complete...
        </span>
      </div>
      
      {/* Progress indicator */}
      <motion.div
        style={{
          marginTop: '8px',
          height: '2px',
          background: 'rgba(245, 158, 11, 0.2)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            width: '50%',
            height: '100%',
            background: '#F59E0B',
          }}
        />
      </motion.div>
    </motion.div>
  )
}
```

**Result Display**
```typescript
function AwaitAgentResult({ result }: ResultProps) {
  if (result.status === 'waiting_for_child') {
    return <AwaitAgentWaiting childSessionId={result.child_session_id} />
  }
  
  if (result.status === 'failed') {
    return (
      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: theme.errorLight,
        borderRadius: '8px',
        borderLeft: `3px solid ${theme.error}`,
      }}>
        <div style={{ color: theme.error }}>
          <XCircle size={16} style={{ marginRight: '8px' }} />
          {result.error}
        </div>
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.default}
      style={{
        marginTop: '12px',
        padding: '12px',
        background: theme.successLight,
        borderRadius: '8px',
        borderLeft: `3px solid ${theme.success}`,
      }}
    >
      <div style={{ 
        fontSize: '13px', 
        fontWeight: 500, 
        color: theme.success,
        marginBottom: '8px',
      }}>
        Child Agent Completed
      </div>
      
      {result.result && (
        <div style={{
          fontSize: '13px',
          color: theme.text.primary,
          whiteSpace: 'pre-wrap',
        }}>
          {result.result}
        </div>
      )}
    </motion.div>
  )
}
```

### Web Research Tool Design

**Visual Identity**
- Icon: Search (magnifying glass)
- Color: #10B981 (Green)
- Background: rgba(16, 185, 129, 0.05)
- Border: rgba(16, 185, 129, 0.2)

**Animation: Scanning Effect**
```typescript
function WebSearchAnimation({ status }: AnimationProps) {
  return (
    <div style={{ position: 'relative', width: '24px', height: '24px' }}>
      <Search size={20} color="#10B981" />
      
      {status === 'executing' && (
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid #10B981',
            borderRadius: '50%',
          }}
        />
      )}
    </div>
  )
}
```

**Parameters Display**
```typescript
function WebSearchParameters({ parameters }: ParametersProps) {
  return (
    <div style={{ marginTop: '12px' }}>
      {/* Query */}
      <ParamRow 
        label="Query" 
        value={parameters.query}
        icon={<Search size={14} />}
        highlight
      />
      
      {/* Detailed mode */}
      {parameters.detailed && (
        <div style={{
          marginTop: '8px',
          padding: '4px 8px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#10B981',
          width: 'fit-content',
        }}>
          Detailed Search (Brave)
        </div>
      )}
      
      {/* Localization */}
      {(parameters.country || parameters.search_lang) && (
        <div style={{ 
          marginTop: '8px', 
          fontSize: '12px', 
          color: theme.text.tertiary 
        }}>
          {parameters.country && `Country: ${parameters.country}`}
          {parameters.country && parameters.search_lang && ' • '}
          {parameters.search_lang && `Language: ${parameters.search_lang}`}
        </div>
      )}
    </div>
  )
}
```

**Result Display**
```typescript
function WebSearchResult({ result }: ResultProps) {
  if (result.error) {
    return (
      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: theme.errorLight,
        borderRadius: '8px',
        borderLeft: `3px solid ${theme.error}`,
      }}>
        <div style={{ color: theme.error }}>
          <AlertCircle size={16} style={{ marginRight: '8px' }} />
          {result.error}
        </div>
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={springPresets.gentle}
      style={{
        marginTop: '12px',
        padding: '12px',
        background: 'rgba(16, 185, 129, 0.08)',
        borderRadius: '8px',
        borderLeft: '3px solid #10B981',
      }}
    >
      <div style={{ 
        fontSize: '13px', 
        fontWeight: 500, 
        color: '#10B981',
        marginBottom: '8px',
      }}>
        Search Results
      </div>
      
      {/* Expandable result */}
      <ExpandableContent
        preview={truncate(JSON.stringify(result.result), 200)}
        full={<pre style={{ 
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {JSON.stringify(result.result, null, 2)}
        </pre>}
      />
    </motion.div>
  )
}
```

### Tool Configuration Map

```typescript
const toolConfigs: Record<string, ToolConfig> = {
  spawn_agent: {
    displayName: 'Spawn Agent',
    description: 'Creating child agent session',
    icon: <GitBranch size={20} />,
    color: '#8B5CF6',
    background: 'rgba(139, 92, 246, 0.05)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  send_message: {
    displayName: 'Send Message',
    description: 'Sending message to child agent',
    icon: <Send size={20} />,
    color: '#3B82F6',
    background: 'rgba(59, 130, 246, 0.05)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  await_agent: {
    displayName: 'Await Agent',
    description: 'Waiting for child agent completion',
    icon: <Clock size={20} />,
    color: '#F59E0B',
    background: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  web_research: {
    displayName: 'Web Research',
    description: 'Searching the web',
    icon: <Search size={20} />,
    color: '#10B981',
    background: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
}
```


---

## Human Intervention (Confirmation Requests)

### Overview

Confirmation requests pause agent execution to ask for human input. They have a distinct, attention-grabbing visual treatment that clearly differentiates them from regular messages and tool executions.

### Confirmation Types

**DECISION** - Binary or multiple choice
- No options: Yes/No confirmation
- With options: Choose from provided options or provide custom text

**TEXT** - Free-form text input
- Human must provide textual answer

### Confirmation Request Card

**Base Structure**
```typescript
interface ConfirmationRequestProps {
  confirmationId: string
  prompt: string
  originalToolCallId?: string
  options?: string[]
  kind: 'DECISION' | 'TEXT'
  status: 'pending' | 'confirmed' | 'rejected'
  confirmedAnswer?: string
  timestamp: Date
}

function ConfirmationRequestCard({ confirmation }: { confirmation: ConfirmationRequestProps }) {
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isPending = confirmation.status === 'pending'
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={springPresets.default}
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: isPending 
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05))'
          : theme.surface,
        border: isPending 
          ? '2px solid #F59E0B'
          : `1px solid ${theme.border.subtle}`,
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated border glow (pending only) */}
      {isPending && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            inset: -2,
            background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
            filter: 'blur(8px)',
            zIndex: 0,
          }}
        />
      )}
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <motion.div
            animate={isPending ? {
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <AlertCircle size={24} color="#F59E0B" />
          </motion.div>
          
          <div style={{ flex: 1 }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: '#F59E0B',
              marginBottom: '4px',
            }}>
              Human Input Required
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: theme.text.tertiary 
            }}>
              {confirmation.kind === 'DECISION' ? 'Decision Required' : 'Text Input Required'}
            </p>
          </div>
          
          {!isPending && (
            <StatusBadge 
              status={confirmation.status} 
              label={confirmation.status === 'confirmed' ? 'Confirmed' : 'Rejected'}
            />
          )}
        </div>
        
        {/* Linked tool call */}
        {confirmation.originalToolCallId && (
          <LinkedToolCall toolCallId={confirmation.originalToolCallId} />
        )}
        
        {/* Prompt */}
        <div style={{
          padding: '16px',
          background: theme.surface,
          borderRadius: '12px',
          marginBottom: '16px',
          border: `1px solid ${theme.border.subtle}`,
        }}>
          <p style={{ 
            fontSize: '15px', 
            color: theme.text.primary,
            lineHeight: 1.6,
          }}>
            {confirmation.prompt}
          </p>
        </div>
        
        {/* Input area (pending only) */}
        {isPending && (
          <ConfirmationInput
            kind={confirmation.kind}
            options={confirmation.options}
            answer={answer}
            setAnswer={setAnswer}
            onSubmit={(confirmed, answer) => handleConfirm(
              confirmation.confirmationId,
              confirmed,
              answer
            )}
            isSubmitting={isSubmitting}
          />
        )}
        
        {/* Confirmed answer display */}
        {!isPending && confirmation.confirmedAnswer && (
          <ConfirmedAnswerDisplay answer={confirmation.confirmedAnswer} />
        )}
      </div>
    </motion.div>
  )
}
```

### Linked Tool Call Display

**Show Which Tool Needs Confirmation**
```typescript
function LinkedToolCall({ toolCallId }: { toolCallId: string }) {
  const toolCall = useToolCall(toolCallId)
  
  if (!toolCall) return null
  
  const config = getToolConfig(toolCall.toolName)
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.03)',
        borderRadius: '8px',
        marginBottom: '12px',
        fontSize: '13px',
      }}
    >
      <Link size={14} color={theme.text.tertiary} />
      <span style={{ color: theme.text.secondary }}>
        Related to:
      </span>
      <span style={{ 
        color: config.color,
        fontWeight: 500,
      }}>
        {config.displayName}
      </span>
    </motion.div>
  )
}
```

### Confirmation Input Component

**Binary Decision (No Options)**
```typescript
function BinaryDecisionInput({ onSubmit, isSubmitting }: BinaryInputProps) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <motion.button
        onClick={() => onSubmit(true, null)}
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          flex: 1,
          padding: '12px 24px',
          background: theme.success,
          color: 'white',
          borderRadius: '12px',
          border: 'none',
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <Check size={18} />
        Confirm
      </motion.button>
      
      <motion.button
        onClick={() => onSubmit(false, null)}
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          flex: 1,
          padding: '12px 24px',
          background: theme.error,
          color: 'white',
          borderRadius: '12px',
          border: 'none',
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <X size={18} />
        Reject
      </motion.button>
    </div>
  )
}
```

**Multiple Choice Decision**
```typescript
function MultipleChoiceInput({ options, onSubmit, isSubmitting }: ChoiceInputProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  
  return (
    <div>
      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {options.map((option, index) => (
          <motion.button
            key={option}
            onClick={() => {
              setSelectedOption(option)
              setShowCustom(false)
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            style={{
              padding: '12px 16px',
              background: selectedOption === option 
                ? theme.primaryLight 
                : theme.surface,
              border: selectedOption === option
                ? `2px solid ${theme.primary}`
                : `1px solid ${theme.border.subtle}`,
              borderRadius: '10px',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: theme.text.primary,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <motion.div
                animate={{
                  scale: selectedOption === option ? 1 : 0,
                  opacity: selectedOption === option ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <Check size={16} color={theme.primary} />
              </motion.div>
              <span>{option}</span>
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Custom text option */}
      <motion.button
        onClick={() => {
          setShowCustom(!showCustom)
          setSelectedOption(null)
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: 'transparent',
          border: `1px dashed ${theme.border.medium}`,
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '13px',
          color: theme.text.secondary,
          marginBottom: '12px',
        }}
      >
        <Edit2 size={14} style={{ marginRight: '8px' }} />
        Or provide custom answer
      </motion.button>
      
      {/* Custom text input */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={springPresets.gentle}
            style={{ marginBottom: '12px' }}
          >
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type your answer..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                background: theme.background,
                border: `1px solid ${theme.border.subtle}`,
                borderRadius: '10px',
                fontSize: '14px',
                color: theme.text.primary,
                resize: 'vertical',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Submit button */}
      <motion.button
        onClick={() => {
          const answer = showCustom ? customText : selectedOption
          if (answer) {
            onSubmit(true, answer)
          }
        }}
        disabled={isSubmitting || (!selectedOption && !customText)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          padding: '12px 24px',
          background: theme.primary,
          color: 'white',
          borderRadius: '12px',
          border: 'none',
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
          opacity: (!selectedOption && !customText) ? 0.5 : 1,
        }}
      >
        {isSubmitting ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 size={16} />
            </motion.div>
            Submitting...
          </div>
        ) : (
          'Submit Answer'
        )}
      </motion.button>
    </div>
  )
}
```

**Text Input**
```typescript
function TextInput({ answer, setAnswer, onSubmit, isSubmitting }: TextInputProps) {
  return (
    <div>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        autoFocus
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '12px',
          background: theme.background,
          border: `2px solid ${theme.border.medium}`,
          borderRadius: '12px',
          fontSize: '14px',
          color: theme.text.primary,
          resize: 'vertical',
          marginBottom: '12px',
        }}
      />
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <motion.button
          onClick={() => onSubmit(true, answer)}
          disabled={isSubmitting || !answer.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: theme.primary,
            color: 'white',
            borderRadius: '12px',
            border: 'none',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            opacity: !answer.trim() ? 0.5 : 1,
          }}
        >
          {isSubmitting ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Loader2 size={16} />
              </motion.div>
              Submitting...
            </div>
          ) : (
            'Submit Answer'
          )}
        </motion.button>
        
        <motion.button
          onClick={() => onSubmit(false, null)}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: theme.text.secondary,
            border: `1px solid ${theme.border.medium}`,
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cancel
        </motion.button>
      </div>
    </div>
  )
}
```

### Confirmed Answer Display

**Show What Human Answered**
```typescript
function ConfirmedAnswerDisplay({ answer }: { answer: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.default}
      style={{
        padding: '12px 16px',
        background: theme.successLight,
        borderRadius: '10px',
        borderLeft: `3px solid ${theme.success}`,
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '8px',
      }}>
        <Check size={16} color={theme.success} />
        <span style={{ 
          fontSize: '13px', 
          fontWeight: 500, 
          color: theme.success 
        }}>
          Confirmed
        </span>
      </div>
      
      <div style={{
        fontSize: '14px',
        color: theme.text.primary,
        whiteSpace: 'pre-wrap',
      }}>
        {answer}
      </div>
    </motion.div>
  )
}
```

### Confirmation API Integration

**Submit Confirmation**
```typescript
async function handleConfirm(
  confirmationId: string,
  confirmed: boolean,
  answer: string | null
) {
  setIsSubmitting(true)
  
  try {
    const response = await fetch(
      `http://localhost:8080/v1/sessions/${sessionId}/confirm`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationId,
          confirmed,
          answer,
        }),
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to submit confirmation')
    }
    
    // Show success feedback
    soundManager.play('taskComplete')
    hapticManager.success()
    
    // Update UI
    updateConfirmationStatus(confirmationId, 'confirmed', answer)
    
  } catch (error) {
    // Show error toast
    showToast({
      variant: 'error',
      message: 'Failed to submit confirmation. Please try again.',
    })
  } finally {
    setIsSubmitting(false)
  }
}
```

### Pending Confirmation Indicator

**Show in Chat Header**
```typescript
function PendingConfirmationBanner({ count }: { count: number }) {
  if (count === 0) return null
  
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={springPresets.default}
      style={{
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: 'pointer',
      }}
      onClick={() => scrollToPendingConfirmation()}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <AlertCircle size={20} />
      </motion.div>
      
      <span style={{ fontSize: '14px', fontWeight: 500 }}>
        {count} {count === 1 ? 'confirmation' : 'confirmations'} pending
      </span>
      
      <ChevronDown size={16} />
    </motion.div>
  )
}
```

### Confirmation State Management

**Track Confirmations in Store**
```typescript
interface ConfirmationState {
  confirmations: Map<string, ConfirmationRequest>
  pendingCount: number
  
  addConfirmation: (confirmation: ConfirmationRequest) => void
  updateConfirmation: (confirmationId: string, status: string, answer?: string) => void
  getPendingConfirmations: () => ConfirmationRequest[]
}

const useConfirmationStore = create<ConfirmationState>((set, get) => ({
  confirmations: new Map(),
  pendingCount: 0,
  
  addConfirmation: (confirmation) => {
    set((state) => {
      const newConfirmations = new Map(state.confirmations)
      newConfirmations.set(confirmation.confirmationId, confirmation)
      
      return {
        confirmations: newConfirmations,
        pendingCount: state.pendingCount + 1,
      }
    })
  },
  
  updateConfirmation: (confirmationId, status, answer) => {
    set((state) => {
      const newConfirmations = new Map(state.confirmations)
      const confirmation = newConfirmations.get(confirmationId)
      
      if (confirmation) {
        newConfirmations.set(confirmationId, {
          ...confirmation,
          status,
          confirmedAnswer: answer,
        })
      }
      
      return {
        confirmations: newConfirmations,
        pendingCount: Math.max(0, state.pendingCount - 1),
      }
    })
  },
  
  getPendingConfirmations: () => {
    return Array.from(get().confirmations.values())
      .filter((c) => c.status === 'pending')
  },
}))
```


---

## Animation Principles & Best Practices

### The 12 Principles of Animation (Applied to UI)

These principles, originally developed by Disney animators, create believable, engaging motion that feels natural and human.

#### 1. Squash & Stretch

**Purpose**: Convey weight, mass, and flexibility
**UI Application**: Button presses, elastic interactions

```typescript
// Button press with squash
<motion.button
  whileTap={{
    scaleY: 0.95,  // Squash vertically
    scaleX: 1.02,  // Stretch horizontally (maintain volume)
  }}
  transition={{
    type: 'spring',
    stiffness: 500,
    damping: 15,
  }}
>
  Press Me
</motion.button>

// Elastic card hover
<motion.div
  whileHover={{
    scale: 1.02,
    scaleY: 1.03,  // Slight vertical stretch
  }}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 20,
  }}
>
  {content}
</motion.div>
```

#### 2. Anticipation

**Purpose**: Prepare the viewer for an action
**UI Application**: Pre-movement before major transitions

```typescript
// Modal opening with anticipation
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ 
    scale: [0.9, 0.95, 1],  // Slight pull back before full scale
    opacity: [0, 0.5, 1],
  }}
  transition={{
    duration: 0.4,
    times: [0, 0.3, 1],
    ease: [0.34, 1.56, 0.64, 1],  // Overshoot easing
  }}
>
  {modalContent}
</motion.div>

// Button click anticipation
const handleClick = async () => {
  // Slight scale down (anticipation)
  await controls.start({ scale: 0.95 })
  // Then action
  await performAction()
  // Then scale up (follow through)
  await controls.start({ scale: 1 })
}
```

#### 3. Staging

**Purpose**: Direct attention to what's important
**UI Application**: Focus management, z-index, blur, opacity

```typescript
// Modal with staged focus
<AnimatePresence>
  {isOpen && (
    <>
      {/* Background - dimmed and blurred */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
      />
      
      {/* Modal - sharp and elevated */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          position: 'fixed',
          zIndex: 1000,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {content}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

#### 4. Straight Ahead vs Pose-to-Pose

**Purpose**: Control animation flow
**UI Application**: Keyframe animations vs spring physics

```typescript
// Pose-to-pose (keyframes) - precise control
<motion.div
  animate={{
    x: [0, 100, 100, 0],
    y: [0, 0, 100, 100],
    rotate: [0, 90, 180, 270],
  }}
  transition={{
    duration: 2,
    times: [0, 0.33, 0.66, 1],
    ease: 'easeInOut',
  }}
/>

// Straight ahead (spring) - natural flow
<motion.div
  animate={{ x: 100, y: 100 }}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 30,
  }}
/>
```

#### 5. Follow Through & Overlapping Action

**Purpose**: Create realistic momentum
**UI Application**: Staggered animations, trailing elements

```typescript
// Menu items with follow through
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      variants={itemVariants}
      transition={{
        delay: i * 0.05,  // Stagger
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}
```

#### 6. Slow In & Slow Out (Easing)

**Purpose**: Natural acceleration and deceleration
**UI Application**: Smooth transitions with proper easing curves

```typescript
// Custom easing curves
const easings = {
  // Entrances - start slow, end fast
  easeOut: [0, 0, 0.2, 1],  // cubic-bezier(0, 0, 0.2, 1)
  
  // Exits - start fast, end slow
  easeIn: [0.4, 0, 1, 1],  // cubic-bezier(0.4, 0, 1, 1)
  
  // Both - slow start and end
  easeInOut: [0.4, 0, 0.2, 1],  // cubic-bezier(0.4, 0, 0.2, 1)
  
  // Emphasized - dramatic deceleration
  emphasized: [0.05, 0.7, 0.1, 1],  // Material Design
  
  // Bounce - overshoot
  bounce: [0.34, 1.56, 0.64, 1],
}

// Usage
<motion.div
  animate={{ x: 100 }}
  transition={{
    duration: 0.3,
    ease: easings.easeOut,
  }}
/>
```

**Timing Recommendations**
- Micro-interactions: 150-200ms
- Standard transitions: 250-300ms
- Complex animations: 400-500ms
- Never exceed 500ms for UI feedback

#### 7. Arc

**Purpose**: Natural motion follows curved paths
**UI Application**: Floating elements, drag interactions

```typescript
// Floating notification with arc
<motion.div
  animate={{
    x: [0, 50, 100],
    y: [0, -30, 0],  // Arc trajectory
  }}
  transition={{
    duration: 0.6,
    times: [0, 0.5, 1],
    ease: 'easeInOut',
  }}
/>

// Drag with arc constraint
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 200 }}
  dragElastic={0.2}
  dragTransition={{
    power: 0.3,
    timeConstant: 200,
  }}
/>
```

#### 8. Secondary Action

**Purpose**: Add richness without distracting from primary action
**UI Application**: Subtle supporting animations

```typescript
// Button with secondary glow
<motion.button
  whileHover="hover"
  whileTap="tap"
>
  {/* Primary action - scale */}
  <motion.div
    variants={{
      hover: { scale: 1.05 },
      tap: { scale: 0.95 },
    }}
  >
    Click Me
  </motion.div>
  
  {/* Secondary action - glow */}
  <motion.div
    variants={{
      hover: { 
        opacity: [0, 0.5, 0],
        scale: [0.8, 1.2, 1.4],
      },
    }}
    transition={{
      duration: 1,
      repeat: Infinity,
    }}
    style={{
      position: 'absolute',
      inset: -10,
      background: 'radial-gradient(circle, rgba(245,158,11,0.3), transparent)',
      filter: 'blur(20px)',
      pointerEvents: 'none',
    }}
  />
</motion.button>
```

#### 9. Timing

**Purpose**: Control speed to convey weight and personality
**UI Application**: Different durations for different elements

```typescript
// Heavy element - slower
<motion.div
  animate={{ y: 100 }}
  transition={{
    duration: 0.6,  // Slower = heavier
    ease: [0.4, 0, 0.2, 1],
  }}
  style={{ fontSize: '48px', fontWeight: 700 }}
>
  Heavy Title
</motion.div>

// Light element - faster
<motion.div
  animate={{ y: 100 }}
  transition={{
    duration: 0.2,  // Faster = lighter
    ease: [0, 0, 0.2, 1],
  }}
  style={{ fontSize: '12px', fontWeight: 400 }}
>
  Light caption
</motion.div>
```

#### 10. Exaggeration

**Purpose**: Make actions clear and appealing
**UI Application**: Overshoot, bounce, dramatic scale

```typescript
// Exaggerated success animation
<motion.div
  animate={{
    scale: [0, 1.3, 1],  // Overshoot
    rotate: [0, 10, -10, 0],  // Wiggle
  }}
  transition={{
    duration: 0.6,
    times: [0, 0.6, 1],
    ease: [0.34, 1.56, 0.64, 1],
  }}
>
  <CheckCircle size={48} />
</motion.div>

// Exaggerated error shake
<motion.div
  animate={{
    x: [0, -10, 10, -10, 10, 0],
    rotate: [0, -2, 2, -2, 2, 0],
  }}
  transition={{
    duration: 0.5,
    ease: 'easeInOut',
  }}
>
  <AlertCircle size={48} />
</motion.div>
```

#### 11. Solid Drawing (Depth)

**Purpose**: Create sense of volume and space
**UI Application**: Shadows, transforms, perspective

```typescript
// 3D card flip
<motion.div
  whileHover={{ rotateY: 180 }}
  transition={{
    duration: 0.6,
    ease: 'easeInOut',
  }}
  style={{
    transformStyle: 'preserve-3d',
    perspective: 1000,
  }}
>
  <div style={{
    backfaceVisibility: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  }}>
    Front
  </div>
  <div style={{
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    position: 'absolute',
    inset: 0,
  }}>
    Back
  </div>
</motion.div>

// Layered depth with parallax
<motion.div
  style={{ y: useTransform(scrollY, [0, 1000], [0, -100]) }}
>
  Background layer
</motion.div>
<motion.div
  style={{ y: useTransform(scrollY, [0, 1000], [0, -300]) }}
>
  Foreground layer
</motion.div>
```

#### 12. Appeal

**Purpose**: Make animations pleasant and engaging
**UI Application**: Personality, delight, polish

```typescript
// Delightful loading spinner
<motion.div
  animate={{
    rotate: 360,
    borderRadius: ['50%', '20%', '50%'],
  }}
  transition={{
    rotate: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
    borderRadius: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }}
  style={{
    width: 40,
    height: 40,
    background: 'linear-gradient(135deg, #F59E0B, #F97316)',
  }}
/>

// Playful hover effect
<motion.button
  whileHover={{
    scale: 1.05,
    rotate: [0, -5, 5, -5, 0],
  }}
  whileTap={{ scale: 0.95 }}
  transition={{
    rotate: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  }}
>
  Click me!
</motion.button>
```

### Spring Physics Parameters

**Understanding Spring Values**

```typescript
// Stiff spring - snappy, quick
{
  type: 'spring',
  stiffness: 500,  // High = fast response
  damping: 25,     // Controls oscillation
}

// Soft spring - gentle, smooth
{
  type: 'spring',
  stiffness: 200,  // Low = slow response
  damping: 35,     // Higher = less bounce
}

// Bouncy spring - playful
{
  type: 'spring',
  stiffness: 300,
  damping: 15,     // Low = more bounce
}

// Critical damping - no bounce
{
  type: 'spring',
  stiffness: 300,
  damping: 30,     // Perfect balance
}
```

**Spring Presets for Common Use Cases**

```typescript
const springPresets = {
  // UI feedback - instant response
  instant: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  },
  
  // Button interactions - snappy
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  },
  
  // Default transitions - balanced
  default: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  
  // Gentle movements - smooth
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 35,
    mass: 1.2,
  },
  
  // Playful interactions - bouncy
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
    mass: 1,
  },
  
  // Heavy elements - slow
  heavy: {
    type: 'spring',
    stiffness: 200,
    damping: 40,
    mass: 2,
  },
}
```

### Performance Best Practices

**1. Animate Transform & Opacity Only**
```typescript
// ✅ Good - GPU accelerated
<motion.div
  animate={{
    x: 100,           // transform: translateX
    y: 100,           // transform: translateY
    scale: 1.2,       // transform: scale
    rotate: 45,       // transform: rotate
    opacity: 0.5,     // opacity
  }}
/>

// ❌ Bad - triggers layout/paint
<motion.div
  animate={{
    width: 200,       // Triggers layout
    height: 200,      // Triggers layout
    top: 100,         // Triggers layout
    backgroundColor: '#000',  // Triggers paint
  }}
/>
```

**2. Use will-change Sparingly**
```typescript
// Only for animations you know will happen
<motion.div
  style={{
    willChange: 'transform',  // Hint to browser
  }}
  whileHover={{ scale: 1.1 }}
/>
```

**3. Reduce Motion for Accessibility**
```typescript
function useReducedMotion() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  
  return {
    transition: prefersReducedMotion 
      ? { duration: 0 }
      : springPresets.default,
    shouldAnimate: !prefersReducedMotion,
  }
}

// Usage
const { transition, shouldAnimate } = useReducedMotion()

<motion.div
  animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 1 }}
  transition={transition}
/>
```

**4. Memoize Animation Variants**
```typescript
// ✅ Good - defined outside component
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function Component() {
  return <motion.div variants={variants} />
}

// ❌ Bad - recreated on every render
function Component() {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }
  return <motion.div variants={variants} />
}
```

### Animation Checklist

Before shipping any animation, verify:

- [ ] Duration under 500ms for UI feedback
- [ ] Uses transform/opacity (not layout properties)
- [ ] Respects prefers-reduced-motion
- [ ] Has clear purpose (not decorative only)
- [ ] Tested at 60fps on target devices
- [ ] Provides immediate feedback (<100ms)
- [ ] Follows natural easing curves
- [ ] Maintains visual hierarchy
- [ ] Doesn't distract from content
- [ ] Enhances usability


---

## Advanced Animation Components

**Status**: ✅ Implemented (April 8, 2026)  
**Source**: Modern web animation techniques from svgator.com  
**Purpose**: Enhanced microinteractions, loading states, and list animations

### Microinteractions

#### Toggle Switch

**Design Specifications**:
- Size: 48px × 24px (md), 40px × 20px (sm), 56px × 28px (lg)
- Animation: Slide with spring physics (stiffness: 500, damping: 30)
- States: On (primary color), Off (surface color)
- Transition: 200ms spring
- Disabled: 50% opacity, no interaction

**Implementation**:
```typescript
<Toggle 
  size="md"
  checked={isEnabled}
  onChange={setIsEnabled}
  disabled={false}
/>
```

**Use Cases**: Settings, preferences, feature flags, binary options

---

#### Checkbox

**Design Specifications**:
- Size: 20px × 20px
- Animation: Checkmark rotates (-180deg → 0deg) and scales (0 → 1) with bouncy spring
- Border: 2px, transitions to primary when checked
- Checkmark: Lucide Check icon, 14px, white color, 3px stroke width

**Implementation**:
```typescript
<Checkbox
  checked={isAccepted}
  onChange={setIsAccepted}
  label="Accept terms and conditions"
  disabled={false}
/>
```

**Use Cases**: Forms, multi-select lists, filters, settings

---

#### Radio Button

**Design Specifications**:
- Size: 20px × 20px (outer), 12px × 12px (inner dot)
- Animation: Inner dot scales in (0 → 1) with bouncy spring
- Border: 2px, transitions to primary when checked
- Shape: Perfect circle (border-radius: 50%)

**Implementation**:
```typescript
<Radio
  checked={selectedOption === 'option1'}
  onChange={() => setSelectedOption('option1')}
  label="Option 1"
/>
```

**Use Cases**: Single-select options, settings, filters

---

### Loading States

#### Skeleton Screens

**Design Philosophy**: Better UX than spinners - shows content structure while loading

**Variants**:
1. **Base Skeleton**: Generic rectangular placeholder
2. **SkeletonCard**: Agent/session card structure (avatar + 2 text lines)
3. **SkeletonMessage**: Chat message structure (avatar + 3 text lines)
4. **SkeletonList**: Multiple skeleton cards with configurable count
5. **SkeletonText**: Multiple text lines with configurable line count

**Animation**:
- Pulse: opacity 0.5 → 1.0 → 0.5
- Duration: 1.5s infinite
- Easing: easeInOut
- Color: Surface color with subtle opacity change

**Implementation**:
```typescript
// Loading agent list
{isLoading ? (
  <SkeletonList count={5} />
) : (
  agents.map(agent => <AgentCard key={agent.id} agent={agent} />)
)}

// Loading single message
{isLoading ? (
  <SkeletonMessage isUser={false} />
) : (
  <MessageBubble message={message} />
)}
```

**Use Cases**: 
- Agent list loading
- Session list loading
- Message history loading
- Profile data loading

---

#### Shimmer Effect

**Design Philosophy**: Premium loading indicator with moving gradient

**Specifications**:
- Gradient: Transparent → White/10% → Transparent
- Animation: Translate X from -100% to 100%
- Duration: 1.5s infinite
- Easing: Linear
- Direction: Left-to-right (default), top-to-bottom (optional)

**Variants**:
1. **Shimmer**: Base wrapper component
2. **ShimmerCard**: Card with shimmer overlay
3. **ShimmerButton**: Button with shimmer on hover

**Implementation**:
```typescript
// Shimmer overlay on loading card
<ShimmerCard>
  <h4>Loading Content</h4>
  <p>Please wait...</p>
</ShimmerCard>

// Shimmer button (hover effect)
<ShimmerButton onClick={handleClick}>
  Hover Me
</ShimmerButton>

// Custom shimmer wrapper
<Shimmer duration={2} direction="top-to-bottom">
  <YourContent />
</Shimmer>
```

**Use Cases**:
- Loading states for cards
- Premium button hover effects
- Content placeholders
- Skeleton enhancement

---

### List Animations

#### Stagger Animations

**Design Philosophy**: Sequential reveal creates visual hierarchy and draws attention

**Specifications**:
- Delay: 50-100ms between items (configurable)
- Directions: Up (y: 20 → 0), Down (y: -20 → 0), Left (x: 20 → 0), Right (x: -20 → 0)
- Spring physics: Default preset (stiffness: 300, damping: 30)
- Performance: Limit to 20 items max for smooth 60fps

**Implementation**:
```typescript
// Agent list with stagger
<StaggerList direction="up" staggerDelay={0.1}>
  {agents.map(agent => (
    <AgentCard key={agent.id} agent={agent} />
  ))}
</StaggerList>

// Grid layout with stagger
<StaggerList 
  direction="up" 
  staggerDelay={0.08}
  className="grid grid-cols-2 gap-4"
>
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</StaggerList>
```

**Use Cases**:
- Agent list appearing
- Session list appearing
- Message list appearing
- Planning tasks appearing
- Search results appearing

---

#### Scroll-Triggered Animations

**Design Philosophy**: Reveal content as user scrolls for engaging experience

**Specifications**:
- Threshold: 0.1 (10% visible triggers animation)
- Once: true (animate only first time for performance)
- Directions: Up, Down, Left, Right, Scale
- Intersection Observer based (efficient)
- Amount: 0.3 (30% of element must be visible)

**Components**:
1. **ScrollReveal**: Single element animation
2. **ScrollStagger**: Multiple elements with stagger

**Implementation**:
```typescript
// Single element reveal
<ScrollReveal direction="up" delay={0}>
  <Card>Content appears when scrolled into view</Card>
</ScrollReveal>

// Multiple elements with stagger
<ScrollStagger staggerDelay={0.1}>
  {messages.map(msg => (
    <MessageBubble key={msg.id} message={msg} />
  ))}
</ScrollStagger>
```

**Use Cases**:
- Messages appearing as you scroll
- Long content reveals
- Feature sections
- Testimonials
- Image galleries

---

### View Transitions

#### Page Transitions

**Design Philosophy**: Smooth transitions between views maintain context and reduce jarring changes

**Specifications**:
- Types: Fade, Slide, SlideUp, SlideDown, Scale
- Duration: 300ms (normal), configurable
- Easing: easeInOut
- AnimatePresence: mode="wait" (exit before enter)

**Implementation**:
```typescript
// Basic page transition
<PageTransition pageKey={currentView} type="slideUp">
  {currentView === 'agents' ? <AgentList /> : <SessionList />}
</PageTransition>

// View switcher helper
<ViewSwitcher
  views={{
    agents: <AgentList />,
    sessions: <SessionList />,
    settings: <Settings />,
  }}
  currentView={activeView}
  transitionType="fade"
/>
```

**Use Cases**:
- Sidebar view switching (agents ↔ sessions)
- Modal content switching
- Tab content switching
- Settings panels
- Wizard steps

---

### Enhanced Links

#### AnimatedLink

**Design Philosophy**: Links with character-by-character animation and serif font switch create premium feel

**Specifications**:
- Character stagger: 50ms default (configurable)
- Hover effect: Sans → Serif font switch
- Underline animation: Width 0 → 100%, 300ms
- Color transition: text-secondary → primary

**Implementation**:
```typescript
// Basic animated link
<AnimatedLink
  text="Documentation"
  href="/docs"
  stagger={0.05}
/>

// Link with serif switch on hover
<AnimatedLink
  text="Learn More"
  href="/learn"
  hoverFontSwitch={true}
/>
```

**Use Cases**:
- Navigation links
- External links
- Documentation links
- Footer links
- Call-to-action links

---

### Animation Performance Guidelines

**For List Animations**:
- Limit stagger to 20 items max
- Use `once: true` for scroll animations
- Debounce scroll events
- Use Intersection Observer (not scroll listeners)

**For Loading States**:
- Prefer skeleton screens over spinners
- Show skeleton for >200ms delays
- Match skeleton structure to actual content
- Use shimmer sparingly (premium feel only)

**For Microinteractions**:
- Keep animations under 300ms
- Use spring physics for natural feel
- Provide immediate feedback (<100ms)
- Respect prefers-reduced-motion

**For View Transitions**:
- Keep transitions under 400ms
- Use fade for simple switches
- Use slide for directional context
- Avoid transitions for rapid switching

---

### Integration Checklist

When integrating these components into the application:

- [ ] Replace loading spinners with skeleton screens
- [ ] Add stagger animations to agent/session lists
- [ ] Add page transitions to sidebar view switching
- [ ] Add scroll reveals to message history
- [ ] Use toggle/checkbox/radio in settings
- [ ] Add shimmer to premium loading states
- [ ] Use animated links in navigation
- [ ] Test all animations at 60fps
- [ ] Verify reduced motion support
- [ ] Measure performance impact

---

### Component Reference

| Component | File | Use Case | Priority |
|-----------|------|----------|----------|
| Toggle | `Toggle.tsx` | Settings, preferences | High |
| Checkbox | `Checkbox.tsx` | Forms, filters | High |
| Radio | `Checkbox.tsx` | Single-select options | High |
| Skeleton | `Skeleton.tsx` | Loading states | High |
| Shimmer | `Shimmer.tsx` | Premium loading | Medium |
| StaggerList | `StaggerList.tsx` | List animations | High |
| PageTransition | `PageTransition.tsx` | View switching | High |
| ScrollReveal | `ScrollReveal.tsx` | Scroll animations | Medium |
| AnimatedLink | `AnimatedText.tsx` | Navigation | Low |

