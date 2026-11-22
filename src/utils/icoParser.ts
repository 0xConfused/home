// SPDX-License-Identifier: AGPL-3.0-or-later

export interface IcoFrame {
  width: number;
  height: number;
  bpp: number;
  bytes: number;
  dataUrl: string;
}

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function isPngSlice(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIG.length) return false;
  for (let i = 0; i < PNG_SIG.length; i++) {
    if (bytes[i] !== PNG_SIG[i]) return false;
  }
  return true;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function parseIcoFrames(buffer: ArrayBuffer): IcoFrame[] {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  if (buffer.byteLength < 6) {
    return [];
  }

  const reserved = view.getUint16(0, true);
  const type = view.getUint16(2, true);
  const count = view.getUint16(4, true);

  if (reserved !== 0 || (type !== 1 && type !== 2) || count === 0) {
    return [];
  }

  const frames: IcoFrame[] = [];

  for (let i = 0; i < count; i++) {
    const dirOffset = 6 + i * 16;
    if (dirOffset + 16 > buffer.byteLength) break;

    const width = view.getUint8(dirOffset) || 256;
    const height = view.getUint8(dirOffset + 1) || 256;
    const dirBpp = view.getUint16(dirOffset + 6, true);
    const size = view.getUint32(dirOffset + 8, true);
    const imgOffset = view.getUint32(dirOffset + 12, true);

    if (imgOffset + size > buffer.byteLength) continue;

    const slice = bytes.subarray(imgOffset, imgOffset + size);

    if (isPngSlice(slice)) {
      frames.push({
        width,
        height,
        bpp: dirBpp || 32,
        bytes: size,
        dataUrl: `data:image/png;base64,${uint8ToBase64(slice)}`,
      });
      continue;
    }

    if (size < 40) continue;
    const biSize = view.getUint32(imgOffset, true);
    const biBitCount = view.getUint16(imgOffset + 14, true);
    const biCompression = view.getUint32(imgOffset + 16, true);

    if (biSize < 40 || biBitCount !== 32 || biCompression !== 0) {
      continue;
    }

    const pixelOffset = imgOffset + biSize;
    const xorSize = width * height * 4;
    if (pixelOffset + xorSize > buffer.byteLength) continue;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    const imageData = ctx.createImageData(width, height);
    const dst = imageData.data;

    let hasAlpha = false;
    for (let p = 0; p < width * height; p++) {
      if (bytes[pixelOffset + p * 4 + 3] !== 0) {
        hasAlpha = true;
        break;
      }
    }

    const andOffset = pixelOffset + xorSize;
    const andRowStride = Math.ceil(width / 32) * 4;

    for (let y = 0; y < height; y++) {
      const srcRow = height - 1 - y;
      for (let x = 0; x < width; x++) {
        const s = pixelOffset + (srcRow * width + x) * 4;
        const d = (y * width + x) * 4;

        dst[d] = bytes[s + 2];
        dst[d + 1] = bytes[s + 1];
        dst[d + 2] = bytes[s];

        if (hasAlpha) {
          dst[d + 3] = bytes[s + 3];
        } else {
          const andByteIndex = andOffset + srcRow * andRowStride + (x >> 3);
          const bit = andByteIndex < buffer.byteLength ? (bytes[andByteIndex] >> (7 - (x & 7))) & 1 : 0;
          dst[d + 3] = bit === 0 ? 255 : 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    frames.push({
      width,
      height,
      bpp: biBitCount,
      bytes: size,
      dataUrl: canvas.toDataURL('image/png'),
    });
  }

  return frames;
}
