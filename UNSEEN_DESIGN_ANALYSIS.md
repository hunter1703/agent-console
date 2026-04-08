# Unseen.co Design System Analysis

**Source**: Complete HTML clone of unseen.co website  
**Date Analyzed**: April 8, 2026  
**Purpose**: Deep understanding of premium design philosophy for Agent Console V2

---

## 1. CORE DESIGN PHILOSOPHY

### Brand Identity
- **Tagline**: "A brand, digital and motion studio creating refreshingly unexpected ideas and striking visuals that help bold brands cut through the noise"
- **Philosophy**: Unexpected, bold, striking, refreshing
- **Award**: Design Studio of the Year – Awwwards

### Design Principles (Extracted from Implementation)
1. **Playful Sophistication**: Animated eyes, liquid morphing, organic movements
2. **Premium Minimalism**: Clean layouts with generous spacing
3. **Delightful Interactions**: Every hover, click, and transition is animated
4. **Attention to Detail**: Character-by-character text animations
5. **Performance-First**: GPU acceleration, smooth 60fps animations

---

## 2. COLOR SYSTEM

### Primary Colors
```css
/* Light Theme - NOT USED (they use dark) */
--background: #FFFFFF
--surface: #FEFCE8 (warm cream)
--text-primary: #1C1917 (near black)
--text-secondary: #78716C (warm gray)
--text-tertiary: #A8A29E (light gray)

/* Dark Theme - ACTUAL SITE COLORS */
--background: #09090B (true black)
--surface: #18181B (dark gray)
--surface-hover: #27272A (lighter gray)
--text-primary: #FAFAFA (off-white)
--text-secondary: #A1A1AA (medium gray)
--text-tertiary: #71717A (darker gray)

/* Accent Colors */
--primary: #FAFAFA (white in dark mode)
--border-subtle: #27272A
--border-medium: #3F3F46
--border-strong: #52525B

/* Special Colors */
Pink: #F8D8D8 (for eyes/special elements)
Orange: #FF4E1B (for hearts in eyes)
Beige: #F1EDEB (menu background)
```

