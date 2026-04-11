# Liquid Glass Studio Components

This directory contains all the reusable components from the [liquid-glass-studio](https://github.com/iyinchao/liquid-glass-studio) project, providing production-ready glassmorphic effects using WebGL2 and WebGPU.

## Overview

The liquid-glass-studio implementation provides a complete, high-performance glassmorphic effect system with:

- **Dual Rendering Backends**: WebGL2 and WebGPU support with automatic fallback
- **Advanced Visual Effects**: Refraction, dispersion, Fresnel reflections, dynamic glare, and blur
- **Real-time Performance**: Multi-pass rendering pipeline optimized for 60fps
- **Flexible Configuration**: Extensive control over all visual parameters
- **Production Ready**: Battle-tested implementation from the original project

## Directory Structure

```
components/liquid-glass-studio/
├── LiquidGlassStudio.tsx          # Main component wrapper
├── ResizableWindow/               # Draggable/resizable window component
├── PresetControls/                # Import/export preset functionality
├── LevaButton/                    # Custom button component
├── LevaCheckButtons/              # Checkbox button group component
├── LevaContainer/                 # Container component for custom controls
├── LevaImageUpload/               # Image upload component
├── LevaVectorNew/                 # Vector input component
└── README.md                      # This file

lib/liquid-glass-studio/
├── utils/
│   ├── GLUtils.ts                 # WebGL2 rendering utilities
│   ├── GPUUtils.ts                # WebGPU rendering utilities
│   ├── RendererInterface.ts       # Common renderer interface
│   ├── gpuDetect.ts               # WebGPU capability detection
│   ├── presetUtils.ts             # Preset import/export utilities
│   ├── languages.ts               # i18n language definitions
│   └── index.ts                   # Utility helpers
├── shaders/                       # GLSL shaders for WebGL2
│   ├── vertex.glsl
│   ├── fragment-bg.glsl
│   ├── fragment-bg-vblur.glsl
│   ├── fragment-bg-hblur.glsl
│   └── fragment-main.glsl
└── shaders-wgsl/                  # WGSL shaders for WebGPU
    ├── vertex.wgsl
    ├── fragment-bg.wgsl
    ├── fragment-bg-vblur.wgsl
    ├── fragment-bg-hblur.wgsl
    └── fragment-main.wgsl
```

## Components

### LiquidGlassStudio

The main component that renders the liquid glass effect.

```tsx
import { LiquidGlassStudio } from '@/components/liquid-glass-studio';

<LiquidGlassStudio
  initialWidth={600}
  initialHeight={600}
  shaders={{
    vertex: vertexShader,
    fragmentBg: fragmentBgShader,
    fragmentBgVblur: fragmentBgVblurShader,
    fragmentBgHblur: fragmentBgHblurShader,
    fragmentMain: fragmentMainShader,
    // Optional WebGPU shaders
    wgslVertex: wgslVertexShader,
    wgslFragBg: wgslFragBgShader,
    wgslFragVblur: wgslFragVblurShader,
    wgslFragHblur: wgslFragHblurShader,
    wgslFragMain: wgslFragMainShader,
  }}
  controls={{
    refThickness: 20,
    refFactor: 1.4,
    refDispersion: 7,
    // ... other controls
  }}
  backgroundImage="/path/to/image.jpg"
  disableResize={false}
  disableMove={false}
/>
```

### ResizableWindow

A draggable and resizable window container.

```tsx
import { ResizableWindow } from '@/components/liquid-glass-studio';

<ResizableWindow
  size={{ width: 600, height: 600 }}
  onResize={(size) => console.log(size)}
  onMove={(pos) => console.log(pos)}
  disableMove={false}
  disableResize={false}
>
  {/* Your content */}
</ResizableWindow>
```

### PresetControls

Import/export functionality for saving and loading effect presets.

```tsx
import { PresetControls } from '@/components/liquid-glass-studio';

<PresetControls
  controls={controls}
  controlsAPI={controlsAPI}
  lang={lang}
/>
```

## Utilities

### GLUtils

WebGL2 rendering utilities including:
- `ShaderProgram`: Shader compilation and management
- `FrameBuffer`: Framebuffer object management
- `RenderPass`: Individual render pass handling
- `MultiPassRenderer`: Multi-pass rendering pipeline
- `loadTextureFromURL`: Texture loading from URLs
- `createEmptyTexture`: Empty texture creation
- `updateVideoTexture`: Video texture updates

### GPUUtils

WebGPU rendering utilities with equivalent functionality to GLUtils:
- `GPUMultiPassRenderer`: WebGPU multi-pass renderer
- `gpuLoadTextureFromURL`: WebGPU texture loading
- `gpuCreateEmptyTexture`: WebGPU empty texture creation
- `gpuUpdateVideoTexture`: WebGPU video texture updates

### gpuDetect

WebGPU capability detection:
```tsx
import { detectWebGPU } from '@/lib/liquid-glass-studio/utils/gpuDetect';

const result = await detectWebGPU();
if (result.supported) {
  // Use WebGPU
} else {
  // Fallback to WebGL2
}
```

## Shader System

The implementation uses a multi-pass rendering pipeline:

1. **Background Pass** (`fragment-bg`): Renders the background with shadows
2. **Vertical Blur Pass** (`fragment-bg-vblur`): Applies vertical Gaussian blur
3. **Horizontal Blur Pass** (`fragment-bg-hblur`): Applies horizontal Gaussian blur
4. **Main Pass** (`fragment-main`): Renders the glass effect with refraction, dispersion, and glare

### Loading Shaders

```tsx
// For WebGL2
import VertexShader from '@/lib/liquid-glass-studio/shaders/vertex.glsl?raw';
import FragmentBgShader from '@/lib/liquid-glass-studio/shaders/fragment-bg.glsl?raw';
// ... other shaders

// For WebGPU
import WgslVertex from '@/lib/liquid-glass-studio/shaders-wgsl/vertex.wgsl?raw';
import WgslFragBg from '@/lib/liquid-glass-studio/shaders-wgsl/fragment-bg.wgsl?raw';
// ... other shaders
```

## Control Parameters

The `controls` prop accepts the following parameters:

### Refraction
- `refThickness` (1-80): Thickness of the refractive layer
- `refFactor` (1-4): Refraction index
- `refDispersion` (0-50): Chromatic dispersion amount
- `refFresnelRange` (0-100): Fresnel reflection size
- `refFresnelHardness` (0-100): Fresnel reflection edge hardness
- `refFresnelFactor` (0-100): Fresnel reflection intensity

### Glare
- `glareRange` (0-100): Glare effect size
- `glareHardness` (0-100): Glare edge hardness
- `glareFactor` (0-120): Glare intensity
- `glareConvergence` (0-100): Glare convergence factor
- `glareOppositeFactor` (0-100): Opposite side glare intensity
- `glareAngle` (-180-180): Glare angle in degrees

### Blur
- `blurRadius` (1-200): Gaussian blur radius
- `blurEdge` (boolean): Enable edge blurring

### Appearance
- `tint` ({ r, g, b, a }): Color tint overlay
- `shadowExpand` (2-100): Shadow expansion factor
- `shadowFactor` (0-100): Shadow intensity
- `shadowPosition` ({ x, y }): Shadow offset position

### Shape
- `shapeWidth` (20-800): Shape width in pixels
- `shapeHeight` (20-800): Shape height in pixels
- `shapeRadius` (1-100): Corner radius percentage
- `shapeRoundness` (2-7): Superellipse roundness factor
- `mergeRate` (0-0.3): Shape merging rate
- `showShape1` (boolean): Show second shape

### Animation
- `springSizeFactor` (0-50): Animation morph factor

### Background
- `bgType` (number): Background type selector

## Performance Considerations

1. **Blur Radius**: Higher blur radius values significantly impact performance. Keep below 50 for 60fps on most devices.

2. **Resolution**: The canvas renders at device pixel ratio. Consider capping DPR on high-resolution displays:
   ```tsx
   dpr: Math.min(window.devicePixelRatio, 2)
   ```

3. **WebGPU vs WebGL2**: WebGPU generally provides better performance but has limited browser support. The component automatically falls back to WebGL2.

4. **Video Textures**: Video backgrounds require continuous texture updates. Use static images when possible for better performance.

## Browser Support

### WebGL2
- Chrome 56+
- Firefox 51+
- Safari 15+
- Edge 79+

### WebGPU
- Chrome 113+
- Edge 113+
- Safari 18+ (experimental)
- Firefox (behind flag)

## Credits

Original implementation by [iyinchao](https://github.com/iyinchao/liquid-glass-studio).

This is a direct copy of the production-ready components from the liquid-glass-studio project, providing superior glassmorphic effects compared to the previous CSS-based implementation in agent-console.

## License

Check the original [liquid-glass-studio repository](https://github.com/iyinchao/liquid-glass-studio) for licensing information.
