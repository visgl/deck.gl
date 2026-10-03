// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {DashMode, DashUnits} from '@deck.gl/extensions';

export type YarnColor = [red: number, green: number, blue: number, alpha: number];
export type DashPattern = [dash: number, gap: number];
export type YarnLayoutMode = 'fibonacci' | 'nested';

export const YARN_DASH_MOTIF_NAMES = [
  'Pin dots',
  'Short stitches',
  'Even checks',
  'Long stitches',
  'Spaced blocks',
  'Ribbon breaks'
] as const;

export type YarnDashMotifName = (typeof YARN_DASH_MOTIF_NAMES)[number];

type DashMotif = {
  label: string;
  pattern: DashPattern;
};

type Vector3 = [x: number, y: number, z: number];

type UnitStyle = {
  units: DashUnits;
  label: string;
  description: string;
  palette: YarnColor[];
  dashPatterns: DashMotif[];
};

type PhaseStyle = {
  id: string;
  label: string;
  description: string;
  dashMode: DashMode;
  dashJustified: boolean;
};

export type YarnStyle = UnitStyle &
  PhaseStyle & {
    styleId: string;
    billboard: boolean;
    capRounded: boolean;
    jointRounded: boolean;
    offsetEnabled: boolean;
  };

export type YarnStrand = {
  id: string;
  name: string;
  path: number[];
  color: YarnColor | YarnColor[];
  width: number;
  dashArray: DashPattern;
  dashMotif: string;
  offset: number;
  shellIndex: number;
  altitude: number;
  layout: YarnLayoutMode;
  anchorCount?: number;
  style: YarnStyle;
};

export type FibonacciYarnOptions = {
  /** Number of evenly distributed spherical Fibonacci anchors visited by the strand. */
  anchorCount?: number;
  /** Multiplier for the strand's 220 km inside-to-outside altitude rise. */
  depthScale?: number;
  /** Repeating color sequence painted along the single strand. */
  paletteName?: YarnPaletteName;
  /** Number of complete palette repetitions from the north pole to the south pole. */
  colorCycles?: number;
  /** Palette offset expressed as a fraction of one complete color cycle. */
  colorPhase?: number;
  dashMode?: DashMode;
  dashUnits?: DashUnits;
  dashJustified?: boolean;
  dashMotif?: YarnDashMotifName;
  /** Independent multiplier for the motif's solid run. */
  dashScale?: number;
  /** Independent multiplier for the motif's gap. */
  gapScale?: number;
  offset?: number;
  capRounded?: boolean;
  jointRounded?: boolean;
  billboard?: boolean;
};

export type FoundationStrand = {
  id: string;
  path: number[];
  color: YarnColor;
  width: number;
};

export const YARN_UNIT_LEGEND = [
  {
    units: 'widths',
    label: 'Widths',
    description: 'Pattern scales with the thread',
    color: [255, 151, 43, 255]
  },
  {
    units: 'pixels',
    label: 'Pixels',
    description: 'Pattern stays stable on screen',
    color: [42, 199, 239, 255]
  },
  {
    units: 'meters',
    label: 'Meters',
    description: 'Pattern follows physical distance',
    color: [135, 220, 80, 255]
  },
  {
    units: 'common',
    label: 'Common',
    description: 'Pattern follows deck.gl common space',
    color: [204, 92, 255, 255]
  }
] satisfies Array<{
  units: DashUnits;
  label: string;
  description: string;
  color: YarnColor;
}>;

