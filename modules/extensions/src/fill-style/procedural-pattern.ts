// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export type HatchPatternConfig = {
  type: 'hatch';
  /** Direction of the hatch lines in degrees. @default 0 */
  angle?: number;
  /** Width of each hatch line. @default 1 */
  strokeWidth?: number;
  /** Empty edge-to-edge distance between lines. A tuple alternates the two gap values. @default 1 */
  gap?: number | Readonly<[number, number]>;
};

export type CrossHatchPatternConfig = {
  type: 'cross-hatch';
  /** Directions of the two intersecting sets of hatch lines in degrees. @default [45, 135] */
  angles?: Readonly<[number, number]>;
  /** Width of each hatch line. @default 1 */
  strokeWidth?: number;
  /** Empty edge-to-edge distance between adjacent lines. @default 1 */
  gap?: number;
};

export type DotPatternConfig = {
  type: 'dots';
  /** Radius of each dot. @default 1 */
  radius?: number;
  /** Empty edge-to-edge distance between dots along both grid axes. @default 1 */
  gap?: number;
  /** Rotation of the dot grid in degrees. @default 0 */
  angle?: number;
  /** Degrees that the second grid axis tilts toward the first; 0 produces an orthogonal grid. @default 0 */
  skew?: number;
};

/** Procedural pattern shapes supported by FillStyleExtension. */
export type ProceduralPatternConfig =
  | HatchPatternConfig
  | CrossHatchPatternConfig
  | DotPatternConfig;

export type ProceduralPatternMapping = Readonly<Record<string, ProceduralPatternConfig>>;

export const PROCEDURAL_PATTERN_TEXTURE_FORMAT = 'rg32float' as const;
export const PROCEDURAL_PATTERN_COMPONENTS_PER_TEXEL = 2;
export const PROCEDURAL_PATTERN_TEXELS_PER_PATTERN = 4;

export const PROCEDURAL_PATTERN_TYPES = {
  none: 0,
  hatch: 1,
  crossHatch: 2,
  dots: 3
} as const;

/** Component offsets within each fixed-width pattern record. */
export const PROCEDURAL_PATTERN_OFFSETS = {
  type: 0,
  size: 1,
  gap0: 2,
  gap1: 3,
  angle0: 4,
  angle1: 5,
  /** Number of alternating gaps, hatch directions, or dot-grid axes, depending on type. */
  elementCount: 6
} as const;

export type PackedProceduralPatterns = {
  data: Float32Array;
  width: number;
  height: 1;
  /** Maps the user-facing pattern id to its record in the data texture. Index 0 is reserved for none. */
  patternIndices: ReadonlyMap<string, number>;
};

const COMPONENTS_PER_PATTERN =
  PROCEDURAL_PATTERN_COMPONENTS_PER_TEXEL * PROCEDURAL_PATTERN_TEXELS_PER_PATTERN;
const DEGREES_TO_RADIANS = Math.PI / 180;
const DEFAULT_SIZE = 1;
const DEFAULT_GAP = 1;
const DEFAULT_HATCH_ANGLE = 0;
const DEFAULT_CROSS_HATCH_ANGLES = [45, 135] as const;
const DEFAULT_DOT_ANGLE = 0;
const DEFAULT_DOT_SKEW = 0;

/**
 * Packs procedural pattern definitions into an `rg32float`-compatible data array.
 * The fixed record width keeps vertex-shader lookup independent of the pattern type.
 */
