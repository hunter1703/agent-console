# Theme Transition Effects

This directory contains components for creating delightful theme transition effects.

## StaggeredMorphTransition

Creates a staggered morphing effect for UI elements during theme changes. Elements animate with 50ms delays between each other using spring physics for natural, organic motion.

### Features

- **Staggered Animation**: 50ms delay between UI elements
- **Spring Physics**: Natural, bouncy transitions using cubic-bezier easing
- **Color Interpolation**: Smooth morphing from old to new theme colors
- **Accessibility**: Respects `prefers-reduced-motion` for instant transitions
- **Performance**: Uses CSS custom properties for efficient color changes

### Usage

```tsx
import { StaggeredMorphTransition } from '@/components/effects/StaggeredMorphTransition'

function MyComponent() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { theme } = useTheme()

  const handleThemeChange = () => {
    setIsTransitioning(true)
    // Change theme logic here
  }

  return (
    <>
      <button onClick={handleThemeChange}>
        Change Theme
      </button>
      
      <StaggeredMorphTransition
        theme={theme}
        isTransitioning={isTransitioning}
        onTransitionComplete={() => setIsTransitioning(false)}
      />
    </>
  )
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `theme` | `'light' \| 'dark'` | Yes | Current theme to transition to |
| `isTransitioning` | `boolean` | Yes | Whether transition is active |
| `onTransitionComplete` | `() => void` | No | Callback when transition completes |

### Animated Elements

The component targets these CSS selectors for animation:

- `.sidebar` - Sidebar components
- `.chat-header` - Chat header elements  
- `.message` - Message components
- `.agent-card` - Agent card components
- `.session-item` - Session list items
- `.input-container` - Input containers
- `.button` - Button components
- `.card` - Card components

### Animation Details

- **Duration**: 400ms per element
- **Stagger Delay**: 50ms between elements
- **Easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)` (bouncy)
- **Properties**: `background-color`, `color`, `border-color`

### CSS Classes

The component adds these CSS classes during animation:

- `.theme-morphing` - Applied to elements during transition
- Custom properties: `--morph-bg`, `--morph-surface`, `--morph-text`, `--morph-border`, `--morph-primary`

### Integration with ThemeToggle

The component is already integrated with the main `ThemeToggle` component for automatic theme transitions.

## Other Effects

- **RippleThemeTransition**: Ripple effect from toggle button
- **ParticleThemeTransition**: Floating particles during theme change

All effects work together to create a cohesive, delightful theme switching experience.