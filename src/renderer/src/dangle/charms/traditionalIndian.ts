import { PendulumState } from '../physics/pendulum';

export function drawTraditionalIndian(
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

  // 1. Top connection loop/ring
  ctx.save();
  const ringGrad = ctx.createLinearGradient(-10, -56, 10, -40);
  ringGrad.addColorStop(0, '#fff2a3');
  ringGrad.addColorStop(0.4, '#e6b422');
  ringGrad.addColorStop(0.8, '#b3820f');
  ringGrad.addColorStop(1, '#664604');

  ctx.beginPath();
  ctx.arc(0, -48, 8, 0, Math.PI * 2);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = ringGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  ctx.stroke();
  ctx.restore();

  // 2. Drop shadow for entire main medallion
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;

  // Outer Gold Scalloped Petals (16 petals)
  const outerRadius = 45;
  const numPetals = 16;
  ctx.beginPath();
  for (let i = 0; i < numPetals; i++) {
    const angle = (i * Math.PI * 2) / numPetals;
    const nextAngle = ((i + 1) * Math.PI * 2) / numPetals;
    const midAngle = (angle + nextAngle) / 2;
    const px = Math.cos(angle) * (outerRadius - 4);
    const py = Math.sin(angle) * (outerRadius - 4);
    const tipX = Math.cos(midAngle) * outerRadius;
    const tipY = Math.sin(midAngle) * outerRadius;

    if (i === 0) ctx.moveTo(px, py);
    ctx.quadraticCurveTo(tipX, tipY, Math.cos(nextAngle) * (outerRadius - 4), Math.sin(nextAngle) * (outerRadius - 4));
  }
  ctx.closePath();

  const goldGrad = ctx.createRadialGradient(0, -10, 5, 0, 0, 48);
  goldGrad.addColorStop(0, '#fff5b8');
  goldGrad.addColorStop(0.3, '#f5c531');
  goldGrad.addColorStop(0.65, '#c59218');
  goldGrad.addColorStop(1, '#7a5205');
  ctx.fillStyle = goldGrad;
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#fff8cc';
  ctx.stroke();
  ctx.restore();

  // 3. Beaded Gold Border Ring
  ctx.save();
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    const bx = Math.cos(angle) * 38;
    const by = Math.sin(angle) * 38;
    ctx.beginPath();
    ctx.arc(bx, by, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff099';
    ctx.fill();
  }
  ctx.restore();

  // 4. Crimson Enamel Disc
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  const crimsonGrad = ctx.createRadialGradient(-8, -10, 2, 0, 0, 36);
  crimsonGrad.addColorStop(0, '#ff4d6d');
  crimsonGrad.addColorStop(0.35, '#c9184a');
  crimsonGrad.addColorStop(0.7, '#800f2f');
  crimsonGrad.addColorStop(1, '#4a0418');
  ctx.fillStyle = crimsonGrad;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#d4af37';
  ctx.stroke();
  ctx.restore();

  // 5. Traditional Golden Mandala Filigree Pattern
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 235, 150, 0.85)';
  ctx.lineWidth = 1.6;
  ctx.shadowColor = 'rgba(128, 15, 47, 0.6)';
  ctx.shadowBlur = 2;

  // 8 Petal Lotus Inner Mandala
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    ctx.save();
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(10, -18, 0, -28);
    ctx.quadraticCurveTo(-10, -18, 0, -6);
    ctx.stroke();

    // Small interior dot
    ctx.beginPath();
    ctx.arc(0, -18, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff4b3';
    ctx.fill();

    ctx.restore();
  }
  ctx.restore();

  // 6. Central Ruby Cabochon with Gold Setting
  ctx.save();
  // Gold bezel
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fillStyle = goldGrad;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#5a3d02';
  ctx.stroke();

  // Faceted / Domed Ruby Jewel
  ctx.beginPath();
  ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
  const rubyGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 9);
  rubyGrad.addColorStop(0, '#ff99a8');
  rubyGrad.addColorStop(0.4, '#e60039');
  rubyGrad.addColorStop(0.8, '#80001f');
  rubyGrad.addColorStop(1, '#33000c');
  ctx.fillStyle = rubyGrad;
  ctx.fill();

  // Bright specular glint
  ctx.beginPath();
  ctx.arc(-2.8, -2.8, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fill();
  ctx.restore();

  ctx.restore(); // Exit main medallion rotation

  // 7. Hanging Chains & Chiming Bells / Tassels (Tertiary Motion)
  // Center Ghungroo Bell & Silk Tassel
  ctx.save();
  ctx.translate(cx, cy + 42 * scale);
  ctx.rotate(state.tasselAngleCenter);
  ctx.scale(scale, scale);

  // Center Chain
  ctx.strokeStyle = '#c59218';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 18);
  ctx.stroke();

  // Little Golden Ghungroo Bell
  drawBell(ctx, 0, 20, 9, '#e6b422');

  // Red Silk Tassel below bell
  drawTassel(ctx, 0, 31, 24, '#d90429', '#ffccd5');
  ctx.restore();

  // Left Hanging Bell
  ctx.save();
  ctx.translate(cx - 24 * scale, cy + 34 * scale);
  ctx.rotate(state.tasselAngleLeft);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#c59218';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 14);
  ctx.stroke();

  drawBell(ctx, 0, 16, 7.5, '#e6b422');
  drawTassel(ctx, 0, 25, 18, '#b22222', '#ff9999');
  ctx.restore();

  // Right Hanging Bell
  ctx.save();
  ctx.translate(cx + 24 * scale, cy + 34 * scale);
  ctx.rotate(state.tasselAngleRight);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#c59218';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 14);
  ctx.stroke();

  drawBell(ctx, 0, 16, 7.5, '#e6b422');
  drawTassel(ctx, 0, 25, 18, '#b22222', '#ff9999');
  ctx.restore();
}