export function packProceduralPatterns(
  mapping: ProceduralPatternMapping
): PackedProceduralPatterns {
  const entries = Object.entries(mapping);
  // The zero-filled first record represents a missing or disabled pattern.
  const data = new Float32Array((entries.length + 1) * COMPONENTS_PER_PATTERN);
  const patternIndices = new Map<string, number>();

  entries.forEach(([id, config], entryIndex) => {
    const patternIndex = entryIndex + 1;
    const offset = patternIndex * COMPONENTS_PER_PATTERN;
    patternIndices.set(id, patternIndex);

    switch (config.type) {
      case 'hatch': {
        const gap = config.gap === undefined ? DEFAULT_GAP : config.gap;
        const strokeWidth = config.strokeWidth === undefined ? DEFAULT_SIZE : config.strokeWidth;
        const angle = config.angle === undefined ? DEFAULT_HATCH_ANGLE : config.angle;
        if (Array.isArray(gap) && gap.length !== 2) {
          throw new Error(`${id}.gap must be a number or a two-element array`);
        }
        const gaps = Array.isArray(gap) ? gap : [gap, gap];
        validatePositive(strokeWidth, `${id}.strokeWidth`);
        validateNonNegative(gaps[0], `${id}.gap[0]`);
        validateNonNegative(gaps[1], `${id}.gap[1]`);
        validateAngle(angle, `${id}.angle`);

        data[offset + PROCEDURAL_PATTERN_OFFSETS.type] = PROCEDURAL_PATTERN_TYPES.hatch;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.size] = strokeWidth;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.gap0] = gaps[0];
        data[offset + PROCEDURAL_PATTERN_OFFSETS.gap1] = gaps[1];
        data[offset + PROCEDURAL_PATTERN_OFFSETS.angle0] = angle * DEGREES_TO_RADIANS;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.elementCount] = Array.isArray(gap) ? 2 : 1;
        break;
      }

      case 'cross-hatch': {
        const angles = config.angles === undefined ? DEFAULT_CROSS_HATCH_ANGLES : config.angles;
        const strokeWidth = config.strokeWidth === undefined ? DEFAULT_SIZE : config.strokeWidth;
        const gap = config.gap === undefined ? DEFAULT_GAP : config.gap;
        if (!Array.isArray(angles) || angles.length !== 2) {
          throw new Error(`${id}.angles must be a two-element array`);
        }
        validatePositive(strokeWidth, `${id}.strokeWidth`);
        validateNonNegative(gap, `${id}.gap`);
        validateAngle(angles[0], `${id}.angles[0]`);
        validateAngle(angles[1], `${id}.angles[1]`);

        data[offset + PROCEDURAL_PATTERN_OFFSETS.type] = PROCEDURAL_PATTERN_TYPES.crossHatch;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.size] = strokeWidth;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.gap0] = gap;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.gap1] = gap;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.angle0] = angles[0] * DEGREES_TO_RADIANS;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.angle1] = angles[1] * DEGREES_TO_RADIANS;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.elementCount] = 2;
        break;
      }

      case 'dots': {
        const radius = config.radius === undefined ? DEFAULT_SIZE : config.radius;
        const gap = config.gap === undefined ? DEFAULT_GAP : config.gap;
        const angle = config.angle === undefined ? DEFAULT_DOT_ANGLE : config.angle;
        const skew = config.skew === undefined ? DEFAULT_DOT_SKEW : config.skew;
        validatePositive(radius, `${id}.radius`);
        validateNonNegative(gap, `${id}.gap`);
        validateAngle(angle, `${id}.angle`);
        validateSkew(skew, `${id}.skew`);

        data[offset + PROCEDURAL_PATTERN_OFFSETS.type] = PROCEDURAL_PATTERN_TYPES.dots;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.size] = radius;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.gap0] = gap;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.gap1] = gap;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.angle0] = angle * DEGREES_TO_RADIANS;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.angle1] = skew * DEGREES_TO_RADIANS;
        data[offset + PROCEDURAL_PATTERN_OFFSETS.elementCount] = 2;
        break;
      }

      default:
        throw new Error(`${id}.type is not a supported procedural pattern type`);
    }
  });

  return {
    data,
    width: data.length / PROCEDURAL_PATTERN_COMPONENTS_PER_TEXEL,
    height: 1,
    patternIndices
  };
}

function validatePositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a finite number greater than 0`);
  }
}

function validateNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite number greater than or equal to 0`);
  }
}

function validateAngle(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
}

function validateSkew(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= -90 || value >= 90) {
    throw new Error(`${name} must be a finite number greater than -90 and less than 90`);
  }
}
