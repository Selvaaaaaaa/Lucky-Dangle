import { AnimationIntensity } from '@/shared/types';

export interface PendulumState {
  angle: number;           // Primary string angle (radians)
  angularVelocity: number; // Primary string angular velocity (rad/s)
  charmAngle: number;      // Secondary charm body tilt (radians)
  charmVelocity: number;   // Secondary charm tilt velocity (rad/s)
  tasselAngleLeft: number; // Tertiary left tassel angle
  tasselAngleCenter: number;// Tertiary center tassel angle
  tasselAngleRight: number;// Tertiary right tassel angle
  length: number;          // Current effective string length
  isDragging: boolean;     // Dragging active flag
  isStationary: boolean;   // Micro-sleep optimization
}

export class PendulumEngine {
  public state: PendulumState;
  public baseLength: number;
  public anchorX: number;
  public anchorY: number;

  private gravity: number = 1900;
  private damping: number = 0.022;
  private intensity: AnimationIntensity = 'medium';
  private animationEnabled: boolean = true;

  // Drag & Flick tracking
  private mouseHistory: Array<{ x: number; y: number; time: number }> = [];
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;

  // Ambient time accumulator
  private time: number = 0;

  // Peak swing trigger callback for sound effect
  public onPeakSwing?: (speed: number) => void;
  private prevVelocitySign: number = 0;

  constructor(anchorX: number, anchorY: number, length: number = 260) {
    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.baseLength = length;

    this.state = {
      angle: 0.14, // Gentle initial sway on launch (~8 degrees)
      angularVelocity: 0,
      charmAngle: 0.14,
      charmVelocity: 0,
      tasselAngleLeft: 0.14,
      tasselAngleCenter: 0.14,
      tasselAngleRight: 0.14,
      length: length,
      isDragging: false,
      isStationary: false
    };
  }

  public setParams(params: {
    length?: number;
    damping?: number;
    intensity?: AnimationIntensity;
    animationEnabled?: boolean;
    anchorX?: number;
    anchorY?: number;
  }) {
    if (params.length !== undefined) {
      this.baseLength = params.length;
      if (!this.state.isDragging) {
        this.state.length = params.length;
      }
    }
    if (params.damping !== undefined) this.damping = params.damping;
    if (params.intensity !== undefined) this.intensity = params.intensity;
    if (params.animationEnabled !== undefined) this.animationEnabled = params.animationEnabled;
    if (params.anchorX !== undefined) this.anchorX = params.anchorX;
    if (params.anchorY !== undefined) this.anchorY = params.anchorY;

    this.state.isStationary = false;
  }

  public startDrag(x: number, y: number) {
    this.state.isDragging = true;
    this.state.isStationary = false;
    this.mouseHistory = [{ x, y, time: performance.now() }];

    const charmPos = this.getCharmPosition();
    this.dragOffsetX = x - charmPos.x;
    this.dragOffsetY = y - charmPos.y;
  }

  public updateDrag(x: number, y: number) {
    if (!this.state.isDragging) return;

    const now = performance.now();
    this.mouseHistory.push({ x, y, time: now });
    // Keep last 60ms of history for accurate flick velocity
    while (this.mouseHistory.length > 8 || (this.mouseHistory.length > 2 && now - this.mouseHistory[0].time > 80)) {
      this.mouseHistory.shift();
    }

    const targetX = x - this.dragOffsetX;
    const targetY = y - this.dragOffsetY;

    const dx = targetX - this.anchorX;
    const dy = targetY - this.anchorY;

    // Calculate angle from anchor
    let targetAngle = Math.atan2(dx, Math.max(10, dy));
    // Clamp to realistic max angle (-75 to +75 degrees)
    targetAngle = Math.max(-1.3, Math.min(1.3, targetAngle));

    // Elastic length stretch
    const dist = Math.sqrt(dx * dx + dy * dy);
    const targetLength = Math.max(this.baseLength * 0.75, Math.min(this.baseLength * 1.35, dist));

    // Smooth response
    this.state.angle += (targetAngle - this.state.angle) * 0.45;
    this.state.length += (targetLength - this.state.length) * 0.35;
    this.state.angularVelocity = 0;
  }

  public endDrag(): { flickSpeed: number } {
    if (!this.state.isDragging) return { flickSpeed: 0 };
    this.state.isDragging = false;

    let vx = 0;
    let vy = 0;

    if (this.mouseHistory.length >= 2) {
      const first = this.mouseHistory[0];
      const last = this.mouseHistory[this.mouseHistory.length - 1];
      const dt = (last.time - first.time) / 1000;

      if (dt > 0.005) {
        vx = (last.x - first.x) / dt;
        vy = (last.y - first.y) / dt;
      }
    }

    this.mouseHistory = [];

    // Tangential release velocity
    const theta = this.state.angle;
    const vTangential = vx * Math.cos(theta) - vy * Math.sin(theta);
    const flickAngularVelocity = (vTangential / this.state.length) * 1.25;

    // Apply angular impulse with realistic limits (natural swing amplitude)
    this.state.angularVelocity = Math.max(-6.5, Math.min(6.5, flickAngularVelocity));

    const flickSpeed = Math.abs(vTangential);
    if (flickSpeed > 180 && this.onPeakSwing) {
      this.onPeakSwing(flickSpeed);
    }

    return { flickSpeed };
  }

