export class SoundFX {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.65;
  private lastPlayTime: number = 0;

  constructor(enabled: boolean = true, volume: number = 65) {
    this.enabled = enabled;
    this.volume = Math.max(0, Math.min(1, volume / 100));
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume / 100));
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playChime(speed: number = 200) {
    if (!this.enabled || this.volume <= 0) return;

    const now = performance.now();
    // Throttle sound so it doesn't overlap excessively
    if (now - this.lastPlayTime < 240) return;
    this.lastPlayTime = now;

    try {
      this.initContext();
      if (!this.ctx) return;

      const audioTime = this.ctx.currentTime;
      const intensity = Math.min(1.2, Math.max(0.4, speed / 400));
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.28 * intensity, audioTime);
      masterGain.connect(this.ctx.destination);

      // Tuned brass bell frequencies (C#6 pentatonic bell cluster)
      const baseFreq = 1046.5; // C6
      const partials = [
        { mult: 1.0, decay: 1.8, gain: 0.6 },
        { mult: 2.76, decay: 1.2, gain: 0.35 },
        { mult: 5.4, decay: 0.6, gain: 0.2 },
        { mult: 8.1, decay: 0.3, gain: 0.1 }
      ];

      partials.forEach((partial) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * partial.mult, audioTime);

        // Exponential decay envelope
        gain.gain.setValueAtTime(partial.gain, audioTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioTime + partial.decay);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(audioTime);
        osc.stop(audioTime + partial.decay + 0.05);
      });
    } catch (err) {
      console.warn('Audio playback not supported or blocked:', err);
    }
  }

  public playClack() {
    if (!this.enabled || this.volume <= 0) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const audioTime = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, audioTime);
      osc.frequency.exponentialRampToValueAtTime(110, audioTime + 0.06);

      gain.gain.setValueAtTime(this.volume * 0.15, audioTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(audioTime);
      osc.stop(audioTime + 0.07);
    } catch {
      // Ignored
    }
  }
}
