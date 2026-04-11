'use client'

import React, { useRef, useEffect, forwardRef, useState } from 'react'
import { MultiPassRenderer } from '@/lib/liquid-glass-studio/utils/GLUtils'
import { cn } from '@/lib/utils/cn'

// Import shaders
import {
  VertexShader,
  FragmentBgShader,
  FragmentBgVblurShader,
  FragmentBgHblurShader,
  FragmentMainShader,
} from '@/lib/liquid-glass-studio/shaders-ts'

// ============================================================================
// TYPES
// ============================================================================

export interface StudioGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the glass element
   */
  width?: number
  
  /**
   * Height of the glass element
   */
  height?: number
  
  /**
   * Shape width
   */
  shapeWidth?: number
  
  /**
   * Shape height
   */
  shapeHeight?: number
  
  /**
   * Corner radius
   */
  cornerRadius?: number
  
  /**
   * Shape roundness (superellipse parameter)
   */
  shapeRoundness?: number
  
  /**
   * Refraction thickness
   */
  refThickness?: number
  
  /**
   * Refraction factor
   */
  refFactor?: number
  
  /**
   * Dispersion gain (chromatic aberration)
   */
  refDispersion?: number
  
  /**
   * Fresnel size
   */
  refFresnelRange?: number
  
  /**
   * Fresnel hardness
   */
  refFresnelHardness?: number
  
  /**
   * Fresnel intensity
   */
  refFresnelFactor?: number
  
  /**
   * Glare size
   */
  glareRange?: number
  
  /**
   * Glare hardness
   */
  glareHardness?: number
  
  /**
   * Glare intensity
   */
  glareFactor?: number
  
  /**
   * Glare convergence
   */
  glareConvergence?: number
  
  /**
   * Glare opposite side factor
   */
  glareOppositeFactor?: number
  
  /**
   * Glare angle (degrees)
   */
  glareAngle?: number
  
  /**
   * Blur radius
   */
  blurRadius?: number
  
  /**
   * Blur edge
   */
  blurEdge?: boolean
  
  /**
   * Tint color (RGBA)
   */
  tint?: { r: number; g: number; b: number; a: number }
  
  /**
   * Shadow expand
   */
  shadowExpand?: number
  
  /**
   * Shadow intensity
   */
  shadowFactor?: number
  
  /**
   * Shadow position
   */
  shadowPosition?: { x: number; y: number }
  
  /**
   * Background image URL
   */
  backgroundImage?: string
  
  /**
   * Enable dragging
   */
  draggable?: boolean
  
  /**
   * Children content
   */
  children?: React.ReactNode
}

// ============================================================================
// PRESETS
// ============================================================================

