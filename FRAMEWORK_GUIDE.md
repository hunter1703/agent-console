# Liquid Glass Framework Guide

## Overview

The Liquid Glass Framework is a comprehensive, declarative system for building beautiful glass components with:

- **6-Layer Composition**: Background, Glass Surface, Border, Content, Depth, Motion
- **WebGL Refraction**: True optical effects with chromatic dispersion
- **Theme System**: Centralized configuration with dark/light modes
- **Builder API**: Fluent interface for creating custom components
- **Accessibility**: WCAG AA compliance, reduced motion, high contrast
- **Performance**: GPU acceleration, CSS containment, optimized animations

---

## Quick Start

### 1. Setup Providers

Wrap your app with the necessary providers:

```tsx
import { ThemeProvider } from '@/components/liquid-glass/ThemeProvider'
import { RefractionProvider } from '@/components/liquid-glass/RefractionProvider'

export default function App() {
  return (
    <ThemeProvider defaultTheme="default">
      <RefractionProvider 
        backgroundImage="/lake-foggy-bg.png"
        enabled={true}
      >
        <YourApp />
      </RefractionProvider>
    </ThemeProvider>
  )
}
```

### 2. Use Pre-built Components

```tsx
import { Glass, GlassCard, GlassButton } from '@/components/liquid-glass/Glass'

function MyComponent() {
  return (
    <GlassCard>
      <h2>Hello World</h2>
      <p>This is a frosted glass card</p>
      <GlassButton>Click Me</GlassButton>
    </GlassCard>
  )
}
```

### 3. Use Declarative API

```tsx
import { Glass } from '@/components/liquid-glass/Glass'

function MyComponent() {
  return (
    <Glass
      config="frosted"
      variant="medium"
      blur={20}
      radius={24}
      padding="2rem"
      refraction={true}
    >
      Content goes here
    </Glass>
  )
}
```

---

## Core Concepts

### 6-Layer Composition

Every glass component is composed of 6 layers:

1. **Background**: Vibrant gradients, animated blobs, or patterns
2. **Glass Surface**: Backdrop-filter + semi-transparent fill
3. **Border**: Directional highlights (white top-left, accent bottom-right)
4. **Content**: Typography, inputs, or data
5. **Depth**: Stacking, shadows, or 3D transforms
6. **Motion**: Hover effects, transitions, ambient animations

### Configuration Object

```typescript
interface GlassConfig {
  background?: BackgroundLayer
  glass: GlassSurface
  border?: BorderLayer
  content?: ContentLayer
  depth?: DepthLayer
  motion?: MotionLayer
  accessibility?: AccessibilityOptions
  performance?: PerformanceOptions
  responsive?: ResponsiveOverrides
}
```

---

## Usage Patterns

### Pattern 1: Using Presets

```tsx
// Frosted glass (light, medium, heavy)
<Glass config="frosted" variant="light">Light blur</Glass>
<Glass config="frosted" variant="medium">Medium blur</Glass>
<Glass config="frosted" variant="heavy">Heavy blur</Glass>

// Liquid glass (flowing animations)
<Glass config="liquid" variant="default">Liquid morph</Glass>

// Crystal glass (sharp, with refraction)
<Glass config="crystal" variant="default" refraction>Crystal clear</Glass>

// Clear glass (minimal blur)
<Glass config="clear" variant="default">Barely there</Glass>

// Tinted glass (colored)
<Glass config="tinted" variant="default">Colored glass</Glass>
```

### Pattern 2: Quick Overrides

```tsx
<Glass
  config="frosted"
  variant="medium"
  blur={20}              // Override blur amount
  fill="rgba(255,255,255,0.2)"  // Override fill color
  radius={24}            // Override border radius
  padding="2rem"         // Override padding
>
  Content
</Glass>
```

### Pattern 3: Full Configuration