export const YARN_PALETTES = {
  'Vivid rainbow': [
    [255, 54, 96, 255],
    [255, 124, 38, 255],
    [255, 220, 72, 255],
    [129, 239, 83, 255],
    [39, 226, 196, 255],
    [42, 161, 255, 255],
    [112, 91, 255, 255],
    [231, 67, 210, 255]
  ],
  Electric: [
    [0, 247, 255, 255],
    [52, 125, 255, 255],
    [162, 72, 255, 255],
    [255, 55, 214, 255],
    [255, 74, 94, 255],
    [204, 255, 58, 255]
  ],
  Candy: [
    [255, 76, 151, 255],
    [255, 137, 203, 255],
    [168, 101, 255, 255],
    [79, 201, 255, 255],
    [99, 245, 204, 255],
    [255, 225, 112, 255]
  ],
  Aurora: [
    [29, 224, 179, 255],
    [98, 247, 127, 255],
    [194, 255, 101, 255],
    [59, 190, 255, 255],
    [97, 97, 255, 255],
    [205, 70, 255, 255]
  ],
  Sunset: [
    [255, 220, 104, 255],
    [255, 145, 55, 255],
    [255, 71, 91, 255],
    [225, 55, 156, 255],
    [128, 68, 214, 255],
    [61, 84, 180, 255]
  ],
  Ocean: [
    [66, 245, 220, 255],
    [31, 193, 237, 255],
    [38, 123, 232, 255],
    [68, 76, 194, 255],
    [115, 72, 220, 255],
    [64, 216, 183, 255]
  ]
} satisfies Record<string, YarnColor[]>;

export type YarnPaletteName = keyof typeof YARN_PALETTES;
export const YARN_PALETTE_NAMES = Object.keys(YARN_PALETTES) as YarnPaletteName[];

const UNIT_STYLES: UnitStyle[] = [
  {
    units: 'widths',
    label: 'Width-relative',
    description: 'dash and gap are multiples of half the rendered thread width',
    palette: [
      [255, 181, 55, 255],
      [255, 118, 35, 255],
      [255, 73, 91, 255],
      [248, 200, 94, 255],
      [240, 82, 43, 255]
    ],
    dashPatterns: [
      {label: 'Pin dots', pattern: [0.7, 2.3]},
      {label: 'Short stitches', pattern: [1.7, 1]},
      {label: 'Even checks', pattern: [2.7, 2.7]},
      {label: 'Long stitches', pattern: [4.7, 1.3]},
      {label: 'Spaced blocks', pattern: [6, 3.3]},
      {label: 'Ribbon breaks', pattern: [7, 2]}
    ]
  },
  {
    units: 'pixels',
    label: 'Screen-space',
    description: 'dash and gap are nominal screen pixels',
    palette: [
      [42, 224, 232, 255],
      [45, 151, 255, 255],
      [63, 104, 235, 255],
      [81, 235, 194, 255],
      [27, 181, 220, 255]
    ],
    dashPatterns: [
      {label: 'Pin dots', pattern: [2, 7]},
      {label: 'Short stitches', pattern: [5, 3]},
      {label: 'Even checks', pattern: [8, 8]},
      {label: 'Long stitches', pattern: [14, 4]},
      {label: 'Spaced blocks', pattern: [18, 10]},
      {label: 'Ribbon breaks', pattern: [21, 6]}
    ]
  },
  {
    units: 'meters',
    label: 'Physical',
    description: 'dash and gap are measured along the globe in meters',
    palette: [
      [164, 229, 72, 255],
      [74, 199, 101, 255],
      [240, 218, 70, 255],
      [58, 183, 153, 255],
      [211, 235, 100, 255]
    ],
    dashPatterns: [
      {label: 'Pin dots', pattern: [40_000, 140_000]},
      {label: 'Short stitches', pattern: [100_000, 60_000]},
      {label: 'Even checks', pattern: [160_000, 160_000]},
      {label: 'Long stitches', pattern: [280_000, 80_000]},
      {label: 'Spaced blocks', pattern: [360_000, 200_000]},
      {label: 'Ribbon breaks', pattern: [420_000, 120_000]}
    ]
  },
  {
    units: 'common',
    label: 'Common-space',
    description: 'dash and gap are deck.gl common-coordinate units',
    palette: [
      [211, 97, 255, 255],
      [240, 72, 179, 255],
      [139, 98, 255, 255],
      [255, 112, 146, 255],
      [180, 79, 225, 255]
    ],
    dashPatterns: [
      {label: 'Pin dots', pattern: [0.5, 1.7]},
      {label: 'Short stitches', pattern: [1.2, 0.7]},
      {label: 'Even checks', pattern: [2, 2]},
      {label: 'Long stitches', pattern: [3.5, 1]},
      {label: 'Spaced blocks', pattern: [4.5, 2.5]},
      {label: 'Ribbon breaks', pattern: [5.2, 1.5]}
    ]
  }
];

