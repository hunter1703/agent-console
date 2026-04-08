'use client'

/**
 * Demo Page
 * 
 * Showcases all implemented components with the design system.
 */

import { useState } from 'react'
import { 
  Button, Input, Textarea, Card, Avatar, Icon, Modal, ThemeToggle, ToastContainer, 
  AnimatedText, AnimatedHeading, AnimatedLink, Toggle, Checkbox, Radio,
  Skeleton, SkeletonCard, SkeletonMessage, SkeletonList, SkeletonText,
  Shimmer, ShimmerCard, ShimmerButton,
  StaggerList, PageTransition, ScrollReveal, ScrollStagger
} from '@/components/common'
import { Send, Plus, User, MessageSquare, Check, X } from 'lucide-react'
import { useToast } from '@/lib/hooks'

export default function Home() {
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')
  const [inputError, setInputError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState<'view1' | 'view2'>('view1')
  const [isToggleOn, setIsToggleOn] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [selectedRadio, setSelectedRadio] = useState('option1')
  const [isLoading, setIsLoading] = useState(false)
  
  const { toasts, success, error, warning, info } = useToast()

  const demoItems = [
    { id: 1, title: 'First Item', description: 'This is the first item' },
    { id: 2, title: 'Second Item', description: 'This is the second item' },
    { id: 3, title: 'Third Item', description: 'This is the third item' },
    { id: 4, title: 'Fourth Item', description: 'This is the fourth item' },
  ]

  return (
    <main className="min-h-screen bg-background p-8">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} />

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <AnimatedHeading 
              level={1}
              text="Agent Console V2"
              hoverFontSwitch={true}
            />
            <ThemeToggle />
          </div>
          <AnimatedText
            text="Delightful, playful, interactive design system"
            className="text-lg text-text-secondary"
            stagger={0.03}
          />
        </div>

        {/* Buttons Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Buttons" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">
                  Primary Button
                </Button>
                <Button variant="primary" magnetic>
                  Magnetic Button
                </Button>
                <Button variant="primary" liquidBorder>
                  Liquid Border
                </Button>
                <Button variant="secondary">
                  Secondary Button
                </Button>
                <Button variant="ghost">
                  Ghost Button
                </Button>
                <Button variant="danger">
                  Danger Button
                </Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="md">
                  Medium
                </Button>
                <Button variant="primary" size="lg">
                  Large
                </Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="primary" icon={<Send size={16} />}>
                  With Icon
                </Button>
                <Button variant="primary" loading>
                  Loading
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Animated Text Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Animated Text" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-text-secondary mb-2">Character-by-character reveal:</p>
                <AnimatedText
                  text="The quick brown fox jumps over the lazy dog"
                  className="text-xl text-text-primary"
                  stagger={0.05}
                  once={false}
                />
              </div>

              <div>
                <p className="text-sm text-text-secondary mb-2">With serif font switch on hover:</p>
                <AnimatedText
                  text="Hover over me to see the magic"
                  className="text-xl text-text-primary"
                  stagger={0.04}
                  hoverFontSwitch={true}
                  once={false}
                />
              </div>

              <div>
                <p className="text-sm text-text-secondary mb-2">Animated links:</p>
                <div className="flex flex-wrap gap-4">
                  <AnimatedLink
                    text="Documentation"
                    href="#"
                    stagger={0.05}
                  />
                  <AnimatedLink
                    text="Get Started"
                    href="#"
                    stagger={0.05}
                  />
                  <AnimatedLink
                    text="Examples"
                    href="#"
                    stagger={0.05}
                  />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Inputs Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Inputs" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setInputError('')
                }}
                error={inputError}
                helperText="We'll never share your email"
              />

              <Input
                label="Name"
                placeholder="Enter your name"
                maxLength={50}
                showCharCount
              />

              <Textarea
                label="Message"
                placeholder="Type your message..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                autoResize
                maxLength={500}
                showCharCount
                helperText="Tell us what you think"
              />

              <Button 
                variant="primary"
                onClick={() => {
                  if (!inputValue) {
                    setInputError('Email is required')
                  }
                }}
              >
                Submit
              </Button>
            </div>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Cards" hoverFontSwitch={true} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="default" padding="lg">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Default Card
              </h3>
              <p className="text-text-secondary">
                Simple card with surface background
              </p>
            </Card>

            <Card variant="elevated" padding="lg" hoverable>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Elevated Card
              </h3>
              <p className="text-text-secondary">
                Card with shadow and hover lift
              </p>
            </Card>

            <Card variant="outlined" padding="lg" hoverable>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Outlined Card
              </h3>
              <p className="text-text-secondary">
                Card with border outline
              </p>
            </Card>

            <Card variant="glass" padding="lg" hoverable magnetic>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Glass Card (Magnetic)
              </h3>
              <p className="text-text-secondary">
                Glassmorphism with magnetic hover
              </p>
            </Card>
          </div>
        </section>

        {/* Avatars Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Avatars" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2">
                <Avatar name="John Doe" variant="user" size="sm" />
                <p className="text-xs text-text-secondary text-center">Small</p>
              </div>
              
              <div className="space-y-2">
                <Avatar name="John Doe" variant="user" size="md" />
                <p className="text-xs text-text-secondary text-center">Medium</p>
              </div>
              
              <div className="space-y-2">
                <Avatar name="John Doe" variant="user" size="lg" />
                <p className="text-xs text-text-secondary text-center">Large</p>
              </div>

              <div className="space-y-2">
                <Avatar name="AI Assistant" variant="agent" size="md" />
                <p className="text-xs text-text-secondary text-center">Agent</p>
              </div>

              <div className="space-y-2">
                <Avatar name="Jane Smith" variant="user" size="md" interactive />
                <p className="text-xs text-text-secondary text-center">Interactive</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Icons Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Icons" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="flex flex-wrap items-center gap-8">
              <div className="space-y-2 text-center">
                <Icon name="send" size="md" />
                <p className="text-xs text-text-secondary">Default</p>
              </div>

              <div className="space-y-2 text-center">
                <Icon name="loader" size="md" animate="spin" />
                <p className="text-xs text-text-secondary">Spin</p>
              </div>

              <div className="space-y-2 text-center">
                <Icon name="bell" size="md" animate="pulse" />
                <p className="text-xs text-text-secondary">Pulse</p>
              </div>

              <div className="space-y-2 text-center">
                <Icon name="heart" size="md" animate="bounce" />
                <p className="text-xs text-text-secondary">Bounce</p>
              </div>

              <div className="space-y-2 text-center">
                <Icon name="star" size="md" animate="hover" />
                <p className="text-xs text-text-secondary">Hover</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Microinteractions Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Microinteractions" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="space-y-8">
              {/* Toggle Switches */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Toggle Switches</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="space-y-2">
                    <Toggle size="sm" checked={isToggleOn} onChange={setIsToggleOn} />
                    <p className="text-xs text-text-secondary">Small</p>
                  </div>
                  <div className="space-y-2">
                    <Toggle size="md" checked={isToggleOn} onChange={setIsToggleOn} />
                    <p className="text-xs text-text-secondary">Medium</p>
                  </div>
                  <div className="space-y-2">
                    <Toggle size="lg" checked={isToggleOn} onChange={setIsToggleOn} />
                    <p className="text-xs text-text-secondary">Large</p>
                  </div>
                  <div className="space-y-2">
                    <Toggle size="md" checked={true} onChange={() => {}} disabled />
                    <p className="text-xs text-text-secondary">Disabled</p>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Checkboxes</h3>
                <div className="space-y-3">
                  <Checkbox
                    checked={isChecked}
                    onChange={setIsChecked}
                    label="Accept terms and conditions"
                  />
                  <Checkbox
                    checked={true}
                    onChange={() => {}}
                    label="Receive email notifications"
                  />
                  <Checkbox
                    checked={false}
                    onChange={() => {}}
                    label="Subscribe to newsletter"
                  />
                  <Checkbox
                    checked={true}
                    onChange={() => {}}
                    disabled
                    label="Disabled checkbox"
                  />
                </div>
              </div>

              {/* Radio Buttons */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Radio Buttons</h3>
                <div className="space-y-3">
                  <Radio
                    checked={selectedRadio === 'option1'}
                    onChange={() => setSelectedRadio('option1')}
                    label="Option 1"
                  />
                  <Radio
                    checked={selectedRadio === 'option2'}
                    onChange={() => setSelectedRadio('option2')}
                    label="Option 2"
                  />
                  <Radio
                    checked={selectedRadio === 'option3'}
                    onChange={() => setSelectedRadio('option3')}
                    label="Option 3"
                  />
                  <Radio
                    checked={false}
                    onChange={() => {}}
                    disabled
                    label="Disabled option"
                  />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Loading States Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Loading States" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="space-y-8">
              {/* Skeleton Screens */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text-primary">Skeleton Screens</h3>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      setIsLoading(!isLoading)
                    }}
                  >
                    {isLoading ? 'Hide' : 'Show'} Loading
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonMessage />
                    <SkeletonList count={3} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Card variant="outlined" padding="md">
                      <h4 className="text-sm font-semibold text-text-primary mb-2">Loaded Content</h4>
                      <p className="text-sm text-text-secondary">This is the actual content that appears after loading.</p>
                    </Card>
                  </div>
                )}
              </div>

              {/* Shimmer Effects */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">Shimmer Effects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ShimmerCard>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Loading Card</h4>
                    <p className="text-sm text-text-secondary">Shimmer effect overlay</p>
                  </ShimmerCard>
                  
                  <div>
                    <ShimmerButton>
                      Hover Me
                    </ShimmerButton>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Stagger Animations Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Stagger Animations" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-text-primary mb-4">List Items (Bottom to Top)</h3>
                <StaggerList direction="up" staggerDelay={0.1}>
                  {demoItems.map((item) => (
                    <Card key={item.id} variant="outlined" padding="md" className="mb-3">
                      <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
                      <p className="text-sm text-text-secondary">{item.description}</p>
                    </Card>
                  ))}
                </StaggerList>
              </div>

              <div>
                <h3 className="text-base font-semibold text-text-primary mb-4">Grid Items (Fade In)</h3>
                <StaggerList direction="up" staggerDelay={0.08} className="grid grid-cols-2 gap-4">
                  {demoItems.map((item) => (
                    <Card key={item.id} variant="elevated" padding="md" hoverable>
                      <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
                    </Card>
                  ))}
                </StaggerList>
              </div>
            </div>
          </Card>
        </section>

        {/* Page Transitions Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Page Transitions" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant={currentView === 'view1' ? 'primary' : 'secondary'}
                  onClick={() => setCurrentView('view1')}
                >
                  View 1
                </Button>
                <Button 
                  variant={currentView === 'view2' ? 'primary' : 'secondary'}
                  onClick={() => setCurrentView('view2')}
                >
                  View 2
                </Button>
              </div>

              <PageTransition pageKey={currentView} type="slideUp">
                {currentView === 'view1' ? (
                  <div className="p-6 bg-surface rounded-lg">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">View 1</h3>
                    <p className="text-text-secondary">This is the first view with smooth slide-up transition.</p>
                  </div>
                ) : (
                  <div className="p-6 bg-surface rounded-lg">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">View 2</h3>
                    <p className="text-text-secondary">This is the second view with smooth slide-up transition.</p>
                  </div>
                )}
              </PageTransition>
            </div>
          </Card>
        </section>

        {/* Scroll Reveal Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Scroll-Triggered Animations" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="space-y-8">
              <ScrollReveal direction="up">
                <Card variant="elevated" padding="md">
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Reveal from Bottom</h4>
                  <p className="text-sm text-text-secondary">This card animates when scrolled into view</p>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.1}>
                <Card variant="elevated" padding="md">
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Reveal from Right</h4>
                  <p className="text-sm text-text-secondary">This card slides in from the right</p>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.2}>
                <Card variant="elevated" padding="md">
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Reveal from Left</h4>
                  <p className="text-sm text-text-secondary">This card slides in from the left</p>
                </Card>
              </ScrollReveal>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-text-primary">Staggered Scroll Reveal</h3>
                <ScrollStagger staggerDelay={0.1}>
                  {demoItems.slice(0, 3).map((item) => (
                    <Card key={item.id} variant="outlined" padding="sm">
                      <p className="text-sm text-text-primary">{item.title}</p>
                    </Card>
                  ))}
                </ScrollStagger>
              </div>
            </div>
          </Card>
        </section>

        {/* Modal & Toast Section */}
        <section className="space-y-6">
          <AnimatedHeading level={2} text="Modal & Toasts" hoverFontSwitch={true} />
          
          <Card padding="lg">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Open Modal
                </Button>
                <Button variant="primary" onClick={() => success('Success! Operation completed.')}>
                  Success Toast
                </Button>
                <Button variant="danger" onClick={() => error('Error! Something went wrong.')}>
                  Error Toast
                </Button>
                <Button variant="secondary" onClick={() => warning('Warning! Please be careful.')}>
                  Warning Toast
                </Button>
                <Button variant="ghost" onClick={() => info('Info: Here is some information.')}>
                  Info Toast
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center text-text-tertiary text-sm py-8">
          <p>Agent Console V2 - Built with Next.js, Framer Motion, and Tailwind CSS</p>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              success('Modal action completed!')
              setIsModalOpen(false)
            }}>
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-text-primary">
            This is an example modal with liquid morphing animation.
          </p>
          <p className="text-text-secondary">
            It features focus trap, escape key support, and outside click to close.
          </p>
        </div>
      </Modal>
    </main>
  )
}
