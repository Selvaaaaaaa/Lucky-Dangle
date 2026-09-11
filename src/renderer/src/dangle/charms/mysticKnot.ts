import { PendulumState } from '../physics/pendulum';

export function drawMysticKnot(
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
  ctx.strokeStyle = '#c59218';
  ctx.stroke();
  ctx.restore();

  // 2. Endless Mystic Knot Body
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  const redCordGrad = ctx.createLinearGradient(-30, -30, 30, 30);
  redCordGrad.addColorStop(0, '#ff3344');
  redCordGrad.addColorStop(0.5, '#b80018');
  redCordGrad.addColorStop(1, '#57000b');

  // Weave interwoven rounded squares
  const drawKnotSquare = (ox: number, oy: number) => {
    ctx.beginPath();
    ctx.roundRect(ox - 16, oy - 16, 32, 32, 6);
    ctx.lineWidth = 6;
    ctx.strokeStyle = redCordGrad;
    ctx.stroke();

    // Gold thread highlight running down center of cord
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#ffe066';
    ctx.stroke();
  };

  // 4 interlocking lobes
  drawKnotSquare(-10, -10);
  drawKnotSquare(10, -10);
  drawKnotSquare(-10, 10);
  drawKnotSquare(10, 10);

  // Outer corner ears / loops
  const drawEar = (ex: number, ey: number, rad: number) => {
    ctx.beginPath();
    ctx.arc(ex, ey, rad, 0, Math.PI * 2);
    ctx.lineWidth = 5.5;
    ctx.strokeStyle = redCordGrad;
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffe066';
    ctx.stroke();
  };

  drawEar(0, -28, 9);
  drawEar(-28, 0, 9);
  drawEar(28, 0, 9);

  // Center Auspicious Jade Bead
  ctx.beginPath();
  ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
  const jadeGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 8);
  jadeGrad.addColorStop(0, '#a7f3d0');
  jadeGrad.addColorStop(0.4, '#10b981');
  jadeGrad.addColorStop(0.8, '#047857');
  jadeGrad.addColorStop(1, '#064e3b');
  ctx.fillStyle = jadeGrad;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#fef08a';
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // End knot rotation

  // 3. Hanging Auspicious Brass Qing Dynasty Coin (Secondary/Tertiary)
  ctx.save();
  ctx.translate(cx, cy + 32 * scale);
  ctx.rotate(state.tasselAngleCenter * 0.9);
  ctx.scale(scale, scale);

  // Connecting red silk cord
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 14);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#b80018';
  ctx.stroke();

  // Brass Coin
  const coinY = 28;
  const coinR = 20;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  ctx.beginPath();
  ctx.arc(0, coinY, coinR, 0, Math.PI * 2);
  const coinGrad = ctx.createRadialGradient(-4, coinY - 4, 3, 0, coinY, coinR);
  coinGrad.addColorStop(0, '#fef08a');
  coinGrad.addColorStop(0.3, '#ca8a04');
  coinGrad.addColorStop(0.7, '#854d0e');
  coinGrad.addColorStop(1, '#422006');
  ctx.fillStyle = coinGrad;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#fef9c3';
  ctx.stroke();

  // Raised Rim
  ctx.beginPath();
  ctx.arc(0, coinY, coinR - 2.5, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#713f12';
  ctx.stroke();

  // Square Hole
  const sqSize = 8;
  ctx.fillStyle = '#0f1117';
  ctx.fillRect(-sqSize / 2, coinY - sqSize / 2, sqSize, sqSize);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#fef08a';
  ctx.strokeRect(-sqSize / 2, coinY - sqSize / 2, sqSize, sqSize);

  // Auspicious embossed four dots/characters (North, South, East, West)
  ctx.fillStyle = '#fef9c3';
  ctx.beginPath();
  ctx.arc(0, coinY - 12, 1.6, 0, Math.PI * 2); // Top
  ctx.arc(0, coinY + 12, 1.6, 0, Math.PI * 2); // Bottom
  ctx.arc(-12, coinY, 1.6, 0, Math.PI * 2);    // Left
  ctx.arc(12, coinY, 1.6, 0, Math.PI * 2);     // Right
  ctx.fill();
  ctx.restore();

  // 4. Flowing Silk Double Tassel
  ctx.translate(0, coinY + coinR + 2);
  ctx.rotate(state.tasselAngleCenter * 0.3);

  // Tassel golden binding knot
  ctx.beginPath();
  ctx.arc(0, 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ca8a04';
  ctx.fill();
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-4, 4, 8, 3);

  // Flowing double tassel skirt
  const tasselLen = 38;
  ctx.lineWidth = 1.3;
  for (let i = -6; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 0.8, 7);
    ctx.quadraticCurveTo(i * 1.5, tasselLen * 0.5, i * 2.2, tasselLen);
    ctx.strokeStyle = Math.abs(i) % 2 === 0 ? '#b91c1c' : '#ef4444';
    ctx.stroke();
  }

  ctx.restore();
}
