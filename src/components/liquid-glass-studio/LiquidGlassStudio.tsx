'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  createEmptyTexture,
  loadTextureFromURL,
  MultiPassRenderer,
  updateVideoTexture,
} from '@/lib/liquid-glass-studio/utils/GLUtils';
import type { IMultiPassRenderer, ITextureHandle } from '@/lib/liquid-glass-studio/utils/RendererInterface';
import {
  GPUMultiPassRenderer,
  gpuLoadTextureFromURL,
  gpuCreateEmptyTexture,
  gpuUpdateVideoTexture,
} from '@/lib/liquid-glass-studio/utils/GPUUtils';
import { detectWebGPU, type WebGPUDetectResult } from '@/lib/liquid-glass-studio/utils/gpuDetect';
import { ResizableWindow } from './ResizableWindow';
import type { ResizeWindowCtrlRefType } from './ResizableWindow/ResizableWindow';
import { computeGaussianKernelByRadius } from '@/lib/liquid-glass-studio/utils';
import { Controller } from '@react-spring/web';

interface LiquidGlassStudioProps {
  className?: string;
  initialWidth?: number;
  initialHeight?: number;
  shaders: {
    vertex: string;
    fragmentBg: string;
    fragmentBgVblur: string;
    fragmentBgHblur: string;
    fragmentMain: string;
    wgslVertex?: string;
    wgslFragBg?: string;
    wgslFragVblur?: string;
    wgslFragHblur?: string;
    wgslFragMain?: string;
  };
  controls?: {
    refThickness?: number;
    refFactor?: number;
    refDispersion?: number;
    refFresnelRange?: number;
    refFresnelHardness?: number;
    refFresnelFactor?: number;
    glareRange?: number;
    glareHardness?: number;
    glareFactor?: number;
    glareConvergence?: number;
    glareOppositeFactor?: number;
    glareAngle?: number;
    blurRadius?: number;
    blurEdge?: boolean;
    tint?: { r: number; g: number; b: number; a: number };
    shadowExpand?: number;
    shadowFactor?: number;
    shadowPosition?: { x: number; y: number };
    shapeWidth?: number;
    shapeHeight?: number;
    shapeRadius?: number;
    shapeRoundness?: number;
    mergeRate?: number;
    showShape1?: boolean;
    springSizeFactor?: number;
    bgType?: number;
  };
  backgroundImage?: string;
  backgroundVideo?: string;
  disableResize?: boolean;
  disableMove?: boolean;
}

