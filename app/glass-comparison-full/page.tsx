'use client';

import { useState } from 'react';
import { Heart, Download, Settings } from 'lucide-react';
import { LiquidGlass } from '@/components/liquid-glass/LiquidGlass';
import { Glass } from '@/components/liquid-glass/Glass';
import { RefractionProvider } from '@/components/liquid-glass/RefractionProvider';
import { glassBuilder } from '@/lib/liquid-glass/builder';
import '@/lib/liquid-glass/tokens.css';
import '@/lib/liquid-glass/base.css';

/**
 * Complete Glass Effect Comparison
 * 
 * Three-way comparison:
 * 1. liquid-glass-react (SVG displacement)
 * 2. Our CSS Framework (backdrop-filter)
 * 3. liquid-glass-studio approach (WebGL2/WebGPU - described)
 */

export default function GlassComparisonFullPage() {
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
    <RefractionProvider backgroundImage="/lake-bg.png">
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/lake-bg.png)',
          }}
        />
        
        {/* Dark overlay for better contrast */}
        <div className="fixed inset-0 z-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-12 text-center">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Complete Glass Effect Comparison
            </h1>
            <p className="text-xl text-white/90 drop-shadow">
              Three Approaches to Liquid Glass UI
            </p>
          </header>

          {/* Preset Selector */}
          <div className="mb-12 flex justify-center gap-4">
            {(['subtle', 'medium', 'prominent', 'liquid'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  preset === p
                    ? 'bg-white/30 text-white backdrop-blur-md shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-sm'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Comparison Grid */}
          <div className="space-y-16">
            
            {/* 1. Card Comparison */}
            <section>
              <h2 className="text-4xl font-bold mb-8 text-white text-center drop-shadow-lg">
                Card Component
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* liquid-glass-react */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white text-center drop-shadow">
                    1️⃣ liquid-glass-react
                  </h3>
                  <div className="flex justify-center">
                    <LiquidGlass preset={preset} padding="2rem">
                      <div className="w-72">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          SVG Displacement
                        </h3>
                        <p className="text-white/90 text-sm mb-3">
                          Uses SVG filters for displacement mapping. 
                          Hover to see liquid effect.
                        </p>
                        <div className="space-y-1 text-xs text-white/70">
                          <div>✅ Real refraction</div>
                          <div>✅ Chromatic aberration</div>
                          <div>✅ Mouse-responsive</div>
                          <div>⚠️ Chrome/Edge only</div>
                        </div>
                      </div>
                    </LiquidGlass>
                  </div>
                </div>

                {/* Our CSS Framework */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white text-center drop-shadow">
                    2️⃣ CSS Framework
                  </h3>
                  <div className="flex justify-center">
                    <Glass config={ourConfig} className="p-8 w-72">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Backdrop Filter
                      </h3>
                      <p className="text-white/90 text-sm mb-3">
                        Simple CSS backdrop-filter blur. 
                        No displacement effects.
                      </p>
                      <div className="space-y-1 text-xs text-white/70">
                        <div>✅ All browsers</div>
                        <div>✅ Lightweight</div>
                        <div>✅ Predictable</div>
                        <div>❌ No refraction</div>
                      </div>
                    </Glass>
                  </div>
                </div>

                {/* liquid-glass-studio approach */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white text-center drop-shadow">
                    3️⃣ liquid-glass-studio
                  </h3>
                  <div className="flex justify-center">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-72 border border-white/20 shadow-2xl">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        WebGL2/WebGPU
                      </h3>
                      <p className="text-white/90 text-sm mb-3">
                        Full shader-based rendering with advanced effects.
                      </p>
                      <div className="space-y-1 text-xs text-white/70">
                        <div>✅ Fresnel reflection</div>
                        <div>✅ Dispersion</div>
                        <div>✅ Superellipse shapes</div>
                        <div>✅ Blob merging</div>
                        <div>✅ Glare effects</div>
                        <div>⚠️ Complex setup</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Button Comparison */}
            <section>
              <h2 className="text-4xl font-bold mb-8 text-white text-center drop-shadow-lg">
                Button Component
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* liquid-glass-react */}
                <div>
                  <div className="flex justify-center">
                    <LiquidGlass 
                      preset={preset}
                      padding="12px 24px"
                      cornerRadius={100}
                    >
                      <div className="flex items-center gap-2 text-white font-medium">
                        <Download className="h-5 w-5" />
                        Download
                      </div>
                    </LiquidGlass>
                  </div>
                </div>

                {/* Our CSS Framework */}
                <div>
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

                {/* liquid-glass-studio approach */}
                <div>
                  <div className="flex justify-center">
                    <div className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <Download className="h-5 w-5" />
                        Download
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Icon Buttons */}
            <section>
              <h2 className="text-4xl font-bold mb-8 text-white text-center drop-shadow-lg">
                Icon Buttons
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* liquid-glass-react */}
                <div>
                  <div className="flex justify-center gap-4">
                    <LiquidGlass preset={preset} padding="12px" cornerRadius={100}>
                      <Heart className="h-6 w-6 text-white" />
                    </LiquidGlass>
                    <LiquidGlass preset={preset} padding="12px" cornerRadius={100}>
                      <Settings className="h-6 w-6 text-white" />
                    </LiquidGlass>
                    <LiquidGlass preset={preset} padding="12px" cornerRadius={100}>
                      <Download className="h-6 w-6 text-white" />
                    </LiquidGlass>
                  </div>
                </div>

                {/* Our CSS Framework */}
                <div>
                  <div className="flex justify-center gap-4">
                    <Glass config={ourConfig} className="p-3 rounded-full cursor-pointer">
                      <Heart className="h-6 w-6 text-white" />
                    </Glass>
                    <Glass config={ourConfig} className="p-3 rounded-full cursor-pointer">
                      <Settings className="h-6 w-6 text-white" />
                    </Glass>
                    <Glass config={ourConfig} className="p-3 rounded-full cursor-pointer">
                      <Download className="h-6 w-6 text-white" />
                    </Glass>
                  </div>
                </div>

                {/* liquid-glass-studio approach */}
                <div>
                  <div className="flex justify-center gap-4">
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Detailed Comparison Table */}
            <section className="mt-16">
              <h2 className="text-4xl font-bold mb-8 text-white text-center drop-shadow-lg">
                Feature Comparison
              </h2>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-4 px-4">Feature</th>
                        <th className="text-center py-4 px-4">liquid-glass-react</th>
                        <th className="text-center py-4 px-4">CSS Framework</th>
                        <th className="text-center py-4 px-4">liquid-glass-studio</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">Refraction</td>
                        <td className="text-center">✅ SVG displacement</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">✅ WebGL shader</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">Chromatic Aberration</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">✅ Advanced</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">Fresnel Reflection</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">✅</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">Dispersion</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">✅</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">Glare Effects</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">✅</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">Browser Support</td>
                        <td className="text-center">⚠️ Chrome/Edge</td>
                        <td className="text-center">✅ All modern</td>
                        <td className="text-center">⚠️ WebGL2/WebGPU</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">Performance</td>
                        <td className="text-center">⚠️ Medium</td>
                        <td className="text-center">✅ Excellent</td>
                        <td className="text-center">⚠️ GPU-intensive</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">Setup Complexity</td>
                        <td className="text-center">✅ Simple npm install</td>
                        <td className="text-center">✅ Built-in</td>
                        <td className="text-center">❌ Complex integration</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">Customization</td>
                        <td className="text-center">✅ Good</td>
                        <td className="text-center">✅ Excellent</td>
                        <td className="text-center">✅ Extensive</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Production Ready</td>
                        <td className="text-center">✅ Yes</td>
                        <td className="text-center">✅ Yes</td>
                        <td className="text-center">⚠️ Demo/Studio</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Recommendations */}
            <section className="mt-16">
              <h2 className="text-4xl font-bold mb-8 text-white text-center drop-shadow-lg">
                Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/30">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    🥇 liquid-glass-react
                  </h3>
                  <p className="text-white/90 mb-4">
                    Best balance of visual quality and ease of use.
                  </p>
                  <div className="text-sm text-white/80 space-y-2">
                    <div><strong>Use for:</strong></div>
                    <div>• Hero sections</div>
                    <div>• Feature cards</div>
                    <div>• Interactive elements</div>
                    <div>• Chrome/Edge users</div>
                  </div>
                </div>

                <div className="bg-green-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-400/30">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    🥈 CSS Framework
                  </h3>
                  <p className="text-white/90 mb-4">
                    Best for universal compatibility and performance.
                  </p>
                  <div className="text-sm text-white/80 space-y-2">
                    <div><strong>Use for:</strong></div>
                    <div>• All UI components</div>
                    <div>• Mobile devices</div>
                    <div>• Safari/Firefox users</div>
                    <div>• Production apps</div>
                  </div>
                </div>

                <div className="bg-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    🥉 liquid-glass-studio
                  </h3>
                  <p className="text-white/90 mb-4">
                    Most advanced but complex to integrate.
                  </p>
                  <div className="text-sm text-white/80 space-y-2">
                    <div><strong>Use for:</strong></div>
                    <div>• Showcase pages</div>
                    <div>• Marketing sites</div>
                    <div>• High-end demos</div>
                    <div>• When quality &gt; compatibility</div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </RefractionProvider>
  );
}
