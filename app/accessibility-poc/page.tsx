'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SkipLinks } from '@/components/common/SkipLinks'
import { LiveRegion, ToastLiveRegion, AlertLiveRegion } from '@/components/common/LiveRegion'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Toggle } from '@/components/common/Toggle'
import { Checkbox } from '@/components/common/Checkbox'
import { useKeyboardShortcuts, formatShortcut, getModifierKey } from '@/lib/hooks/useKeyboardShortcuts'
import { springPresets } from '@/lib/constants/animations'
import { Keyboard, Eye, Volume2, Check } from 'lucide-react'

export default function AccessibilityPOCPage() {
  const [liveMessage, setLiveMessage] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [shortcutPressed, setShortcutPressed] = useState('')
  const [isToggleOn, setIsToggleOn] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  // Define keyboard shortcuts
  const shortcuts = [
    {
      key: 'k',
      modifiers: ['meta' as const],
      action: () => {
        setShortcutPressed('Search (⌘K)')
        setTimeout(() => setShortcutPressed(''), 2000)
      },
      description: 'Open search',
    },
    {
      key: 'n',
      modifiers: ['meta' as const],
      action: () => {
        setShortcutPressed('New Chat (⌘N)')
        setTimeout(() => setShortcutPressed(''), 2000)
      },
      description: 'New chat',
    },
    {
      key: 'b',
      modifiers: ['meta' as const],
      action: () => {
        setShortcutPressed('Toggle Sidebar (⌘B)')
        setTimeout(() => setShortcutPressed(''), 2000)
      },
      description: 'Toggle sidebar',
    },
  ]

  useKeyboardShortcuts(shortcuts)

  const modifierKey = getModifierKey()

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Links */}
      <SkipLinks />

      {/* Live Regions */}
      <LiveRegion message={liveMessage} />
      <ToastLiveRegion message={toastMessage} />
      <AlertLiveRegion message={alertMessage} />

      <div className="max-w-4xl mx-auto p-8 space-y-12">
        {/* Header */}
        <motion.div
          id="main-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springPresets.gentle}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-primary">
            Phase 16: Accessibility & Polish POC
          </h1>
          <p className="text-secondary">
            Test keyboard navigation, screen reader support, and accessibility features
          </p>
        </motion.div>

        {/* Skip Links Demo */}
        <section className="space-y-4" aria-labelledby="skip-links-heading">
          <h2 id="skip-links-heading" className="text-2xl font-semibold text-primary">
            Skip Links
          </h2>
          <div className="bg-surface p-6 rounded-lg border border-subtle space-y-4">
            <p className="text-secondary">
              Press <kbd className="px-2 py-1 bg-background border border-subtle rounded text-sm">Tab</kbd> from the top of the page to see skip links appear.
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary">
              <li>Skip links are hidden by default</li>
              <li>They become visible when focused with keyboard</li>
              <li>Allow users to jump to main content areas</li>
              <li>Essential for screen reader users</li>
            </ul>
          </div>
        </section>

        {/* Live Regions Demo */}
        <section className="space-y-4" aria-labelledby="live-regions-heading">
          <h2 id="live-regions-heading" className="text-2xl font-semibold text-primary">
            ARIA Live Regions
          </h2>
          <div className="bg-surface p-6 rounded-lg border border-subtle space-y-4">
            <p className="text-secondary mb-4">
              Live regions announce dynamic content changes to screen readers without moving focus.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Polite Announcement (doesn't interrupt)
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setLiveMessage('This is a polite announcement')}
                    variant="secondary"
                    size="sm"
                  >
                    Trigger Polite
                  </Button>
                  {liveMessage && (
                    <span className="text-sm text-secondary flex items-center gap-2">
                      <Check size={16} className="text-success" />
                      Announced: "{liveMessage}"
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Toast Notification
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setToastMessage('Toast notification sent')}
                    variant="secondary"
                    size="sm"
                  >
                    Trigger Toast
                  </Button>
                  {toastMessage && (
                    <span className="text-sm text-secondary flex items-center gap-2">
                      <Check size={16} className="text-success" />
                      Announced: "{toastMessage}"
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Assertive Alert (interrupts immediately)
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAlertMessage('Important alert!')}
                    variant="danger"
                    size="sm"
                  >
                    Trigger Alert
                  </Button>
                  {alertMessage && (
                    <span className="text-sm text-secondary flex items-center gap-2">
                      <Check size={16} className="text-error" />
                      Announced: "{alertMessage}"
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts Demo */}
        <section className="space-y-4" aria-labelledby="keyboard-shortcuts-heading">
          <h2 id="keyboard-shortcuts-heading" className="text-2xl font-semibold text-primary">
            Keyboard Shortcuts
          </h2>
          <div className="bg-surface p-6 rounded-lg border border-subtle space-y-4">
            <p className="text-secondary mb-4">
              Try these keyboard shortcuts:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-subtle"
                >
                  <span className="text-sm text-secondary">{shortcut.description}</span>
                  <kbd className="px-3 py-1 bg-surface border border-subtle rounded text-sm font-mono">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>

            {shortcutPressed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-primary/10 border border-primary rounded-lg text-center"
              >
                <p className="text-primary font-medium">
                  Shortcut Pressed: {shortcutPressed}
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Focus Indicators Demo */}
        <section className="space-y-4" aria-labelledby="focus-indicators-heading">
          <h2 id="focus-indicators-heading" className="text-2xl font-semibold text-primary">
            Focus Indicators
          </h2>
          <div className="bg-surface p-6 rounded-lg border border-subtle space-y-4">
            <p className="text-secondary mb-4">
              Press <kbd className="px-2 py-1 bg-background border border-subtle rounded text-sm">Tab</kbd> to navigate through these elements and see focus indicators:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>

            <div className="space-y-4">
              <Input
                label="Text Input"
                placeholder="Focus me with Tab"
              />
              
              <div className="flex items-center gap-4">
                <Toggle
                  checked={isToggleOn}
                  onChange={setIsToggleOn}
                  label="Toggle Switch"
                />
                <Checkbox
                  checked={isChecked}
                  onChange={setIsChecked}
                  label="Checkbox"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Semantic HTML Demo */}
        <section className="space-y-4" aria-labelledby="semantic-html-heading">
          <h2 id="semantic-html-heading" className="text-2xl font-semibold text-primary">
            Semantic HTML
          </h2>
          <div className="bg-surface p-6 rounded-lg border border-subtle space-y-4">
            <p className="text-secondary mb-4">
              This page uses proper semantic HTML:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-secondary">
              <li><code className="px-2 py-1 bg-background rounded text-sm">&lt;main&gt;</code> for main content area</li>
              <li><code className="px-2 py-1 bg-background rounded text-sm">&lt;nav&gt;</code> for navigation (skip links)</li>
              <li><code className="px-2 py-1 bg-background rounded text-sm">&lt;section&gt;</code> for content sections</li>
              <li><code className="px-2 py-1 bg-background rounded text-sm">&lt;h1&gt;-&lt;h6&gt;</code> for proper heading hierarchy</li>
              <li><code className="px-2 py-1 bg-background rounded text-sm">&lt;button&gt;</code> for all clickable actions</li>
              <li>ARIA labels for icon-only buttons</li>
              <li>ARIA live regions for dynamic content</li>
            </ul>
          </div>
        </section>

        {/* Accessibility Checklist */}
        <section className="space-y-4" aria-labelledby="checklist-heading">
          <h2 id="checklist-heading" className="text-2xl font-semibold text-primary">
            Accessibility Checklist
          </h2>
          <div className="bg-surface p-6 rounded-lg border border-subtle">
            <ul className="space-y-3">
              {[
                'Skip links for keyboard navigation',
                'ARIA live regions for dynamic content',
                'Visible focus indicators (keyboard only)',
                'Semantic HTML structure',
                'Proper heading hierarchy',
                'Keyboard shortcuts with visual feedback',
                'High contrast colors (WCAG AA)',
                'Screen reader friendly labels',
                'Reduced motion support',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-secondary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-center pt-8">
          <Button onClick={() => (window.location.href = '/')} variant="ghost">
            ← Back to Demo Page
          </Button>
        </div>
      </div>
    </div>
  )
}
