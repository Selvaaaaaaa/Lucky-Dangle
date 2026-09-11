import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const html = `<!DOCTYPE html><html><body style="background:#11111b;margin:0;"><canvas id="cv" width="1600" height="900"></canvas></body></html>`;
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

  const artifactDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/bd67338c-44ce-4b94-a35d-29379fc1df3b';
  const nazarPath = path.resolve('src/renderer/src/assets/charms/blue-nazar.png');
  const maskPath = path.resolve('src/renderer/src/assets/charms/horned-mask.png');

  const nazarDataUrl = 'data:image/png;base64,' + fs.readFileSync(nazarPath).toString('base64');
  const maskDataUrl = 'data:image/png;base64,' + fs.readFileSync(maskPath).toString('base64');

  const dataUri = await win.webContents.executeJavaScript(`
    (async () => {
      const cv = document.getElementById('cv');
      const ctx = cv.getContext('2d');

      const loadImg = (dataUri) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = dataUri;
      });

      const imgNazar = await loadImg('${nazarDataUrl}');
      const imgMask = await loadImg('${maskDataUrl}');

      ctx.fillStyle = '#181825';
      ctx.fillRect(0, 0, 1600, 900);

      // Top screen edge line
      ctx.strokeStyle = '#45475a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(1600, 30);
      ctx.stroke();

      ctx.fillStyle = '#a6adc8';
      ctx.font = '12px sans-serif';
      ctx.fillText('TOP OF SCREEN (y = 0)', 20, 24);

      const CHARM_ATTACHMENTS = {
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
          visualTopOffset: 3,
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

      function drawContinuousCord(ctx, x0, y0, x1, y1, scale = 1.0) {
        ctx.save();
        
        // 1. Soft shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4 * scale;
        ctx.shadowOffsetX = 1.5 * scale;
        ctx.shadowOffsetY = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(x0, y0 - 10);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = 3.8 * scale;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // 2. Dark bronze outer border
        ctx.beginPath();
        ctx.moveTo(x0, y0 - 10);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = 3.8 * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#4e3314';
        ctx.stroke();

        // 3. Warm golden satin body
        ctx.beginPath();
        ctx.moveTo(x0, y0 - 10);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = 2.4 * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#cda233';
        ctx.stroke();

        // 4. Center spun gold highlight
        ctx.beginPath();
        ctx.moveTo(x0 - 0.4 * scale, y0 - 10);
        ctx.lineTo(x1 - 0.4 * scale, y1);
        ctx.lineWidth = 1.1 * scale;
        ctx.strokeStyle = '#fef08a';
        ctx.stroke();

        // 5. Subtle woven silk spiral texture
        const dx = x1 - x0;
        const dy = y1 - y0;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const step = 6 * scale;
        const count = Math.floor(dist / step);

        ctx.save();
        ctx.translate(x0, y0);
        ctx.rotate(angle);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.lineWidth = 1.0 * scale;

        for (let i = 0; i < count; i++) {
          const px = i * step;
          ctx.beginPath();
          ctx.moveTo(px - 1.5 * scale, -1.4 * scale);
          ctx.lineTo(px + 1.5 * scale, 1.4 * scale);
          ctx.stroke();
        }
        ctx.restore();

        ctx.restore();
      }

      function drawGoldenBead(ctx, x, y, r) {
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
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.35, r * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        ctx.restore();
      }

      function drawDecorativeBead(ctx, x, y, r, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * 1.15, 0, 0, Math.PI * 2);
        const rubyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r * 1.2);
        rubyGrad.addColorStop(0, '#ff6b81');
        rubyGrad.addColorStop(0.35, '#dc2626');
        rubyGrad.addColorStop(0.7, '#7f1d1d');
        rubyGrad.addColorStop(1, '#450a0a');
        ctx.fillStyle = rubyGrad;
        ctx.fill();
        ctx.beginPath();
        ctx.rect(-r * 0.9, -1.8, r * 1.8, 3.6);
        const goldBand = ctx.createLinearGradient(-r, 0, r, 0);
        goldBand.addColorStop(0, '#fef08a');
        goldBand.addColorStop(0.5, '#eab308');
        goldBand.addColorStop(1, '#713f12');
        ctx.fillStyle = goldBand;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -r * 1.1, 3.5, 0, Math.PI * 2);
        ctx.arc(0, r * 1.1, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#eab308';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.3, r * 0.35, r * 0.2, -0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();
        ctx.restore();
      }

      function drawCharmArtwork(ctx, charmId, userCharmScale) {
        const att = CHARM_ATTACHMENTS[charmId];
        ctx.save();
        // Artwork scales DOWNWARD from attachment point
        ctx.scale(userCharmScale, userCharmScale);
        ctx.translate(-att.attachmentX, -att.attachmentY);

        if (charmId === 'horned-mask') {
          const sx = 164, sy = 245, sw = 181, sh = 242;
          const s = 0.50;
          const dx = -93 * s;
          const dy = 0;
          ctx.drawImage(imgMask, sx, sy, sw, sh, dx, dy, sw * s, sh * s);
        } else if (charmId === 'blue-nazar') {
          const sx = 160, sy = 290, sw = 162, sh = 176;
          const s = 0.54;
          const dx = -(sw / 2) * s;
          const dy = -2 * s;
          ctx.drawImage(imgNazar, sx, sy, sw, sh, dx, dy, sw * s, sh * s);
        } else {
          // Vector charms: ring at (0, -48)
          ctx.beginPath();
          ctx.arc(0, -48, 8, 0, Math.PI * 2);
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = '#e6b422';
          ctx.stroke();

          // Body
          ctx.beginPath();
          ctx.arc(0, 0, 44, 0, Math.PI * 2);
          ctx.fillStyle = charmId === 'ganesha' ? '#b45309' : charmId === 'mystic-knot' ? '#b91c1c' : '#1e3a8a';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#e6b422';
          ctx.stroke();

          // Bells
          ctx.beginPath();
          ctx.arc(0, 56, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#eab308';
          ctx.fill();
        }
        ctx.restore();
      }

      function renderCharmSetup(cx, topY, charmY, charmId, userCharmScale, label) {
        const att = CHARM_ATTACHMENTS[charmId];
        const beadScale = Math.min(1.2, Math.max(0.85, Math.sqrt(userCharmScale)));

        // 1. Continuous rope to attachment point (charmY)
        drawContinuousCord(ctx, cx, topY, cx, charmY, 1.0);

        // 2. 3 Beads positioned using connectorLength
        const s3 = charmY - att.connectorLength * beadScale;
        const s2 = s3 - 22 * beadScale;
        const s1 = s2 - 22 * beadScale;

        drawGoldenBead(ctx, cx, s1, 6.2 * beadScale);
        drawDecorativeBead(ctx, cx, s2, 9.2 * beadScale, 0);
        drawGoldenBead(ctx, cx, s3, 6.2 * beadScale);

        // 3. Charm attached at charmY and scaled around attachment point
        ctx.save();
        ctx.translate(cx, charmY);
        drawCharmArtwork(ctx, charmId, userCharmScale);
        ctx.restore();

        // Label
        ctx.fillStyle = '#cdd6f4';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, cx, charmY + (att.baseHeight * userCharmScale) + 30);
      }

      // ROW 1: All 6 Charms at 100% scale
      const topY = 30;
      const charmY1 = 200;
      renderCharmSetup(130, topY, charmY1, 'mandala', 1.0, 'Mandala (100%)');
      renderCharmSetup(380, topY, charmY1, 'mystic-knot', 1.0, 'Mystic Knot (100%)');
      renderCharmSetup(630, topY, charmY1, 'ganesha', 1.0, 'Ganesha (100%)');
      renderCharmSetup(880, topY, charmY1, 'nazar', 1.0, 'Nazar Vector (100%)');
      renderCharmSetup(1130, topY, charmY1, 'blue-nazar', 1.0, 'Blue Nazar PNG (100%)');
      renderCharmSetup(1390, topY, charmY1, 'horned-mask', 1.0, 'Horned Mask PNG (100%)');

      // ROW 2: Size Slider Testing: 50%, 100%, 150% for Horned Mask & Blue Nazar
      const charmY2 = 540;
      ctx.fillStyle = '#fab387';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CHARM SIZE SLIDER TEST (50% vs 100% vs 150%) — FIXED ATTACHMENT POINT:', 30, 480);

      renderCharmSetup(160, 490, charmY2, 'horned-mask', 0.5, 'Horned Mask (50%)');
      renderCharmSetup(400, 490, charmY2, 'horned-mask', 1.0, 'Horned Mask (100%)');
      renderCharmSetup(670, 490, charmY2, 'horned-mask', 1.5, 'Horned Mask (150%)');

      renderCharmSetup(960, 490, charmY2, 'blue-nazar', 0.5, 'Blue Nazar (50%)');
      renderCharmSetup(1200, 490, charmY2, 'blue-nazar', 1.0, 'Blue Nazar (100%)');
      renderCharmSetup(1450, 490, charmY2, 'blue-nazar', 1.5, 'Blue Nazar (150%)');

      return cv.toDataURL('image/png');
    })()
  `);

  const base64Data = dataUri.replace(/^data:image\/png;base64,/, '');
  const outPath = path.join(artifactDir, 'rope_per_charm_geometry_test.png');
  fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
  console.log('Saved preview to', outPath);
  app.quit();
});