const PHASE_STYLES: PhaseStyle[] = [
  {
    id: 'segment',
    label: 'Segment phase',
    description: 'the pattern starts again at every rendered joint',
    dashMode: 'segment',
    dashJustified: false
  },
  {
    id: 'segment-fitted',
    label: 'Fitted segments',
    description: 'every rendered segment fits a whole number of periods',
    dashMode: 'segment',
    dashJustified: true
  },
  {
    id: 'path',
    label: 'Path phase',
    description: 'one continuous pattern flows through every joint',
    dashMode: 'path',
    dashJustified: false
  },
  {
    id: 'path-fitted',
    label: 'Fitted path',
    description: 'one fitted pattern spans the complete strand',
    dashMode: 'path',
    dashJustified: true
  }
];

export const YARN_STYLES: YarnStyle[] = UNIT_STYLES.flatMap((unitStyle, unitIndex) =>
  PHASE_STYLES.map((phaseStyle, phaseIndex) => ({
    ...unitStyle,
    ...phaseStyle,
    styleId: `${unitStyle.units}-${phaseStyle.id}`,
    billboard: (unitIndex + phaseIndex) % 2 === 1,
    capRounded: (unitIndex * 2 + phaseIndex) % 3 !== 1,
    jointRounded: (unitIndex + phaseIndex * 2) % 3 !== 0,
    offsetEnabled: phaseIndex === 3 || (unitIndex + phaseIndex) % 5 === 0
  }))
);

const FOUNDATION_PALETTE: YarnColor[] = [
  [40, 37, 66, 255],
  [49, 42, 76, 255],
  [34, 53, 76, 255],
  [58, 38, 68, 255],
  [38, 59, 80, 255]
];

const TAU = Math.PI * 2;
const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
const FIBONACCI_BASE_ALTITUDE = 18_000;
const FIBONACCI_DEPTH_METERS = 220_000;
const FIBONACCI_CORNER_FRACTION = 0.06;
const COLORED_SHELL_COUNT = 6;
const FOUNDATION_SHELL_COUNT = 2;
const SPIRAL_EXTENT = 1.22;

/** Resolve one of the named motifs into values that are useful in the selected unit system. */
export function getYarnDashPattern(
  dashUnits: DashUnits,
  dashMotif: YarnDashMotifName,
  dashScale = 1,
  gapScale = 1
): DashPattern {
  const unitStyle = UNIT_STYLES.find(style => style.units === dashUnits) as UnitStyle;
  const motif = unitStyle.dashPatterns.find(candidate => candidate.label === dashMotif);
  const [dash, gap] = (motif || unitStyle.dashPatterns[0]).pattern;
  return [
    dash * Math.max(0, finiteNumber(dashScale, 1)),
    gap * Math.max(0, finiteNumber(gapScale, 1))
  ];
}

/**
 * Generate one continuous strand through a spherical Fibonacci sequence.
 *
 * The returned path is deliberately flat so a PathLayer can use `_pathType: 'open'`. Its color
 * array has exactly one entry per path vertex, which lets PathLayer paint individual rendered
 * segments without splitting the strand and resetting whole-path dash phase.
 */
