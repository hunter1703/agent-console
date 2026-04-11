'use client';

import { useState } from 'react';
import { Heart, Download, Settings, Plus } from 'lucide-react';
import { LiquidGlass } from '@/components/liquid-glass/LiquidGlass';
import { Glass } from '@/components/liquid-glass/Glass';
import { glassBuilder } from '@/lib/liquid-glass/builder';
import '@/lib/liquid-glass/tokens.css';
import '@/lib/liquid-glass/base.css';

/**
 * Glass Effect Comparison
 * 
 * Side-by-side comparison of liquid-glass-react vs our CSS framework
 */

export default function GlassComparisonPage() {
  const [preset, setPreset] = useState<'subtle' | 'medium' | 'prominent' | 'liquid'>('medium');
  
  // Our framework config
  const ourConfig = glassBuilder()
    .preset('frosted', 'medium')
    .fill('rgba(255, 255, 255, 0.1)')
    .radius(16)
    .shadow('hard')
    .withBorder({
      highlight: {
        topLeft: 'rgba(255, 255, 255, 0.2)',
        bottomRight: 'rgba(255, 255, 255, 0.1)',
      },
    })
    .build();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Foggy Lake Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/lake-foggy-bg.png)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Glass Effect Comparison
          </h1>
          <p className="text-xl text-white/70">
            liquid-glass-react vs Our CSS Framework
          </p>
        </header>

        {/* Preset Selector */}
        <div className="mb-8 flex justify-center gap-4">
          {(['subtle', 'medium', 'prominent', 'liquid'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`px-6 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                preset === p
                  ? 'bg-white/20 text-white backdrop-blur-md'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Comparison Grid */}
        <div className="space-y-16">
          
          {/* 1. Simple Card */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-white text-center">
              Simple Card
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* liquid-glass-react */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center">
                  liquid-glass-react ✨
                </h3>
                <div className="flex justify-center">
                  <LiquidGlass preset={preset} padding="2rem">
                    <div className="w-80">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Liquid Glass Card
                      </h3>
                      <p className="text-white/80">
                        Notice the refraction and displacement at the edges. 
                        Move your mouse over to see the liquid effect.
                      </p>
                    </div>
                  </LiquidGlass>
                </div>
              </div>

              {/* Our Framework */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center">
                  Our CSS Framework
                </h3>
                <div className="flex justify-center">
                  <Glass config={ourConfig} className="p-8 w-80">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      CSS Glass Card
                    </h3>
                    <p className="text-white/80">
                      Simple backdrop-filter blur. No refraction or displacement.
                      Works in all browsers.
                    </p>
                  </Glass>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Button */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-white text-center">
              Button
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* liquid-glass-react */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center">
                  liquid-glass-react ✨
                </h3>
                <div className="flex justify-center">
                  <LiquidGlass 
                    preset={preset}
                    padding="12px 24px"
                    cornerRadius={100}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Download className="h-5 w-5" />
                      Download
                    </div>
                  </LiquidGlass>
                </div>
              </div>

              {/* Our Framework */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center">
                  Our CSS Framework
                </h3>
                <div className="flex justify-center">
                  <Glass 
                    config={ourConfig}
                    className="px-6 py-3 rounded-full cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Download className="h-5 w-5" />
                      Download
                    </div>
                  </Glass>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Icon Button */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-white text-center">
              Icon Button
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* liquid-glass-react */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center">
                  liquid-glass-react ✨
                </h3>
                <div className="flex justify-center gap-4">
                  <LiquidGlass 
                    preset={preset}
                    padding="12px"
                    cornerRadius={100}
                    className="cursor-pointer"
                  >
                    <Heart className="h-6 w-6 text-white" />
                  </LiquidGlass>
                  
                  <LiquidGlass 
                    preset={preset}
                    padding="12px"
                    cornerRadius={100}
                    className="cursor-pointer"
                  >
                    <Settings className="h-6 w-6 text-white" />
                  </LiquidGlass>
                  
                  <LiquidGlass 
                    preset={preset}
                    padding="12px"
                    cornerRadius={100}
                    className="cursor-pointer"
                  >
                    <Plus className="h-6 w-6 text-white" />
                  </LiquidGlass>
                </div>
              </div>

              {/* Our Framework */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center">
                  Our CSS Framework
                </h3>
                <div className="flex justify-center gap-4">
                  <Glass 
                    config={ourConfig}
                    className="p-3 rounded-full cursor-pointer"
                  >
                    <Heart className="h-6 w-6 text-white" />
                  </Glass>
                  
                  <Glass 
                    config={ourConfig}
                    className="p-3 rounded-full cursor-pointer"
                  >
                    <Settings className="h-6 w-6 text-white" />
                  </Glass>
                  
                  <Glass 
                    config={ourConfig}
                    className="p-3 rounded-full cursor-pointer"
                  >
                    <Plus className="h-6 w-6 text-white" />
                  </Glass>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Large Card with Content */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-white text-center">
              Content Card
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* liquid-glass-react */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center">
                  liquid-glass-react ✨
                </h3>
                <div className="flex justify-center">
                  <LiquidGlass preset={preset} padding="2rem">
                    <div className="w-80">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                        <div>
                          <h4 className="text-lg font-semibold text-white">Agent Name</h4>
                          <p className="text-sm text-white/60">Active now</p>
                        </div>
                      </div>
                      <p className="text-white/80 mb-4">
                        This is a more complex card with multiple elements. 
                        Notice how the glass effect creates depth and separation.
                      </p>
                      <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                          Tag 1
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                          Tag 2
                        </div>
                      </div>
                    </div>
                  </LiquidGlass>
                </div>
              </div>

              {/* Our Framework */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center">
                  Our CSS Framework
                </h3>
                <div className="flex justify-center">
                  <Glass config={ourConfig} className="p-8 w-80">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <div>
                        <h4 className="text-lg font-semibold text-white">Agent Name</h4>
                        <p className="text-sm text-white/60">Active now</p>
                      </div>
                    </div>
                    <p className="text-white/80 mb-4">
                      This is a more complex card with multiple elements. 
                      Simple blur without refraction effects.
                    </p>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                        Tag 1
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                        Tag 2
                      </div>
                    </div>
                  </Glass>
                </div>
              </div>
            </div>
          </section>

          {/* Key Differences */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">
              Key Differences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  ✨ liquid-glass-react
                </h3>
                <ul className="space-y-2 text-white/80">
                  <li>✅ Real refraction and displacement</li>
                  <li>✅ Chromatic aberration</li>
                  <li>✅ Liquid elastic feel</li>
                  <li>✅ Edge bending effect</li>
                  <li>✅ Mouse-responsive distortion</li>
                  <li>⚠️ Chrome/Edge only (full effect)</li>
                  <li>⚠️ Heavier performance</li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  🎨 Our CSS Framework
                </h3>
                <ul className="space-y-2 text-white/80">
                  <li>✅ Works in all browsers</li>
                  <li>✅ Lightweight performance</li>
                  <li>✅ Simple backdrop-filter blur</li>
                  <li>✅ Predictable behavior</li>
                  <li>✅ Easy to customize</li>
                  <li>❌ No refraction effects</li>
                  <li>❌ No displacement</li>
                </ul>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-30px, 30px) scale(0.9);
          }
          75% {
            transform: translate(30px, 30px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
