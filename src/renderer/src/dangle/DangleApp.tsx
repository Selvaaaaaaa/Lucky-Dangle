import React, { useEffect, useRef, useState } from 'react';
import { AppSettings } from '@/shared/types';
import { DEFAULT_SETTINGS, WINDOW_CONFIG } from '@/shared/constants';
import { PendulumEngine } from './physics/pendulum';
import { SoundFX } from './physics/sound';
import { CharmRenderer, CharmHitArea } from './charms/charmRenderer';

export const DangleApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const engineRef = useRef<PendulumEngine | null>(null);
  const soundRef = useRef<SoundFX | null>(null);
  const hitAreaRef = useRef<CharmHitArea | null>(null);
  const isIgnoringMouseRef = useRef<boolean>(true);
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameIdRef = useRef<number>(0);

  // Initialize engine & sound once
  if (!engineRef.current) {
    const anchorX = WINDOW_CONFIG.DANGLE_WIDTH / 2;
    const anchorY = 0; // Exactly the top bezel of the screen
    engineRef.current = new PendulumEngine(anchorX, anchorY, DEFAULT_SETTINGS.stringLength);
  }

  if (!soundRef.current) {
    soundRef.current = new SoundFX(DEFAULT_SETTINGS.soundEnabled, DEFAULT_SETTINGS.soundVolume);
  }

  // Hook peak swing audio
  useEffect(() => {
    if (engineRef.current && soundRef.current) {
      engineRef.current.onPeakSwing = (speed: number) => {
        soundRef.current?.playChime(speed);
      };
    }
  }, []);

  // Fetch initial settings & subscribe to changes
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getSettings().then((s) => {
        if (s) {
          setSettings(s);
          applySettings(s);
        }
      });

      const unsubscribe = window.electronAPI.onSettingsChanged((updated) => {
        setSettings(updated);
        applySettings(updated);
      });

      // Start with ignoring mouse events, forwarding moves
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  const applySettings = (s: AppSettings) => {
    if (engineRef.current) {
      engineRef.current.setParams({
        length: s.stringLength,
        damping: s.dampingFactor,
        intensity: s.animationIntensity,
        animationEnabled: s.animationEnabled
      });
    }
    if (soundRef.current) {
      soundRef.current.setEnabled(s.soundEnabled);
      soundRef.current.setVolume(s.soundVolume);
    }
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = WINDOW_CONFIG.DANGLE_WIDTH;
    const height = WINDOW_CONFIG.DANGLE_HEIGHT;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    lastTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const engine = engineRef.current;
      if (engine) {
        engine.step(dt);

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        // Render string, beads, and chosen charm with user charm scale
        const userScale = settings.charmScale ?? 1.0;
        const hitArea = CharmRenderer.render(ctx, engine, settings.selectedCharm, 1.0, userScale);
        hitAreaRef.current = hitArea;

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [settings.selectedCharm, settings.charmScale]);

  // Click-through / Hit-testing logic
  const checkHit = (x: number, y: number): boolean => {
    const hit = hitAreaRef.current;
    if (!hit) return false;

    // Direct circular distance to main charm
    const dx = x - hit.cx;
    const dy = y - hit.cy;
    const distCharm = Math.sqrt(dx * dx + dy * dy);
    if (distCharm <= hit.radius + 15) return true;

    // Check hit along string corridor
    const engine = engineRef.current;
    if (engine && y >= 0 && y <= hit.cy) {
      const stringX = engine.anchorX + (hit.cx - engine.anchorX) * (y / Math.max(1, hit.cy));
      if (Math.abs(x - stringX) <= 22) return true;
    }

    // Check hit on bottom bells/tassels
    if (y > hit.cy && y <= hit.maxY && Math.abs(x - hit.cx) <= hit.radius) {
      return true;
    }

    return false;
  };

  // Global mouseup and mousemove tracking for robust drag outside window bounds
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine || !engine.state.isDragging) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      engine.updateDrag(x, y);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine || !engine.state.isDragging) return;

      const { flickSpeed } = engine.endDrag();
      if (flickSpeed > 180) {
        soundRef.current?.playChime(flickSpeed);
      }

      // Restore click-through if released outside hit area
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (!checkHit(x, y)) {
          isIgnoringMouseRef.current = true;
          window.electronAPI?.setIgnoreMouseEvents(true, { forward: true });
        }
      }
    };

    const handleMouseLeave = () => {
      const engine = engineRef.current;
      if (engine && engine.state.isDragging) return;

      if (!isIgnoringMouseRef.current) {
        isIgnoringMouseRef.current = true;
        window.electronAPI?.setIgnoreMouseEvents(true, { forward: true });
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const engine = engineRef.current;
    if (engine?.state.isDragging) {
      engine.updateDrag(x, y);
      return;
    }

    const isHit = checkHit(x, y);

    if (isHit && isIgnoringMouseRef.current) {
      // Mouse entered interactive charm area -> capture clicks
      isIgnoringMouseRef.current = false;
      window.electronAPI?.setIgnoreMouseEvents(false);
    } else if (!isHit && !isIgnoringMouseRef.current) {
      // Mouse left interactive charm area -> pass clicks through
      isIgnoringMouseRef.current = true;
      window.electronAPI?.setIgnoreMouseEvents(true, { forward: true });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (e.button === 2) {
      // Right click -> Open Context Menu
      window.electronAPI?.showContextMenu();
      return;
    }

    if (e.button === 0) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (checkHit(x, y)) {
        soundRef.current?.playClack();
        engineRef.current?.startDrag(x, y);
        isIgnoringMouseRef.current = false;
        window.electronAPI?.setIgnoreMouseEvents(false);
      }
    }
  };

  const handleMouseUp = () => {
    const engine = engineRef.current;
    if (engine?.state.isDragging) {
      const { flickSpeed } = engine.endDrag();
      if (flickSpeed > 180) {
        soundRef.current?.playChime(flickSpeed);
      }
    }
  };

  const handleDoubleClick = () => {
    // Playful nudge on double click
    engineRef.current?.nudge(4.5);
    soundRef.current?.playChime(300);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.electronAPI?.showContextMenu();
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'transparent',
        cursor: engineRef.current?.state.isDragging ? 'grabbing' : 'grab'
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          pointerEvents: 'auto'
        }}
      />
    </div>
  );
};
