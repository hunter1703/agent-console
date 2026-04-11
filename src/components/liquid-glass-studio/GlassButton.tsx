'use client';

import { useRef, useState, useCallback, type ReactNode } from 'react';
import { LiquidGlassStudio } from './LiquidGlassStudio';
import { cn } from '@/src/lib/utils';

// Import shaders with Vite's ?raw syntax
import VertexShader from '@/src/lib/liquid-glass-studio/shaders/vertex.glsl?raw';
import FragmentBgShader from '@/src/lib/liquid-glass-studio/shaders/fragment-bg.glsl?raw';
import FragmentBgVblurShader from '@/src/lib/liquid-glass-studio/shaders/fragment-bg-vblur.glsl?raw';
import FragmentBgHblurShader from '@/src/lib/liquid-glass-studio/shaders/fragment-bg-hblur.glsl?raw';
import FragmentMainShader from '@/src/lib/liquid-glass-studio/shaders/fragment-main.glsl?raw';

interface GlassButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glassIntensity?: 'subtle' | 'medium' | 'strong';
  backgroundImage?: string;
  backgroundVideo?: string;
}

export function GlassButton({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  className,
  glassIntensity = 'medium',
  backgroundImage,
  backgroundVideo,
}: GlassButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: { width: 120, height: 36, fontSize: '0.875rem', padding: '0.5rem 1rem' },
    md: { width: 160, height: 44, fontSize: '1rem', padding: '0.75rem 1.5rem' },
    lg: { width: 200, height: 52, fontSize: '1.125rem', padding: '1rem 2rem' },
  };

  const currentSize = sizeConfig[size];

  // Glass effect intensity configurations
  const intensityConfig = {
    subtle: {
      refThickness: 11.72,
      refFactor: 1.3,
      refDispersion: 50,
      refFresnelRange: 0,
      refFresnelHardness: 59.86,
      refFresnelFactor: 52.58,
      glareRange: 0,
      glareHardness: 0,
      glareFactor: 0,
      blurRadius: 1,
      tint: { r: 23, g: 23, b: 165, a: 0 },
    },
    medium: {
      refThickness: 11.72,
      refFactor: 1.3,
      refDispersion: 50,
      refFresnelRange: 0,
      refFresnelHardness: 59.86,
      refFresnelFactor: 52.58,
      glareRange: 0,
      glareHardness: 0,
      glareFactor: 0,
      blurRadius: 1,
      tint: { r: 23, g: 23, b: 165, a: 0 },
    },
    strong: {
      refThickness: 11.72,
      refFactor: 1.3,
      refDispersion: 50,
      refFresnelRange: 0,
      refFresnelHardness: 59.86,
      refFresnelFactor: 52.58,
      glareRange: 0,
      glareHardness: 0,
      glareFactor: 0,
      blurRadius: 1,
      tint: { r: 23, g: 23, b: 165, a: 0 },
    },
  };

  const glassConfig = intensityConfig[glassIntensity];

  // Variant-specific tints
  const variantTints = {
    default: { r: 255, g: 255, b: 255, a: glassConfig.tint.a },
    primary: { r: 100, g: 150, b: 255, a: glassConfig.tint.a * 1.5 },
    secondary: { r: 150, g: 100, b: 255, a: glassConfig.tint.a * 1.5 },
    ghost: { r: 255, g: 255, b: 255, a: glassConfig.tint.a * 0.5 },
  };

  // Enhanced controls with hover and press states
  const glassControls = {
    ...glassConfig,
    tint: variantTints[variant],
    shapeWidth: currentSize.width,
    shapeHeight: currentSize.height,
    shapeRadius: size === 'sm' ? 60 : size === 'md' ? 70 : 80,
    shapeRoundness: 5,
    mergeRate: 0.05,
    showShape1: true,
    springSizeFactor: isPressed ? 5 : isHovered ? 15 : 10,
    glareAngle: -180,
    glareConvergence: 0,
    shadowExpand: isPressed ? 10 : isHovered ? 12 : 10.99,
    shadowFactor: 15,
    shadowPosition: { x: 0, y: -10 },
    blurEdge: true,
    bgType: backgroundImage || backgroundVideo ? 4 : 0, // 4 = texture background
  };

  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled}
      className={cn(
        'relative inline-flex items-center justify-center',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        isPressed && !disabled && 'scale-95',
        isHovered && !disabled && 'scale-105',
        className
      )}
      style={{
        width: currentSize.width,
        height: currentSize.height,
      }}
    >
      {/* Glass effect layer */}
      <div
        className="absolute inset-0 overflow-hidden rounded-xl"
        style={{
          pointerEvents: 'none',
        }}
      >
        <LiquidGlassStudio
          className="absolute inset-0"
          initialWidth={currentSize.width}
          initialHeight={currentSize.height}
          shaders={{
            vertex: VertexShader,
            fragmentBg: FragmentBgShader,
            fragmentBgVblur: FragmentBgVblurShader,
            fragmentBgHblur: FragmentBgHblurShader,
            fragmentMain: FragmentMainShader,
          }}
          controls={glassControls}
          disableResize={true}
          disableMove={true}
          backgroundImage={backgroundImage}
          backgroundVideo={backgroundVideo}
        />
      </div>

      {/* Content layer */}
      <span
        className={cn(
          'relative z-10 font-medium',
          'transition-all duration-200',
          variant === 'primary' && 'text-blue-100',
          variant === 'secondary' && 'text-purple-100',
          variant === 'ghost' && 'text-gray-700',
          variant === 'default' && 'text-gray-800',
          disabled && 'text-gray-400'
        )}
        style={{
          fontSize: currentSize.fontSize,
          textShadow: variant !== 'ghost' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {children}
      </span>

      {/* Subtle border overlay */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl pointer-events-none',
          'border border-white/20',
          'transition-opacity duration-200',
          isHovered && !disabled && 'border-white/30'
        )}
      />
    </button>
  );
}