export function createFibonacciYarnStrand(options: FibonacciYarnOptions = {}): YarnStrand {
  const {
    anchorCount = 377,
    depthScale = 1,
    paletteName = 'Vivid rainbow',
    colorCycles = 8,
    colorPhase = 0,
    dashMode = 'path',
    dashUnits = 'pixels',
    dashJustified = false,
    dashMotif = 'Even checks',
    dashScale = 1,
    gapScale = 1,
    offset = 0,
    capRounded = true,
    jointRounded = true,
    billboard = true
  } = options;

  const resolvedAnchorCount = Math.max(8, Math.floor(finiteNumber(anchorCount, 377)));
  const resolvedDepthScale = Math.max(0, finiteNumber(depthScale, 1));
  const resolvedColorCycles = Math.max(0, finiteNumber(colorCycles, 8));
  const resolvedColorPhase = finiteNumber(colorPhase, 0);
  const resolvedOffset = finiteNumber(offset, 0);
  const palette = YARN_PALETTES[paletteName] || YARN_PALETTES['Vivid rainbow'];
  const maxSegmentAngle = (dashMode === 'segment' ? 7.5 : 3.5) * DEGREES_TO_RADIANS;
  const depthMeters = FIBONACCI_DEPTH_METERS * resolvedDepthScale;
  const waypoints: Vector3[] = [[0, 0, 1]];

  for (let anchorIndex = 0; anchorIndex < resolvedAnchorCount; anchorIndex++) {
    waypoints.push(createFibonacciAnchor(anchorIndex, resolvedAnchorCount));
  }
  waypoints.push([0, 0, -1]);

  const route = createRoundedFibonacciRoute(waypoints, maxSegmentAngle);
  const cumulativeDistances = [0];
  for (let pointIndex = 1; pointIndex < route.length; pointIndex++) {
    cumulativeDistances.push(
      cumulativeDistances[pointIndex - 1] + angleBetween(route[pointIndex - 1], route[pointIndex])
    );
  }
  const totalDistance = cumulativeDistances[cumulativeDistances.length - 1] || 1;
  const path: number[] = [];
  const segmentColors: YarnColor[] = [];
  let previousLongitude: number | undefined;
  const appendPosition = (position: Vector3, progress: number) => {
    const canonicalLongitude = Math.atan2(position[1], position[0]) * RADIANS_TO_DEGREES;
    const longitude = unwrapLongitude(canonicalLongitude, previousLongitude);
    const latitude = Math.asin(Math.max(-1, Math.min(1, position[2]))) * RADIANS_TO_DEGREES;
    const altitude =
      FIBONACCI_BASE_ALTITUDE + depthMeters * smoothstep(Math.max(0, Math.min(1, progress)));

    path.push(longitude, latitude, altitude);
    previousLongitude = longitude;
  };

  appendPosition(route[0], 0);
  for (let pointIndex = 1; pointIndex < route.length; pointIndex++) {
    const startProgress = cumulativeDistances[pointIndex - 1] / totalDistance;
    const endProgress = cumulativeDistances[pointIndex] / totalDistance;
    segmentColors.push(
      getPaletteColor(
        (startProgress + endProgress) / 2,
        palette,
        resolvedColorCycles,
        resolvedColorPhase
      )
    );
    appendPosition(route[pointIndex], endProgress);
  }

  const colors = [...segmentColors, segmentColors[segmentColors.length - 1]];
  const unitStyle = UNIT_STYLES.find(style => style.units === dashUnits) as UnitStyle;
  const phaseStyle = PHASE_STYLES.find(
    style => style.dashMode === dashMode && style.dashJustified === dashJustified
  ) as PhaseStyle;
  const style: YarnStyle = {
    ...unitStyle,
    ...phaseStyle,
    palette,
    styleId: `fibonacci-${dashUnits}-${phaseStyle.id}`,
    billboard,
    capRounded,
    jointRounded,
    offsetEnabled: resolvedOffset !== 0
  };

  return {
    id: 'fibonacci-yarn',
    name: `${paletteName} Fibonacci strand`,
    path,
    color: colors,
    width: 5.4,
    dashArray: getYarnDashPattern(dashUnits, dashMotif, dashScale, gapScale),
    dashMotif,
    offset: resolvedOffset,
    shellIndex: 0,
    altitude: FIBONACCI_BASE_ALTITUDE + depthMeters / 2,
    layout: 'fibonacci',
    anchorCount: resolvedAnchorCount,
    style
  };
}

