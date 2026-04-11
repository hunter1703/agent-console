# GlassButton Component

A production-ready glassmorphic button component powered by WebGL2 rendering from liquid-glass-studio. Features real-time refraction, dispersion, Fresnel reflections, dynamic glare, and interactive animations.

## Features

- **WebGL2-Powered Effects**: Real-time glass rendering with refraction, dispersion, and Fresnel reflections
- **Interactive States**: Smooth hover and press animations with dynamic glare and shadow effects
- **Multiple Variants**: Default, Primary, Secondary, and Ghost styles
- **Flexible Sizing**: Small, Medium, and Large sizes
- **Adjustable Intensity**: Subtle, Medium, and Strong glass effects
- **Fully Accessible**: Keyboard navigation and focus states
- **Performance Optimized**: Efficient WebGL rendering at 60fps

## Installation

The component is already set up in your project. Make sure you have the required dependencies:

```bash
npm install re-resizable @react-spring/web clsx
```

## Basic Usage

```tsx
import { GlassButton } from '@/components/liquid-glass-studio/GlassButton';

export default function MyComponent() {
  return (
    <GlassButton
      variant="primary"
      onClick={() => console.log('Clicked!')}
    >
      Click Me
    </GlassButton>
  );
}
```

## Props

### `children`
- Type: `ReactNode`
- Default: `undefined`
- Description: Button content (text, icons, etc.)

### `onClick`
- Type: `() => void`
- Default: `undefined`
- Description: Click handler function

### `disabled`
- Type: `boolean`
- Default: `false`
- Description: Disables the button and reduces opacity

### `variant`
- Type: `'default' | 'primary' | 'secondary' | 'ghost'`
- Default: `'default'`
- Description: Visual style variant
  - `default`: Neutral white glass effect
  - `primary`: Blue-tinted glass effect
  - `secondary`: Purple-tinted glass effect
  - `ghost`: Minimal glass effect

### `size`
- Type: `'sm' | 'md' | 'lg'`
- Default: `'md'`
- Description: Button size
  - `sm`: 120x36px
  - `md`: 160x44px
  - `lg`: 200x52px

### `glassIntensity`
- Type: `'subtle' | 'medium' | 'strong'`
- Default: `'medium'`
- Description: Intensity of the glass effect
  - `subtle`: Light refraction and minimal glare
  - `medium`: Balanced glass effect
  - `strong`: Pronounced refraction and strong glare

### `className`
- Type: `string`
- Default: `undefined`
- Description: Additional CSS classes for the button wrapper

## Examples

### All Variants

```tsx
<div className="flex gap-4">
  <GlassButton variant="default">Default</GlassButton>
  <GlassButton variant="primary">Primary</GlassButton>
  <GlassButton variant="secondary">Secondary</GlassButton>
  <GlassButton variant="ghost">Ghost</GlassButton>
</div>
```

### All Sizes

```tsx
<div className="flex items-center gap-4">
  <GlassButton size="sm">Small</GlassButton>
  <GlassButton size="md">Medium</GlassButton>
  <GlassButton size="lg">Large</GlassButton>
</div>
```

### Glass Intensity Levels

```tsx
<div className="flex gap-4">
  <GlassButton glassIntensity="subtle">Subtle</GlassButton>
  <GlassButton glassIntensity="medium">Medium</GlassButton>
  <GlassButton glassIntensity="strong">Strong</GlassButton>
</div>
```

### With Icons

```tsx
import { ArrowRight } from 'lucide-react';

<GlassButton variant="primary">
  <span className="flex items-center gap-2">
    Continue
    <ArrowRight size={16} />
  </span>
</GlassButton>
```

### Disabled State

```tsx
<GlassButton disabled>
  Disabled Button
</GlassButton>
```

### Custom Styling

```tsx
<GlassButton
  variant="primary"
  className="shadow-2xl"
>
  Custom Styled
</GlassButton>
```

## Interactive States

The button automatically handles the following states:

1. **Normal**: Default appearance with subtle glass effect
2. **Hover**: Enhanced glare, increased scale (105%), adjusted shadow
3. **Press**: Reduced scale (95%), compressed shadow, decreased glare
4. **Focus**: Blue focus ring for keyboard navigation
5. **Disabled**: Reduced opacity (50%), no interactions

## Technical Details

### Glass Effect Parameters

The component uses the following WebGL parameters (varies by intensity):

**Refraction:**
- Thickness: 15-25px
- Factor: 1.2-1.6
- Dispersion: 3-12

**Fresnel Reflection:**
- Range: 25-40
- Hardness: 15-25
- Factor: 15-25

**Glare:**
- Range: 25-40
- Hardness: 15-25
- Factor: 60-110
- Convergence: 50-60 (increases on hover)

**Blur:**
- Radius: 8-18px
- Edge blur: Enabled

**Shadow:**
- Expand: 15-30 (varies with press state)
- Factor: 10-20
- Position: Dynamic based on interaction

### Performance

- Renders at 60fps on modern hardware
- WebGL2 multi-pass rendering pipeline
- Efficient shader compilation and caching
- Minimal CPU overhead during interactions

### Browser Support

- Chrome 56+ (WebGL2)
- Firefox 51+ (WebGL2)
- Safari 15+ (WebGL2)
- Edge 79+ (WebGL2)

## Best Practices

1. **Background**: Use the button on darker backgrounds for best visual effect
2. **Contrast**: Ensure sufficient contrast for accessibility
3. **Spacing**: Provide adequate spacing between buttons
4. **Loading States**: Consider adding a loading spinner for async actions
5. **Mobile**: Test on mobile devices as WebGL performance varies

## Customization

To create a custom variant, you can extend the component:

```tsx
import { GlassButton } from '@/components/liquid-glass-studio/GlassButton';

export function DangerButton(props) {
  return (
    <GlassButton
      {...props}
      variant="primary"
      className="[&_span]:text-red-100"
    />
  );
}
```

## Demo

Visit `/glass-button-demo` to see all variants, sizes, and states in action.

## Credits

Built on top of [liquid-glass-studio](https://github.com/iyinchao/liquid-glass-studio) by iyinchao.
