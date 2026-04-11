'use client';

import { GlassButton } from '@/components/liquid-glass-studio/GlassButton';

export default function TestGlassButton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-8">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Glass Button Test
        </h1>
        
        <div className="flex flex-col items-center gap-6">
          <GlassButton
            variant="primary"
            size="lg"
            onClick={() => alert('Button clicked!')}
          >
            Click Me!
          </GlassButton>
          
          <p className="text-gray-400 text-sm">
            Hover over the button to see the glass effect
          </p>
        </div>
      </div>
    </div>
  );
}
