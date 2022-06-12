/*
Adapted from s2-geometry

ISC License (ISC)

Copyright (c) 2012-2016, Jon Atkins <github@jonatkins.com>
Copyright (c) 2016, AJ ONeal <aj@daplie.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import Long from 'long';

//
// Functional Style
//
const FACE_BITS = 3;
const MAX_LEVEL = 30;
const POS_BITS = 2 * MAX_LEVEL + 1; // 61 (60 bits of data, 1 bit lsb marker)
const RADIAN_TO_DEGREE = 180 / Math.PI;

export function IJToST(
  ij: [number, number],
  order: number,
  offsets: [number, number]
): [number, number] {
  const maxSize = 1 << order;

  return [(ij[0] + offsets[0]) / maxSize, (ij[1] + offsets[1]) / maxSize];
}

function singleSTtoUV(st: number): number {
  if (st >= 0.5) {
    return (1 / 3.0) * (4 * st * st - 1);
  }
  return (1 / 3.0) * (1 - 4 * (1 - st) * (1 - st));
}

export function STToUV(st: [number, number]): [number, number] {
  return [singleSTtoUV(st[0]), singleSTtoUV(st[1])];
}

export function FaceUVToXYZ(face: number, [u, v]: [number, number]): [number, number, number] {
  switch (face) {
    case 0:
      return [1, u, v];
    case 1:
      return [-u, 1, v];
    case 2:
      return [-u, -v, 1];
    case 3:
      return [-1, -v, -u];
    case 4:
      return [v, -1, -u];
    case 5:
      return [v, u, -1];
    default:
      throw new Error('Invalid face');
  }
}

export function XYZToLngLat([x, y, z]: [number, number, number]): [number, number] {
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lng = Math.atan2(y, x);

  return [lng * RADIAN_TO_DEGREE, lat * RADIAN_TO_DEGREE];
}

export function toHilbertQuadkey(idS: string): string {
  let bin = Long.fromString(idS, true, 10).toString(2);

  while (bin.length < FACE_BITS + POS_BITS) {
    // eslint-disable-next-line prefer-template
    bin = '0' + bin;
  }

  // MUST come AFTER binstr has been left-padded with '0's
  const lsbIndex = bin.lastIndexOf('1');
  // substr(start, len)
  // substring(start, end) // includes start, does not include end
  const faceB = bin.substring(0, 3);
  // posB will always be a multiple of 2 (or it's invalid)
  const posB = bin.substring(3, lsbIndex);
  const levelN = posB.length / 2;

  const faceS = Long.fromString(faceB, true, 2).toString(10);
  let posS = Long.fromString(posB, true, 2).toString(4);

  while (posS.length < levelN) {
    // eslint-disable-next-line prefer-template
    posS = '0' + posS;
  }

  return `${faceS}/${posS}`;
}

function rotateAndFlipQuadrant(n: number, point: [number, number], rx: number, ry: number): void {
  if (ry === 0) {
    if (rx === 1) {
      point[0] = n - 1 - point[0];
      point[1] = n - 1 - point[1];
    }

    const x = point[0];
    point[0] = point[1];
    point[1] = x;
  }
}

export function FromHilbertQuadKey(hilbertQuadkey: string): {
  face: number;
  ij: [number, number];
  level: number;
} {
  const parts = hilbertQuadkey.split('/');
  const face = parseInt(parts[0], 10);
  const position = parts[1];
  const maxLevel = position.length;
  const point = [0, 0] as [number, number];
  let level;

  for (let i = maxLevel - 1; i >= 0; i--) {
    level = maxLevel - i;
    const bit = position[i];
    let rx = 0;
    let ry = 0;
    if (bit === '1') {
      ry = 1;
    } else if (bit === '2') {
      rx = 1;
      ry = 1;
    } else if (bit === '3') {
      rx = 1;
    }

    const val = Math.pow(2, level - 1);
    rotateAndFlipQuadrant(val, point, rx, ry);

    point[0] += val * rx;
    point[1] += val * ry;
  }

  if (face % 2 === 1) {
    const t = point[0];
    point[0] = point[1];
    point[1] = t;
  }

  return {face, ij: point, level};
}
