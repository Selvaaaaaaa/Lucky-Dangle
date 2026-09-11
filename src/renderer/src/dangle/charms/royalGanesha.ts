import { PendulumState } from '../physics/pendulum';

export function drawRoyalGanesha(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  state: PendulumState,
  scale: number = 1.0
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(state.charmAngle);
  ctx.scale(scale, scale);
  ctx.translate(0, 48); // Pivot and scale around top hanging ring at (0, -48)

  // 1. Hanging Loop
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, -48, 8, 0, Math.PI * 2);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#e6b422';
  ctx.stroke();
  ctx.restore();

  // 2. Main Gold Medallion with Lotus Sunburst
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;

  // Radiating 20 Lotus Tips
  const rOuter = 46;
  ctx.beginPath();
  for (let i = 0; i < 20; i++) {
    const a1 = (i * Math.PI * 2) / 20;
    const a2 = ((i + 1) * Math.PI * 2) / 20;
    const aMid = (a1 + a2) / 2;
    const p1x = Math.cos(a1) * (rOuter - 5);
    const p1y = Math.sin(a1) * (rOuter - 5);
    const tipX = Math.cos(aMid) * rOuter;
    const tipY = Math.sin(aMid) * rOuter;
    const p2x = Math.cos(a2) * (rOuter - 5);
    const p2y = Math.sin(a2) * (rOuter - 5);

    if (i === 0) ctx.moveTo(p1x, p1y);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(p2x, p2y);
  }
  ctx.closePath();

  const goldGrad = ctx.createRadialGradient(-5, -12, 4, 0, 0, 48);
  goldGrad.addColorStop(0, '#fffbeb');
  goldGrad.addColorStop(0.25, '#fbbf24');
  goldGrad.addColorStop(0.65, '#d97706');
  goldGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = goldGrad;
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#fef08a';
  ctx.stroke();
  ctx.restore();

  // 3. Inlaid Ruby Dots on Sunburst Points
  ctx.save();
  for (let i = 0; i < 20; i += 2) {
    const a = (i * Math.PI * 2) / 20;
    const rx = Math.cos(a) * 38;
    const ry = Math.sin(a) * 38;
    ctx.beginPath();
    ctx.arc(rx, ry, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();
  }
  ctx.restore();

  // 4. Medallion Inner Gold Face
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 33, 0, Math.PI * 2);
  const faceGrad = ctx.createRadialGradient(0, -6, 2, 0, 0, 34);
  faceGrad.addColorStop(0, '#fef08a');
  faceGrad.addColorStop(0.5, '#eab308');
  faceGrad.addColorStop(0.9, '#a16207');
  faceGrad.addColorStop(1, '#713f12');
  ctx.fillStyle = faceGrad;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ca8a04';
  ctx.stroke();
  ctx.restore();

  // 5. Stylized Embossed Ganesha Silhouette Relief
  ctx.save();
  ctx.fillStyle = '#fffbeb'; // Highlighted gold relief
  ctx.shadowColor = 'rgba(113, 63, 18, 0.7)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1.5;

  // Crown (Mukut)
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(6, -14);
  ctx.lineTo(-6, -14);
  ctx.closePath();
  ctx.fill();

  // Forehead & Tilak
  ctx.beginPath();
  ctx.arc(0, -10, 6, 0, Math.PI * 2);
  ctx.fill();

  // Red Tilak Mark
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(-1, -13, 2, 5);
  ctx.beginPath();
  ctx.arc(0, -7, 1, 0, Math.PI * 2);
  ctx.fill();

  // Curved Trunk
  ctx.fillStyle = '#fffbeb';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.quadraticCurveTo(4, 0, 2, 8);
  ctx.quadraticCurveTo(0, 16, -6, 14);
  ctx.quadraticCurveTo(-10, 12, -7, 8);
  ctx.quadraticCurveTo(-4, 9, -2, 11);
  ctx.quadraticCurveTo(0, 8, -1, -7);
  ctx.fill();

  // Modak (sweet in trunk)
  ctx.beginPath();
  ctx.arc(-8, 7, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();

  // Left & Right Large Elephant Ears
  ctx.fillStyle = '#fffbeb';
  // Right Ear
  ctx.beginPath();
  ctx.ellipse(8, -8, 6, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Left Ear
  ctx.beginPath();
  ctx.ellipse(-8, -8, 6, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // Exit main medallion rotation

  // 6. Hanging Lustrous Teardrop Pearl Droplets (Tertiary Motion)
  // Center Pearl
  ctx.save();
  ctx.translate(cx, cy + 42 * scale);
  ctx.rotate(state.tasselAngleCenter);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 16);
  ctx.stroke();

  drawPearlDrop(ctx, 0, 18, 7, 12);
  ctx.restore();

  // Left Pearl
  ctx.save();
  ctx.translate(cx - 22 * scale, cy + 36 * scale);
  ctx.rotate(state.tasselAngleLeft);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 12);
  ctx.stroke();

  drawPearlDrop(ctx, 0, 14, 5.5, 9.5);
  ctx.restore();

  // Right Pearl
  ctx.save();
  ctx.translate(cx + 22 * scale, cy + 36 * scale);
  ctx.rotate(state.tasselAngleRight);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 12);
  ctx.stroke();

  drawPearlDrop(ctx, 0, 14, 5.5, 9.5);
  ctx.restore();
}

function drawPearlDrop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.translate(x, y);

  // Gold cap
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.7, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#ca8a04';
  ctx.fill();

  // Lustrous Teardrop Pearl
  ctx.beginPath();
  ctx.moveTo(0, 1);
  ctx.quadraticCurveTo(w, h * 0.4, w * 0.8, h * 0.85);
  ctx.quadraticCurveTo(0, h * 1.1, -w * 0.8, h * 0.85);
  ctx.quadraticCurveTo(-w, h * 0.4, 0, 1);

  const pearlGrad = ctx.createRadialGradient(-w * 0.3, h * 0.4, 1, 0, h * 0.6, h);
  pearlGrad.addColorStop(0, '#ffffff');
  pearlGrad.addColorStop(0.3, '#f8fafc');
  pearlGrad.addColorStop(0.7, '#cbd5e1');
  pearlGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = pearlGrad;
  ctx.fill();

  // Specular sheen
  ctx.beginPath();
  ctx.ellipse(-w * 0.3, h * 0.4, w * 0.3, h * 0.2, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();

  ctx.restore();
}
