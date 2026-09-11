import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, '../build');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPng(width, height, drawFn) {
  // Raw scanline buffer: each row starts with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcBuf);
  buf.writeUInt32BE(crc, 8 + len);

  return buf;
}

function createIco(pngBuffers) {
  // Use highest-res 256x256 PNG
  const png = pngBuffers[0];
  const count = 1;

  // ICO header (6 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type (1 = ICO)
  header.writeUInt16LE(count, 4); // 1 image

  // Directory entry (16 bytes)
  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0); // Width 256
  entry.writeUInt8(0, 1); // Height 256
  entry.writeUInt8(0, 2); // Colors (0 = 256+)
  entry.writeUInt8(0, 3); // Reserved
  entry.writeUInt16LE(1, 4); // Planes
  entry.writeUInt16LE(32, 6); // Bit count
  entry.writeUInt32LE(png.length, 8); // Bytes in res
  entry.writeUInt32LE(6 + 16, 12); // Offset to image data

  return Buffer.concat([header, entry, png]);
}

// 1. Draw 256x256 App Icon: Radiant Crimson & Gold Lucky Charm Medallion
const appIconPng = createPng(256, 256, (x, y, w, h) => {
  const cx = 128;
  const cy = 128;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Rounded squircle container
  const cornerR = 56;
  const inBox = (Math.abs(dx) <= 120 && Math.abs(dy) <= 120);
  const cornerDist = Math.hypot(
    Math.max(0, Math.abs(dx) - (120 - cornerR)),
    Math.max(0, Math.abs(dy) - (120 - cornerR))
  );
  if (cornerDist > cornerR) return [0, 0, 0, 0];

  // Dark obsidian-crimson background
  let r = 26;
  let g = 8;
  let b = 12;
  let a = 255;

  // Gold border
  if (cornerDist >= cornerR - 4 || (cornerDist <= 0 && (Math.abs(dx) >= 116 || Math.abs(dy) >= 116))) {
    return [230, 180, 34, 255];
  }

  // Hanging String
  if (Math.abs(dx) <= 2 && y <= 60) {
    return [230, 180, 34, 255];
  }

  // Top Golden Bead
  const distB1 = Math.hypot(x - 128, y - 48);
  if (distB1 <= 9) {
    const shine = Math.max(0, 1 - Math.hypot(x - 125, y - 45) / 9);
    return [
      Math.min(255, 230 + shine * 50),
      Math.min(255, 180 + shine * 70),
      Math.min(255, 34 + shine * 150),
      255
    ];
  }

  // Center Red Barrel Bead
  const distB2 = Math.hypot((x - 128) * 1.1, y - 72);
  if (distB2 <= 13) {
    if (Math.abs(y - 72) <= 2) return [240, 200, 70, 255]; // Gold waist band
    const shine = Math.max(0, 1 - Math.hypot(x - 124, y - 68) / 12);
    return [
      Math.min(255, 200 + shine * 55),
      Math.min(255, 10 + shine * 60),
      Math.min(255, 30 + shine * 80),
      255
    ];
  }

  // Lower Golden Bead
  const distB3 = Math.hypot(x - 128, y - 96);
  if (distB3 <= 8) {
    return [240, 190, 40, 255];
  }

  // Connector Ring
  const distRing = Math.hypot(x - 128, y - 112);
  if (distRing <= 8 && distRing >= 5) {
    return [230, 180, 34, 255];
  }

  // Main Medallion center at (128, 168)
  const mdx = x - 128;
  const mdy = y - 168;
  const mDist = Math.hypot(mdx, mdy);

  // Outer gold scalloped ring
  if (mDist <= 46 && mDist >= 36) {
    const angle = Math.atan2(mdy, mdx);
    const petalWave = Math.sin(angle * 16) * 3;
    if (mDist <= 43 + petalWave) {
      return [235, 190, 45, 255];
    }
  }

  // Crimson enamel disk
  if (mDist < 36 && mDist >= 14) {
    const angle = Math.atan2(mdy, mdx);
    const mandalaLotus = Math.abs(Math.sin(angle * 4)) * 4;
    if (Math.abs(mDist - 24) <= 1.2 || Math.abs(mDist - (20 + mandalaLotus)) <= 1.2) {
      return [255, 235, 140, 255]; // Golden filigree line
    }
    return [180, 12, 35, 255]; // Deep ruby enamel
  }

  // Center gold setting & ruby gem
  if (mDist < 14) {
    if (mDist >= 11) return [240, 190, 40, 255]; // Gold bezel
    const shine = Math.max(0, 1 - Math.hypot(mdx + 3, mdy + 3) / 10);
    return [
      Math.min(255, 220 + shine * 35),
      Math.min(255, 15 + shine * 80),
      Math.min(255, 45 + shine * 100),
      255
    ];
  }

  // Hanging bells
  if (y >= 215 && y <= 235 && Math.abs(mdx) <= 35) {
    if (Math.hypot(mdx, y - 225) <= 7 || Math.hypot(mdx - 24, y - 220) <= 5.5 || Math.hypot(mdx + 24, y - 220) <= 5.5) {
      return [230, 180, 34, 255];
    }
    if (Math.abs(mdx) <= 1.5 || Math.abs(mdx - 24) <= 1.2 || Math.abs(mdx + 24) <= 1.2) {
      return [200, 150, 30, 255];
    }
  }

  return [r, g, b, a];
});

fs.writeFileSync(path.join(buildDir, 'icon.png'), appIconPng);
console.log('Saved build/icon.png (256x256)');

// 2. Generate ICO file
const icoBuffer = createIco([appIconPng]);
fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
console.log('Saved build/icon.ico');

// 3. Generate 32x32 Tray Icon: Golden lucky charm silhouette
const trayIconPng = createPng(32, 32, (x, y) => {
  const cx = 16;
  const cy = 18;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy);

  // Hanging cord
  if (Math.abs(dx) <= 0.8 && y <= 8) {
    return [254, 240, 138, 255];
  }

  // Top bead
  if (Math.hypot(dx, y - 6) <= 2) {
    return [254, 240, 138, 255];
  }

  // Center red bead
  if (Math.hypot(dx, y - 10) <= 3) {
    return [239, 68, 68, 255];
  }

  // Medallion
  if (dist <= 8) {
    if (dist >= 6) return [234, 179, 8, 255];
    if (dist >= 3) return [185, 28, 28, 255];
    return [254, 240, 138, 255];
  }

  // Hanging bell / tassel
  if (y >= 26 && y <= 30 && Math.abs(dx) <= 2) {
    return [234, 179, 8, 255];
  }

  return [0, 0, 0, 0];
});

fs.writeFileSync(path.join(buildDir, 'tray-icon.png'), trayIconPng);
console.log('Saved build/tray-icon.png (32x32)');