/** Generate six ordered spiral shells that collectively exercise every dash style. */
export function createYarnStrands(strandCount: number): YarnStrand[] {
  const count = Math.max(YARN_STYLES.length, Math.floor(strandCount));
  const coursesPerShell = distributeCourses(count, COLORED_SHELL_COUNT);
  const styleOccurrences = YARN_STYLES.map(() => 0);
  const strands: YarnStrand[] = [];
  let strandIndex = 0;

  for (let shellIndex = 0; shellIndex < COLORED_SHELL_COUNT; shellIndex++) {
    const courseCount = coursesPerShell[shellIndex];
    const basis = createSpiralBasis(getShellAxis(shellIndex));
    const phase = 0.35 + shellIndex * 0.82;
    const baseAltitude = 18_000 + shellIndex * 32_000;
    const altitudeRise = 6_000;
    let previousLongitude: number | undefined;

    for (let courseIndex = 0; courseIndex < courseCount; courseIndex++) {
      const styleIndex = strandIndex % YARN_STYLES.length;
      const style = YARN_STYLES[styleIndex];
      const occurrence = styleOccurrences[styleIndex]++;
      const motif = style.dashPatterns[occurrence % style.dashPatterns.length];
      const pointCount =
        style.dashMode === 'path' ? 112 + (courseIndex % 3) * 16 : 72 + (courseIndex % 4) * 12;
      const course = createSpiralCourse({
        basis,
        courseIndex,
        courseCount,
        pointCount,
        phase,
        baseAltitude,
        altitudeRise,
        previousLongitude
      });
      previousLongitude = course.lastLongitude;
      const baseColor = style.palette[(courseIndex + shellIndex * 2) % style.palette.length];
      const offsetDirection = (courseIndex + shellIndex) % 2 === 0 ? -1 : 1;

      strands.push({
        id: `strand-shell-${shellIndex}-${courseIndex}`,
        name: `${motif.label} · winding layer ${shellIndex + 1}`,
        path: course.path,
        color: mixColor(baseColor, [255, 244, 219, 255], (courseIndex % 3) * 0.035),
        width: 3.7 + shellIndex * 0.55 + ((courseIndex + styleIndex) % 3) * 0.42,
        dashArray: motif.pattern,
        dashMotif: motif.label,
        offset: style.offsetEnabled ? offsetDirection * 0.32 : 0,
        shellIndex,
        altitude: baseAltitude + altitudeRise * ((courseIndex + 0.5) / courseCount),
        layout: 'nested',
        style
      });
      strandIndex++;
    }
  }

  return strands;
}

/** Muted inner spirals fill the silhouette without competing with the dash patterns. */
export function createFoundationStrands(strandCount: number): FoundationStrand[] {
  const count = Math.max(16, Math.floor(strandCount));
  const coursesPerShell = distributeCourses(count, FOUNDATION_SHELL_COUNT);
  const strands: FoundationStrand[] = [];

  for (let shellIndex = 0; shellIndex < FOUNDATION_SHELL_COUNT; shellIndex++) {
    const courseCount = coursesPerShell[shellIndex];
    const basis = createSpiralBasis(getShellAxis(shellIndex * 4));
    const phase = 0.15 + shellIndex * 1.35;
    const baseAltitude = 2_000 + shellIndex * 8_000;
    const altitudeRise = 3_000;
    let previousLongitude: number | undefined;

    for (let courseIndex = 0; courseIndex < courseCount; courseIndex++) {
      const course = createSpiralCourse({
        basis,
        courseIndex,
        courseCount,
        pointCount: 72,
        phase,
        baseAltitude,
        altitudeRise,
        previousLongitude
      });
      previousLongitude = course.lastLongitude;
      strands.push({
        id: `foundation-${shellIndex}-${courseIndex}`,
        path: course.path,
        color: FOUNDATION_PALETTE[(courseIndex + shellIndex * 2) % FOUNDATION_PALETTE.length],
        width: 3.8 + ((courseIndex + shellIndex) % 4) * 0.72
      });
    }
  }

  return strands;
}

type SpiralBasis = {
  axis: Vector3;
  tangent: Vector3;
  bitangent: Vector3;
};

type SpiralCourseOptions = {
  basis: SpiralBasis;
  courseIndex: number;
  courseCount: number;
  pointCount: number;
  phase: number;
  baseAltitude: number;
  altitudeRise: number;
  previousLongitude: number | undefined;
};

