import { CharmId } from '@/shared/types';
import { PendulumEngine } from '../physics/pendulum';
import { drawTraditionalIndian } from './traditionalIndian';
import { drawMysticKnot } from './mysticKnot';
import { drawRoyalGanesha } from './royalGanesha';
import { drawProtectiveNazar } from './protectiveNazar';
import { drawImageCharm } from './imageCharms';

export interface CharmAttachment {
  attachmentX: number;
  attachmentY: number;
  connectorLength: number;
  visualTopOffset: number;
  baseRadius: number;
  baseHeight: number;
}

export const CHARM_ATTACHMENTS: Record<CharmId, CharmAttachment> = {
  'mandala': {
    attachmentX: 0,
    attachmentY: -48,
    connectorLength: 24,
    visualTopOffset: 8,
    baseRadius: 52,
    baseHeight: 140
  },
  'mystic-knot': {
    attachmentX: 0,
    attachmentY: -48,
    connectorLength: 24,
    visualTopOffset: 8,
    baseRadius: 50,
    baseHeight: 148
  },
  'ganesha': {
    attachmentX: 0,
    attachmentY: -48,
    connectorLength: 24,
    visualTopOffset: 8,
    baseRadius: 52,
    baseHeight: 135
  },
  'nazar': {
    attachmentX: 0,
    attachmentY: -48,
    connectorLength: 24,
    visualTopOffset: 8,
    baseRadius: 50,
    baseHeight: 130
  },
  'blue-nazar': {
    attachmentX: 0,
    attachmentY: 0,
    connectorLength: 24,
    visualTopOffset: 2,
    baseRadius: 48,
    baseHeight: 96
  },
  'horned-mask': {
    attachmentX: 0,
    attachmentY: 0,
    connectorLength: 24,
    visualTopOffset: 0,
    baseRadius: 52,
    baseHeight: 120
  }
};

