import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  createEmptyTexture,
  loadTextureFromURL,
  MultiPassRenderer,
  updateVideoTexture,
} from '../lib/liquid-glass-studio/utils/GLUtils';
import type { IMultiPassRenderer, ITextureHandle } from '../lib/liquid-glass-studio/utils/RendererInterface';
import { detectWebGPU, type WebGPUDetectResult } from '../lib/liquid-glass-studio/utils/gpuDetect';
import { ResizableWindow } from './liquid-glass-studio/ResizableWindow';
import type { ResizeWindowCtrlRefType } from './liquid-glass-studio/ResizableWindow/ResizableWindow';

import VertexShader from '../lib/liquid-glass-studio/shaders/vertex.glsl?raw';
import FragmentBgShader from '../lib/liquid-glass-studio/shaders/fragment-bg.glsl?raw';
import FragmentBgVblurShader from '../lib/liquid-glass-studio/shaders/fragment-bg-vblur.glsl?raw';
import FragmentBgHblurShader from '../lib/liquid-glass-studio/shaders/fragment-bg-hblur.glsl?raw';
import FragmentMainShader from '../lib/liquid-glass-studio/shaders/fragment-main.glsl?raw';
import { Controller } from '@react-spring/web';

import { computeGaussianKernelByRadius } from '../lib/liquid-glass-studio/utils';

interface GlassButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  backgroundImage?: string;
}