export function LiquidGlassStudio({
  className,
  initialWidth = 600,
  initialHeight = 600,
  shaders,
  controls: externalControls,
  backgroundImage,
  backgroundVideo,
  disableResize = false,
  disableMove = false,
}: LiquidGlassStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasInfo, setCanvasInfo] = useState<{ width: number; height: number; dpr: number }>({
    width: initialWidth,
    height: initialHeight,
    dpr: 1,
  });

  // WebGPU detection
  const [webgpuDetect, setWebgpuDetect] = useState<WebGPUDetectResult | null>(null);
  const [rendererBackend] = useState<'webgl' | 'webgpu'>('webgl');
  const [canvasKey] = useState(0);

  useEffect(() => {
    detectWebGPU().then(setWebgpuDetect);
  }, []);

  // Default controls
  const defaultControls = {
    refThickness: 20,
    refFactor: 1.4,
    refDispersion: 7,
    refFresnelRange: 30,
    refFresnelHardness: 20,
    refFresnelFactor: 20,
    glareRange: 30,
    glareHardness: 20,
    glareFactor: 90,
    glareConvergence: 50,
    glareOppositeFactor: 80,
    glareAngle: -45,
    blurRadius: 1,
    blurEdge: true,
    tint: { r: 255, g: 255, b: 255, a: 0 },
    shadowExpand: 25,
    shadowFactor: 15,
    shadowPosition: { x: 0, y: -10 },
    shapeWidth: 200,
    shapeHeight: 200,
    shapeRadius: 80,
    shapeRoundness: 5,
    mergeRate: 0.05,
    showShape1: true,
    springSizeFactor: 10,
    bgType: 0,
    step: 9,
  };

  const controls = { ...defaultControls, ...externalControls };

  const stateRef = useRef<{
    canvasWindowCtrlRef: ResizeWindowCtrlRefType | null;
    renderRaf: number | null;
    canvasInfo: typeof canvasInfo;
    canvasPos: { x: number; y: number };
    canvasPointerPos: { x: number; y: number };
    controls: typeof controls;
    blurWeights: number[];
    lastMouseSpringValue: { x: number; y: number };
    lastMouseSpringTime: null | number;
    mouseSpring: Controller<{ x: number; y: number }>;
    mouseSpringSpeed: { x: number; y: number };
    bgTextureUrl: string | null;
    bgTexture: ITextureHandle | null;
    bgTextureRatio: number;
    bgTextureType: 'image' | 'video' | null;
    bgTextureReady: boolean;
    bgVideoEl: HTMLVideoElement | null;
    rendererBackend: 'webgl' | 'webgpu';
    activeRenderer: IMultiPassRenderer | null;
    gpuDevice: GPUDevice | null;
  }>({
    canvasWindowCtrlRef: null,
    renderRaf: null,
    canvasInfo,
    canvasPos: { x: 0, y: 0 },
    canvasPointerPos: { x: 0, y: 0 },
    controls,
    blurWeights: [],
    lastMouseSpringValue: { x: 0, y: 0 },
    lastMouseSpringTime: null,
    mouseSpring: new Controller({
      x: 0,
      y: 0,
      onChange: (c) => {
        if (!stateRef.current.lastMouseSpringTime) {
          stateRef.current.lastMouseSpringTime = Date.now();
          stateRef.current.lastMouseSpringValue = c.value;
          return;
        }

        const now = Date.now();
        const lastValue = stateRef.current.lastMouseSpringValue;
        const dt = now - stateRef.current.lastMouseSpringTime;
        const dx = {
          x: c.value.x - lastValue.x,
          y: c.value.y - lastValue.y,
        };
        const speed = {
          x: dx.x / dt,
          y: dx.y / dt,
        };

        if (Math.abs(speed.x) > 1e10 || Math.abs(speed.y) > 1e10) {
          speed.x = 0;
          speed.y = 0;
        }

        stateRef.current.mouseSpringSpeed = speed;
        stateRef.current.lastMouseSpringValue = c.value;
        stateRef.current.lastMouseSpringTime = now;
      },
    }),
    mouseSpringSpeed: { x: 0, y: 0 },
    bgTextureUrl: null,
    bgTexture: null,
    bgTextureRatio: 1,
    bgTextureType: null,
    bgTextureReady: false,
    bgVideoEl: null,
    rendererBackend: 'webgl',
    activeRenderer: null,
    gpuDevice: null,
  });

  stateRef.current.canvasInfo = canvasInfo;
  stateRef.current.controls = controls;

  useMemo(() => {
    stateRef.current.blurWeights = computeGaussianKernelByRadius(controls.blurRadius);
  }, [controls.blurRadius]);

  const centerizeCanvasWindow = useCallback(() => {
    const ctrl = stateRef.current.canvasWindowCtrlRef;
    if (!ctrl) return;
    const size = ctrl.getSize();
    ctrl.setMoveOffset({
      x: window.innerWidth / 2 - size.width / 2,
      y: window.innerHeight / 2 - size.height / 2,
    });
  }, []);

  useLayoutEffect(() => {
    const onResize = () => {
      centerizeCanvasWindow();
      setCanvasInfo((v) => ({
        ...v,
        dpr: window.devicePixelRatio,
      }));
    };
    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [centerizeCanvasWindow]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = canvasInfo.width * canvasInfo.dpr;
    canvasRef.current.height = canvasInfo.height * canvasInfo.dpr;
  }, [canvasInfo]);

  stateRef.current.rendererBackend = rendererBackend;

  const createWebGLRenderer = useCallback((canvasEl: HTMLCanvasElement) => {
    const gl = canvasEl.getContext('webgl2');
    if (!gl) return null;
    return new MultiPassRenderer(canvasEl, [
      { name: 'bgPass', shader: { vertex: shaders.vertex, fragment: shaders.fragmentBg } },
      { name: 'vBlurPass', shader: { vertex: shaders.vertex, fragment: shaders.fragmentBgVblur }, inputs: { u_prevPassTexture: 'bgPass' } },
      { name: 'hBlurPass', shader: { vertex: shaders.vertex, fragment: shaders.fragmentBgHblur }, inputs: { u_prevPassTexture: 'vBlurPass' } },
      { name: 'mainPass', shader: { vertex: shaders.vertex, fragment: shaders.fragmentMain }, inputs: { u_blurredBg: 'hBlurPass', u_bg: 'bgPass' }, outputToScreen: true },
    ]);
  }, [shaders]);

  const createWebGPURenderer = useCallback((canvasEl: HTMLCanvasElement, device: GPUDevice) => {
    if (!shaders.wgslVertex || !shaders.wgslFragBg || !shaders.wgslFragVblur || !shaders.wgslFragHblur || !shaders.wgslFragMain) {
      throw new Error('WebGPU shaders not provided');
    }
    return new GPUMultiPassRenderer(canvasEl, [
      { name: 'bgPass', shader: { vertex: shaders.wgslVertex, fragment: shaders.wgslFragBg } },
      { name: 'vBlurPass', shader: { vertex: shaders.wgslVertex, fragment: shaders.wgslFragVblur }, inputs: { u_prevPassTexture: 'bgPass' } },
      { name: 'hBlurPass', shader: { vertex: shaders.wgslVertex, fragment: shaders.wgslFragHblur }, inputs: { u_prevPassTexture: 'vBlurPass' } },
      { name: 'mainPass', shader: { vertex: shaders.wgslVertex, fragment: shaders.wgslFragMain }, inputs: { u_blurredBg: 'hBlurPass', u_bg: 'bgPass' }, outputToScreen: true },
    ], device);
  }, [shaders]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (stateRef.current.activeRenderer) {
      stateRef.current.activeRenderer.dispose();
      stateRef.current.activeRenderer = null;
    }

    stateRef.current.bgTexture = null;
    stateRef.current.bgTextureReady = false;
    const savedBgTextureUrl = stateRef.current.bgTextureUrl;
    const savedBgTextureType = stateRef.current.bgTextureType;
    stateRef.current.bgTextureUrl = null;
    stateRef.current.bgTextureType = null;

    const canvasEl = canvasRef.current;

    const onPointerMove = (e: PointerEvent) => {
      const ci = stateRef.current.canvasInfo;
      if (!ci) return;
      stateRef.current.canvasPointerPos = {
        x: (e.clientX - stateRef.current.canvasPos.x) * ci.dpr,
        y: (ci.height - (e.clientY - stateRef.current.canvasPos.y)) * ci.dpr,
      };
      stateRef.current.mouseSpring.start(stateRef.current.canvasPointerPos);
    };
    canvasEl.addEventListener('pointermove', onPointerMove);

    if (rendererBackend === 'webgpu' && webgpuDetect?.supported && webgpuDetect.device) {
      stateRef.current.gpuDevice = webgpuDetect.device;
      try {
        const renderer = createWebGPURenderer(canvasEl, webgpuDetect.device);
        stateRef.current.activeRenderer = renderer;
      } catch (e) {
        console.error('Failed to create WebGPU renderer, falling back to WebGL:', e);
        const renderer = createWebGLRenderer(canvasEl);
        stateRef.current.activeRenderer = renderer;
      }
    } else {
      stateRef.current.gpuDevice = null;
      const renderer = createWebGLRenderer(canvasEl);
      stateRef.current.activeRenderer = renderer;
    }

    const ci = stateRef.current.canvasInfo;
    canvasEl.width = ci.width * ci.dpr;
    canvasEl.height = ci.height * ci.dpr;
    if (stateRef.current.activeRenderer) {
      const w = ci.width * ci.dpr;
      const h = ci.height * ci.dpr;
      if (stateRef.current.rendererBackend === 'webgl') {
        const gl = canvasEl.getContext('webgl2');
        gl?.viewport(0, 0, Math.round(w), Math.round(h));
      }
      stateRef.current.activeRenderer.resize(w, h);
      stateRef.current.activeRenderer.setUniform('u_resolution', [w, h]);
    }

    requestAnimationFrame(() => {
      stateRef.current.bgTextureUrl = savedBgTextureUrl;
      stateRef.current.bgTextureType = savedBgTextureType;
    });

    return () => {
      canvasEl.removeEventListener('pointermove', onPointerMove);
    };
  }, [rendererBackend, canvasKey, webgpuDetect, createWebGLRenderer, createWebGPURenderer]);

  // Set background texture from props - EXACTLY like the original
  useEffect(() => {
    if (backgroundImage) {
      console.log('Setting background image:', backgroundImage);
      stateRef.current.bgTextureUrl = backgroundImage;
      stateRef.current.bgTextureType = 'image';
    } else if (backgroundVideo) {
      stateRef.current.bgTextureUrl = backgroundVideo;
      stateRef.current.bgTextureType = 'video';
    } else {
      stateRef.current.bgTextureUrl = null;
      stateRef.current.bgTextureReady = false;
    }
  }, [backgroundImage, backgroundVideo]);

  useEffect(() => {
    let raf: number | null = null;
    const lastState = {
      canvasInfo: null as typeof canvasInfo | null,
      controls: null as typeof controls | null,
      bgTextureType: null as typeof stateRef.current.bgTextureType,
      bgTextureUrl: null as typeof stateRef.current.bgTextureUrl,
    };

    const render = () => {
      raf = requestAnimationFrame(render);

      const renderer = stateRef.current.activeRenderer;
      if (!renderer) return;

      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      const backend = stateRef.current.rendererBackend;
      const canvasInfo = stateRef.current.canvasInfo;
      const textureUrl = stateRef.current.bgTextureUrl;

      if (
        !lastState.canvasInfo ||
        lastState.canvasInfo.width !== canvasInfo.width ||
        lastState.canvasInfo.height !== canvasInfo.height ||
        lastState.canvasInfo.dpr !== canvasInfo.dpr
      ) {
        if (backend === 'webgl') {
          const gl = canvasEl.getContext('webgl2');
          if (gl) {
            gl.viewport(0, 0, Math.round(canvasInfo.width * canvasInfo.dpr), Math.round(canvasInfo.height * canvasInfo.dpr));
          }
        }
        renderer.resize(canvasInfo.width * canvasInfo.dpr, canvasInfo.height * canvasInfo.dpr);
        renderer.setUniform('u_resolution', [canvasInfo.width * canvasInfo.dpr, canvasInfo.height * canvasInfo.dpr]);
      }

      // Texture management - EXACTLY like the original
      if (textureUrl !== lastState.bgTextureUrl) {
        if (lastState.bgTextureType === 'video') {
          stateRef.current.bgVideoEl?.pause();
        }
        if (!textureUrl) {
          if (stateRef.current.bgTexture) {
            if (backend === 'webgl') {
              const gl = canvasEl.getContext('webgl2');
              gl?.deleteTexture(stateRef.current.bgTexture as WebGLTexture);
            } else {
              (stateRef.current.bgTexture as GPUTexture)?.destroy();
            }
            stateRef.current.bgTexture = null;
            stateRef.current.bgTextureType = null;
          }
        } else {
          if (stateRef.current.bgTextureType === 'image') {
            const rafId = requestAnimationFrame(() => { stateRef.current.bgTextureReady = false; });
            if (backend === 'webgl') {
              const gl = canvasEl.getContext('webgl2');
              if (gl) {
                loadTextureFromURL(gl, textureUrl).then(({ texture, ratio }) => {
                  if (stateRef.current.bgTextureUrl === textureUrl) {
                    cancelAnimationFrame(rafId);
                    stateRef.current.bgTexture = texture;
                    stateRef.current.bgTextureRatio = ratio;
                    stateRef.current.bgTextureReady = true;
                  }
                });
              }
            } else if (stateRef.current.gpuDevice) {
              gpuLoadTextureFromURL(stateRef.current.gpuDevice, textureUrl).then(({ texture, ratio }) => {
                if (stateRef.current.bgTextureUrl === textureUrl) {
                  cancelAnimationFrame(rafId);
                  stateRef.current.bgTexture = texture;
                  stateRef.current.bgTextureRatio = ratio;
                  stateRef.current.bgTextureReady = true;
                }
              });
            }
          } else if (stateRef.current.bgTextureType === 'video') {
            stateRef.current.bgTextureReady = false;
            if (backend === 'webgl') {
              const gl = canvasEl.getContext('webgl2');
              if (gl) {
                stateRef.current.bgTexture = createEmptyTexture(gl);
              }
            } else if (stateRef.current.gpuDevice) {
              stateRef.current.bgTexture = gpuCreateEmptyTexture(stateRef.current.gpuDevice);
            }
            stateRef.current.bgVideoEl?.play();
          }
        }
      }
      lastState.controls = stateRef.current.controls;
      lastState.bgTextureType = stateRef.current.bgTextureType;
      lastState.canvasInfo = canvasInfo;
      lastState.bgTextureUrl = stateRef.current.bgTextureUrl;

      // Video texture update
      if (stateRef.current.bgTextureType === 'video') {
        const videoEl = stateRef.current.bgVideoEl;
        if (stateRef.current.bgTexture && videoEl) {
          if (backend === 'webgl') {
            const gl = canvasEl.getContext('webgl2');
            if (gl) {
              const info = updateVideoTexture(gl, stateRef.current.bgTexture as WebGLTexture, videoEl);
              if (info) {
                stateRef.current.bgTextureRatio = info.ratio;
                stateRef.current.bgTextureReady = true;
              }
            }
          } else if (stateRef.current.gpuDevice) {
            gpuUpdateVideoTexture(stateRef.current.gpuDevice, stateRef.current.bgTexture as GPUTexture, videoEl).then((info) => {
              if (info) {
                stateRef.current.bgTexture = info.texture;
                stateRef.current.bgTextureRatio = info.ratio;
                stateRef.current.bgTextureReady = true;
              }
            });
          }
        }
      }

      if (backend === 'webgl') {
        const gl = canvasEl.getContext('webgl2');
        if (gl) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
      }

      const controls = stateRef.current.controls;
      const mouseSpring = stateRef.current.mouseSpring.get();

      const shapeSizeSpring = {
        x: controls.shapeWidth + (Math.abs(stateRef.current.mouseSpringSpeed.x) * controls.shapeWidth * controls.springSizeFactor) / 100,
        y: controls.shapeHeight + (Math.abs(stateRef.current.mouseSpringSpeed.y) * controls.shapeHeight * controls.springSizeFactor) / 100,
      };

      renderer.setUniforms({
        u_resolution: [canvasInfo.width * canvasInfo.dpr, canvasInfo.height * canvasInfo.dpr],
        u_dpr: canvasInfo.dpr,
        u_blurWeights: stateRef.current.blurWeights,
        u_blurRadius: stateRef.current.controls.blurRadius,
        u_mouse: [stateRef.current.canvasPointerPos.x, stateRef.current.canvasPointerPos.y],
        u_mouseSpring: [mouseSpring.x, mouseSpring.y],
        u_shapeWidth: shapeSizeSpring.x,
        u_shapeHeight: shapeSizeSpring.y,
        u_shapeRadius: ((Math.min(shapeSizeSpring.x, shapeSizeSpring.y) / 2) * controls.shapeRadius) / 100,
        u_shapeRoundness: controls.shapeRoundness,
        u_mergeRate: controls.mergeRate,
        u_glareAngle: (controls.glareAngle * Math.PI) / 180,
        u_showShape1: controls.showShape1 ? 1 : 0,
      });

      renderer.render({
        bgPass: {
          u_bgType: controls.bgType,
          u_bgTexture: (stateRef.current.bgTextureUrl && stateRef.current.bgTexture) ?? undefined,
          u_bgTextureRatio: stateRef.current.bgTextureUrl && stateRef.current.bgTexture ? stateRef.current.bgTextureRatio : undefined,
          u_bgTextureReady: stateRef.current.bgTextureReady ? 1 : 0,
          u_shadowExpand: controls.shadowExpand,
          u_shadowFactor: controls.shadowFactor / 100,
          u_shadowPosition: [-controls.shadowPosition.x, -controls.shadowPosition.y],
        },
        mainPass: {
          u_tint: [controls.tint.r / 255, controls.tint.g / 255, controls.tint.b / 255, controls.tint.a],
          u_refThickness: controls.refThickness,
          u_refFactor: controls.refFactor,
          u_refDispersion: controls.refDispersion,
          u_refFresnelRange: controls.refFresnelRange,
          u_refFresnelHardness: controls.refFresnelHardness / 100,
          u_refFresnelFactor: controls.refFresnelFactor / 100,
          u_glareRange: controls.glareRange,
          u_glareHardness: controls.glareHardness / 100,
          u_glareConvergence: controls.glareConvergence / 100,
          u_glareOppositeFactor: controls.glareOppositeFactor / 100,
          u_glareFactor: controls.glareFactor / 100,
          u_blurEdge: controls.blurEdge ? 1 : 0,
          STEP: controls.step || 9,
        },
      });
    };
    raf = requestAnimationFrame(render);

    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  return (
    <ResizableWindow
      className={className}
      disableMove={disableMove}
      disableResize={disableResize}
      size={canvasInfo}
      onResize={(size) => {
        setCanvasInfo({
          ...size,
          dpr: window.devicePixelRatio,
        });
        centerizeCanvasWindow();
      }}
      onMove={(pos) => {
        stateRef.current.canvasPos = pos;
      }}
      ctrlRef={(ref) => {
        stateRef.current.canvasWindowCtrlRef = ref;
      }}
    >
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <canvas
          key={canvasKey}
          ref={canvasRef}
          style={
            {
              transform: `scale(${1 / canvasInfo.dpr})`,
              transformOrigin: 'top left',
              touchAction: 'none',
            } as CSSProperties
          }
        />
      </div>
    </ResizableWindow>
  );
}
