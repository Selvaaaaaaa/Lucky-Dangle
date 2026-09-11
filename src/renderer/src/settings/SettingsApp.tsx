import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  Activity,
  Monitor,
  Volume2,
  X,
  RotateCcw,
  Power
} from 'lucide-react';
import { AppSettings, CharmId, MonitorInfo, PositionPreset, AnimationIntensity, CharmDefinition } from '@/shared/types';
import { DEFAULT_SETTINGS, CHARM_DEFINITIONS } from '@/shared/constants';
import { PendulumEngine } from '../dangle/physics/pendulum';
import { CharmRenderer } from '../dangle/charms/charmRenderer';

type Tab = 'charms' | 'physics' | 'display' | 'system';

const INTENSITY_LEVELS: AnimationIntensity[] = ['off', 'low', 'medium', 'high'];

const POSITION_OPTIONS: Array<{ label: string; value: PositionPreset }> = [
  { label: 'Left', value: 'top-left' },
  { label: 'Center', value: 'top-center' },
  { label: 'Right', value: 'top-right' },
  { label: 'Custom', value: 'custom' }
];

export const SettingsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('charms');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [monitors, setMonitors] = useState<MonitorInfo[]>([]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getSettings().then((s) => {
        if (s) setSettings(s);
      });
      window.electronAPI.getMonitors().then((m) => {
        if (m) setMonitors(m);
      });

      const unsub = window.electronAPI.onSettingsChanged((updated) => {
        setSettings(updated);
      });
      return () => unsub();
    }
  }, []);

  const update = (partial: Partial<AppSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    window.electronAPI?.saveSettings(partial);
  };

  const handleReset = () => {
    window.electronAPI?.resetPosition();
    update(DEFAULT_SETTINGS);
  };

  const handleClose = () => {
    window.electronAPI?.closeSettingsWindow();
  };

  const handleQuit = () => {
    window.electronAPI?.quitApp();
  };

  return (
    <div className="settings-window">
      {/* Title Bar */}
      <div className="title-bar">
        <div className="title-info">
          <svg className="title-logo" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="14" r="7" fill="#e6b422" />
            <circle cx="12" cy="14" r="5" fill="#d90429" />
            <line x1="12" y1="2" x2="12" y2="7" stroke="#e6b422" strokeWidth="2" />
            <circle cx="12" cy="5" r="2" fill="#e6b422" />
          </svg>
          <span className="title-text">LUCKY DANGLE</span>
          <span className="title-tag">Settings</span>
        </div>
        <div className="title-actions">
          <button className="btn-icon" onClick={handleClose} title="Close Settings">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'charms' ? 'active' : ''}`}
          onClick={() => setActiveTab('charms')}
        >
          <Sparkles size={16} /> Charms
        </button>
        <button
          className={`tab-btn ${activeTab === 'physics' ? 'active' : ''}`}
          onClick={() => setActiveTab('physics')}
        >
          <Activity size={16} /> Motion & Physics
        </button>
        <button
          className={`tab-btn ${activeTab === 'display' ? 'active' : ''}`}
          onClick={() => setActiveTab('display')}
        >
          <Monitor size={16} /> Display & Position
        </button>
        <button
          className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <Volume2 size={16} /> Sound & System
        </button>
      </div>

      {/* Tab Body */}
      <div className="tab-content">
        {activeTab === 'charms' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Charm Appearance & Size Section */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h4 className="section-title">Charm Appearance</h4>
                  <p className="section-desc">Adjust the display size and scale of your hanging charm.</p>
                </div>
              </div>

              <div className="control-row">
                <div className="control-label-group">
                  <span className="control-label">Charm Size</span>
                  <span className="control-hint">Scale the artwork around its hanging point (50% – 150%)</span>
                </div>
                <div className="slider-group">
                  <input
                    type="range"
                    min={50}
                    max={150}
                    step={5}
                    value={Math.round((settings.charmScale ?? 1.0) * 100)}
                    onChange={(e) => update({ charmScale: Number(e.target.value) / 100 })}
                    className="slider-input"
                  />
                  <span className="slider-value">{Math.round((settings.charmScale ?? 1.0) * 100)}%</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="control-row" style={{ paddingTop: 0 }}>
                <div className="control-label-group">
                  <span className="control-label">Quick Presets</span>
                  <span className="control-hint">Standard proportional size targets</span>
                </div>
                <div className="segmented-control">
                  {[
                    { label: 'Small (75%)', val: 0.75 },
                    { label: 'Normal (100%)', val: 1.0 },
                    { label: 'Large (125%)', val: 1.25 },
                    { label: 'Max (150%)', val: 1.5 }
                  ].map((preset) => {
                    const isActive = Math.abs((settings.charmScale ?? 1.0) - preset.val) < 0.02;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        className={`segmented-btn ${isActive ? 'active' : ''}`}
                        onClick={() => update({ charmScale: preset.val })}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Charms Grid */}
            <div className="charms-grid">
              {CHARM_DEFINITIONS.map((charm: CharmDefinition) => (
                <div
                  key={charm.id}
                  className={`charm-card ${settings.selectedCharm === charm.id ? 'selected' : ''}`}
                  onClick={() => update({ selectedCharm: charm.id })}
                >
                  <span className="charm-card-badge">{charm.badge}</span>
                  <div className="charm-preview-box">
                    <CharmMiniPreview
                      charmId={charm.id}
                      isSelected={settings.selectedCharm === charm.id}
                      charmScale={settings.charmScale ?? 1.0}
                    />
                  </div>
                  <h3 className="charm-card-title">{charm.name}</h3>
                  <p className="charm-card-desc">{charm.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'physics' && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <h4 className="section-title">Dangling Physics & Motion</h4>
                <p className="section-desc">Customize swinging behavior, gravity response, and air resistance.</p>
              </div>
            </div>

            {/* Animation Toggle */}
            <div className="control-row">
              <div className="control-label-group">
                <span className="control-label">Enable Physics Animation</span>
                <span className="control-hint">Allow the charm to dangle and respond to gravity</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.animationEnabled}
                  onChange={(e) => update({ animationEnabled: e.target.checked })}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            {/* Animation Intensity */}
            <div className="control-row">
              <div className="control-label-group">
                <span className="control-label">Ambient Breeze Intensity</span>
                <span className="control-hint">Subtle draft causing occasional gentle swaying</span>
              </div>
              <div className="segmented-control">
                {INTENSITY_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`segmented-btn ${settings.animationIntensity === level ? 'active' : ''}`}
                    onClick={() => update({ animationIntensity: level })}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* String Length Slider */}
            <div className="control-row">
              <div className="control-label-group">
                <span className="control-label">Hanging String Length</span>
                <span className="control-hint">Distance from the top bezel to charm</span>
              </div>
              <div className="slider-group">
                <input
                  type="range"
                  min={200}
                  max={340}
                  step={5}
                  value={settings.stringLength}
                  onChange={(e) => update({ stringLength: Number(e.target.value) })}
                  className="slider-input"
                />
                <span className="slider-value">{settings.stringLength} px</span>
              </div>
            </div>

            {/* Damping Slider */}
            <div className="control-row">
              <div className="control-label-group">
                <span className="control-label">Air Resistance (Damping)</span>
                <span className="control-hint">How quickly the charm comes to rest after swinging</span>
              </div>
              <div className="slider-group">
                <input
                  type="range"
                  min={0.01}
                  max={0.05}
                  step={0.002}
                  value={settings.dampingFactor}
                  onChange={(e) => update({ dampingFactor: Number(e.target.value) })}
                  className="slider-input"
                />
                <span className="slider-value">{Math.round(settings.dampingFactor * 1000)}</span>
              </div>
            </div>

            {/* Charm Size Slider */}
            <div className="control-row">
              <div className="control-label-group">
                <span className="control-label">Charm Size</span>
                <span className="control-hint">Scale the hanging charm artwork (50% – 150%)</span>
              </div>
              <div className="slider-group">
                <input
                  type="range"
                  min={50}
                  max={150}
                  step={5}
                  value={Math.round((settings.charmScale ?? 1.0) * 100)}
                  onChange={(e) => update({ charmScale: Number(e.target.value) / 100 })}
                  className="slider-input"
                />
                <span className="slider-value">{Math.round((settings.charmScale ?? 1.0) * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'display' && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <h4 className="section-title">Screen & Monitor Placement</h4>
                <p className="section-desc">Choose which display and position the charm hangs from.</p>
              </div>
            </div>

            {/* Monitor Picker */}
            <div className="control-row">
              <div className="control-label-group">
                <span className="control-label">Target Monitor</span>
                <span className="control-hint">Select the display where Lucky Dangle should hang</span>
              </div>
              <select
                className="select-input"
                value={settings.monitorId}
                onChange={(e) => {
                  const val = e.target.value === 'primary' ? 'primary' : Number(e.target.value);
                  update({ monitorId: val });
                }}
              >
                <option value="primary">Primary Display (Auto)</option>
                {monitors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Preset */}
            <div className="control-row">
              <div className="control-label-group">
                <span className="control-label">Top Edge Position</span>
                <span className="control-hint">Horizontal alignment on top screen bezel</span>
              </div>
              <div className="segmented-control">
                {POSITION_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`segmented-btn ${settings.positionPreset === item.value ? 'active' : ''}`}
                    onClick={() => update({ positionPreset: item.value })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Offset Slider (if custom selected) */}
            {settings.positionPreset === 'custom' && (
              <div className="control-row">
                <div className="control-label-group">
                  <span className="control-label">Custom X Offset</span>
                  <span className="control-hint">Fine-tune horizontal position</span>
                </div>
                <div className="slider-group">
                  <input
                    type="range"
                    min={-600}
                    max={600}
                    step={10}
                    value={settings.customOffsetX}
                    onChange={(e) => update({ customOffsetX: Number(e.target.value) })}
                    className="slider-input"
                  />
                  <span className="slider-value">{settings.customOffsetX} px</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <h4 className="section-title">Sound & System Integration</h4>
                <p className="section-desc">Manage startup behavior, window priority, and audio.</p>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="control-row">
              <div className="control-label-group">
                <span className="control-label">Chime & Bell Sound Effects</span>
                <span className="control-hint">Play gentle harmonic bell chimes on flicks</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => update({ soundEnabled: e.target.checked })}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            {/* Sound Volume Slider */}
            {settings.soundEnabled && (
              <div className="control-row">
                <div className="control-label-group">
                  <span className="control-label">Chime Volume</span>
                  <span className="control-hint">Loudness of bell chimes</span>
                </div>
                <div className="slider-group">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={settings.soundVolume}
                    onChange={(e) => update({ soundVolume: Number(e.target.value) })}
                    className="slider-input"
                  />
                  <span className="slider-value">{settings.soundVolume}%</span>
                </div>
              </div>
            )}

            {/* Always on Top */}
            <div className="control-row">
              <div className="control-label-group">
                <span className="control-label">Always on Top</span>
                <span className="control-hint">Keep charm floating above full-screen windows</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.alwaysOnTop}
                  onChange={(e) => update({ alwaysOnTop: e.target.checked })}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            {/* Start with Windows */}
            <div className="control-row">
              <div className="control-label-group">
                <span className="control-label">Launch with Windows</span>
                <span className="control-hint">Automatically start Lucky Dangle when your PC boots</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.startWithWindows}
                  onChange={(e) => update({ startWithWindows: e.target.checked })}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="bottom-bar">
        <button className="btn-secondary" onClick={handleReset} title="Reset all settings to default">
          <RotateCcw size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Reset Defaults
        </button>
        <button className="btn-danger" onClick={handleQuit} title="Completely exit application">
          <Power size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Quit Lucky Dangle
        </button>
      </div>
    </div>
  );
};

// Mini preview canvas for each charm card in settings
const CharmMiniPreview: React.FC<{ charmId: CharmId; isSelected: boolean; charmScale?: number }> = ({
  charmId,
  isSelected,
  charmScale = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PendulumEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 130;
    const height = 150;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const engine = new PendulumEngine(width / 2, 0, 75);
    engine.setParams({ intensity: isSelected ? 'medium' : 'low', damping: 0.03 });
    engineRef.current = engine;

    let animId = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      engine.step(dt);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Render scaled mini charm with user-selected charmScale
      CharmRenderer.render(ctx, engine, charmId, 0.65, charmScale);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [charmId, isSelected, charmScale]);

  return <canvas ref={canvasRef} style={{ width: 130, height: 150 }} />;
};