function createSpiralCourse({
  basis,
  courseIndex,
  courseCount,
  pointCount,
  phase,
  baseAltitude,
  altitudeRise,
  previousLongitude
}: SpiralCourseOptions): {path: number[]; lastLongitude: number} {
  const path: number[] = [];
  let lastLongitude = previousLongitude;

  for (let pointIndex = 0; pointIndex <= pointCount; pointIndex++) {
    const fraction = pointIndex / pointCount;
    const windingProgress = courseIndex + fraction;
    const shellProgress = windingProgress / courseCount;
    const beta = -SPIRAL_EXTENT + shellProgress * SPIRAL_EXTENT * 2;
    const theta = phase + windingProgress * TAU;
    const radialScale = Math.cos(beta);
    const position: Vector3 = [
      basis.tangent[0] * Math.cos(theta) * radialScale +
        basis.bitangent[0] * Math.sin(theta) * radialScale +
        basis.axis[0] * Math.sin(beta),
      basis.tangent[1] * Math.cos(theta) * radialScale +
        basis.bitangent[1] * Math.sin(theta) * radialScale +
        basis.axis[1] * Math.sin(beta),
      basis.tangent[2] * Math.cos(theta) * radialScale +
        basis.bitangent[2] * Math.sin(theta) * radialScale +
        basis.axis[2] * Math.sin(beta)
    ];
    const canonicalLongitude = (Math.atan2(position[1], position[0]) * 180) / Math.PI;
    const longitude = unwrapLongitude(canonicalLongitude, lastLongitude);
    const latitude = (Math.asin(position[2]) * 180) / Math.PI;
    const altitude = baseAltitude + altitudeRise * shellProgress;

    path.push(longitude, latitude, altitude);
    lastLongitude = longitude;
  }

  return {path, lastLongitude: lastLongitude as number};
}

function createSpiralBasis(axis: Vector3): SpiralBasis {
  const reference: Vector3 = Math.abs(axis[2]) < 0.88 ? [0, 0, 1] : [0, 1, 0];
  const tangent = normalize(cross(axis, reference));
  return {axis, tangent, bitangent: normalize(cross(axis, tangent))};
}

function getShellAxis(shellIndex: number): Vector3 {
  const axes: Array<[longitude: number, latitude: number]> = [
    [18, 72],
    [24, 67],
    [128, 55],
    [136, 49],
    [250, 58],
    [258, 52]
  ];
  const [longitude, latitude] = axes[shellIndex % axes.length];
  const longitudeRadians = (longitude * Math.PI) / 180;
  const latitudeRadians = (latitude * Math.PI) / 180;
  const latitudeScale = Math.cos(latitudeRadians);
  return [
    Math.cos(longitudeRadians) * latitudeScale,
    Math.sin(longitudeRadians) * latitudeScale,
    Math.sin(latitudeRadians)
  ];
}

function distributeCourses(count: number, shellCount: number): number[] {
  const baseCount = Math.floor(count / shellCount);
  const remainder = count % shellCount;
  return Array.from({length: shellCount}, (_, shellIndex) =>
    shellIndex < remainder ? baseCount + 1 : baseCount
  );
}

function unwrapLongitude(longitude: number, previousLongitude: number | undefined): number {
  if (previousLongitude === undefined) {
    return longitude;
  }
  let unwrapped = longitude;
  while (unwrapped - previousLongitude > 180) {
    unwrapped -= 360;
  }
  while (unwrapped - previousLongitude < -180) {
    unwrapped += 360;
  }
  return unwrapped;
}

function normalize(vector: Vector3): Vector3 {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function cross(left: Vector3, right: Vector3): Vector3 {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0]
  ];
}

function createFibonacciAnchor(anchorIndex: number, anchorCount: number): Vector3 {
  const height = 1 - (2 * anchorIndex + 1) / anchorCount;
  // Reducing before the trigonometric functions avoids precision loss for large anchor counts.
  const azimuth = TAU * fractionalPart(anchorIndex / GOLDEN_RATIO);
  const radius = Math.sqrt(Math.max(0, 1 - height * height));
  return [Math.cos(azimuth) * radius, Math.sin(azimuth) * radius, height];
}

