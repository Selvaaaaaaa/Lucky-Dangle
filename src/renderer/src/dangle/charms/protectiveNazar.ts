import { PendulumState } from '../physics/pendulum';

export function drawProtectiveNazar(
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

  // 1. Top Loop
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, -48, 8, 0, Math.PI * 2);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();
  ctx.restore();

  // 2. Main Bezel & Outer Glass
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;

  // Outer Gold Sunburst Ring
  const rOuter = 46;
  ctx.beginPath();
  ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
  const goldGrad = ctx.createRadialGradient(-6, -10, 4, 0, 0, rOuter);
  goldGrad.addColorStop(0, '#fef08a');
  goldGrad.addColorStop(0.35, '#eab308');
  goldGrad.addColorStop(0.75, '#a16207');
  goldGrad.addColorStop(1, '#713f12');
  ctx.fillStyle = goldGrad;
  ctx.fill();

  // Beaded rim
  for (let i = 0; i < 28; i++) {
    const a = (i * Math.PI * 2) / 28;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * (rOuter - 3), Math.sin(a) * (rOuter - 3), 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#fef9c3';
    ctx.fill();
  }
  ctx.restore();

  // 3. Cobalt Blue Deep Glass Layer
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 37, 0, Math.PI * 2);
  const cobaltGrad = ctx.createRadialGradient(-8, -8, 2, 0, 0, 38);
  cobaltGrad.addColorStop(0, '#3b82f6');
  cobaltGrad.addColorStop(0.4, '#1d4ed8');
  cobaltGrad.addColorStop(0.8, '#1e3a8a');
  cobaltGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = cobaltGrad;
  ctx.fill();
  ctx.restore();

  // 4. Cyan / Turquoise Ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  const cyanGrad = ctx.createRadialGradient(-5, -5, 2, 0, 0, 26);
  cyanGrad.addColorStop(0, '#7dd3fc');
  cyanGrad.addColorStop(0.6, '#0284c7');
  cyanGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = cyanGrad;
  ctx.fill();
  ctx.restore();

  // 5. White Enamel Ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, Math.PI * 2);
  const whiteGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 18);
  whiteGrad.addColorStop(0, '#ffffff');
  whiteGrad.addColorStop(0.8, '#f1f5f9');
  whiteGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = whiteGrad;
  ctx.fill();
  ctx.restore();

  // 6. Black Obsidian Pupil
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
  ctx.fillStyle = '#090d16';
  ctx.fill();

  // High-gloss curved glass reflection
  ctx.beginPath();
  ctx.ellipse(-3.5, -3.5, 3.5, 2.2, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.fill();

  // Secondary soft reflection
  ctx.beginPath();
  ctx.arc(3, 3, 1.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();
  ctx.restore();

  ctx.restore(); // Exit main medallion rotation

  // 7. Hanging Sapphire Glass Teardrops & Gold Feathers (Tertiary Motion)
  // Center Teardrop
  ctx.save();
  ctx.translate(cx, cy + 42 * scale);
  ctx.rotate(state.tasselAngleCenter);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 16);
  ctx.stroke();

  drawGlassTeardrop(ctx, 0, 18, 7, 13, '#1d4ed8', '#60a5fa');
  ctx.restore();

  // Left Teardrop
  ctx.save();
  ctx.translate(cx - 22 * scale, cy + 36 * scale);
  ctx.rotate(state.tasselAngleLeft);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 12);
  ctx.stroke();

  drawGlassTeardrop(ctx, 0, 14, 5.5, 10, '#0284c7', '#38bdf8');
  ctx.restore();

  // Right Teardrop
  ctx.save();
  ctx.translate(cx + 22 * scale, cy + 36 * scale);
  ctx.rotate(state.tasselAngleRight);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 12);
  ctx.stroke();

  drawGlassTeardrop(ctx, 0, 14, 5.5, 10, '#0284c7', '#38bdf8');
  ctx.restore();
}

function drawGlassTeardrop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  colorDark: string,
  colorLight: string
) {
  ctx.save();
  ctx.translate(x, y);

  // Tiny gold cap
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.65, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#eab308';
  ctx.fill();

  // Glass teardrop
  ctx.beginPath();
  ctx.moveTo(0, 1);
  ctx.quadraticCurveTo(w, h * 0.45, w * 0.8, h * 0.85);
  ctx.quadraticCurveTo(0, h * 1.1, -w * 0.8, h * 0.85);
  ctx.quadraticCurveTo(-w, h * 0.45, 0, 1);

  const dropGrad = ctx.createRadialGradient(-w * 0.3, h * 0.3, 1, 0, h * 0.6, h);
  dropGrad.addColorStop(0, '#ffffff');
  dropGrad.addColorStop(0.3, colorLight);
  dropGrad.addColorStop(0.8, colorDark);
  dropGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = dropGrad;
  ctx.fill();

  // Glint
  ctx.beginPath();
  ctx.ellipse(-w * 0.3, h * 0.35, w * 0.3, h * 0.2, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();

  ctx.restore();
}