  public step(dt: number): void {
    if (!this.animationEnabled) {
      this.state.angle = 0;
      this.state.angularVelocity = 0;
      this.state.charmAngle = 0;
      this.state.length = this.baseLength;
      return;
    }

    // Clamp dt to prevent explosion on frame drops
    dt = Math.min(dt, 0.04);
    this.time += dt;

    if (this.state.isDragging) {
      // Secondary tilt during drag
      const tiltTarget = this.state.angle;
      this.state.charmAngle += (tiltTarget - this.state.charmAngle) * 12 * dt;
      this.state.tasselAngleCenter = this.state.charmAngle;
      this.state.tasselAngleLeft = this.state.charmAngle;
      this.state.tasselAngleRight = this.state.charmAngle;
      return;
    }

    // Elastic length recoil towards baseLength
    this.state.length += (this.baseLength - this.state.length) * 8 * dt;

    // Ambient draft/breeze torque based on intensity
    let ambientTorque = 0;
    if (this.intensity !== 'off') {
      const mult = this.intensity === 'low' ? 0.35 : this.intensity === 'high' ? 2.2 : 1.0;
      ambientTorque = (
        Math.sin(this.time * 1.1) * 0.45 +
        Math.cos(this.time * 2.3) * 0.25 +
        Math.sin(this.time * 0.4) * 0.6
      ) * mult;
    }

    // 1. Primary string pendulum physics
    const g = this.gravity;
    const L = this.state.length;
    // α = - (g / L) * sin(θ) - damping * ω + ambient
    const angularAcc = -(g / L) * Math.sin(this.state.angle) - (this.damping * 60) * this.state.angularVelocity + ambientTorque;

    this.state.angularVelocity += angularAcc * dt;
    this.state.angle += this.state.angularVelocity * dt;

    // Guard against swing clipping boundaries
    if (Math.abs(this.state.angle) > 0.95) {
      this.state.angle = Math.sign(this.state.angle) * 0.95;
      this.state.angularVelocity *= -0.35; // Soft natural rebound
    }

    // 2. Sound effect trigger when crossing center with velocity
    const currentSign = Math.sign(this.state.angularVelocity);
    if (
      this.prevVelocitySign !== 0 &&
      currentSign !== this.prevVelocitySign &&
      Math.abs(this.state.angle) < 0.1 &&
      Math.abs(this.state.angularVelocity) > 1.8
    ) {
      if (this.onPeakSwing) {
        this.onPeakSwing(Math.abs(this.state.angularVelocity) * 100);
      }
    }
    this.prevVelocitySign = currentSign;

    // 3. Secondary charm body tilt (spring-damper lag behind string)
    const tiltSpringK = 35;
    const tiltDamping = 6;
    const tiltAcc = -tiltSpringK * (this.state.charmAngle - this.state.angle) - tiltDamping * this.state.charmVelocity;
    this.state.charmVelocity += tiltAcc * dt;
    this.state.charmAngle += this.state.charmVelocity * dt;

    // 4. Tertiary bottom tassels/bells sway
    const tasselFollow = 16 * dt;
    this.state.tasselAngleCenter += (this.state.charmAngle * 1.25 - this.state.tasselAngleCenter) * tasselFollow;
    this.state.tasselAngleLeft += (this.state.charmAngle * 1.15 - this.state.tasselAngleLeft) * (tasselFollow * 0.9);
    this.state.tasselAngleRight += (this.state.charmAngle * 1.35 - this.state.tasselAngleRight) * (tasselFollow * 1.1);

    // 5. Stationary detection for low-power idle
    const isNearlyStill =
      Math.abs(this.state.angle) < 0.001 &&
      Math.abs(this.state.angularVelocity) < 0.001 &&
      Math.abs(this.state.charmAngle) < 0.001 &&
      this.intensity === 'off';

    this.state.isStationary = isNearlyStill;
  }

  public getCharmPosition(): { x: number; y: number } {
    const x = this.anchorX + this.state.length * Math.sin(this.state.angle);
    const y = this.anchorY + this.state.length * Math.cos(this.state.angle);
    return { x, y };
  }

  public getPointOnString(fraction: number): { x: number; y: number } {
    // Uses smooth natural catenary curvature
    const len = this.state.length * fraction;
    // Slight string flex
    const flex = Math.sin(fraction * Math.PI) * (this.state.angularVelocity * 0.015);
    const x = this.anchorX + len * Math.sin(this.state.angle) + flex;
    const y = this.anchorY + len * Math.cos(this.state.angle);
    return { x, y };
  }

  public nudge(force: number = 3.5) {
    this.state.angularVelocity += force;
    this.state.isStationary = false;
  }
}
