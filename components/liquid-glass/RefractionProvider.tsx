'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { RefractionEngine } from '../../lib/liquid-glass/RefractionEngine';
import { GlassProperties } from '../../lib/liquid-glass/types';

interface RefractionContextValue {
  engine: RefractionEngine | null;
  registerLayer: (id: string, zIndex: number, element: HTMLElement, properties: GlassProperties) => void;
  unregisterLayer: (id: string) => void;
  updateLayer: (id: string, properties: Partial<GlassProperties>) => void;
}

const RefractionContext = createContext<RefractionContextValue | null>(null);

export function useRefraction() {
  const context = useContext(RefractionContext);
  // Return null if not within provider (optional usage)
  return context;
}

interface RefractionProviderProps {
  children: ReactNode;
  backgroundImage: string;
  enabled?: boolean;
}

export function RefractionProvider({
  children,
  backgroundImage,
  enabled = true,
}: RefractionProviderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RefractionEngine | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    try {
      const engine = new RefractionEngine(canvas);
      engineRef.current = engine;

      // Load base image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        engine.setBaseImage(img);
        engine.start();
        setIsReady(true);
      };
      img.onerror = () => {
        console.error('Failed to load background image');
      };
      img.src = backgroundImage;

      // Handle resize
      const handleResize = () => {
        engine.resize(window.innerWidth, window.innerHeight);
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        engine.destroy();
        engineRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize refraction engine:', error);
    }
  }, [backgroundImage, enabled]);

  const registerLayer = (id: string, zIndex: number, element: HTMLElement, properties: GlassProperties) => {
    if (engineRef.current) {
      engineRef.current.addLayer(id, zIndex, element, properties);
    }
  };

  const unregisterLayer = (id: string) => {
    if (engineRef.current) {
      engineRef.current.removeLayer(id);
    }
  };

  const updateLayer = (id: string, properties: Partial<GlassProperties>) => {
    // TODO: Implement layer property updates
    console.log('Update layer:', id, properties);
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <RefractionContext.Provider
      value={{
        engine: engineRef.current,
        registerLayer,
        unregisterLayer,
        updateLayer,
      }}
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </RefractionContext.Provider>
  );
}