function drawBell(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.translate(x, y);

  const bellGrad = ctx.createLinearGradient(-r, 0, r, 0);
  bellGrad.addColorStop(0, '#fff4b3');
  bellGrad.addColorStop(0.3, color);
  bellGrad.addColorStop(0.8, '#845b08');
  bellGrad.addColorStop(1, '#4a3203');

  ctx.beginPath();
  ctx.moveTo(-r * 0.8, 0);
  ctx.quadraticCurveTo(-r * 0.9, -r * 0.9, 0, -r * 0.9);
  ctx.quadraticCurveTo(r * 0.9, -r * 0.9, r * 0.8, 0);
  ctx.quadraticCurveTo(r * 0.9, r * 0.8, 0, r * 0.85);
  ctx.quadraticCurveTo(-r * 0.9, r * 0.8, -r * 0.8, 0);
  ctx.fillStyle = bellGrad;
  ctx.fill();

  // Rim slit
  ctx.beginPath();
  ctx.arc(0, r * 0.3, r * 0.35, 0, Math.PI);
  ctx.strokeStyle = '#3a2503';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Little clapper bead
  ctx.beginPath();
  ctx.arc(0, r * 0.6, r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#ff4d6d';
  ctx.fill();

  ctx.restore();
}

function drawTassel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  color: string,
  highlight: string
) {
  ctx.save();
  ctx.translate(x, y);

  // Tassel head bead
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#e6b422';
  ctx.fill();

  // Golden thread collar
  ctx.fillStyle = '#fff099';
  ctx.fillRect(-2.5, 2, 5, 2.5);

  // Flowing silk threads
  ctx.lineWidth = 1.2;
  const numThreads = 9;
  for (let i = 0; i < numThreads; i++) {
    const offset = (i - (numThreads - 1) / 2) * 1.8;
    ctx.beginPath();
    ctx.moveTo(offset * 0.4, 4);
    ctx.quadraticCurveTo(offset * 0.8, length * 0.5, offset * 1.3, length);
    ctx.strokeStyle = i % 2 === 0 ? color : highlight;
    ctx.stroke();
  }

  ctx.restore();
}
