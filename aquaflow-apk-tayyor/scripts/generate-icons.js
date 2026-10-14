import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate a valid uncompressed/deflated PNG buffer
function createPng(width, height, drawPixel) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw pixel data: each scanline starts with a filter byte (0)
  const rawScanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(rawScanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawScanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Deflate pixel data
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuffer, data]);

  const crc = crc32(typeAndData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeAndData, crcBuffer]);
}

// CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c;
  }

  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// Pixel drawer for AquaFlow water drop icon
function drawAquaFlowIcon(x, y, width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const nx = (x - cx) / (width / 2); // -1 to 1
  const ny = (y - cy) / (height / 2); // -1 to 1

  // Background: squircle or solid for maskable
  let inBg = true;
  if (!isMaskable) {
    // Squircle r = 0.85
    const p = Math.pow(Math.abs(nx), 3.5) + Math.pow(Math.abs(ny), 3.5);
    inBg = p <= 0.85;
  }

  if (!inBg) {
    return [0, 0, 0, 0]; // Transparent outside icon bounds
  }

  // Background Gradient: Sky blue (#0284c7) to deep blue (#075985)
  const gradT = (ny + 1) / 2;
  let bgR = Math.round(2 * (1 - gradT) + 7 * gradT);
  let bgG = Math.round(132 * (1 - gradT) + 89 * gradT);
  let bgB = Math.round(199 * (1 - gradT) + 133 * gradT);

  // Check if inside water droplet
  // Water droplet parametric / formula
  const dropScale = isMaskable ? 0.6 : 0.72;
  const dx = nx / dropScale;
  const dy = (ny + 0.12) / dropScale; // shift up slightly

  let inDrop = false;
  // Lower rounded body (circle at dy = 0.25, r = 0.45)
  const distCircle = Math.sqrt(dx * dx + (dy - 0.25) * (dy - 0.25));
  if (distCircle <= 0.46) {
    inDrop = true;
  }
  // Upper triangular point towards (0, -0.65)
  if (dy >= -0.65 && dy <= 0.3) {
    const halfWidth = 0.46 * ((dy + 0.65) / 0.95);
    if (Math.abs(dx) <= halfWidth) {
      inDrop = true;
    }
  }

  if (inDrop) {
    // Water gradient: Bright cyan/sky (#38bdf8) to medium blue (#0284c7)
    const dropT = (dy + 0.65) / 1.1;
    let drR = Math.round(56 * (1 - dropT) + 2 * dropT);
    let drG = Math.round(189 * (1 - dropT) + 132 * dropT);
    let drB = Math.round(248 * (1 - dropT) + 199 * dropT);

    // Inner highlight / shine reflection
    if (dx < -0.05 && dy < 0.25 && dy > -0.45) {
      const shineDist = Math.abs(dx - (-0.18));
      if (shineDist < 0.12) {
        drR = Math.min(255, drR + 80);
        drG = Math.min(255, drG + 60);
        drB = Math.min(255, drB + 20);
      }
    }

    return [drR, drG, drB, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
console.log('Generating pwa-192x192.png...');
const png192 = createPng(192, 192, (x, y, w, h) => drawAquaFlowIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// Generate 512x512
console.log('Generating pwa-512x512.png...');
const png512 = createPng(512, 512, (x, y, w, h) => drawAquaFlowIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// Generate maskable 512x512 (with safe margins)
console.log('Generating pwa-maskable-512x512.png...');
const pngMaskable512 = createPng(512, 512, (x, y, w, h) => drawAquaFlowIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);

// Generate apple-touch-icon.png (180x180)
console.log('Generating apple-touch-icon.png...');
const pngApple = createPng(180, 180, (x, y, w, h) => drawAquaFlowIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

// Generate favicon.ico / png (64x64)
console.log('Generating favicon.png...');
const pngFavicon = createPng(64, 64, (x, y, w, h) => drawAquaFlowIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), pngFavicon);

console.log('All icons generated successfully in /public!');