export function GlassButton({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  className,
  backgroundImage = '/lake-bg.png',
}: GlassButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const sizeConfig = {
    sm: { width: 120, height: 36 },
    md: { width: 160, height: 44 },
    lg: { width: 200, height: 52 },
  };

  const currentSize = sizeConfig[size];

  const [canvasInfo, setCanvasInfo] = useState<{ width: number; height: number; dpr: number }>({
    width: currentSize.width,
    height: currentSize.height,
    dpr: 1,
  });

  const [webgpuDetect, setWebgpuDetect] = useState<any>(null);
  const [rendererBackend] = useState<'webgl' | 'webgpu'>('webgl');
  const [canvasKey] = useState(0);

  useEffect(() => {
    detectWebGPU().then(setWebgpuDetect);
  }, []);

  const controls = {
    refThickness: 11.72,
    refFactor: 1.3,
    refDispersion: 50,
    refFresnelRange: 0,
    refFresnelHardness: 59.86,
    refFresnelFactor: 52.58,
    glareRange: 0,
    glareHardness: 0,
    glareFactor: 0,
    glareConvergence: 0,
    glareOppositeFactor: 0,
    glareAngle: -180,
    blurRadius: 1,
    blurEdge: true,
    tint: { r: 23, g: 23, b: 165, a: 0 },
    shadowExpand: isPressed ? 8 : isHovered ? 12 : 10.99,
    shadowFactor: 15,
    shadowPosition: { x: 0, y: -10 },
    shapeWidth: currentSize.width,
    shapeHeight: currentSize.height,
    shapeRadius: 80,
    shapeRoundness: 5,
    mergeRate: 0.05,
    showShape1: true,
    springSizeFactor: isPressed ? 5 : isHovered ? 15 : 10,
    bgType: 4,
    step: 9,
  };

  const stateRef = useRef<any>({
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
      onChange: (c: any) => {
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
    bgTextureUrl: backgroundImage,
    bgTexture: null,
    bgTextureRatio: 1,
    bgTextureType: 'image',
    bgTextureReady: false,
    bgVideoEls: new Map(),
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
  }, []);

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
      { name: 'bgPass', shader: { vertex: VertexShader, fragment: FragmentBgShader } },
      { name: 'vBlurPass', shader: { vertex: VertexShader, fragment: FragmentBgVblurShader }, inputs: { u_prevPassTexture: 'bgPass' } },
      { name: 'hBlurPass', shader: { vertex: VertexShader, fragment: FragmentBgHblurShader }, inputs: { u_prevPassTexture: 'vBlurPass' } },
      { name: 'mainPass', shader: { vertex: VertexShader, fragment: FragmentMainShader }, inputs: { u_blurredBg: 'hBlurPass', u_bg: 'bgPass' }, outputToScreen: true },
    ]);
  }, []);

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
      const rect = canvasEl.getBoundingClientRect();
      stateRef.current.canvasPointerPos = {
        x: (e.clientX - rect.left) * ci.dpr,
        y: (ci.height - (e.clientY - rect.top)) * ci.dpr,
      };
      stateRef.current.mouseSpring.start(stateRef.current.canvasPointerPos);
    };
    canvasEl.addEventListener('pointermove', onPointerMove);

    stateRef.current.gpuDevice = null;
    const renderer = createWebGLRenderer(canvasEl);
    stateRef.current.activeRenderer = renderer;

    const ci = stateRef.current.canvasInfo;
    canvasEl.width = ci.width * ci.dpr;
    canvasEl.height = ci.height * ci.dpr;
    if (stateRef.current.activeRenderer) {
      const w = ci.width * ci.dpr;
      const h = ci.height * ci.dpr;
      const gl = canvasEl.getContext('webgl2');
      gl?.viewport(0, 0, Math.round(w), Math.round(h));
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
  }, [rendererBackend, canvasKey, webgpuDetect, createWebGLRenderer]);

  useEffect(() => {
    let raf: number | null = null;
    const lastState = {
      canvasInfo: null as any,
      controls: null as any,
      bgTextureType: null as any,
      bgTextureUrl: null as any,
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
        const gl = canvasEl.getContext('webgl2');
        if (gl) {
          gl.viewport(0, 0, Math.round(canvasInfo.width * canvasInfo.dpr), Math.round(canvasInfo.height * canvasInfo.dpr));
        }
        renderer.resize(canvasInfo.width * canvasInfo.dpr, canvasInfo.height * canvasInfo.dpr);
        renderer.setUniform('u_resolution', [canvasInfo.width * canvasInfo.dpr, canvasInfo.height * canvasInfo.dpr]);
      }

      if (textureUrl !== lastState.bgTextureUrl) {
        if (!textureUrl) {
          if (stateRef.current.bgTexture) {
            const gl = canvasEl.getContext('webgl2');
            gl?.deleteTexture(stateRef.current.bgTexture as WebGLTexture);
            stateRef.current.bgTexture = null;
            stateRef.current.bgTextureType = null;
          }
        } else {
          if (stateRef.current.bgTextureType === 'image') {
            const rafId = requestAnimationFrame(() => { stateRef.current.bgTextureReady = false; });
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
          }
        }
      }
      lastState.controls = stateRef.current.controls;
      lastState.bgTextureType = stateRef.current.bgTextureType;
      lastState.canvasInfo = canvasInfo;
      lastState.bgTextureUrl = stateRef.current.bgTextureUrl;

      const gl = canvasEl.getContext('webgl2');
      if (gl) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
          STEP: controls.step,
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
    <button
      onClick={onClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center transition-all duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${isPressed && !disabled ? 'scale-95' : ''} ${isHovered && !disabled ? 'scale-105' : ''} ${className || ''}`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl" style={{ pointerEvents: 'none' }}>
        <ResizableWindow
          disableMove
          disableResize
          size={canvasInfo}
          onResize={() => {}}
          onMove={() => {}}
          ctrlRef={(ref) => {
            stateRef.current.canvasWindowCtrlRef = ref;
          }}
        >
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <canvas
              key={canvasKey}
              ref={canvasRef}
              style={{
                transform: `scale(${1 / canvasInfo.dpr})`,
                transformOrigin: 'top left',
                touchAction: 'none',
              } as CSSProperties}
            />
          </div>
        </ResizableWindow>
      </div>

      <span
        className={`relative z-10 font-medium transition-all duration-200 ${
          variant === 'primary' ? 'text-blue-100' : ''
        } ${variant === 'secondary' ? 'text-purple-100' : ''} ${
          variant === 'ghost' ? 'text-gray-700' : ''
        } ${variant === 'default' ? 'text-gray-800' : ''} ${disabled ? 'text-gray-400' : ''}`}
        style={{
          fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
          textShadow: variant !== 'ghost' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {children}
      </span>
    </button>
  );
}
