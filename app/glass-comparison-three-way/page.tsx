'use client';

import { useState } from 'react';
import { Heart, Download, Settings, Plus, Code, Zap, Palette } from 'lucide-react';
import { LiquidGlass } from '@/components/liquid-glass/LiquidGlass';
import { Glass } from '@/components/liquid-glass/Glass';
import { StudioGlass } from '@/components/liquid-glass-studio/StudioGlass';
import { glassBuilder } from '@/lib/liquid-glass/builder';
import '@/lib/liquid-glass/tokens.css';
import '@/lib/liquid-glass/base.css';

/**
 * Three-Way Glass Effect Comparison
 * 
 * Comprehensive comparison of three approaches:
 * 1. liquid-glass-react (npm package)
 * 2. liquid-glass-studio (WebGL2/WebGPU custom implementation)
 * 3. Our CSS Framework (backdrop-filter based)
 */

export default function ThreeWayComparisonPage() {
  const [preset, setPreset] = useState<'subtle' | 'medium' | 'prominent' | 'liquid'>('medium');
  const backgroundImageUrl = '/lake-foggy-bg.png';
  
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
      <div className="relative z-10 p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
            Three-Way Glass Effect Comparison
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            liquid-glass-react • liquid-glass-studio • Our CSS Framework
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
            <h2 className="text-3xl font-bold mb-8 text-white text-center drop-shadow">
              Simple Card
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* liquid-glass-react */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center drop-shadow">
                  liquid-glass-react ✨
                </h3>
                <div className="flex justify-center">
                  <LiquidGlass preset={preset} padding="2rem">
                    <div className="w-72">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Liquid Glass
                      </h3>
                      <p className="text-white/80 text-sm">
                        Real refraction and displacement. Mouse-responsive liquid effect.
                      </p>
                    </div>
                  </LiquidGlass>
                </div>
              </div>

              {/* liquid-glass-studio approach */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center drop-shadow">
                  liquid-glass-studio 🔮
                </h3>
                <div className="flex justify-center">
                  <StudioGlass
                    width={288}
                    height={200}
                    shapeWidth={200}
                    shapeHeight={200}
                    cornerRadius={80}
                    shapeRoundness={5}
                    refThickness={20}
                    refFactor={1.4}
                    refDispersion={7}
                    refFresnelRange={30}
                    refFresnelHardness={20}
                    refFresnelFactor={20}
                    glareRange={30}
                    glareHardness={20}
                    glareFactor={90}
                    glareConvergence={50}
                    glareOppositeFactor={80}
                    glareAngle={-45}
                    blurRadius={1}
                    blurEdge={true}
                    shadowExpand={25}
                    shadowFactor={15}
                    shadowPosition={{ x: 0, y: -10 }}
                    draggable={true}
                  >
                    <div className="p-8 flex flex-col justify-center h-full">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        WebGL2/WebGPU
                      </h3>
                      <p className="text-white/80 text-sm">
                        Custom shaders with Fresnel, dispersion, glare, and SDF shapes.
                      </p>
                    </div>
                  </StudioGlass>
                </div>
              </div>

              {/* Our Framework */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center drop-shadow">
                  Our CSS Framework 🎨
                </h3>
                <div className="flex justify-center">
                  <Glass config={ourConfig} className="p-8 w-72">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      CSS Glass
                    </h3>
                    <p className="text-white/80 text-sm">
                      Simple backdrop-filter blur. Universal compatibility.
                    </p>
                  </Glass>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Button */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-white text-center drop-shadow">
              Button
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* liquid-glass-react */}
              <div>
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

              {/* liquid-glass-studio approach */}
              <div>
                <div className="flex justify-center">
                  <StudioGlass
                    width={140}
                    height={48}
                    shapeWidth={140}
                    shapeHeight={48}
                    cornerRadius={100}
                    refThickness={15}
                    refFactor={1.3}
                    refDispersion={5}
                    className="cursor-pointer"
                    draggable={true}
                  >
                    <div className="flex items-center justify-center gap-2 text-white font-medium h-full">
                      <Download className="h-5 w-5" />
                      Download
                    </div>
                  </StudioGlass>
                </div>
              </div>

              {/* Our Framework */}
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
            </div>
          </section>

          {/* 3. Icon Buttons */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-white text-center drop-shadow">
              Icon Buttons
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* liquid-glass-react */}
              <div>
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

              {/* liquid-glass-studio approach */}
              <div>
                <div className="flex justify-center gap-4">
                  <StudioGlass
                    width={48}
                    height={48}
                    shapeWidth={48}
                    shapeHeight={48}
                    cornerRadius={100}
                    refThickness={12}
                    refFactor={1.3}
                    className="cursor-pointer"
                    draggable={true}
                  >
                    <div className="flex items-center justify-center h-full">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                  </StudioGlass>
                  
                  <StudioGlass
                    width={48}
                    height={48}
                    shapeWidth={48}
                    shapeHeight={48}
                    cornerRadius={100}
                    refThickness={12}
                    refFactor={1.3}
                    className="cursor-pointer"
                    draggable={true}
                  >
                    <div className="flex items-center justify-center h-full">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                  </StudioGlass>
                  
                  <StudioGlass
                    width={48}
                    height={48}
                    shapeWidth={48}
                    shapeHeight={48}
                    cornerRadius={100}
                    refThickness={12}
                    refFactor={1.3}
                    className="cursor-pointer"
                    draggable={true}
                  >
                    <div className="flex items-center justify-center h-full">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                  </StudioGlass>
                </div>
              </div>

              {/* Our Framework */}
              <div>
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

          {/* Technical Comparison */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-white text-center drop-shadow">
              Technical Comparison
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* liquid-glass-react */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-8 w-8 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">
                    liquid-glass-react
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white/90 mb-2">✨ Features</h4>
                    <ul className="space-y-1 text-white/70 text-sm">
                      <li>• Real refraction & displacement</li>
                      <li>• Chromatic aberration</li>
                      <li>• Liquid elastic feel</li>
                      <li>• Edge bending effect</li>
                      <li>• Mouse-responsive distortion</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white/90 mb-2">⚙️ Implementation</h4>
                    <ul className="space-y-1 text-white/70 text-sm">
                      <li>• npm package</li>
                      <li>• CSS filters + SVG</li>
                      <li>• React component</li>
                      <li>• Preset configurations</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white/90 mb-2">📊 Trade-offs</h4>
                    <ul className="space-y-1 text-white/70 text-sm">
                      <li>✅ Easy to use</li>
                      <li>✅ Authentic effects</li>
                      <li>⚠️ Chrome/Edge best</li>
                      <li>⚠️ Heavier performance</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* liquid-glass-studio */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Code className="h-8 w-8 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">
                    liquid-glass-studio
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white/90 mb-2">🔮 Features</h4>
                    <ul className="space-y-1 text-white/70 text-sm">
                      <li>• Fresnel reflection</li>
                      <li>• Dispersion (rainbow prism)</li>
                      <li>• Glare with angle control</li>
                      <li>• SDF shape merging (blob)</li>
                      <li>• Gaussian blur masking</li>
                      <li>• Superellipse shapes</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white/90 mb-2">⚙️ Implementation</h4>
                    <ul className="space-y-1 text-white/70 text-sm">
                      <li>• Custom WebGL2/WebGPU</li>
                      <li>• Multi-pass rendering</li>
                      <li>• Custom GLSL shaders</li>
                      <li>• Fine-grained controls</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white/90 mb-2">📊 Trade-offs</h4>
                    <ul className="space-y-1 text-white/70 text-sm">
                      <li>✅ Most realistic</li>
                      <li>✅ Full control</li>
                      <li>⚠️ Complex implementation</li>
                      <li>⚠️ Not packaged (yet)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Our CSS Framework */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="h-8 w-8 text-pink-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Our CSS Framework
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white/90 mb-2">🎨 Features</h4>
                    <ul className="space-y-1 text-white/70 text-sm">
                      <li>• 6-layer composition</li>
                      <li>• Backdrop-filter blur</li>
                      <li>• Border highlights</li>
                      <li>• Shadow & depth</li>
                      <li>• Theme system</li>
                      <li>• Motion presets</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white/90 mb-2">⚙️ Implementation</h4>
                    <ul className="space-y-1 text-white/70 text-sm">
                      <li>• Pure CSS + React</li>
                      <li>• Fluent builder API</li>
                      <li>• Declarative components</li>
                      <li>• Preset system</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white/90 mb-2">📊 Trade-offs</h4>
                    <ul className="space-y-1 text-white/70 text-sm">
                      <li>✅ Universal compatibility</li>
                      <li>✅ Lightweight</li>
                      <li>✅ Easy to customize</li>
                      <li>❌ No refraction</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recommendation */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-white text-center drop-shadow">
              Recommendation
            </h2>
            <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-4">
                🎯 Hybrid Approach (Recommended)
              </h3>
              <p className="text-white/80 mb-6">
                Use the best of all three approaches based on component importance and performance requirements:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    🌟 Hero Elements & Key UI (liquid-glass-react)
                  </h4>
                  <p className="text-white/70 text-sm">
                    Use for main cards, modals, and focal points where the "wow factor" matters most.
                    The authentic refraction and liquid feel justify the performance cost.
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    🔮 Special Effects (liquid-glass-studio approach)
                  </h4>
                  <p className="text-white/70 text-sm">
                    Implement custom WebGL for unique effects like Fresnel reflection, dispersion, and glare
                    where you need fine-grained control and maximum visual impact.
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    🎨 Everything Else (Our CSS Framework)
                  </h4>
                  <p className="text-white/70 text-sm">
                    Use for buttons, inputs, tooltips, badges, and other common UI elements.
                    Lightweight, predictable, and works everywhere.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-white/90 text-sm">
                  <strong>💡 Pro Tip:</strong> Start with our CSS framework for all components, then selectively
                  upgrade hero elements to liquid-glass-react. Add custom WebGL effects only where truly needed.
                  This gives you the best balance of visual quality, performance, and maintainability.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