```tsx
<Glass
  config={{
    glass: {
      type: 'frosted',
      intensity: 'medium',
      blur: 15,
      saturation: 180,
      fill: 'rgba(255, 255, 255, 0.1)',
      refraction: {
        enabled: true,
        strength: 0.05,
        dispersion: 0.01,
      },
    },
    border: {
      enabled: true,
      width: 1,
      radius: 16,
      highlight: {
        topLeft: 'rgba(255, 255, 255, 0.3)',
        bottomRight: 'rgba(255, 255, 255, 0.15)',
      },
    },
    content: {
      padding: '2rem',
      typography: {
        color: 'rgba(255, 255, 255, 0.95)',
        shadow: true,
      },
    },
    depth: {
      shadow: {
        type: 'medium',
      },
    },
    motion: {
      hover: {
        enabled: true,
        type: 'lift',
        intensity: 'medium',
      },
      transition: {
        duration: 250,
        easing: 'spring',
      },
    },
  }}
>
  Content
</Glass>
```

### Pattern 4: Builder API

```tsx
import { glassBuilder } from '@/lib/liquid-glass/builder'

const myConfig = glassBuilder()
  .preset('frosted', 'medium')
  .blur(20)
  .radius(24)
  .padding('2rem')
  .shadow('medium')
  .withHover('lift', 'medium')
  .withTransition(250, 'spring')
  .withRefraction(0.05, 0.01)
  .accessible()
  .optimized()
  .build()

function MyComponent() {
  return <Glass config={myConfig}>Content</Glass>
}
```

### Pattern 5: Pre-configured Builders

```tsx
import { GlassBuilders } from '@/lib/liquid-glass/builder'

// Card
const cardConfig = GlassBuilders.card()
  .blur(15)
  .radius(20)
  .build()

// Button
const buttonConfig = GlassBuilders.button()
  .withHover('scale', 'strong')
  .build()

// Modal
const modalConfig = GlassBuilders.modal()
  .blur(30)
  .build()

// Input
const inputConfig = GlassBuilders.input()
  .withHover('glow', 'medium')
  .build()
```

---

## Advanced Features

### WebGL Refraction

Enable true optical refraction with chromatic dispersion:

```tsx
<Glass
  config="crystal"
  refraction={true}  // Enable refraction
>
  Content will refract background pixels
</Glass>
```

Or with custom parameters:

```tsx
<Glass
  config={{
    glass: {
      type: 'crystal',
      intensity: 'light',
      refraction: {
        enabled: true,
        strength: 0.08,      // 0-1, higher = more distortion
        dispersion: 0.02,    // 0-1, chromatic aberration
      },
    },
  }}
  refraction={true}
>
  Rainbow prism effect
</Glass>
```

### Hover Effects

Available hover types:

- `lift`: Translates element up
- `scale`: Scales element up
- `glow`: Adds glowing shadow
- `tilt`: 3D tilt effect (parallax)
- `magnetic`: Follows mouse cursor
- `none`: No hover effect

```tsx
<Glass
  config="frosted"
  variant="medium"
>
  {/* Hover configured in preset */}
</Glass>

{/* Or override */}
<Glass
  config={{
    glass: { type: 'frosted', intensity: 'medium' },
    motion: {
      hover: {
        enabled: true,
        type: 'magnetic',
        intensity: 'strong',
      },
    },
  }}
>
  Magnetic hover
</Glass>
```

### Ambient Animations

Add subtle ambient animations:

```tsx
<Glass
  config={{
    glass: { type: 'liquid', intensity: 'medium' },
    motion: {
      ambient: {
        enabled: true,
        type: 'breathe',  // pulse, float, shimmer, breathe
        duration: 3000,
      },
    },
  }}
>
  Breathing animation
</Glass>
```

### Responsive Design

Configure different styles for different breakpoints:

```tsx
<Glass
  config={{
    glass: { type: 'frosted', intensity: 'medium', blur: 20 },
    responsive: {
      mobile: {
        glass: { blur: 8 },  // Reduce blur on mobile
        content: { padding: '1rem' },
      },
      tablet: {
        glass: { blur: 12 },
      },
      desktop: {
        glass: { blur: 20 },
      },
    },
  }}
>
  Responsive glass
</Glass>
```