### Color Philosophy
- **90% Grayscale**: Almost entirely black, white, and grays
- **Color as Accent**: Pink and orange ONLY for special interactive elements (eyes, hearts)
- **High Contrast**: Pure black (#09090B) with off-white (#FAFAFA)
- **Warm Neutrals**: Beige menu (#F1EDEB) provides warmth without color

---

## 3. TYPOGRAPHY

### Font Families
```css
/* Primary (Sans-Serif) */
font-family: 'Neue Montreal', system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif

/* Secondary (Serif) - For Emphasis */
font-family: 'Saol Display', Georgia, Cambria, 'Times New Roman', Times, serif
```

### Font Sizes (Fluid Typography)
```css
/* Base calculation */
html { font-size: clamp(14px, 1vw, 38px); }

/* Scale (in rem) */
--font-xs: 0.7rem    /* 11px */
--font-sm: 0.8rem    /* 13px */
--font-base: 1rem    /* 15px */
--font-lg: 1.2rem    /* 17px */
--font-xl: 1.3rem    /* 20px */
--font-2xl: 1.5rem   /* 24px */
--font-3xl: 4rem     /* 32px+ */
--font-huge: 6.25rem /* Menu items */
```

### Typography Rules
1. **Sans-serif for UI**: All navigation, buttons, body text
2. **Serif for Emphasis**: Hover states, menu items (italic)
3. **Tight Letter Spacing**: `letter-spacing: -0.1rem` (t-ls-tighter)
4. **Tight Line Height**: `line-height: 0.9` to `1.1`
5. **Uppercase for Labels**: Small text, navigation hints

---

## 4. SPACING SYSTEM

### Scale (Generous Spacing)
```css
--spacing-1: 1rem   /* 16px */
--spacing-2: 2rem   /* 32px */
--spacing-3: 3rem   /* 48px */
--spacing-4: 4rem   /* 64px */
--spacing-6: 6rem   /* 96px */
--spacing-8: 8rem   /* 128px */
```

### Layout Spacing
- **Header padding**: 1rem (mobile), 2rem (desktop)
- **Section gaps**: 4rem to 8rem between major sections
- **Menu padding**: 8.3rem top/bottom, 6.25rem left
- **Card padding**: 1rem to 2rem
- **Button padding**: 0.8rem vertical, 1.5rem horizontal

### Spacing Philosophy
- **Breathing Room**: Generous whitespace everywhere
- **Consistent Rhythm**: Multiples of 8px (0.5rem)
- **Responsive**: Increases on larger screens

---

## 5. ANIMATION SYSTEM

### Core Animation Principles (Disney's 12 Principles Applied)

#### 1. Squash & Stretch
```css
/* Button press */
whileTap: { scaleY: 0.95, scaleX: 1.02 }
```

#### 2. Anticipation
```css
/* Hover lift before click */
whileHover: { y: -2, scale: 1.02 }
```

#### 3. Staging
- Clear visual hierarchy
- One focal point at a time
- Animations draw attention

#### 4. Straight Ahead & Pose-to-Pose
```javascript
// Character-by-character text reveal
chars.forEach((char, i) => {
  animate(char, { 
    opacity: [0, 1],
    transform: ['translateY(150%)', 'translateY(0%)']
  }, { delay: i * 0.05 })
})
```

#### 5. Follow Through & Overlapping Action
```css
/* Menu items stagger */
transform: translate(10%, 0px) /* Item 1 */
transform: translate(20%, 0px) /* Item 2 */
transform: translate(30%, 0px) /* Item 3 */
```

#### 6. Slow In & Slow Out (Easing)
```css
/* Custom cubic-bezier */
transition: 1s cubic-bezier(0.16, 1, 0.3, 1)
/* Emphasized easing for smooth, natural motion */
```

#### 7. Arcs
- Cursor follows smooth arcs
- Elements move in curved paths
- No linear motion

#### 8. Secondary Action
```css
/* Eyes blink while page loads */
/* Ripple effect on theme toggle */
/* Text morphs while button hovers */
```

#### 9. Timing
```css
/* Fast interactions */
--duration-instant: 0.1s
--duration-fast: 0.2s
--duration-normal: 0.3s
--duration-slow: 0.5s
--duration-slower: 1s

/* Specific timings */
Button hover: 0.2s
Menu open: 0.3s
Text reveal: 1s
Loader: 1.5s to 8s (ambient)
```

#### 10. Exaggeration
- Eyes with hearts on hover
- Liquid blob morphing (extreme)
- Magnetic hover (10px pull)
- Scale transforms (1.05, 1.1)

#### 11. Solid Drawing (3D Depth)
```css
/* Shadows for depth */
box-shadow: 0 4px 6px rgba(0,0,0,0.1)
box-shadow: 0 10px 15px rgba(0,0,0,0.1)
box-shadow: 0 20px 25px rgba(0,0,0,0.1)

/* Backdrop blur for glassmorphism */
backdrop-filter: blur(8px)
```

#### 12. Appeal
- Playful eyes character
- Smooth, organic animations
- Delightful micro-interactions
- Personality in every detail

---

## 6. BUTTON DESIGN

### Button Anatomy
```html
<button class="btn btn--regular btn--fill btn--light">
  <span class="btn__inner">
    <span class="btn__content">Text</span>
    <span class="btn__content--cloned">Text</span> <!-- For animation -->
  </span>
  <svg><!-- Animated border --></svg>
</button>
```

### Button Variants
1. **Fill**: Solid background, morphs on hover
2. **Border**: Outline only, fills on hover
3. **Circle**: Round icon buttons (3.7rem diameter)

### Button Animations
```css
/* Hover */
- Scale: 1.02
- Y-translate: -2px
- Border morphs with SVG masks
- Text slides up, cloned text slides in from bottom
- Icon translates

/* Press */
- Scale: 0.98
- Duration: 0.1s

/* Border Animation */
- SVG masks reveal/hide borders
- Liquid morphing effect
- 4 corner clips animate independently
```

### Button States
```css
/* Default */
--text: #212121
--background: #fff
--border: #fff

/* Hover */
--hoverText: #fff
--hoverFill: #212121
--hoverBorder: #212121

/* Disabled */
opacity: 0.5
cursor: not-allowed
```

---

## 7. CURSOR SYSTEM

### Custom Cursor Elements
```html
<div class="cursor">
  <div class="cursor__circle"></div>      <!-- Default -->
  <div class="cursor__hold"></div>        <!-- Click & hold -->
  <div class="cursor__drag"></div>        <!-- Drag -->
  <div class="cursor__progress"></div>    <!-- Loading -->
  <div class="cursor__video"></div>       <!-- Video play/pause -->
</div>
```

### Cursor States
1. **Default**: 2.2rem circle, 1.5px border
2. **Hover**: Scale 1.5, 24px diameter
3. **Active**: Scale 0.8, 8px diameter
4. **Text**: Vertical line (I-beam)
5. **Drag**: Arrows showing direction
6. **Video**: Play/pause icon
7. **Hold**: Circular progress indicator

### Cursor Behavior
```javascript
// Smooth follow with lerp
const lerp = (start, end, factor) => start + (end - start) * factor
cursor.x = lerp(cursor.x, mouse.x, 0.15)
cursor.y = lerp(cursor.y, mouse.y, 0.15)

// GPU accelerated
transform: translateZ(0)
will-change: transform
```

---

## 8. NAVIGATION DESIGN

### Header
```css
/* Fixed header */
position: fixed
top: 0
width: 100%
z-index: 80
padding: 1rem (mobile), 2rem (desktop)
```

### Navigation Items
```html
<a class="nav-item">
  <div class="nav-item__text">Index</div>
  <div class="nav-item__text--hover">Index</div> <!-- Serif, italic -->
</a>
```

### Nav Hover Animation
```javascript
// Character-by-character reveal
1. Default text slides up (translateY: -150%)
2. Hover text (serif, italic) slides in from bottom
3. Each character animates with 50ms stagger
4. Font switches: Sans → Serif Italic
```

### Menu (Hamburger)
```css
/* Full-screen overlay */
position: fixed
width: 100% (mobile), 41rem (desktop)
background: #F1EDEB (warm beige)
transform: translateX(100%) /* Hidden */

/* Menu items */
font-size: 6.25rem
font-family: 'Saol Display' (serif)
letter-spacing: -0.1rem
line-height: 6.25rem

/* Active item */
color: #D6D6D6 (grayed out)
font-family: 'Neue Montreal' (sans)
underline: 7px height, animated width
```

---

## 9. LOADER DESIGN

### Animated Eyes
```html
<svg class="loader__eyes">
  <!-- Left eye -->
  <ellipse class="eyes-st0" />
  <g class="js-eyes-left">
    <ellipse /> <!-- Pupil -->
    <circle class="eyes-st1" /> <!-- Highlight -->
    <path class="js-eyes-heart" /> <!-- Heart on hover -->
  </g>
  
  <!-- Right eye -->
  <!-- Same structure -->
  
  <!-- Eyelids (for blinking) -->
  <rect class="js-eyes-eyelid-left-top" />
  <rect class="js-eyes-eyelid-left-bottom" />
</svg>
```

### Loader Animations
1. **Letter Box**: "UNSEEN" letters in boxes, scale in
2. **Eyes**: Follow cursor, blink, show hearts
3. **Progress Bar**: Pink overlay slides up
4. **Enter Button**: Liquid border animation

### Loader Behavior
```javascript
// Eyes follow cursor
const eyeX = (mouseX - eyeCenterX) / eyeRadius
const eyeY = (mouseY - eyeCenterY) / eyeRadius
pupil.x = eyeX * maxDistance
pupil.y = eyeY * maxDistance

// Blink animation
eyelids.scaleY = [1, 0, 1] // Close and open
duration: 0.2s
random interval: 2-5s

// Heart reveal on hover
hearts.scale = [0, 1]
hearts.rotate = [-80deg, 0deg]
```

---

## 10. MICRO-INTERACTIONS

### Arrow Links
```html
<a class="arrow-link">
  <span>
    <span><span>⮡&nbsp;</span></span>
    Text
  </span>
</a>
```

```css
/* Hover */
.arrow-link:hover > span {
  transform: translateX(0.75rem); /* Text moves right */
}
.arrow-link:hover > span > span > span {
  transform: translateX(0); /* Arrow slides in from left */
}
```

### Magnetic Hover
```javascript
// Elements follow cursor within bounds
const rect = element.getBoundingClientRect()
const x = mouseX - rect.left - rect.width / 2
const y = mouseY - rect.top - rect.height / 2

// Limit to 10px
const moveX = Math.max(-10, Math.min(10, x * 0.1))
const moveY = Math.max(-10, Math.min(10, y * 0.1))

element.style.transform = `translate(${moveX}px, ${moveY}px)`
```

### Ripple Effect (Theme Toggle)
```javascript
// On click, create expanding circle
const ripple = document.createElement('div')
ripple.style.cssText = `
  position: absolute;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(theme-color, 0.3);
  animation: ripple 0.8s ease-out;
`

@keyframes ripple {
  to {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}
```

---

## 11. RESPONSIVE DESIGN

### Breakpoints
```css
--breakpoint-xs: 320px
--breakpoint-sm: 640px   /* Tablet */
--breakpoint-md: 768px   /* Small desktop */
--breakpoint-lg: 1024px  /* Desktop */
--breakpoint-xl: 1280px  /* Large desktop */
--breakpoint-2xl: 1536px /* Extra large */
```

### Mobile Adaptations
- **Navigation**: Hidden, replaced with hamburger menu
- **Menu**: Full-screen overlay
- **Typography**: Smaller base size (14px → 15px → 16px)
- **Spacing**: Reduced padding (1rem → 2rem)
- **Cursor**: Disabled on touch devices
- **Animations**: Simplified or disabled

### Touch Detection
```javascript
const isTouch = 'ontouchstart' in window
if (!isTouch) {
  // Enable custom cursor
  // Enable hover effects
  // Enable magnetic interactions
}
```

---

## 12. PERFORMANCE OPTIMIZATIONS

### GPU Acceleration
```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
```

### Smooth Scrolling
```javascript
// Custom scroll library (ASScroll)
// Virtual scrolling for performance
// Smooth interpolation
```

### Animation Performance
```css
/* Use transform instead of position */
transform: translate(x, y) /* ✓ GPU */
left: x; top: y;           /* ✗ CPU */

/* Use opacity instead of visibility */
opacity: 0 /* ✓ GPU */
display: none /* ✗ Reflow */
```

### Lazy Loading
- Images load on scroll
- Animations trigger on viewport entry
- Heavy effects disabled on mobile

---

## 13. ACCESSIBILITY

### Semantic HTML
```html
<header>
<nav>
<main role="main" itemprop="mainContentOfPage">
<button aria-label="Toggle Menu">
```

### Screen Reader Support
```css
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  clip: rect(1px, 1px, 1px, 1px);
  overflow: hidden;
}
```

### Keyboard Navigation
- All interactive elements focusable
- Focus visible on keyboard nav
- Skip links for screen readers

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 14. KEY TAKEAWAYS FOR AGENT CONSOLE V2

### Must-Have Features
1. ✅ **Custom Cursor** - Already implemented, needs enhancement
2. ✅ **Liquid Button Animations** - Partially implemented
3. ❌ **Character-by-Character Text Animations** - Missing
4. ❌ **Magnetic Hover Effects** - Implemented but not visible
5. ❌ **Serif/Sans Font Switching on Hover** - Missing
6. ❌ **SVG Border Morphing** - Missing
7. ✅ **Theme Toggle with Ripple** - Implemented
8. ❌ **Menu with Stagger Animation** - Not applicable yet
9. ✅ **Generous Spacing** - Implemented
10. ❌ **90% Grayscale Color Scheme** - Using too much color

### Design Philosophy Alignment
- **Current**: Warm, colorful, friendly
- **Target**: Cool, minimal, sophisticated
- **Gap**: Need more restraint, less color, more animation

### Animation Gaps
- Buttons don't have visible hover lift
- No text morphing animations
- No character-by-character reveals
- Magnetic effects too subtle
- Missing liquid border morphing

### Color System Gaps
- Using too much amber/orange
- Need more pure black/white
- Missing the 90% grayscale rule
- Accent colors should be rare

---

## 15. IMPLEMENTATION PRIORITIES

### Phase 1: Visual Affordances (CURRENT)
- [x] Cursor: pointer on buttons
- [x] Cursor: text on inputs
- [x] Button hover scale
- [x] Input focus rings
- [x] Card hover lift
- [ ] Make animations MORE visible

### Phase 2: Premium Animations
- [ ] Character-by-character text reveals
- [ ] Serif/sans font switching on hover
- [ ] Liquid button border morphing
- [ ] Enhanced magnetic hover (more obvious)
- [ ] Ripple effects on interactions

### Phase 3: Color Refinement
- [ ] Reduce to 90% grayscale
- [ ] Use color only for meaning
- [ ] Pure black backgrounds option
- [ ] Subtle accent colors

### Phase 4: Micro-Interactions
- [ ] Arrow link animations
- [ ] Stagger animations
- [ ] Follow-through effects
- [ ] Secondary animations

---

**END OF ANALYSIS**

This document captures the essence of unseen.co's design system. The key insight: **Restrained elegance through minimal color, generous spacing, and delightful animations on every interaction.**
