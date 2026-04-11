'use client';

import { useState } from 'react';
import { GlassButton } from '@/components/liquid-glass-studio/GlassButton';

export default function GlassButtonDemo() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Glass Button Demo</h1>
        <p className="text-gray-300 mb-12">
          Production-ready glassmorphic buttons using liquid-glass-studio WebGL effects
        </p>

        {/* Click counter */}
        <div className="mb-12 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <p className="text-white text-lg">
            Button clicks: <span className="font-bold text-blue-400">{clickCount}</span>
          </p>
        </div>

        {/* Variants Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6">Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-white font-medium">Default</h3>
              <GlassButton
                variant="default"
                onClick={() => setClickCount(c => c + 1)}
              >
                Click Me
              </GlassButton>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-white font-medium">Primary</h3>
              <GlassButton
                variant="primary"
                onClick={() => setClickCount(c => c + 1)}
              >
                Primary
              </GlassButton>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-white font-medium">Secondary</h3>
              <GlassButton
                variant="secondary"
                onClick={() => setClickCount(c => c + 1)}
              >
                Secondary
              </GlassButton>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-white font-medium">Ghost</h3>
              <GlassButton
                variant="ghost"
                onClick={() => setClickCount(c => c + 1)}
              >
                Ghost
              </GlassButton>
            </div>
          </div>
        </section>

        {/* Sizes Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6">Sizes</h2>
          <div className="flex flex-wrap items-center gap-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => setClickCount(c => c + 1)}
            >
              Small
            </GlassButton>

            <GlassButton
              size="md"
              variant="primary"
              onClick={() => setClickCount(c => c + 1)}
            >
              Medium
            </GlassButton>

            <GlassButton
              size="lg"
              variant="primary"
              onClick={() => setClickCount(c => c + 1)}
            >
              Large
            </GlassButton>
          </div>
        </section>

        {/* Glass Intensity Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6">Glass Intensity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-white font-medium">Subtle</h3>
              <GlassButton
                glassIntensity="subtle"
                variant="primary"
                onClick={() => setClickCount(c => c + 1)}
              >
                Subtle Glass
              </GlassButton>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-white font-medium">Medium</h3>
              <GlassButton
                glassIntensity="medium"
                variant="primary"
                onClick={() => setClickCount(c => c + 1)}
              >
                Medium Glass
              </GlassButton>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-white font-medium">Strong</h3>
              <GlassButton
                glassIntensity="strong"
                variant="primary"
                onClick={() => setClickCount(c => c + 1)}
              >
                Strong Glass
              </GlassButton>
            </div>
          </div>
        </section>

        {/* States Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6">States</h2>
          <div className="flex flex-wrap items-center gap-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <GlassButton
              variant="primary"
              onClick={() => setClickCount(c => c + 1)}
            >
              Normal
            </GlassButton>

            <GlassButton
              variant="primary"
              disabled
            >
              Disabled
            </GlassButton>
          </div>
        </section>

        {/* Interactive Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6">Interactive Grid</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            {Array.from({ length: 12 }).map((_, i) => (
              <GlassButton
                key={i}
                variant={['default', 'primary', 'secondary', 'ghost'][i % 4] as any}
                size={['sm', 'md', 'lg'][i % 3] as any}
                onClick={() => setClickCount(c => c + 1)}
              >
                Button {i + 1}
              </GlassButton>
            ))}
          </div>
        </section>

        {/* Technical Info */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Technical Details</h2>
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <ul className="text-gray-300 space-y-2">
              <li>✓ WebGL2-powered glassmorphic effects</li>
              <li>✓ Real-time refraction, dispersion, and Fresnel reflections</li>
              <li>✓ Dynamic glare and shadow effects</li>
              <li>✓ Hover and press state animations</li>
              <li>✓ Fully accessible with keyboard support</li>
              <li>✓ Multiple variants, sizes, and intensity levels</li>
              <li>✓ Production-ready from liquid-glass-studio</li>
            </ul>
          </div>
        </section>

        {/* Usage Example */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Usage Example</h2>
          <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{`import { GlassButton } from '@/components/liquid-glass-studio/GlassButton';

<GlassButton
  variant="primary"
  size="md"
  glassIntensity="medium"
  onClick={() => console.log('Clicked!')}
>
  Click Me
</GlassButton>`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