### Accessibility

Automatic accessibility features:

```tsx
<Glass
  config={{
    glass: { type: 'frosted', intensity: 'medium' },
    accessibility: {
      reducedMotion: true,        // Respects prefers-reduced-motion
      reducedTransparency: true,  // Respects prefers-reduced-transparency
      highContrast: true,         // Respects prefers-contrast
      focusVisible: true,         // Shows focus indicators
    },
  }}
>
  Accessible glass
</Glass>
```

### Performance Optimization

```tsx
<Glass
  config={{
    glass: { type: 'frosted', intensity: 'medium' },
    performance: {
      gpuAcceleration: true,           // transform: translateZ(0)
      containment: 'layout style',     // CSS containment
      willChange: ['transform', 'opacity'],  // Hint to browser
    },
  }}
>
  Optimized glass
</Glass>
```

---

## Theme System

### Using Theme

```tsx
import { useTheme } from '@/components/liquid-glass/ThemeProvider'

function MyComponent() {
  const { theme, themeName, setTheme, toggleTheme } = useTheme()
  
  return (
    <div>
      <p>Current theme: {themeName}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  )
}
```

### Using Theme Colors

```tsx
import { useThemeColors } from '@/components/liquid-glass/ThemeProvider'

function MyComponent() {
  const colors = useThemeColors()
  
  return (
    <Glass
      config="frosted"
      fill={colors.glass.medium}
      style={{ color: colors.text.primary }}
    >
      Themed glass
    </Glass>
  )
}
```

### Using Component Configs from Theme

```tsx
import { useComponentConfig } from '@/components/liquid-glass/ThemeProvider'

function MyButton() {
  const buttonConfig = useComponentConfig('button')
  
  return (
    <Glass config={buttonConfig}>
      Themed button
    </Glass>
  )
}
```

### Creating Custom Theme

```typescript
import { createTheme, defaultTheme } from '@/lib/liquid-glass/theme'

const myTheme = createTheme('my-theme', defaultTheme, {
  colors: {
    primary: {
      hue: 280,
      saturation: 85,
      lightness: 65,
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.08)',
      medium: 'rgba(255, 255, 255, 0.12)',
      heavy: 'rgba(255, 255, 255, 0.18)',
    },
  },
})
```

---

## Component Composition

### Composing Multiple Configs

```typescript
import { composeGlass } from '@/lib/liquid-glass/builder'

const baseConfig = glassBuilder()
  .preset('frosted', 'medium')
  .build()

const hoverConfig = {
  motion: {
    hover: { enabled: true, type: 'lift', intensity: 'strong' },
  },
}

const refractionConfig = {
  glass: {
    refraction: { enabled: true, strength: 0.08 },
  },
}

const finalConfig = composeGlass(baseConfig, hoverConfig, refractionConfig)
```

### Creating Variants

```typescript
import { createVariants } from '@/lib/liquid-glass/builder'

const baseCard = glassBuilder()
  .preset('frosted', 'medium')
  .padding('2rem')
  .radius(16)
  .build()

const cardVariants = createVariants(baseCard, {
  primary: {
    glass: { fill: 'rgba(59, 130, 246, 0.1)' },
    border: { highlight: { topLeft: 'rgba(59, 130, 246, 0.3)' } },
  },
  success: {
    glass: { fill: 'rgba(16, 185, 129, 0.1)' },
    border: { highlight: { topLeft: 'rgba(16, 185, 129, 0.3)' } },
  },
  error: {
    glass: { fill: 'rgba(239, 68, 68, 0.1)' },
    border: { highlight: { topLeft: 'rgba(239, 68, 68, 0.3)' } },
  },
})

// Use variants
<Glass config={cardVariants.primary}>Primary card</Glass>
<Glass config={cardVariants.success}>Success card</Glass>
<Glass config={cardVariants.error}>Error card</Glass>
```

---

## Best Practices

### 1. Start with Presets

