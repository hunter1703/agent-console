'use client'

import { useEffect, useRef } from 'react'
import { useRefraction } from '@/components/liquid-glass/RefractionProvider'
import type { GlassType, GlassIntensity } from '@/lib/liquid-glass/types'

export interface GlassLayerOptions {
  /**
   * Glass type determines the shader and distortion parameters
   */
  type?: GlassType
  
  /**
   * Intensity of the glass effect
   */
  intensity?: GlassIntensity
  
  /**
   * Refraction strength (0-1)
   * Higher values = more distortion
   */
  refraction?: number
  
  /**
   * Chromatic dispersion amount (0-1)
   * Creates rainbow prism effects
   */
  dispersion?: number
  
  /**
   * Whether this layer should participate in refraction
   */
  enabled?: boolean
  
  /**
   * Z-index for layer ordering
   * Higher values render on top
   */
  zIndex?: number
}

const defaultOptions: Required<GlassLayerOptions> = {
  type: 'frosted',
  intensity: 'medium',
  refraction: 0.05,
  dispersion: 0.01,
  enabled: true,
  zIndex: 0,
}

/**
 * Hook for registering a component as a glass layer in the refraction system
 * 
 * @example
 * ```tsx
 * function GlassCard() {
 *   const ref = useGlassLayer({
 *     type: 'frosted',
 *     intensity: 'medium',
 *     refraction: 0.05,
 *   })
 *   
 *   return <div ref={ref} className="glass-card">Content</div>
 * }
 * ```
 */
export function useGlassLayer<T extends HTMLElement = HTMLDivElement>(
  options: GlassLayerOptions = {}
) {
  const ref = useRef<T>(null)
  const refraction = useRefraction()
  
  const opts = { ...defaultOptions, ...options }
  
  useEffect(() => {
    // Skip if no element, no refraction context, or not enabled
    if (!ref.current || !refraction || !opts.enabled) return
    
    const element = ref.current
    const layerId = `glass-layer-${Math.random().toString(36).substr(2, 9)}`
    
    // Register layer with refraction engine
    refraction.registerLayer(
      layerId,
      opts.zIndex,
      element,
      {
        type: opts.type,
        intensity: opts.intensity,
        refraction: opts.refraction,
        dispersion: opts.dispersion,
      }
    )
    
    // Add data attribute for debugging
    element.setAttribute('data-glass-layer', layerId)
    element.setAttribute('data-glass-type', opts.type)
    
    // Cleanup on unmount
    return () => {
      refraction.unregisterLayer(layerId)
      element.removeAttribute('data-glass-layer')
      element.removeAttribute('data-glass-type')
    }
  }, [
    refraction,
    opts.type,
    opts.intensity,
    opts.refraction,
    opts.dispersion,
    opts.enabled,
    opts.zIndex,
  ])
  
  return ref
}
