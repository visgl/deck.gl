// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, test} from 'vitest';
import {
  PROCEDURAL_PATTERN_OFFSETS,
  PROCEDURAL_PATTERN_TEXELS_PER_PATTERN,
  PROCEDURAL_PATTERN_TYPES,
  packProceduralPatterns
} from '../../../modules/extensions/src/fill-style/procedural-pattern';

const COMPONENTS_PER_PATTERN = PROCEDURAL_PATTERN_TEXELS_PER_PATTERN * 2;

describe('packProceduralPatterns', () => {
  test('packs hatch and dot definitions into fixed-width records', () => {
    const packed = packProceduralPatterns({
      doubleLine: {type: 'hatch', angle: 45, strokeWidth: 2, gap: [4, 10]},
      crosshatch: {type: 'cross-hatch', angles: [0, 90], strokeWidth: 1, gap: 7},
      dots: {type: 'dots', radius: 2, gap: 8, angle: 30, skew: 20}
    });

    expect(packed.width).toBe(16);
    expect(packed.height).toBe(1);
    expect(packed.patternIndices.get('doubleLine')).toBe(1);
    expect(packed.patternIndices.get('crosshatch')).toBe(2);
    expect(packed.patternIndices.get('dots')).toBe(3);
    expect(Array.from(packed.data.slice(0, COMPONENTS_PER_PATTERN))).toEqual(
      new Array(COMPONENTS_PER_PATTERN).fill(0)
    );

    const doubleLineOffset = COMPONENTS_PER_PATTERN;
    expect(packed.data[doubleLineOffset + PROCEDURAL_PATTERN_OFFSETS.type]).toBe(
      PROCEDURAL_PATTERN_TYPES.hatch
    );
    expect(packed.data[doubleLineOffset + PROCEDURAL_PATTERN_OFFSETS.size]).toBe(2);
    expect(packed.data[doubleLineOffset + PROCEDURAL_PATTERN_OFFSETS.gap0]).toBe(4);
    expect(packed.data[doubleLineOffset + PROCEDURAL_PATTERN_OFFSETS.gap1]).toBe(10);
    expect(packed.data[doubleLineOffset + PROCEDURAL_PATTERN_OFFSETS.angle0]).toBeCloseTo(
      Math.PI / 4
    );
    expect(packed.data[doubleLineOffset + PROCEDURAL_PATTERN_OFFSETS.elementCount]).toBe(2);

    const crosshatchOffset = COMPONENTS_PER_PATTERN * 2;
    expect(packed.data[crosshatchOffset + PROCEDURAL_PATTERN_OFFSETS.type]).toBe(
      PROCEDURAL_PATTERN_TYPES.crossHatch
    );
    expect(packed.data[crosshatchOffset + PROCEDURAL_PATTERN_OFFSETS.angle1]).toBeCloseTo(
      Math.PI / 2
    );
    expect(packed.data[crosshatchOffset + PROCEDURAL_PATTERN_OFFSETS.elementCount]).toBe(2);

    const dotsOffset = COMPONENTS_PER_PATTERN * 3;
    expect(packed.data[dotsOffset + PROCEDURAL_PATTERN_OFFSETS.type]).toBe(
      PROCEDURAL_PATTERN_TYPES.dots
    );
    expect(packed.data[dotsOffset + PROCEDURAL_PATTERN_OFFSETS.size]).toBe(2);
    expect(packed.data[dotsOffset + PROCEDURAL_PATTERN_OFFSETS.gap0]).toBe(8);
    expect(packed.data[dotsOffset + PROCEDURAL_PATTERN_OFFSETS.angle0]).toBeCloseTo(Math.PI / 6);
    expect(packed.data[dotsOffset + PROCEDURAL_PATTERN_OFFSETS.angle1]).toBeCloseTo(Math.PI / 9);
  });

  test('returns a valid empty texture record', () => {
    const packed = packProceduralPatterns({});

    expect(packed.width).toBe(PROCEDURAL_PATTERN_TEXELS_PER_PATTERN);
    expect(packed.data).toEqual(new Float32Array(COMPONENTS_PER_PATTERN));
    expect(packed.patternIndices.size).toBe(0);
  });

  test('applies defaults to omitted pattern fields', () => {
    const packed = packProceduralPatterns({
      hatch: {type: 'hatch'},
      crosshatch: {type: 'cross-hatch'},
      dots: {type: 'dots'}
    });

    const hatchOffset = COMPONENTS_PER_PATTERN;
    expect(packed.data[hatchOffset + PROCEDURAL_PATTERN_OFFSETS.size]).toBe(1);
    expect(packed.data[hatchOffset + PROCEDURAL_PATTERN_OFFSETS.gap0]).toBe(1);
    expect(packed.data[hatchOffset + PROCEDURAL_PATTERN_OFFSETS.gap1]).toBe(1);
    expect(packed.data[hatchOffset + PROCEDURAL_PATTERN_OFFSETS.angle0]).toBe(0);
    expect(packed.data[hatchOffset + PROCEDURAL_PATTERN_OFFSETS.elementCount]).toBe(1);

    const crosshatchOffset = COMPONENTS_PER_PATTERN * 2;
    expect(packed.data[crosshatchOffset + PROCEDURAL_PATTERN_OFFSETS.size]).toBe(1);
    expect(packed.data[crosshatchOffset + PROCEDURAL_PATTERN_OFFSETS.gap0]).toBe(1);
    expect(packed.data[crosshatchOffset + PROCEDURAL_PATTERN_OFFSETS.angle0]).toBeCloseTo(
      Math.PI / 4
    );
    expect(packed.data[crosshatchOffset + PROCEDURAL_PATTERN_OFFSETS.angle1]).toBeCloseTo(
      (Math.PI * 3) / 4
    );

    const dotsOffset = COMPONENTS_PER_PATTERN * 3;
    expect(packed.data[dotsOffset + PROCEDURAL_PATTERN_OFFSETS.size]).toBe(1);
    expect(packed.data[dotsOffset + PROCEDURAL_PATTERN_OFFSETS.gap0]).toBe(1);
    expect(packed.data[dotsOffset + PROCEDURAL_PATTERN_OFFSETS.angle0]).toBe(0);
    expect(packed.data[dotsOffset + PROCEDURAL_PATTERN_OFFSETS.angle1]).toBe(0);
  });

  test('rejects invalid dimensions', () => {
    expect(() =>
      packProceduralPatterns({badHatch: {type: 'hatch', angle: 0, strokeWidth: 0, gap: 1}})
    ).toThrow('badHatch.strokeWidth');
    expect(() => packProceduralPatterns({badDots: {type: 'dots', radius: 1, gap: -1}})).toThrow(
      'badDots.gap'
    );
    expect(() =>
      packProceduralPatterns({
        badAngles: {type: 'cross-hatch', angles: [0, 45, 90], strokeWidth: 1, gap: 1}
      } as any)
    ).toThrow('badAngles.angles');
    expect(() =>
      packProceduralPatterns({badSkew: {type: 'dots', radius: 1, gap: 1, skew: 90}})
    ).toThrow('badSkew.skew');
  });
});