export const STUDIO_PRESETS = {
  subtle: {
    refThickness: 15,
    refFactor: 1.2,
    refDispersion: 3,
    refFresnelRange: 20,
    refFresnelHardness: 10,
    refFresnelFactor: 10,
    glareRange: 20,
    glareHardness: 10,
    glareFactor: 50,
    glareConvergence: 30,
    glareOppositeFactor: 50,
    glareAngle: -45,
    blurRadius: 1,
  },
  medium: {
    refThickness: 20,
    refFactor: 1.4,
    refDispersion: 7,
    refFresnelRange: 30,
    refFresnelHardness: 20,
    refFresnelFactor: 20,
    glareRange: 30,
    glareHardness: 20,
    glareFactor: 90,
    glareConvergence: 50,
    glareOppositeFactor: 80,
    glareAngle: -45,
    blurRadius: 1,
  },
  prominent: {
    refThickness: 25,
    refFactor: 1.6,
    refDispersion: 10,
    refFresnelRange: 40,
    refFresnelHardness: 30,
    refFresnelFactor: 30,
    glareRange: 40,
    glareHardness: 30,
    glareFactor: 120,
    glareConvergence: 70,
    glareOppositeFactor: 100,
    glareAngle: -45,
    blurRadius: 2,
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function computeGaussianKernelByRadius(radius: number): number[] {
  const sigma = radius / 2
  const size = Math.ceil(radius) * 2 + 1
  const kernel: number[] = []
  let sum = 0

  for (let i = 0; i < size; i++) {
    const x = i - Math.floor(size / 2)
    const value = Math.exp(-(x * x) / (2 * sigma * sigma))
    kernel.push(value)
    sum += value
  }

  // Normalize
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum
  }

  return kernel
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * StudioGlass - Real liquid glass using WebGL2 shaders from liquid-glass-studio
 * 
 * Features:
 * - Fresnel reflection
 * - Dispersion (chromatic aberration)
 * - Glare with angle control
 * - SDF shapes with superellipse
 * - Multi-pass Gaussian blur
 * - Real refraction
 * 
 * @example
 * ```tsx
 * <StudioGlass 
 *   width={300}
 *   height={200}
 *   cornerRadius={16}
 *   backgroundImage="/lake-foggy-bg.png"
 * >
 *   <div className="p-6">
 *     <h2>Content with real glass effect</h2>
 *   </div>
 * </StudioGlass>
 * ```
 */
export const StudioGlass = forwardRef<HTMLDivElement, StudioGlassProps>(
  (
    {
      width = 300,
      height = 200,
      shapeWidth,
      shapeHeight,
      cornerRadius = 16,
      shapeRoundness = 4,
      refThickness = 20,
      refFactor = 1.4,
      refDispersion = 7,
      refFresnelRange = 30,
      refFresnelHardness = 20,
      refFresnelFactor = 20,
      glareRange = 30,
      glareHardness = 20,
      glareFactor = 90,
      glareConvergence = 50,
      glareOppositeFactor = 80,
      glareAngle = -45,
      blurRadius = 1,
      blurEdge = true,
      tint = { r: 1, g: 1, b: 1, a: 0 },
      shadowExpand = 25,
      shadowFactor = 15,
      shadowPosition = { x: 0, y: -10 },
      backgroundImage,
      draggable = false,
      className,
      children,
      style,
      ...props
    },
    forwardedRef
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const rendererRef = useRef<MultiPassRenderer | null>(null)
    const rafRef = useRef<number | null>(null)
    const mousePos = useRef({ x: width / 2, y: height / 2 })
    const mousePosSpring = useRef({ x: width / 2, y: height / 2 })
    const mousePosVelocity = useRef({ x: 0, y: 0 })
    
    // Dragging state
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const dragStateRef = useRef({
      isDragging: false,
      startX: 0,
      startY: 0,
      startPosX: 0,
      startPosY: 0,
    })
    
    const finalShapeWidth = shapeWidth ?? width
    const finalShapeHeight = shapeHeight ?? height

    useEffect(() => {
      if (!canvasRef.current || !containerRef.current) return

      const canvas = canvasRef.current
      const container = containerRef.current
      const dpr = window.devicePixelRatio || 1
      
      canvas.width = width * dpr
      canvas.height = height * dpr

      try {
        const gl = canvas.getContext('webgl2', { 
          alpha: true,
          premultipliedAlpha: false,
        })
        if (!gl) throw new Error('WebGL2 not supported')

        // Check for required extension
        const ext = gl.getExtension('EXT_color_buffer_float')
        if (!ext) throw new Error('EXT_color_buffer_float not supported')

        // Create multi-pass renderer
        const renderer = new MultiPassRenderer(canvas, [
          { name: 'bgPass', shader: { vertex: VertexShader, fragment: FragmentBgShader } },
          { name: 'vBlurPass', shader: { vertex: VertexShader, fragment: FragmentBgVblurShader }, inputs: { u_prevPassTexture: 'bgPass' } },
          { name: 'hBlurPass', shader: { vertex: VertexShader, fragment: FragmentBgHblurShader }, inputs: { u_prevPassTexture: 'vBlurPass' } },
          { name: 'mainPass', shader: { vertex: VertexShader, fragment: FragmentMainShader }, inputs: { u_blurredBg: 'hBlurPass', u_bg: 'bgPass' }, outputToScreen: true },
        ])

        rendererRef.current = renderer

        // Capture page background
        let bgTexture: WebGLTexture | null = null
        let bgTextureRatio = 1
        let bgTextureReady = false

        const captureBackground = () => {
          // Get the page background element
          const bgElement = document.querySelector('[style*="background-image"]') as HTMLElement
          if (!bgElement) return

          const bgStyle = window.getComputedStyle(bgElement)
          const bgImage = bgStyle.backgroundImage
          
          if (bgImage && bgImage !== 'none') {
            const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/)
            if (urlMatch && urlMatch[1]) {
              const img = new Image()
              img.crossOrigin = 'anonymous'
              img.onload = () => {
                const texture = gl.createTexture()
                if (!texture) return

                gl.bindTexture(gl.TEXTURE_2D, texture)
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
                gl.generateMipmap(gl.TEXTURE_2D)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

                bgTexture = texture
                bgTextureRatio = img.naturalWidth / img.naturalHeight
                bgTextureReady = true
              }
              img.src = urlMatch[1]
            }
          }
        }

        captureBackground()

        // Compute blur weights
        const blurWeights = computeGaussianKernelByRadius(blurRadius)

        // Set global uniforms
        renderer.setUniforms({
          u_resolution: [width * dpr, height * dpr],
          u_dpr: dpr,
          u_mouse: [mousePos.current.x * dpr, mousePos.current.y * dpr],
          u_mouseSpring: [mousePosSpring.current.x * dpr, mousePosSpring.current.y * dpr],
          u_shapeWidth: finalShapeWidth,
          u_shapeHeight: finalShapeHeight,
          u_shapeRadius: cornerRadius,
          u_shapeRoundness: shapeRoundness,
          u_mergeRate: 0,
          u_blurWeights: blurWeights,
          u_blurRadius: blurRadius,
          u_showShape1: 0,
        })

        // Clear to transparent
        gl.clearColor(0, 0, 0, 0)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        // Render loop with spring animation
        const render = () => {
          if (!renderer) return

          // Spring animation for mouse position
          const springStiffness = 0.15
          const springDamping = 0.8
          
          const dx = mousePos.current.x - mousePosSpring.current.x
          const dy = mousePos.current.y - mousePosSpring.current.y
          
          mousePosVelocity.current.x += dx * springStiffness
          mousePosVelocity.current.y += dy * springStiffness
          
          mousePosVelocity.current.x *= springDamping
          mousePosVelocity.current.y *= springDamping
          
          mousePosSpring.current.x += mousePosVelocity.current.x
          mousePosSpring.current.y += mousePosVelocity.current.y

          renderer.render({
            bgPass: {
              u_bgType: bgTextureReady ? 3 : 0,
              u_bgTexture: bgTexture,
              u_bgTextureRatio: bgTextureRatio,
              u_bgTextureReady: bgTextureReady ? 1 : 0,
              u_shadowExpand: shadowExpand,
              u_shadowFactor: shadowFactor / 100,
              u_shadowPosition: [shadowPosition.x, shadowPosition.y],
            },
            mainPass: {
              u_mouse: [mousePos.current.x * dpr, mousePos.current.y * dpr],
              u_mouseSpring: [mousePosSpring.current.x * dpr, mousePosSpring.current.y * dpr],
              u_tint: [tint.r, tint.g, tint.b, tint.a],
              u_refThickness: refThickness,
              u_refFactor: refFactor,
              u_refDispersion: refDispersion,
              u_refFresnelRange: refFresnelRange,
              u_refFresnelHardness: refFresnelHardness / 100,
              u_refFresnelFactor: refFresnelFactor / 100,
              u_glareRange: glareRange,
              u_glareHardness: glareHardness / 100,
              u_glareConvergence: glareConvergence / 100,
              u_glareOppositeFactor: glareOppositeFactor / 100,
              u_glareFactor: glareFactor / 100,
              u_blurEdge: blurEdge ? 1 : 0,
              STEP: 9, // Final step with all effects
            },
          })

          rafRef.current = requestAnimationFrame(render)
        }

        render()

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect()
          mousePos.current = {
            x: e.clientX - rect.left,
            y: height - (e.clientY - rect.top),
          }
        }

        canvas.addEventListener('mousemove', handleMouseMove)

        return () => {
          canvas.removeEventListener('mousemove', handleMouseMove)
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
          }
          if (bgTexture) {
            gl.deleteTexture(bgTexture)
          }
          renderer.dispose()
        }
      } catch (error) {
        console.error('Failed to initialize StudioGlass:', error)
      }
    }, [
      width,
      height,
      finalShapeWidth,
      finalShapeHeight,
      cornerRadius,
      shapeRoundness,
      refThickness,
      refFactor,
      refDispersion,
      refFresnelRange,
      refFresnelHardness,
      refFresnelFactor,
      glareRange,
      glareHardness,
      glareFactor,
      glareConvergence,
      glareOppositeFactor,
      glareAngle,
      blurRadius,
      blurEdge,
      tint,
      shadowExpand,
      shadowFactor,
      shadowPosition,
    ])

    // Dragging handlers
    useEffect(() => {
      if (!draggable || !containerRef.current) return

      const container = containerRef.current

      const handlePointerDown = (e: PointerEvent) => {
        // Only drag if clicking on the glass itself, not on interactive content
        const target = e.target as HTMLElement
        if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT') {
          return
        }

        dragStateRef.current = {
          isDragging: true,
          startX: e.clientX,
          startY: e.clientY,
          startPosX: position.x,
          startPosY: position.y,
        }

        e.preventDefault()
        container.style.cursor = 'grabbing'
      }

      const handlePointerMove = (e: PointerEvent) => {
        if (!dragStateRef.current.isDragging) return

        const deltaX = e.clientX - dragStateRef.current.startX
        const deltaY = e.clientY - dragStateRef.current.startY

        setPosition({
          x: dragStateRef.current.startPosX + deltaX,
          y: dragStateRef.current.startPosY + deltaY,
        })
      }

      const handlePointerUp = () => {
        if (dragStateRef.current.isDragging) {
          dragStateRef.current.isDragging = false
          container.style.cursor = draggable ? 'grab' : 'default'
        }
      }

      container.addEventListener('pointerdown', handlePointerDown)
      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)

      return () => {
        container.removeEventListener('pointerdown', handlePointerDown)
        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerUp)
      }
    }, [draggable, position])

    return (
      <div
        ref={(node) => {
          containerRef.current = node
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else if (forwardedRef) {
            forwardedRef.current = node
          }
        }}
        className={cn('relative inline-block overflow-hidden', className)}
        style={{ 
          width, 
          height,
          borderRadius: `${cornerRadius}px`,
          transform: draggable ? `translate(${position.x}px, ${position.y}px)` : undefined,
          cursor: draggable ? 'grab' : 'default',
          userSelect: draggable ? 'none' : undefined,
          ...style 
        }}
        {...props}
      >
        {/* WebGL Canvas with glass effect */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: `${cornerRadius}px`,
          }}
        />
        
        {/* Content overlay */}
        <div
          ref={contentRef}
          className="relative z-10 w-full h-full"
        >
          {children}
        </div>
      </div>
    )
  }
)

StudioGlass.displayName = 'StudioGlass'
