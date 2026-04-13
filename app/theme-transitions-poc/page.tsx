'use client'

/**
 * Theme Transitions POC Page
 * 
 * Interactive demo page to test all theme transition effects:
 * - Ripple Theme Transition
 * - Particle Theme Transition  
 * - Staggered Morphing Transition
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Sparkles, Waves, Layers, Play, Pause } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { RippleThemeTransition, useRippleThemeTransition } from '@/components/effects/RippleThemeTransition'
import { ParticleThemeTransition, useParticleThemeTransition } from '@/components/effects/ParticleThemeTransition'
import { StaggeredMorphTransition } from '@/components/effects/StaggeredMorphTransition'
import { useTheme } from '@/lib/hooks/useTheme'
import { springPresets } from '@/lib/constants/animations'

export default function ThemeTransitionsPOC() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeDemo, setActiveDemo] = useState<'all' | 'ripple' | 'particles' | 'stagger'>('all')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAnyEffectActive, setIsAnyEffectActive] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(0)

  // Individual transition hooks
  const { isTransitioning: isRippleActive, rippleOrigin, triggerRipple, completeTransition: completeRipple } = useRippleThemeTransition()
  const { isTransitioning: isParticleActive, triggerParticles, completeTransition: completeParticles } = useParticleThemeTransition()
  const [isStaggerActive, setIsStaggerActive] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Track when any effect is active - must be before conditional return
  useEffect(() => {
    setIsAnyEffectActive(isRippleActive || isParticleActive || isStaggerActive)
  }, [isRippleActive, isParticleActive, isStaggerActive])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    )
  }

  // Debounce function to prevent rapid clicks
  const debounce = (func: Function, delay: number) => {
    return (...args: any[]) => {
      const now = Date.now()
      if (now - lastClickTime < delay) {
        return // Ignore rapid clicks
      }
      setLastClickTime(now)
      func(...args)
    }
  }

  const handleRippleDemo = debounce((element: HTMLElement | null) => {
    if (!element || isAnyEffectActive) return
    
    setActiveDemo('ripple')
    triggerRipple(element)
    
    // Wait for ripple animation to start before changing theme
    setTimeout(() => {
      toggleTheme()
    }, 150) // Increased delay to ensure ripple is visible
  }, 1000) // 1 second debounce

  const handleParticleDemo = debounce(() => {
    if (isAnyEffectActive) return
    
    setActiveDemo('particles')
    triggerParticles()
    
    setTimeout(() => {
      toggleTheme()
    }, 150)
  }, 1000)

  const handleStaggerDemo = debounce(() => {
    if (isAnyEffectActive) return
    
    setActiveDemo('stagger')
    setIsStaggerActive(true)
    
    setTimeout(() => {
      toggleTheme()
    }, 150)
  }, 1000)

  const handleAllEffects = debounce((element: HTMLElement | null) => {
    if (isAnyEffectActive) return
    
    setActiveDemo('all')
    triggerRipple(element)
    triggerParticles()
    setIsStaggerActive(true)
    
    setTimeout(() => {
      toggleTheme()
    }, 150)
  }, 1000)

  const handleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    if (isAnyEffectActive) {
      return // Don't start auto-play if effects are already running
    }

    setIsPlaying(true)
    
    const effects = ['ripple', 'particles', 'stagger', 'all']
    let currentIndex = 0

    const playNext = () => {
      if (!isPlaying || isAnyEffectActive) return

      const effect = effects[currentIndex]
      const demoButton = document.querySelector(`[data-demo="${effect}"]`) as HTMLElement

      switch (effect) {
        case 'ripple':
          handleRippleDemo(demoButton)
          break
        case 'particles':
          handleParticleDemo()
          break
        case 'stagger':
          handleStaggerDemo()
          break
        case 'all':
          handleAllEffects(demoButton)
          break
      }

      currentIndex = (currentIndex + 1) % effects.length
      
      // Wait longer between auto-play effects to ensure they complete
      setTimeout(() => {
        if (isPlaying) playNext()
      }, 4000) // Increased from 3000ms to 4000ms
    }

    playNext()
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Theme Transition Effects */}
      <RippleThemeTransition
        isActive={isRippleActive && (activeDemo === 'ripple' || activeDemo === 'all')}
        origin={rippleOrigin}
        onComplete={completeRipple}
      />
      
      <ParticleThemeTransition
        isActive={isParticleActive && (activeDemo === 'particles' || activeDemo === 'all')}
        onComplete={completeParticles}
      />
      
      <StaggeredMorphTransition
        theme={theme}
        isTransitioning={isStaggerActive && (activeDemo === 'stagger' || activeDemo === 'all')}
        onTransitionComplete={() => setIsStaggerActive(false)}
      />

      {/* Header */}
      <header className="border-b border-border-subtle bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Theme Transitions POC</h1>
            <p className="text-sm text-text-secondary mt-1">
              Interactive demo of all theme transition effects
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleAutoPlay}
              disabled={isAnyEffectActive && !isPlaying}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isAnyEffectActive && !isPlaying
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
              whileHover={isAnyEffectActive && !isPlaying ? {} : { scale: 1.02 }}
              whileTap={isAnyEffectActive && !isPlaying ? {} : { scale: 0.98 }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Stop Auto Play' : 'Auto Play Demo'}
            </motion.button>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Demo Controls */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Interactive Demo Controls</h2>
            {isAnyEffectActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                Effect in progress...
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ripple Demo */}
            <motion.div
              className={`card p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                isAnyEffectActive ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={isAnyEffectActive ? {} : { y: -2 }}
              onClick={(e) => {
                if (!isAnyEffectActive) {
                  handleRippleDemo(e.currentTarget as HTMLElement)
                }
              }}
              data-demo="ripple"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Waves className="text-blue-500" size={20} />
                </div>
                <h3 className="font-medium text-text-primary">Ripple Effect</h3>
                {isRippleActive && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                )}
              </div>
              <p className="text-sm text-text-secondary">
                Expanding circle animation from click position
              </p>
              {isAnyEffectActive && (
                <p className="text-xs text-text-tertiary mt-2">
                  Wait for current effect to complete...
                </p>
              )}
            </motion.div>

            {/* Particle Demo */}
            <motion.div
              className={`card p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                isAnyEffectActive ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={isAnyEffectActive ? {} : { y: -2 }}
              onClick={() => {
                if (!isAnyEffectActive) {
                  handleParticleDemo()
                }
              }}
              data-demo="particles"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Sparkles className="text-amber-500" size={20} />
                </div>
                <h3 className="font-medium text-text-primary">Floating Particles</h3>
                {isParticleActive && (
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                )}
              </div>
              <p className="text-sm text-text-secondary">
                20-30 particles floating upward with drift
              </p>
              {isAnyEffectActive && (
                <p className="text-xs text-text-tertiary mt-2">
                  Wait for current effect to complete...
                </p>
              )}
            </motion.div>

            {/* Stagger Demo */}
            <motion.div
              className={`card p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                isAnyEffectActive ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={isAnyEffectActive ? {} : { y: -2 }}
              onClick={() => {
                if (!isAnyEffectActive) {
                  handleStaggerDemo()
                }
              }}
              data-demo="stagger"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Layers className="text-purple-500" size={20} />
                </div>
                <h3 className="font-medium text-text-primary">Staggered Morph</h3>
                {isStaggerActive && (
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                )}
              </div>
              <p className="text-sm text-text-secondary">
                Elements morph colors with 50ms delays
              </p>
              {isAnyEffectActive && (
                <p className="text-xs text-text-tertiary mt-2">
                  Wait for current effect to complete...
                </p>
              )}
            </motion.div>

            {/* All Effects Demo */}
            <motion.div
              className={`card p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 ${
                isAnyEffectActive ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={isAnyEffectActive ? {} : { y: -2 }}
              onClick={(e) => {
                if (!isAnyEffectActive) {
                  handleAllEffects(e.currentTarget as HTMLElement)
                }
              }}
              data-demo="all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: isAnyEffectActive ? 360 : 0 }}
                    transition={{ duration: 2, repeat: isAnyEffectActive ? Infinity : 0, ease: 'linear' }}
                  >
                    {theme === 'light' ? <Sun className="text-primary" size={20} /> : <Moon className="text-primary" size={20} />}
                  </motion.div>
                </div>
                <h3 className="font-medium text-text-primary">All Effects</h3>
                {(isRippleActive || isParticleActive || isStaggerActive) && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                )}
              </div>
              <p className="text-sm text-text-secondary">
                Experience all three effects together
              </p>
              {isAnyEffectActive && (
                <p className="text-xs text-text-tertiary mt-2">
                  Effects in progress...
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Sample UI Elements for Stagger Testing */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Sample UI Elements</h2>
          <p className="text-text-secondary mb-6">
            These elements demonstrate the staggered morphing effect. They have the appropriate CSS classes
            that the StaggeredMorphTransition component targets.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar Sample */}
            <div className="sidebar bg-surface border border-border-subtle rounded-lg p-4">
              <h3 className="font-medium text-text-primary mb-4">Sidebar Sample</h3>
              <div className="space-y-3">
                <div className="agent-card bg-surface-elevated rounded-lg p-3 border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                    <div>
                      <div className="font-medium text-text-primary">Agent Name</div>
                      <div className="text-xs text-text-secondary">Agent description</div>
                    </div>
                  </div>
                </div>
                <div className="session-item bg-surface-elevated rounded-lg p-3 border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20"></div>
                    <div className="text-sm text-text-primary">Session Item</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Sample */}
            <div className="space-y-4">
              <div className="chat-header bg-surface border border-border-subtle rounded-lg p-4">
                <h3 className="font-medium text-text-primary">Chat Header</h3>
              </div>
              
              <div className="message bg-surface border border-border-subtle rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-text-primary mb-1">User Message</div>
                    <div className="text-text-secondary">This is a sample message that demonstrates the morphing effect.</div>
                  </div>
                </div>
              </div>
              
              <div className="input-container bg-surface border border-border-subtle rounded-lg p-4">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="w-full bg-transparent text-text-primary placeholder-text-tertiary outline-none"
                />
              </div>
            </div>

            {/* Cards Sample */}
            <div className="space-y-4">
              <div className="card bg-surface border border-border-subtle rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">Sample Card</h4>
                <p className="text-text-secondary text-sm mb-4">
                  This card demonstrates the morphing transition effect.
                </p>
                <button className="button bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors">
                  Action Button
                </button>
              </div>
              
              <div className="card bg-surface border border-border-subtle rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">Another Card</h4>
                <div className="flex gap-2">
                  <button className="button bg-surface-elevated border border-border-subtle text-text-primary px-3 py-1 rounded text-sm hover:bg-surface-hover transition-colors">
                    Secondary
                  </button>
                  <button className="button bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors">
                    Primary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Effect Details */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-6">Effect Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border-subtle rounded-lg p-6">
              <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                <Waves className="text-blue-500" size={16} />
                Ripple Transition
              </h3>
              <ul className="text-sm text-text-secondary space-y-2">
                <li>• Expands from click position</li>
                <li>• 600ms easeInOut duration</li>
                <li>• Covers entire viewport</li>
                <li>• Respects reduced motion</li>
              </ul>
            </div>
            
            <div className="bg-surface border border-border-subtle rounded-lg p-6">
              <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={16} />
                Particle Transition
              </h3>
              <ul className="text-sm text-text-secondary space-y-2">
                <li>• 20-30 random particles</li>
                <li>• 800ms float duration</li>
                <li>• 20ms stagger delays</li>
                <li>• Random horizontal drift</li>
              </ul>
            </div>
            
            <div className="bg-surface border border-border-subtle rounded-lg p-6">
              <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                <Layers className="text-purple-500" size={16} />
                Staggered Morph
              </h3>
              <ul className="text-sm text-text-secondary space-y-2">
                <li>• 50ms element delays</li>
                <li>• 400ms color transitions</li>
                <li>• Spring physics easing</li>
                <li>• Targets UI elements</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section className="mt-12 p-6 bg-surface border border-border-subtle rounded-lg">
          <h3 className="font-medium text-text-primary mb-4">Transition Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRippleActive ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <span className="text-text-secondary">Ripple: {isRippleActive ? 'Active' : 'Idle'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isParticleActive ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
              <span className="text-text-secondary">Particles: {isParticleActive ? 'Active' : 'Idle'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isStaggerActive ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
              <span className="text-text-secondary">Stagger: {isStaggerActive ? 'Active' : 'Idle'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${theme === 'light' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
              <span className="text-text-secondary">Theme: {theme}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}