function createRoundedFibonacciRoute(waypoints: Vector3[], maxSegmentAngle: number): Vector3[] {
  const route: Vector3[] = [waypoints[0]];
  let previousExit = waypoints[0];

  for (let waypointIndex = 1; waypointIndex < waypoints.length - 1; waypointIndex++) {
    const previous = waypoints[waypointIndex - 1];
    const waypoint = waypoints[waypointIndex];
    const next = waypoints[waypointIndex + 1];
    const entry = slerpUnitVectors(
      waypoint,
      previous,
      FIBONACCI_CORNER_FRACTION,
      angleBetween(waypoint, previous)
    );
    const exit = slerpUnitVectors(
      waypoint,
      next,
      FIBONACCI_CORNER_FRACTION,
      angleBetween(waypoint, next)
    );

    appendGreatCircle(route, previousExit, entry, maxSegmentAngle);
    appendRoundedCorner(route, [entry, waypoint, exit], maxSegmentAngle);
    previousExit = exit;
  }

  appendGreatCircle(route, previousExit, waypoints[waypoints.length - 1], maxSegmentAngle);
  return route;
}

function appendGreatCircle(
  route: Vector3[],
  start: Vector3,
  end: Vector3,
  maxSegmentAngle: number
): void {
  const angle = angleBetween(start, end);
  const stepCount = Math.max(1, Math.ceil(angle / maxSegmentAngle));
  for (let stepIndex = 1; stepIndex <= stepCount; stepIndex++) {
    route.push(slerpUnitVectors(start, end, stepIndex / stepCount, angle));
  }
}

function appendRoundedCorner(
  route: Vector3[],
  corner: [entry: Vector3, waypoint: Vector3, exit: Vector3],
  maxSegmentAngle: number
): void {
  const [entry, waypoint, exit] = corner;
  const cornerAngle = angleBetween(entry, waypoint) + angleBetween(waypoint, exit);
  const stepCount = Math.max(2, Math.ceil(cornerAngle / maxSegmentAngle));
  for (let stepIndex = 1; stepIndex <= stepCount; stepIndex++) {
    const progress = stepIndex / stepCount;
    const inverseProgress = 1 - progress;
    route.push(
      normalize([
        entry[0] * inverseProgress * inverseProgress +
          waypoint[0] * 2 * inverseProgress * progress +
          exit[0] * progress * progress,
        entry[1] * inverseProgress * inverseProgress +
          waypoint[1] * 2 * inverseProgress * progress +
          exit[1] * progress * progress,
        entry[2] * inverseProgress * inverseProgress +
          waypoint[2] * 2 * inverseProgress * progress +
          exit[2] * progress * progress
      ])
    );
  }
}

function slerpUnitVectors(start: Vector3, end: Vector3, progress: number, angle: number): Vector3 {
  if (progress >= 1) {
    return end;
  }
  const sine = Math.sin(angle);
  if (Math.abs(sine) < 1e-7) {
    return normalize([
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress,
      start[2] + (end[2] - start[2]) * progress
    ]);
  }

  const startScale = Math.sin((1 - progress) * angle) / sine;
  const endScale = Math.sin(progress * angle) / sine;
  return normalize([
    start[0] * startScale + end[0] * endScale,
    start[1] * startScale + end[1] * endScale,
    start[2] * startScale + end[2] * endScale
  ]);
}

function getPaletteColor(
  progress: number,
  palette: YarnColor[],
  colorCycles: number,
  colorPhase: number
): YarnColor {
  const paletteProgress = fractionalPart(progress * colorCycles + colorPhase);
  return palette[Math.min(palette.length - 1, Math.floor(paletteProgress * palette.length))];
}

function dot(left: Vector3, right: Vector3): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function angleBetween(left: Vector3, right: Vector3): number {
  return Math.acos(Math.max(-1, Math.min(1, dot(left, right))));
}

function fractionalPart(value: number): number {
  return ((value % 1) + 1) % 1;
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function finiteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function mixColor(from: YarnColor, to: YarnColor, amount: number): YarnColor {
  return [
    Math.round(from[0] + (to[0] - from[0]) * amount),
    Math.round(from[1] + (to[1] - from[1]) * amount),
    Math.round(from[2] + (to[2] - from[2]) * amount),
    Math.round(from[3] + (to[3] - from[3]) * amount)
  ];
}