Always start with a preset and override as needed:

```tsx
// ✅ Good
<Glass config="frosted" variant="medium" blur={15}>
  Content
</Glass>

// ❌ Avoid building from scratch unless necessary
<Glass config={{ glass: { type: 'frosted', intensity: 'medium', blur: 15 } }}>
  Content
</Glass>
```

### 2. Use Builder for Complex Configs

For complex configurations, use the builder API:

```tsx
// ✅ Good - readable and maintainable
const config = glassBuilder()
  .preset('frosted', 'medium')
  .blur(20)
  .radius(24)
  .withHover('lift', 'medium')
  .withRefraction(0.05, 0.01)
  .accessible()
  .optimized()
  .build()

// ❌ Avoid - hard to read
const config = {
  glass: { type: 'frosted', intensity: 'medium', blur: 20, refraction: { enabled: true, strength: 0.05, dispersion: 0.01 } },
  border: { enabled: true, radius: 24 },
  motion: { hover: { enabled: true, type: 'lift', intensity: 'medium' } },
  accessibility: { reducedMotion: true, reducedTransparency: true },
  performance: { gpuAcceleration: true },
}
```

### 3. Reuse Configurations

Create reusable configurations:

```tsx
// configs/glass.ts
export const cardConfig = glassBuilder()
  .preset('frosted', 'medium')
  .padding('2rem')
  .radius(16)
  .build()

export const buttonConfig = glassBuilder()
  .preset('frosted', 'light')
  .padding('0.875rem 2rem')
  .radius(12)
  .build()

// components/MyCard.tsx
import { cardConfig } from '@/configs/glass'

export function MyCard() {
  return <Glass config={cardConfig}>Content</Glass>
}
```

### 4. Use Theme System

Leverage the theme system for consistency:

```tsx
// ✅ Good - uses theme
const { theme } = useTheme()
<Glass config={theme.components.card}>Content</Glass>

// ❌ Avoid - hardcoded values
<Glass config="frosted" fill="rgba(255,255,255,0.1)">Content</Glass>
```

### 5. Enable Refraction Sparingly

WebGL refraction is expensive. Use it for hero elements only:

```tsx
// ✅ Good - hero card with refraction
<Glass config="crystal" refraction>
  Hero content
</Glass>

// ❌ Avoid - refraction on every element
{items.map(item => (
  <Glass key={item.id} config="crystal" refraction>
    {item.content}
  </Glass>
))}
```

---

## Performance Tips

1. **Reduce blur on mobile**: Mobile devices struggle with high blur values
2. **Use CSS containment**: Limits repaint scope
3. **Enable GPU acceleration**: For animated elements
4. **Limit refraction layers**: Max 3-5 refraction layers per page
5. **Use will-change sparingly**: Only for actively animating elements
6. **Respect reduced motion**: Always enable accessibility features

---

## Troubleshooting

### Glass not visible

- Ensure there's a vibrant background behind the glass
- Check that backdrop-filter is supported (Safari needs -webkit- prefix)
- Verify fill color has some opacity

### Refraction not working

- Ensure RefractionProvider is wrapping your app
- Check that refraction={true} is set on Glass component
- Verify WebGL is supported in the browser
- Check console for WebGL errors

### Performance issues

- Reduce blur values (especially on mobile)
- Limit number of glass elements
- Disable refraction on non-hero elements
- Enable performance optimizations
- Use CSS containment

### Accessibility warnings

- Enable accessibility features in config
- Ensure text contrast passes WCAG AA (4.5:1)
- Test with reduced motion enabled
- Verify focus indicators are visible

---

## Examples

See `/app/liquid-glass-foundation/page.tsx` for a comprehensive demo of all features.

---

## API Reference

See TypeScript definitions in:
- `/lib/liquid-glass/framework.ts` - Core types and utilities
- `/lib/liquid-glass/builder.ts` - Builder API
- `/lib/liquid-glass/theme.ts` - Theme system
- `/components/liquid-glass/Glass.tsx` - React components
