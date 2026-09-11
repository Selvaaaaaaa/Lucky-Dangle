import { PendulumState } from '../physics/pendulum';
import blueNazarSrc from '../../assets/charms/blue-nazar.png';
import hornedMaskSrc from '../../assets/charms/horned-mask.png';

export interface ImageCropBounds {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface ImageCharmConfig {
  id: 'blue-nazar' | 'horned-mask';
  name: string;
  image: HTMLImageElement;
  scale: number;
  offsetX: number;
  offsetY: number;
  anchorOffset: number;
  rotationOffset: number;
  crop: ImageCropBounds;
  hitRadius: number;
  hitHeight: number;
}

// Pre-load and cache transparent PNG image assets
const blueNazarImg = new Image();
blueNazarImg.src = blueNazarSrc;

const hornedMaskImg = new Image();
hornedMaskImg.src = hornedMaskSrc;

export const IMAGE_CHARM_CONFIGS: Record<'blue-nazar' | 'horned-mask', ImageCharmConfig> = {
  'blue-nazar': {
    id: 'blue-nazar',
    name: 'Blue Nazar Eye',
    image: blueNazarImg,
    scale: 0.54,
    offsetX: 0,
    offsetY: 0,
    anchorOffset: 2,
    rotationOffset: 0,
    // Cropped to visible non-transparent glass amulet & top brass hanging loop
    crop: {
      sx: 160,
      sy: 290,
      sw: 162,
      sh: 176
    },
    hitRadius: 48,
    hitHeight: 96
  },
  'horned-mask': {
    id: 'horned-mask',
    name: 'Drishti Bommai',
    image: hornedMaskImg,
    scale: 0.50,
    offsetX: -2.5,
    offsetY: 0,
    anchorOffset: 0,
    rotationOffset: 0,
    // Cropped to visible non-transparent horned mask with earrings and tongue
    crop: {
      sx: 164,
      sy: 245,
      sw: 181,
      sh: 242
    },
    hitRadius: 52,
    hitHeight: 120
  }
};

/**
 * Draws the real transparent PNG charm artwork onto the canvas at (cx, cy)
 * using the existing pendulum physics (tilt, rotation, scaling) and DPI support.
 */
export function drawImageCharm(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  state: PendulumState,
  charmId: 'blue-nazar' | 'horned-mask',
  previewScale: number = 1.0,
  userCharmScale: number = 1.0
): { hitRadius: number; hitHeight: number; cyOffset: number } {
  const config = IMAGE_CHARM_CONFIGS[charmId];
  const img = config.image;
  const effectiveScale = previewScale * userCharmScale;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(state.charmAngle + config.rotationOffset);
  // Strictly preserve original aspect ratio: scaleX === scaleY
  ctx.scale(effectiveScale * config.scale, effectiveScale * config.scale);

  const { sx, sy, sw, sh } = config.crop;
  const dx = -sw / 2 + config.offsetX;
  const dy = -config.anchorOffset + config.offsetY;

  // High-quality image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Soft atmospheric drop shadow behind the charm for depth
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;
  ctx.shadowOffsetX = 2;

  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh);
  } else {
    // If still decoding first frame, draw as soon as available
    img.onload = () => {
      // Will be rendered on next animation frame
    };
  }
  ctx.restore();

  ctx.restore();

  // Dynamic hit boundaries scaled with charm dimensions
  const renderedWidth = sw * config.scale * effectiveScale;
  const renderedHeight = sh * config.scale * effectiveScale;
  const cyOffset = (renderedHeight / 2);

  return {
    hitRadius: Math.max(renderedWidth / 2, 45 * effectiveScale),
    hitHeight: renderedHeight,
    cyOffset
  };
}
