'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FadeInOnScroll, FadeInScaleOnScroll, SlideInOnScroll } from '@/components/common/FadeInOnScroll'
import { RippleEffect } from '@/components/effects/RippleEffect'
import { ParallaxBackground, ParallaxLayer, ParallaxBlob } from '@/components/effects/ParallaxBackground'
import { AnimatedCounter, AnimatedPercentage, AnimatedCurrency } from '@/components/common/AnimatedCounter'
import { ProgressRing, ProgressRingWithLabel, MiniProgressRing } from '@/components/common/ProgressRing'
import { Button } from '@/components/common/Button'
import { Toggle } from '@/components/common/Toggle'
import { Checkbox } from '@/components/common/Checkbox'
import { useRipple } from '@/lib/hooks/useRipple'
import { useHoverLift, useHoverScale, useHoverGlow } from '@/lib/hooks/useHoverLift'
import { springPresets } from '@/lib/constants/animations'
import { Sparkles, Zap, Heart, Star, TrendingUp, Users, DollarSign } from 'lucide-react'

export default function ScrollAnimationsPOCPage() {
  const [isToggleOn, setIsToggleOn] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [counterValue, setCounterValue] = useState(1234)
  const [progressValue, setProgressValue] = useState(75)
  const { ripples, handleRipple } = useRipple()
  const hoverLift = useHoverLift()
  const hoverScale = useHoverScale(1.05)
  const hoverGlow = useHoverGlow()

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Parallax Background Blobs */}
      <ParallaxBlob
        layer="back"
        color="primary"
        className="top-20 left-10"
      />
      <ParallaxBlob
        layer="middle"
        color="secondary"
        className="top-96 right-20"
      />
      <ParallaxBlob
        layer="front"
        color="primary"
        className="bottom-20 left-1/3"
      />

      <div className="relative z-10 max-w-4xl mx-auto p-8 space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springPresets.gentle}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-primary">
            Phase 15: Scroll Animations & Micro-Interactions POC
          </h1>
          <p className="text-secondary">
            Scroll down to see animations trigger as elements enter the viewport
          </p>
        </motion.div>

        {/* Fade In on Scroll */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">
            Fade In on Scroll
          </h2>
          
          <div className="space-y-4">
            <FadeInOnScroll>
              <div className="bg-surface p-6 rounded-lg border border-subtle">
                <h3 className="text-lg font-medium text-primary mb-2">
                  Basic Fade In
                </h3>
                <p className="text-secondary">
                  This element fades in and slides up when it enters the viewport.
                </p>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll delay={0.1}>
              <div className="bg-surface p-6 rounded-lg border border-subtle">
                <h3 className="text-lg font-medium text-primary mb-2">
                  Fade In with Delay
                </h3>
                <p className="text-secondary">
                  This element has a 100ms delay for staggered effect.
                </p>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll delay={0.2}>
              <div className="bg-surface p-6 rounded-lg border border-subtle">
                <h3 className="text-lg font-medium text-primary mb-2">
                  Another Delayed Element
                </h3>
                <p className="text-secondary">
                  This element has a 200ms delay, creating a cascade effect.
                </p>
              </div>
            </FadeInOnScroll>
          </div>
        </section>

        {/* Fade In with Scale */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">
            Fade In with Scale
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <FadeInScaleOnScroll key={i} delay={i * 0.1}>
                <div className="bg-surface p-6 rounded-lg border border-subtle text-center">
                  <div className="text-primary mb-2">
                    {i === 1 && <Sparkles size={32} className="mx-auto" />}
                    {i === 2 && <Zap size={32} className="mx-auto" />}
                    {i === 3 && <Heart size={32} className="mx-auto" />}
                  </div>
                  <h3 className="text-lg font-medium text-primary">
                    Card {i}
                  </h3>
                  <p className="text-sm text-secondary">
                    Scales and fades in
                  </p>
                </div>
              </FadeInScaleOnScroll>
            ))}
          </div>
        </section>

        {/* Slide In from Directions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">
            Slide In from Different Directions
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <SlideInOnScroll direction="left">
              <div className="bg-surface p-6 rounded-lg border border-subtle">
                <h3 className="text-lg font-medium text-primary mb-2">
                  ← From Left
                </h3>
                <p className="text-secondary">Slides in from the left side</p>
              </div>
            </SlideInOnScroll>

            <SlideInOnScroll direction="right">
              <div className="bg-surface p-6 rounded-lg border border-subtle">
                <h3 className="text-lg font-medium text-primary mb-2">
                  From Right →
                </h3>
                <p className="text-secondary">Slides in from the right side</p>
              </div>
            </SlideInOnScroll>

            <SlideInOnScroll direction="up">
              <div className="bg-surface p-6 rounded-lg border border-subtle">
                <h3 className="text-lg font-medium text-primary mb-2">
                  ↑ From Bottom
                </h3>
                <p className="text-secondary">Slides up from the bottom</p>
              </div>
            </SlideInOnScroll>

            <SlideInOnScroll direction="down">
              <div className="bg-surface p-6 rounded-lg border border-subtle">
                <h3 className="text-lg font-medium text-primary mb-2">
                  From Top ↓
                </h3>
                <p className="text-secondary">Slides down from the top</p>
              </div>
            </SlideInOnScroll>
          </div>
        </section>

        {/* Ripple Effect */}
        <FadeInOnScroll>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">
              Ripple Click Effect
            </h2>
            
            <div className="bg-surface p-6 rounded-lg border border-subtle space-y-4">
              <p className="text-secondary mb-4">
                Click the buttons below to see the ripple effect
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleRipple}
                  className="relative px-6 py-3 bg-primary text-white rounded-lg font-medium overflow-hidden"
                >
                  Click Me
                  <RippleEffect ripples={ripples} />
                </button>

                <button
                  onClick={handleRipple}
                  className="relative px-6 py-3 bg-surface border border-subtle text-primary rounded-lg font-medium overflow-hidden hover:bg-surface-hover"
                >
                  Or Me
                  <RippleEffect ripples={ripples} color="rgba(245, 158, 11, 0.3)" />
                </button>

                <button
                  onClick={handleRipple}
                  className="relative px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium overflow-hidden"
                >
                  Gradient Button
                  <RippleEffect ripples={ripples} />
                </button>
              </div>
            </div>
          </section>
        </FadeInOnScroll>

        {/* Micro-Interactions */}
        <FadeInOnScroll>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">
              Micro-Interactions
            </h2>
            
            <div className="bg-surface p-6 rounded-lg border border-subtle space-y-6">
              {/* Toggle */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-primary">
                  Toggle Switch
                </h3>
                <div className="flex items-center gap-4">
                  <Toggle
                    checked={isToggleOn}
                    onChange={setIsToggleOn}
                    label="Enable feature"
                  />
                  <span className="text-sm text-secondary">
                    {isToggleOn ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Checkbox */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-primary">
                  Animated Checkbox
                </h3>
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={isChecked}
                    onChange={setIsChecked}
                    label="I agree to the terms"
                  />
                  <span className="text-sm text-secondary">
                    {isChecked ? 'Checked' : 'Unchecked'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </FadeInOnScroll>

        {/* Parallax Info */}
        <FadeInOnScroll>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">
              Parallax Background
            </h2>
            
            <div className="bg-surface p-6 rounded-lg border border-subtle">
              <p className="text-secondary mb-4">
                Notice the subtle parallax effect on the background blobs as you scroll.
                Different layers move at different speeds to create depth.
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary">
                <li>Back layer: Slowest movement (30% speed)</li>
                <li>Middle layer: Medium movement (50% speed)</li>
                <li>Front layer: Fastest movement (70% speed)</li>
              </ul>
            </div>
          </section>
        </FadeInOnScroll>

        {/* Animated Counter */}
        <FadeInOnScroll>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">
              Animated Counter
            </h2>
            
            <div className="bg-surface p-6 rounded-lg border border-subtle space-y-6">
              <p className="text-secondary mb-4">
                Counters that smoothly animate to their target values
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-primary mb-2">
                    <Users size={32} className="mx-auto" />
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    <AnimatedCounter value={counterValue} />
                  </div>
                  <p className="text-sm text-secondary">Total Users</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-primary mb-2">
                    <TrendingUp size={32} className="mx-auto" />
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    <AnimatedPercentage value={progressValue} />
                  </div>
                  <p className="text-sm text-secondary">Growth Rate</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-primary mb-2">
                    <DollarSign size={32} className="mx-auto" />
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    <AnimatedCurrency value={45678.90} />
                  </div>
                  <p className="text-sm text-secondary">Revenue</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button
                  onClick={() => setCounterValue(Math.floor(Math.random() * 10000))}
                  variant="secondary"
                  size="sm"
                >
                  Randomize Users
                </Button>
                <Button
                  onClick={() => setProgressValue(Math.floor(Math.random() * 100))}
                  variant="secondary"
                  size="sm"
                >
                  Randomize Progress
                </Button>
              </div>
            </div>
          </section>
        </FadeInOnScroll>

        {/* Progress Ring */}
        <FadeInOnScroll>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">
              Progress Ring
            </h2>
            
            <div className="bg-surface p-6 rounded-lg border border-subtle">
              <p className="text-secondary mb-6">
                Circular progress indicators with smooth stroke animation
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <ProgressRingWithLabel
                  percentage={progressValue}
                  label="Completion"
                />
                <ProgressRingWithLabel
                  percentage={85}
                  label="Quality"
                  color="hsl(var(--success))"
                />
                <ProgressRingWithLabel
                  percentage={60}
                  label="Performance"
                  color="hsl(var(--info))"
                />
                <ProgressRingWithLabel
                  percentage={40}
                  label="Coverage"
                  color="hsl(var(--warning))"
                />
              </div>

              <div className="flex gap-4 justify-center pt-6">
                <Button
                  onClick={() => setProgressValue(Math.floor(Math.random() * 100))}
                  variant="secondary"
                  size="sm"
                >
                  Randomize Progress
                </Button>
              </div>
            </div>
          </section>
        </FadeInOnScroll>

        {/* Hover Effects */}
        <FadeInOnScroll>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary">
              Hover Effects
            </h2>
            
            <div className="bg-surface p-6 rounded-lg border border-subtle space-y-4">
              <p className="text-secondary mb-4">
                Hover over the cards to see different lift effects
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  {...hoverLift}
                  className="bg-background p-6 rounded-lg border border-subtle cursor-pointer"
                >
                  <h3 className="text-lg font-medium text-primary mb-2">
                    Hover Lift
                  </h3>
                  <p className="text-sm text-secondary">
                    Lifts up with shadow
                  </p>
                </motion.div>

                <motion.div
                  {...hoverScale}
                  className="bg-background p-6 rounded-lg border border-subtle cursor-pointer"
                >
                  <h3 className="text-lg font-medium text-primary mb-2">
                    Hover Scale
                  </h3>
                  <p className="text-sm text-secondary">
                    Scales up slightly
                  </p>
                </motion.div>

                <motion.div
                  {...hoverGlow}
                  className="bg-background p-6 rounded-lg border border-subtle cursor-pointer"
                >
                  <h3 className="text-lg font-medium text-primary mb-2">
                    Hover Glow
                  </h3>
                  <p className="text-sm text-secondary">
                    Lifts with glow effect
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        </FadeInOnScroll>

        {/* Spacer for more scrolling */}
        <div className="h-96" />

        {/* Navigation */}
        <FadeInOnScroll>
          <div className="flex justify-center pt-8">
            <Button onClick={() => (window.location.href = '/')} variant="ghost">
              ← Back to Demo Page
            </Button>
          </div>
        </FadeInOnScroll>
      </div>
    </div>
  )
}
