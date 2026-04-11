'use client';

import { useState } from 'react';
import { Plus, Heart, Share2, Settings, Trash2, Download, Upload, Edit, Save, X } from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { FAB } from '@/components/ui/FAB';
import { Toggle, SegmentedButton } from '@/components/ui/Toggle';
import { ThemeProvider, useTheme } from '@/components/liquid-glass/ThemeProvider';
import { RefractionProvider } from '@/components/liquid-glass/RefractionProvider';
import '@/lib/liquid-glass/tokens.css';
import '@/lib/liquid-glass/base.css';
import '@/lib/liquid-glass/backgrounds.css';

/**
 * Liquid Glass Component Showcase
 * 
 * Demonstrates all built components with variants on a vibrant animated background
 */

function ShowcaseContent() {
  const { theme, toggleTheme } = useTheme();
  const [refractionEnabled, setRefractionEnabled] = useState(true);
  const [view, setView] = useState<'components' | 'framework'>('components');
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [segmentedValue, setSegmentedValue] = useState('agents');
  const [multiSelect, setMultiSelect] = useState(['option1']);
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with 3 Blobs */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        
        {/* Blob 1 - Electric Blue */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 animate-blob"
          style={{
            background: 'radial-gradient(circle, hsl(210, 100%, 60%) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            mixBlendMode: 'color-dodge',
            animation: 'blob 12s infinite',
          }}
        />
        
        {/* Blob 2 - Coral Orange */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 animate-blob"
          style={{
            background: 'radial-gradient(circle, hsl(16, 100%, 66%) 0%, transparent 70%)',
            top: '50%',
            right: '10%',
            mixBlendMode: 'color-dodge',
            animation: 'blob 15s infinite 2s',
          }}
        />
        
        {/* Blob 3 - Violet Purple */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 animate-blob"
          style={{
            background: 'radial-gradient(circle, hsl(270, 100%, 70%) 0%, transparent 70%)',
            bottom: '10%',
            left: '50%',
            mixBlendMode: 'color-dodge',
            animation: 'blob 18s infinite 4s',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Liquid Glass Components
          </h1>
          <p className="text-xl text-white/70">
            Phase 1: Action Components Showcase
          </p>
        </header>

        {/* Top Controls */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center items-center">
          <Button variant="secondary" onClick={toggleTheme}>
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </Button>
          
          <Button 
            variant={refractionEnabled ? 'primary' : 'secondary'}
            onClick={() => setRefractionEnabled(!refractionEnabled)}
          >
            Refraction: {refractionEnabled ? '✨ ON' : '❌ OFF'}
          </Button>

          <SegmentedButton
            options={[
              { value: 'components', label: 'Components' },
              { value: 'framework', label: 'Framework' },
            ]}
            value={view}
            onChange={(v) => setView(v as 'components' | 'framework')}
          />
        </div>

        {view === 'components' ? (
          <div className="space-y-12">
            {/* Button Variants */}
            <section className="glass glass-medium glass-radius-xl glass-shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Button</h2>
              
              <div className="space-y-8">
                {/* Variants */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Sizes</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="md">Medium</Button>
                    <Button variant="primary" size="lg">Large</Button>
                  </div>
                </div>

                {/* With Icons */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">With Icons</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary" iconLeft={<Download className="h-4 w-4" />}>
                      Download
                    </Button>
                    <Button variant="secondary" iconRight={<Upload className="h-4 w-4" />}>
                      Upload
                    </Button>
                    <Button variant="primary" iconLeft={<Save className="h-4 w-4" />} iconRight={<X className="h-4 w-4" />}>
                      Both Sides
                    </Button>
                  </div>
                </div>

                {/* Loading State */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Loading State</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary" loading={loading} onClick={simulateLoading}>
                      {loading ? 'Processing...' : 'Click to Load'}
                    </Button>
                    <Button variant="secondary" loading>
                      Loading...
                    </Button>
                  </div>
                </div>

                {/* Full Width */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Full Width</h3>
                  <Button variant="primary" fullWidth>
                    Full Width Button
                  </Button>
                </div>

                {/* Disabled */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Disabled</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary" disabled>Disabled Primary</Button>
                    <Button variant="secondary" disabled>Disabled Secondary</Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Icon Button */}
            <section className="glass glass-medium glass-radius-xl glass-shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Icon Button</h2>
              
              <div className="space-y-8">
                {/* Variants */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    <IconButton variant="primary" icon={<Heart className="h-5 w-5" />} aria-label="Like" />
                    <IconButton variant="secondary" icon={<Share2 className="h-5 w-5" />} aria-label="Share" />
                    <IconButton variant="ghost" icon={<Settings className="h-5 w-5" />} aria-label="Settings" />
                    <IconButton variant="danger" icon={<Trash2 className="h-5 w-5" />} aria-label="Delete" />
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Sizes</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <IconButton variant="primary" size="sm" icon={<Heart className="h-4 w-4" />} aria-label="Like" />
                    <IconButton variant="primary" size="md" icon={<Heart className="h-5 w-5" />} aria-label="Like" />
                    <IconButton variant="primary" size="lg" icon={<Heart className="h-6 w-6" />} aria-label="Like" />
                  </div>
                </div>

                {/* Loading */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Loading</h3>
                  <IconButton variant="primary" loading icon={<Heart className="h-5 w-5" />} aria-label="Like" />
                </div>
              </div>
            </section>

            {/* FAB */}
            <section className="glass glass-medium glass-radius-xl glass-shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Floating Action Button (FAB)</h2>
              
              <div className="space-y-8">
                {/* Note */}
                <div className="glass glass-light glass-radius-lg p-4">
                  <p className="text-white/80">
                    FABs are positioned fixed on the screen. Scroll down to see them in action at the bottom-right corner.
                  </p>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Sizes (Relative Demo)</h3>
                  <div className="flex flex-wrap items-end gap-6">
                    <div className="relative h-24 w-24 glass glass-light glass-radius-lg flex items-center justify-center">
                      <div className="absolute bottom-2 right-2">
                        <button className="h-12 w-12 rounded-full bg-blue-500/30 backdrop-blur-md flex items-center justify-center">
                          <Plus className="h-5 w-5 text-white" />
                        </button>
                      </div>
                      <span className="text-xs text-white/60">Small</span>
                    </div>
                    
                    <div className="relative h-32 w-32 glass glass-light glass-radius-lg flex items-center justify-center">
                      <div className="absolute bottom-2 right-2">
                        <button className="h-14 w-14 rounded-full bg-blue-500/30 backdrop-blur-md flex items-center justify-center">
                          <Plus className="h-6 w-6 text-white" />
                        </button>
                      </div>
                      <span className="text-xs text-white/60">Default</span>
                    </div>
                    
                    <div className="relative h-40 w-40 glass glass-light glass-radius-lg flex items-center justify-center">
                      <div className="absolute bottom-2 right-2">
                        <button className="h-16 w-16 rounded-full bg-blue-500/30 backdrop-blur-md flex items-center justify-center">
                          <Plus className="h-7 w-7 text-white" />
                        </button>
                      </div>
                      <span className="text-xs text-white/60">Large</span>
                    </div>
                  </div>
                </div>

                {/* Extended */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Extended Variant</h3>
                  <div className="relative h-32 w-full glass glass-light glass-radius-lg flex items-center justify-center">
                    <div className="absolute bottom-4 right-4">
                      <button className="h-14 px-6 rounded-full bg-blue-500/30 backdrop-blur-md flex items-center justify-center gap-3">
                        <Plus className="h-6 w-6 text-white" />
                        <span className="text-sm font-semibold text-white">Create New</span>
                      </button>
                    </div>
                    <span className="text-xs text-white/60">Extended FAB with Label</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Toggle */}
            <section className="glass glass-medium glass-radius-xl glass-shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Toggle</h2>
              
              <div className="space-y-8">
                {/* Variants */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Variants</h3>
                  <div className="flex flex-wrap gap-8 items-center">
                    <div className="flex flex-col gap-2">
                      <Toggle 
                        variant="default"
                        checked={toggle1}
                        onCheckedChange={setToggle1}
                      />
                      <span className="text-sm text-white/70">Default</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Toggle 
                        variant="liquid"
                        checked={toggle2}
                        onCheckedChange={setToggle2}
                      />
                      <span className="text-sm text-white/70">Liquid</span>
                    </div>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Sizes</h3>
                  <div className="flex flex-wrap gap-8 items-center">
                    <div className="flex flex-col gap-2">
                      <Toggle size="sm" checked={true} onCheckedChange={() => {}} />
                      <span className="text-sm text-white/70">Small</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Toggle size="md" checked={true} onCheckedChange={() => {}} />
                      <span className="text-sm text-white/70">Medium</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Toggle size="lg" checked={true} onCheckedChange={() => {}} />
                      <span className="text-sm text-white/70">Large</span>
                    </div>
                  </div>
                </div>

                {/* States */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">States</h3>
                  <div className="flex flex-wrap gap-8 items-center">
                    <div className="flex flex-col gap-2">
                      <Toggle checked={false} onCheckedChange={() => {}} />
                      <span className="text-sm text-white/70">Off</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Toggle checked={true} onCheckedChange={() => {}} />
                      <span className="text-sm text-white/70">On</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Toggle checked={false} disabled onCheckedChange={() => {}} />
                      <span className="text-sm text-white/70">Disabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Segmented Button */}
            <section className="glass glass-medium glass-radius-xl glass-shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Segmented Button</h2>
              
              <div className="space-y-8">
                {/* Single Select */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Single Select</h3>
                  <SegmentedButton
                    options={[
                      { value: 'agents', label: 'My Agents' },
                      { value: 'chats', label: 'Recent Chats' },
                      { value: 'settings', label: 'Settings' },
                    ]}
                    value={segmentedValue}
                    onChange={(v) => setSegmentedValue(v as string)}
                  />
                </div>

                {/* Multi Select */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Multi Select</h3>
                  <SegmentedButton
                    multiple
                    options={[
                      { value: 'option1', label: 'Option 1' },
                      { value: 'option2', label: 'Option 2' },
                      { value: 'option3', label: 'Option 3' },
                    ]}
                    value={multiSelect}
                    onChange={(v) => setMultiSelect(v as string[])}
                  />
                </div>

                {/* With Icons */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">With Icons</h3>
                  <SegmentedButton
                    options={[
                      { value: 'edit', label: 'Edit', icon: <Edit className="h-4 w-4" /> },
                      { value: 'save', label: 'Save', icon: <Save className="h-4 w-4" /> },
                      { value: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" /> },
                    ]}
                    value="edit"
                    onChange={() => {}}
                  />
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Sizes</h3>
                  <div className="space-y-4">
                    <SegmentedButton
                      size="sm"
                      options={[
                        { value: 'a', label: 'Small' },
                        { value: 'b', label: 'Size' },
                      ]}
                      value="a"
                      onChange={() => {}}
                    />
                    
                    <SegmentedButton
                      size="md"
                      options={[
                        { value: 'a', label: 'Medium' },
                        { value: 'b', label: 'Size' },
                      ]}
                      value="a"
                      onChange={() => {}}
                    />
                    
                    <SegmentedButton
                      size="lg"
                      options={[
                        { value: 'a', label: 'Large' },
                        { value: 'b', label: 'Size' },
                      ]}
                      value="a"
                      onChange={() => {}}
                    />
                  </div>
                </div>

                {/* Full Width */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white/90">Full Width</h3>
                  <SegmentedButton
                    fullWidth
                    options={[
                      { value: 'left', label: 'Left' },
                      { value: 'center', label: 'Center' },
                      { value: 'right', label: 'Right' },
                    ]}
                    value="center"
                    onChange={() => {}}
                  />
                </div>
              </div>
            </section>

            {/* Component Summary */}
            <section className="glass glass-heavy glass-radius-xl glass-shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Phase 1 Progress</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass glass-light glass-radius-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white">✅ Completed (5)</h3>
                  <ul className="space-y-2 text-white/80">
                    <li>• Button (4 variants, 3 sizes)</li>
                    <li>• IconButton (icon-only variant)</li>
                    <li>• FAB (default + extended)</li>
                    <li>• Toggle (default + liquid)</li>
                    <li>• SegmentedButton (single/multi)</li>
                  </ul>
                </div>
                
                <div className="glass glass-light glass-radius-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white">🚧 Remaining (39)</h3>
                  <ul className="space-y-2 text-white/80">
                    <li>• Communication (5)</li>
                    <li>• Containment (10)</li>
                    <li>• Navigation (10)</li>
                    <li>• Selection (3)</li>
                    <li>• Text Input (2)</li>
                    <li>• Layout (5)</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Framework Info */}
            <section className="glass glass-medium glass-radius-xl glass-shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Framework Features</h2>
              
              <div className="space-y-6">
                <div className="glass glass-light glass-radius-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">6-Layer Composition</h3>
                  <p className="text-white/80 mb-4">
                    Every glass element is composed of 6 distinct layers for maximum visual depth and realism.
                  </p>
                  <ul className="space-y-2 text-white/70">
                    <li>1. Background - Base layer with optional image/gradient</li>
                    <li>2. Glass Surface - Blur and transparency</li>
                    <li>3. Border - Directional highlights and accents</li>
                    <li>4. Content - Text, icons, and interactive elements</li>
                    <li>5. Depth - Shadows and elevation</li>
                    <li>6. Motion - Animations and transitions</li>
                  </ul>
                </div>

                <div className="glass glass-light glass-radius-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">Fluent Builder API</h3>
                  <p className="text-white/80 mb-4">
                    Create custom glass configurations with method chaining.
                  </p>
                  <pre className="bg-black/30 rounded-lg p-4 text-sm text-white/90 overflow-x-auto">
{`glassBuilder()
  .preset('frosted', 'medium')
  .fill('rgba(255, 255, 255, 0.1)')
  .radius(16)
  .shadow('hard')
  .withHover('scale', 'medium')
  .build()`}
                  </pre>
                </div>

                <div className="glass glass-light glass-radius-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">Declarative Components</h3>
                  <p className="text-white/80 mb-4">
                    Use the Glass component with preset configurations.
                  </p>
                  <pre className="bg-black/30 rounded-lg p-4 text-sm text-white/90 overflow-x-auto">
{`<Glass
  preset="frosted"
  variant="medium"
  className="p-6"
>
  Content here
</Glass>`}
                  </pre>
                </div>

                <div className="glass glass-light glass-radius-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">Theme System</h3>
                  <p className="text-white/80 mb-4">
                    HSL-based color system with dark/light modes and localStorage persistence.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-sm text-white/60 mb-1">Primary</div>
                      <div className="h-8 rounded" style={{ background: 'hsl(var(--color-primary-hue), var(--color-primary-saturation), var(--color-primary-lightness))' }} />
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-sm text-white/60 mb-1">Secondary</div>
                      <div className="h-8 rounded" style={{ background: 'hsl(var(--color-secondary-hue), var(--color-secondary-saturation), var(--color-secondary-lightness))' }} />
                    </div>
                  </div>
                </div>

                <div className="glass glass-light glass-radius-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">WebGL Refraction</h3>
                  <p className="text-white/80">
                    Optional WebGL shaders for physically accurate glass with lens distortion, 
                    chromatic aberration, and light flares. Toggle refraction above to see the difference.
                  </p>
                </div>
              </div>
            </section>

            {/* Documentation Links */}
            <section className="glass glass-medium glass-radius-xl glass-shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Documentation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass glass-light glass-radius-lg p-4">
                  <h3 className="font-semibold text-white mb-2">FRAMEWORK_GUIDE.md</h3>
                  <p className="text-sm text-white/70">Complete framework documentation</p>
                </div>
                
                <div className="glass glass-light glass-radius-lg p-4">
                  <h3 className="font-semibold text-white mb-2">liquid-glass/README.md</h3>
                  <p className="text-sm text-white/70">Liquid glass design principles</p>
                </div>
                
                <div className="glass glass-light glass-radius-lg p-4">
                  <h3 className="font-semibold text-white mb-2">liquid-glass/06-components.md</h3>
                  <p className="text-sm text-white/70">Component patterns and techniques</p>
                </div>
                
                <div className="glass glass-light glass-radius-lg p-4">
                  <h3 className="font-semibold text-white mb-2">COMPONENT_BUILD_STATUS.md</h3>
                  <p className="text-sm text-white/70">Track component progress</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Actual FAB (fixed position) */}
      <FAB
        icon={<Plus className="h-6 w-6" />}
        aria-label="Add new item"
        position="bottom-right"
      />

      {/* Keyframes for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}

export default function LiquidGlassFoundationPage() {
  return (
    <ThemeProvider>
      <RefractionProvider>
        <ShowcaseContent />
      </RefractionProvider>
    </ThemeProvider>
  );
}