export interface CharmHitArea {
  cx: number;
  cy: number;
  radius: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class CharmRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    engine: PendulumEngine,
    charmId: CharmId,
    previewScale: number = 1.0,
    userCharmScale: number = 1.0
  ): CharmHitArea {
    const { anchorX, state } = engine;
    const charmPos = engine.getCharmPosition();
    const att = CHARM_ATTACHMENTS[charmId] || CHARM_ATTACHMENTS['mandala'];

    // 1. Draw continuous cord from top screen edge (s = -10) to charm attachment point (charmPos)
    this.drawContinuousCord(ctx, engine, previewScale);

    // 2. Draw 3 decorative beads along the rope above the charm attachment point
    this.drawBeads(ctx, engine, att, previewScale, userCharmScale);

    // 3. Draw Selected Decorative Charm, scaled downward from fixed attachment point (charmPos)
    if (charmId === 'blue-nazar' || charmId === 'horned-mask') {
      drawImageCharm(ctx, charmPos.x, charmPos.y, state, charmId, previewScale, userCharmScale);
    } else {
      const vectorScale = previewScale * userCharmScale;
      switch (charmId) {
        case 'mystic-knot':
          drawMysticKnot(ctx, charmPos.x, charmPos.y, state, vectorScale);
          break;
        case 'ganesha':
          drawRoyalGanesha(ctx, charmPos.x, charmPos.y, state, vectorScale);
          break;
        case 'nazar':
          drawProtectiveNazar(ctx, charmPos.x, charmPos.y, state, vectorScale);
          break;
        case 'mandala':
        default:
          drawTraditionalIndian(ctx, charmPos.x, charmPos.y, state, vectorScale);
          break;
      }
    }

    // 4. Return interactive hit bounds for click-through detection
    const effectiveScale = previewScale * userCharmScale;
    const hitRadius = att.baseRadius * effectiveScale;
    const hitHeight = att.baseHeight * effectiveScale;
    return {
      cx: charmPos.x,
      cy: charmPos.y + (hitHeight / 2),
      radius: hitRadius,
      minX: Math.min(anchorX - 16, charmPos.x - hitRadius),
      maxX: Math.max(anchorX + 16, charmPos.x + hitRadius),
      minY: 0,
      maxY: charmPos.y + hitHeight + 15
    };
  }

  private static drawContinuousCord(ctx: CanvasRenderingContext2D, engine: PendulumEngine, scale: number = 1.0) {
    const { anchorX, anchorY, state } = engine;

    ctx.save();

    const numSegments = 24;
    const points: Array<{ x: number; y: number }> = [];

    // Extend 10px above top anchor along string angle to ensure ZERO gap at screen top
    const theta = state.angle;
    const topOverhang = 10 * scale;
    points.push({
      x: anchorX - topOverhang * Math.sin(theta),
      y: anchorY - topOverhang * Math.cos(theta)
    });

    for (let i = 0; i <= numSegments; i++) {
      const frac = i / numSegments;
      points.push(engine.getPointOnString(frac));
    }

    const tracePath = () => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
    };

    // Soft atmospheric drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.38)';
    ctx.shadowBlur = 4 * scale;
    ctx.shadowOffsetX = 1.5 * scale;
    ctx.shadowOffsetY = 2 * scale;
    tracePath();
    ctx.lineWidth = 3.8 * scale;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Dark bronze outer border
    tracePath();
    ctx.lineWidth = 3.8 * scale;
    ctx.strokeStyle = '#4e3314';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Warm golden satin cord body
    tracePath();
    ctx.lineWidth = 2.4 * scale;
    ctx.strokeStyle = '#cda233';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Spun gold highlight filament
    ctx.save();
    ctx.beginPath();
    const highlightOffset = 0.4 * scale;
    ctx.moveTo(points[0].x - highlightOffset, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x - highlightOffset, points[i].y);
    }
    ctx.lineWidth = 1.1 * scale;
    ctx.strokeStyle = '#fef08a';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Subtle woven silk spiral texture marks along the cord
    ctx.save();
    ctx.lineWidth = 1.0 * scale;
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    const step = 6 * scale;
    let accumulatedDist = 0;
    for (let i = 1; i < points.length; i++) {
      const pA = points[i - 1];
      const pB = points[i];
      const segDx = pB.x - pA.x;
      const segDy = pB.y - pA.y;
      const segLen = Math.sqrt(segDx * segDx + segDy * segDy);
      if (segLen <= 0) continue;

      const segAngle = Math.atan2(segDy, segDx);
      const nx = -Math.sin(segAngle);
      const ny = Math.cos(segAngle);

      let d = step - (accumulatedDist % step);
      while (d < segLen) {
        const t = d / segLen;
        const mx = pA.x + segDx * t;
        const my = pA.y + segDy * t;
        const w = 1.4 * scale;
        ctx.beginPath();
        ctx.moveTo(mx - nx * w - (segDx / segLen) * 1.2 * scale, my - ny * w - (segDy / segLen) * 1.2 * scale);
        ctx.lineTo(mx + nx * w + (segDx / segLen) * 1.2 * scale, my + ny * w + (segDy / segLen) * 1.2 * scale);
        ctx.stroke();
        d += step;
      }
      accumulatedDist += segLen;
    }
    ctx.restore();

    ctx.restore();
  }

  private static drawBeads(
    ctx: CanvasRenderingContext2D,
    engine: PendulumEngine,
    att: CharmAttachment,
    previewScale: number = 1.0,
    userCharmScale: number = 1.0
  ) {
    const len = engine.state.length;
    const beadScale = previewScale * Math.min(1.2, Math.max(0.85, Math.sqrt(userCharmScale)));

    // Positioning along rope using per-charm connector length
    const s3 = len - att.connectorLength * beadScale;
    const s2 = s3 - 22 * beadScale;
    const s1 = s2 - 22 * beadScale;

    const f1 = Math.max(0.05, s1 / len);
    const f2 = Math.max(0.10, s2 / len);
    const f3 = Math.max(0.15, s3 / len);

    const p1 = engine.getPointOnString(f1);
    const p2 = engine.getPointOnString(f2);
    const p3 = engine.getPointOnString(f3);

    // Tangent angle of the cord at center bead for natural tilt
    const df = 0.02;
    const pPrev = engine.getPointOnString(Math.max(0, f2 - df));
    const pNext = engine.getPointOnString(Math.min(1, f2 + df));
    const tangentAngle = Math.atan2(pNext.x - pPrev.x, pNext.y - pPrev.y);

    // 1. Top Golden Bead
    this.drawGoldenBead(ctx, p1.x, p1.y, 6.2 * beadScale);

    // 2. Center Decorative Red/Gold Bead
    this.drawDecorativeBead(ctx, p2.x, p2.y, 9.2 * beadScale, tangentAngle);

    // 3. Lower Golden Bead
    this.drawGoldenBead(ctx, p3.x, p3.y, 6.2 * beadScale);
  }

  private static drawGoldenBead(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save();
    ctx.translate(x, y);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);

    const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.25, '#fef08a');
    grad.addColorStop(0.55, '#eab308');
    grad.addColorStop(0.85, '#a16207');
    grad.addColorStop(1, '#582d03');
    ctx.fillStyle = grad;
    ctx.fill();

    // Specular gleam
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.35, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();

    ctx.restore();
  }

  private static drawDecorativeBead(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    angle: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;

    // Barrel / Fluted Crimson Bead Body
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 1.15, 0, 0, Math.PI * 2);

    const rubyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r * 1.2);
    rubyGrad.addColorStop(0, '#ff6b81');
    rubyGrad.addColorStop(0.35, '#dc2626');
    rubyGrad.addColorStop(0.7, '#7f1d1d');
    rubyGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = rubyGrad;
    ctx.fill();

    // Gold filigree waist bands
    ctx.beginPath();
    ctx.rect(-r * 0.9, -1.8, r * 1.8, 3.6);
    const goldBand = ctx.createLinearGradient(-r, 0, r, 0);
    goldBand.addColorStop(0, '#fef08a');
    goldBand.addColorStop(0.5, '#eab308');
    goldBand.addColorStop(1, '#713f12');
    ctx.fillStyle = goldBand;
    ctx.fill();

    // Top and Bottom Gold Caps
    ctx.beginPath();
    ctx.arc(0, -r * 1.1, 3.5, 0, Math.PI * 2);
    ctx.arc(0, r * 1.1, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#eab308';
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.3, r * 0.35, r * 0.2, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();

    ctx.restore();
  }
}
