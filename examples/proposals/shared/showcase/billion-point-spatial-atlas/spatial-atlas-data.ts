// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';

export const PAUL_TAYLOR_POINT_COUNT = 168_898_952;
export const NYC_LIDAR_POINT_COUNT = 4_755_025_996;
export const DEFAULT_RESIDENT_POINT_COUNT = 1_000_000;
export const RESIDENT_POINT_COUNT_OPTIONS = [1_000_000, 5_000_000, 10_000_000] as const;
export const NYC_TAXI_SAMPLE_URL =
  'https://gist.github.com/iantonios/0626717d831014db228d5e53b28152d3';
export const NYC_TAXI_ZONES_URL = 'https://data.cityofnewyork.us/d/8meu-9t5y';

export type TaxiZone = {
  id: number;
  name: string;
  borough: string;
  bounds: readonly [number, number, number, number];
  /** Simplified TLC polygon positions in the same local coordinate system as the demo points. */
  positions: readonly number[];
  /** Ring offsets including the terminal vertex offset. */
  ringOffsets: readonly number[];
};

/** Returns the demo tiers whose largest individual storage allocation fits the adapter. */
export function getSupportedResidentPointCounts(
  device: Device
): readonly (typeof RESIDENT_POINT_COUNT_OPTIONS)[number][] {
  const maximumAllocation = Math.min(
    device.limits.maxBufferSize,
    device.limits.maxStorageBufferBindingSize
  );
  return RESIDENT_POINT_COUNT_OPTIONS.filter(pointCount => pointCount * 12 <= maximumAllocation);
}

/**
 * Generates a deterministic, spatially partitionable NYC-shaped point population.
 *
 * The generated rows are an explicitly synthetic resident window into the Paul Taylor scale
 * corpus. The public demo never presents them as original TLC records.
 */
export function makeSyntheticTaxiPositions(pointCount: number, firstPointIndex = 0): Float32Array {
  const positions = new Float32Array(pointCount * 3);
  for (let localIndex = 0; localIndex < pointCount; localIndex++) {
    const pointIndex = firstPointIndex + localIndex;
    // Hash the global row so separately generated shards reproduce the same population exactly.
    const randomOffset = pointIndex * 5;
    const populationRandom = unsignedRandom(randomOffset);
    const routePositionRandom = unsignedRandom(randomOffset + 1);
    const firstSpreadRandom = symmetricRandom(randomOffset + 2);
    const secondSpreadRandom = symmetricRandom(randomOffset + 3);
    const thirdSpreadRandom = symmetricRandom(randomOffset + 4);
    const offset = localIndex * 3;

    if (populationRandom < SYNTHETIC_TAXI_HOTSPOT_SHARE) {
      const hotspotRandom = populationRandom / SYNTHETIC_TAXI_HOTSPOT_SHARE;
      const hotspot =
        SYNTHETIC_TAXI_HOTSPOTS[
          Math.min(
            SYNTHETIC_TAXI_HOTSPOTS.length - 1,
            Math.floor(hotspotRandom * SYNTHETIC_TAXI_HOTSPOTS.length)
          )
        ];
      // Two triangular samples make compact pickup clouds without expensive transcendental math.
      const horizontalSpread = (firstSpreadRandom + secondSpreadRandom) * 0.5;
      const verticalSpread = (thirdSpreadRandom + (routePositionRandom * 2 - 1)) * 0.5;
      positions[offset] =
        hotspot.centerX +
        hotspot.horizontalDirectionX * horizontalSpread * hotspot.horizontalRadius +
        hotspot.verticalDirectionX * verticalSpread * hotspot.verticalRadius;
      positions[offset + 1] =
        hotspot.centerY +
        hotspot.horizontalDirectionY * horizontalSpread * hotspot.horizontalRadius +
        hotspot.verticalDirectionY * verticalSpread * hotspot.verticalRadius;
    } else {
      const routeRandom =
        (populationRandom - SYNTHETIC_TAXI_HOTSPOT_SHARE) / (1 - SYNTHETIC_TAXI_HOTSPOT_SHARE);
      const route =
        SYNTHETIC_TAXI_ROUTES[
          Math.min(
            SYNTHETIC_TAXI_ROUTES.length - 1,
            Math.floor(routeRandom * SYNTHETIC_TAXI_ROUTES.length)
          )
        ];
      const routePosition = routePositionRandom;
      const centerX =
        ((route.xCubicCoefficient * routePosition + route.xQuadraticCoefficient) * routePosition +
          route.xLinearCoefficient) *
          routePosition +
        route.xConstant;
      const centerY =
        ((route.yCubicCoefficient * routePosition + route.yQuadraticCoefficient) * routePosition +
          route.yLinearCoefficient) *
          routePosition +
        route.yConstant;
      const lateralDistance =
        ((firstSpreadRandom + secondSpreadRandom) * 0.5 + thirdSpreadRandom * 0.12) * route.width;
      const longitudinalDistance = thirdSpreadRandom * route.width * 0.35;
      positions[offset] =
        centerX +
        route.lateralDirectionX * lateralDistance +
        route.longitudinalDirectionX * longitudinalDistance;
      positions[offset + 1] =
        centerY +
        route.lateralDirectionY * lateralDistance +
        route.longitudinalDirectionY * longitudinalDistance;
    }
    positions[offset + 2] = 0;
  }
  return positions;
}

/**
 * Returns a compact fixture of official TLC taxi-zone outlines.
 *
 * Coordinates were simplified to roughly 50 metres from NYC Open Data dataset `8meu-9t5y`, then
 * transformed with the same local affine projection used by {@link makeSyntheticTaxiPositions}.
 */
export function makeTaxiZones(): readonly TaxiZone[] {
  return TAXI_ZONES;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US', {maximumFractionDigits: 1, notation: 'compact'}).format(
    value
  );
}

const TAXI_ZONES: readonly TaxiZone[] = [
  {
    id: 7,
    name: 'Astoria',
    borough: 'Queens',
    bounds: [0.251282, 0.019235, 0.543799, 0.180256],
    positions: [
      0.526909, 0.157683, 0.543799, 0.156751, 0.497648, 0.09466, 0.50948, 0.088595, 0.47815,
      0.026789, 0.418945, 0.034721, 0.35498, 0.019235, 0.366744, 0.03565, 0.265673, 0.088946,
      0.288153, 0.115434, 0.263962, 0.12816, 0.271957, 0.142964, 0.251282, 0.151356, 0.27053,
      0.159226, 0.280519, 0.153117, 0.292443, 0.16936, 0.365977, 0.132521, 0.382484, 0.155406,
      0.401779, 0.14537, 0.412053, 0.159612, 0.400352, 0.165961, 0.415065, 0.180256
    ],
    ringOffsets: [0, 22]
  },
  {
    id: 33,
    name: 'Brooklyn Heights',
    borough: 'Brooklyn',
    bounds: [-0.264112, -0.547487, -0.152236, -0.419606],
    positions: [
      -0.209538, -0.419606, -0.186031, -0.428292, -0.166996, -0.443942, -0.171468, -0.465463,
      -0.163558, -0.505546, -0.167775, -0.517061, -0.152236, -0.520885, -0.164358, -0.547487,
      -0.248842, -0.521491, -0.253949, -0.518339, -0.247669, -0.503378, -0.264112, -0.496999,
      -0.259184, -0.488595, -0.24215, -0.495308, -0.235304, -0.482781, -0.243452, -0.476528,
      -0.230117, -0.475913, -0.248392, -0.468826, -0.243901, -0.46118, -0.227021, -0.46743,
      -0.224168, -0.461144, -0.240147, -0.454806, -0.235797, -0.447095, -0.217284, -0.451865,
      -0.213582, -0.442107, -0.22511, -0.436331
    ],
    ringOffsets: [0, 26]
  },
  {
    id: 43,
    name: 'Central Park',
    borough: 'Manhattan',
    bounds: [-0.093184, 0.12851, 0.166236, 0.455243],
    positions: [
      -0.020428, 0.13408, -0.024119, 0.12851, -0.093184, 0.165927, 0.094616, 0.455243, 0.166236,
      0.422189
    ],
    ringOffsets: [0, 5]
  },
  {
    id: 68,
    name: 'East Chelsea',
    borough: 'Manhattan',
    bounds: [-0.305632, -0.092226, -0.173062, 0.063995],
    positions: [
      -0.256155, -0.086003, -0.260191, -0.092226, -0.305632, -0.070672, -0.218454, 0.063995,
      -0.173062, 0.042361
    ],
    ringOffsets: [0, 5]
  },
  {
    id: 79,
    name: 'East Village',
    borough: 'Manhattan',
    bounds: [-0.180826, -0.256176, -0.064216, -0.140087],
    positions: [
      -0.110239, -0.256176, -0.180826, -0.232772, -0.159224, -0.140087, -0.064216, -0.185102
    ],
    ringOffsets: [0, 4]
  },
  {
    id: 87,
    name: 'Financial District North',
    borough: 'Manhattan',
    bounds: [-0.340062, -0.428122, -0.255761, -0.35202],
    positions: [
      -0.269779, -0.387609, -0.255761, -0.40742, -0.266585, -0.399343, -0.26378, -0.407102,
      -0.269156, -0.401205, -0.27672, -0.40691, -0.267971, -0.415829, -0.27845, -0.408221,
      -0.282802, -0.411209, -0.274181, -0.422859, -0.285102, -0.413048, -0.292767, -0.416827,
      -0.284013, -0.428122, -0.29428, -0.417887, -0.302374, -0.422428, -0.317971, -0.407023,
      -0.318926, -0.397832, -0.340062, -0.389096, -0.312501, -0.35202, -0.280454, -0.370901
    ],
    ringOffsets: [0, 20]
  },
  {
    id: 113,
    name: 'Greenwich Village North',
    borough: 'Manhattan',
    bounds: [-0.240533, -0.206195, -0.159224, -0.113752],
    positions: [
      -0.170911, -0.201962, -0.172387, -0.206195, -0.212577, -0.18403, -0.2045, -0.173563,
      -0.240533, -0.153637, -0.21472, -0.113752, -0.159224, -0.140087
    ],
    ringOffsets: [0, 7]
  },
  {
    id: 132,
    name: 'JFK Airport',
    borough: 'Queens',
    bounds: [1.098357, -1.169719, 1.780603, -0.761348],
    positions: [
      1.159723, -0.777779, 1.240246, -0.787746, 1.265864, -0.783589, 1.292399, -0.769848, 1.354169,
      -0.762576, 1.481484, -0.778513, 1.513958, -0.788341, 1.566486, -0.811255, 1.727113, -0.911721,
      1.718209, -0.923, 1.767389, -0.957304, 1.780603, -0.977612, 1.772056, -1.028954, 1.655307,
      -1.083057, 1.639938, -1.085274, 1.624003, -1.102245, 1.609741, -1.131095, 1.610445, -1.146009,
      1.593839, -1.169719, 1.586264, -1.161345, 1.593434, -1.140453, 1.543674, -1.101002, 1.520046,
      -1.109796, 1.486441, -1.161966, 1.444028, -1.14528, 1.492275, -1.096937, 1.498837, -1.077768,
      1.444118, -1.041461, 1.433844, -1.045226, 1.422215, -1.026989, 1.213551, -0.932517, 1.185399,
      -0.900902, 1.17213, -0.851671, 1.18176, -0.815175, 1.210437, -0.800055, 1.25903, -0.808587,
      1.268486, -0.803289, 1.210625, -0.790803, 1.172934, -0.808148, 1.160154, -0.851112, 1.176743,
      -0.917159, 1.162691, -0.902476, 1.153123, -0.90472, 1.150841, -0.899263, 1.148861, -0.915081,
      1.131205, -0.835227, 1.098357, -0.761348
    ],
    ringOffsets: [0, 47]
  },
  {
    id: 138,
    name: 'LaGuardia Airport',
    borough: 'Queens',
    bounds: [0.62534, 0.12298, 0.919591, 0.324343],
    positions: [
      0.790012, 0.324343, 0.801754, 0.318041, 0.806551, 0.323491, 0.801039, 0.315773, 0.8045,
      0.302746, 0.812161, 0.303217, 0.804612, 0.302322, 0.779541, 0.27739, 0.919591, 0.199759,
      0.908335, 0.182888, 0.894359, 0.182911, 0.910035, 0.169971, 0.903617, 0.172256, 0.884999,
      0.153678, 0.858491, 0.151883, 0.876533, 0.12482, 0.871222, 0.12298, 0.821744, 0.17685,
      0.782114, 0.195261, 0.740533, 0.190802, 0.658347, 0.151547, 0.650196, 0.170246, 0.644361,
      0.211797, 0.674639, 0.219898, 0.68867, 0.217193, 0.681301, 0.224577, 0.685701, 0.229249,
      0.677998, 0.257516, 0.680523, 0.269432, 0.730355, 0.275273, 0.725531, 0.286683, 0.729133,
      0.291584, 0.722387, 0.295945, 0.729348, 0.291876, 0.733286, 0.297233, 0.75874, 0.283585,
      0.639286, 0.212638, 0.637264, 0.209138, 0.62534, 0.223922, 0.631036, 0.244122, 0.63861,
      0.250657, 0.644228, 0.231643
    ],
    ringOffsets: [0, 36, 42]
  },
  {
    id: 161,
    name: 'Midtown Center',
    borough: 'Manhattan',
    bounds: [-0.11294, 0.021746, -0.009942, 0.1228],
    positions: [
      -0.04275, 0.047697, -0.046459, 0.042095, -0.052126, 0.044768, -0.066958, 0.021746, -0.11294,
      0.043578, -0.061488, 0.1228, -0.009942, 0.098428
    ],
    ringOffsets: [0, 7]
  },
  {
    id: 211,
    name: 'SoHo',
    borough: 'Manhattan',
    bounds: [-0.283135, -0.275422, -0.214174, -0.197682],
    positions: [
      -0.252189, -0.271613, -0.255073, -0.275422, -0.283135, -0.251664, -0.269841, -0.213749,
      -0.257191, -0.197682, -0.214174, -0.221113
    ],
    ringOffsets: [0, 6]
  },
  {
    id: 230,
    name: 'Times Sq/Theatre District',
    borough: 'Manhattan',
    bounds: [-0.158327, 0.043578, -0.068814, 0.133126],
    positions: [
      -0.108995, 0.049647, -0.11294, 0.043578, -0.158327, 0.065098, -0.114258, 0.133126, -0.068814,
      0.111565
    ],
    ringOffsets: [0, 5]
  },
  {
    id: 237,
    name: 'Upper East Side South',
    borough: 'Manhattan',
    bounds: [-0.024119, 0.103958, 0.093957, 0.231094],
    positions: [
      0.03098, 0.109614, 0.027333, 0.103958, -0.024119, 0.12851, 0.042501, 0.231094, 0.093957,
      0.206688
    ],
    ringOffsets: [0, 5]
  },
  {
    id: 239,
    name: 'Upper West Side South',
    borough: 'Manhattan',
    bounds: [-0.14502, 0.247793, 0.005314, 0.364649],
    positions: [
      -0.040113, 0.33917, 0.005314, 0.31764, -0.03998, 0.247793, -0.120575, 0.286017, -0.125435,
      0.272814, -0.14502, 0.282616, -0.123726, 0.318246, -0.129382, 0.324616, -0.136952, 0.316893,
      -0.129027, 0.326151, -0.123435, 0.318725, -0.120649, 0.323297, -0.126125, 0.325766, -0.117241,
      0.328813, -0.127596, 0.328384, -0.116955, 0.329274, -0.095092, 0.364649
    ],
    ringOffsets: [0, 17]
  },
  {
    id: 249,
    name: 'West Village',
    borough: 'Manhattan',
    bounds: [-0.296722, -0.194732, -0.21472, -0.082277],
    positions: [
      -0.260051, -0.188853, -0.262538, -0.194732, -0.296722, -0.19105, -0.281265, -0.082277,
      -0.21472, -0.113752
    ],
    ringOffsets: [0, 5]
  },
  {
    id: 255,
    name: 'Williamsburg (North Side)',
    borough: 'Brooklyn',
    bounds: [0.021089, -0.339611, 0.182293, -0.222941],
    positions: [
      0.065914, -0.222941, 0.098241, -0.231435, 0.121787, -0.247864, 0.146829, -0.238627, 0.154832,
      -0.254649, 0.167375, -0.247137, 0.172669, -0.2839, 0.182293, -0.282951, 0.132122, -0.323368,
      0.125288, -0.323355, 0.116192, -0.339611, 0.021089, -0.301647, 0.027225, -0.288288, 0.021628,
      -0.285194, 0.027777, -0.287707, 0.032969, -0.281204, 0.027652, -0.276994, 0.035794, -0.279892,
      0.037006, -0.269157, 0.045152, -0.268533, 0.047298, -0.2632, 0.039607, -0.257784, 0.048017,
      -0.261554, 0.05615, -0.251715
    ],
    ringOffsets: [0, 24]
  }
];

export const MAXIMUM_TAXI_ZONE_POSITION_COUNT = Math.max(
  ...TAXI_ZONES.map(zone => zone.positions.length / 2)
);
export const MAXIMUM_TAXI_ZONE_RING_OFFSET_COUNT = Math.max(
  ...TAXI_ZONES.map(zone => zone.ringOffsets.length)
);

/** Public 2015 TLC pickup coordinates used as deterministic expansion anchors. */
const NYC_TAXI_SAMPLE = new Float64Array([
  -73.98768615722656, 40.72425079345703, -73.99156951904297, 40.726932525634766, -73.98191833496094,
  40.783443450927734, -73.9731216430664, 40.743553161621094, -73.98294830322266, 40.76620864868164,
  -73.98249816894531, 40.76401901245117, -73.97216033935547, 40.75934600830078, -73.9726791381836,
  40.79328918457031, -74.01148986816406, 40.702728271484375, -73.92871856689453, 40.74388885498047,
  -73.97440338134766, 40.755313873291016, -73.97702026367188, 40.75225067138672, -73.99102020263672,
  40.77024841308594, -73.99394989013672, 40.741302490234375, -74.0071029663086, 40.73452377319336,
  -73.96234130859375, 40.75907516479492, -73.99810028076172, 40.72270584106445, -73.99004364013672,
  40.73695755004883, -73.9720458984375, 40.763999938964844, -73.99137115478516, 40.74979782104492,
  -73.97652435302734, 40.7644157409668, -74.00200653076172, 40.7298469543457, -73.95059967041016,
  40.7757682800293, -73.98234558105469, 40.7768440246582, -73.97513580322266, 40.75242233276367,
  -73.98303985595703, 40.767852783203125, -73.9475326538086, 40.78273010253906, -73.98716735839844,
  40.73312759399414, -73.9649658203125, 40.75581741333008, -74.00420379638672, 40.73214340209961,
  -73.97764587402344, 40.75214385986328, -73.87310028076172, 40.774139404296875
]);

type SyntheticTaxiRoute = {
  xCubicCoefficient: number;
  xQuadraticCoefficient: number;
  xLinearCoefficient: number;
  xConstant: number;
  yCubicCoefficient: number;
  yQuadraticCoefficient: number;
  yLinearCoefficient: number;
  yConstant: number;
  longitudinalDirectionX: number;
  longitudinalDirectionY: number;
  lateralDirectionX: number;
  lateralDirectionY: number;
  width: number;
};

type SyntheticTaxiHotspot = {
  centerX: number;
  centerY: number;
  horizontalDirectionX: number;
  horizontalDirectionY: number;
  verticalDirectionX: number;
  verticalDirectionY: number;
  horizontalRadius: number;
  verticalRadius: number;
};

type SyntheticTaxiDistrict = {
  centerX: number;
  centerY: number;
  longitudinalDirectionX: number;
  longitudinalDirectionY: number;
  length: number;
  width: number;
  longitudinalStreetCount: number;
  crossStreetCount: number;
  curvature: number;
  routeRepeatCount: number;
  seed: number;
};

/**
 * Builds curved street families for the major borough-scale regions in the default camera view.
 * Route coefficients are precomputed, so generating each row only evaluates two cubic polynomials.
 */
function makeSyntheticTaxiRoutes(): readonly SyntheticTaxiRoute[] {
  const routes: SyntheticTaxiRoute[] = [];
  for (const district of SYNTHETIC_TAXI_DISTRICTS) {
    appendDistrictRoutes(routes, district);
  }

  // Curved bridge, parkway, and airport connectors break up the local street families and make
  // the boroughs read as one connected flow map.
  appendCubicRoute(routes, -0.3, -0.4, -0.2, -0.27, 0.03, -0.26, 0.2, -0.34, 0.0044, 5);
  appendCubicRoute(routes, -0.18, -0.19, -0.04, -0.23, 0.18, -0.22, 0.36, -0.12, 0.0038, 4);
  appendCubicRoute(routes, -0.02, 0.18, 0.16, 0.12, 0.43, 0.16, 0.68, 0.25, 0.0046, 5);
  appendCubicRoute(routes, 0.08, -0.5, 0.29, -0.38, 0.49, -0.29, 0.68, -0.21, 0.0048, 4);
  appendCubicRoute(routes, 0.2, 0.36, 0.43, 0.31, 0.68, 0.27, 0.83, 0.2, 0.0042, 3);
  appendCubicRoute(routes, 0.48, -0.2, 0.69, -0.34, 0.99, -0.52, 1.35, -0.78, 0.0052, 5);
  appendCubicRoute(routes, 0.68, 0.22, 0.83, 0.1, 0.92, -0.04, 0.9, -0.2, 0.0038, 3);
  return routes;
}

function appendDistrictRoutes(routes: SyntheticTaxiRoute[], district: SyntheticTaxiDistrict): void {
  const directionLength = Math.hypot(
    district.longitudinalDirectionX,
    district.longitudinalDirectionY
  );
  const longitudinalDirectionX = district.longitudinalDirectionX / directionLength;
  const longitudinalDirectionY = district.longitudinalDirectionY / directionLength;
  const crossDirectionX = -longitudinalDirectionY;
  const crossDirectionY = longitudinalDirectionX;
  const halfLength = district.length * 0.5;
  const halfWidth = district.width * 0.5;

  for (let streetIndex = 0; streetIndex < district.longitudinalStreetCount; streetIndex++) {
    const offsetFraction =
      district.longitudinalStreetCount === 1
        ? 0
        : (streetIndex / (district.longitudinalStreetCount - 1)) * 2 - 1;
    const streetSeed = district.seed + streetIndex * 11;
    const crossOffset = offsetFraction * halfWidth;
    const startCrossOffset =
      crossOffset * (0.82 + unsignedRandom(streetSeed) * 0.16) +
      symmetricRandom(streetSeed + 1) * district.curvature * 0.16;
    const endCrossOffset =
      crossOffset * (0.88 + unsignedRandom(streetSeed + 2) * 0.16) +
      symmetricRandom(streetSeed + 3) * district.curvature * 0.18;
    const startX =
      district.centerX - longitudinalDirectionX * halfLength + crossDirectionX * startCrossOffset;
    const startY =
      district.centerY - longitudinalDirectionY * halfLength + crossDirectionY * startCrossOffset;
    const endX =
      district.centerX + longitudinalDirectionX * halfLength + crossDirectionX * endCrossOffset;
    const endY =
      district.centerY + longitudinalDirectionY * halfLength + crossDirectionY * endCrossOffset;
    const firstBend = symmetricRandom(streetSeed + 4) * district.curvature;
    const secondBend = symmetricRandom(streetSeed + 5) * district.curvature;
    const firstControlX = startX + (endX - startX) * 0.31 + crossDirectionX * firstBend;
    const firstControlY = startY + (endY - startY) * 0.31 + crossDirectionY * firstBend;
    const secondControlX = startX + (endX - startX) * 0.69 + crossDirectionX * secondBend;
    const secondControlY = startY + (endY - startY) * 0.69 + crossDirectionY * secondBend;
    const streetWidth = 0.0022 + unsignedRandom(streetSeed + 6) * 0.003;
    appendCubicRoute(
      routes,
      startX,
      startY,
      firstControlX,
      firstControlY,
      secondControlX,
      secondControlY,
      endX,
      endY,
      streetWidth,
      district.routeRepeatCount
    );
  }

  for (let streetIndex = 0; streetIndex < district.crossStreetCount; streetIndex++) {
    const offsetFraction =
      district.crossStreetCount === 1 ? 0 : (streetIndex / (district.crossStreetCount - 1)) * 2 - 1;
    const streetSeed = district.seed + 10_000 + streetIndex * 13;
    const longitudinalOffset = offsetFraction * halfLength * 0.94;
    const spanScale = 0.72 + (1 - offsetFraction * offsetFraction) * 0.28;
    const routeHalfWidth = halfWidth * spanScale;
    const centerX =
      district.centerX +
      longitudinalDirectionX * longitudinalOffset +
      crossDirectionX * symmetricRandom(streetSeed) * district.curvature * 0.15;
    const centerY =
      district.centerY +
      longitudinalDirectionY * longitudinalOffset +
      crossDirectionY * symmetricRandom(streetSeed) * district.curvature * 0.15;
    const startX = centerX - crossDirectionX * routeHalfWidth;
    const startY = centerY - crossDirectionY * routeHalfWidth;
    const endX = centerX + crossDirectionX * routeHalfWidth;
    const endY = centerY + crossDirectionY * routeHalfWidth;
    const firstBend = symmetricRandom(streetSeed + 1) * district.curvature * 0.75;
    const secondBend = symmetricRandom(streetSeed + 2) * district.curvature * 0.75;
    const firstControlX = startX + (endX - startX) * 0.3 + longitudinalDirectionX * firstBend;
    const firstControlY = startY + (endY - startY) * 0.3 + longitudinalDirectionY * firstBend;
    const secondControlX = startX + (endX - startX) * 0.7 + longitudinalDirectionX * secondBend;
    const secondControlY = startY + (endY - startY) * 0.7 + longitudinalDirectionY * secondBend;
    const streetWidth = 0.0018 + unsignedRandom(streetSeed + 3) * 0.0025;
    appendCubicRoute(
      routes,
      startX,
      startY,
      firstControlX,
      firstControlY,
      secondControlX,
      secondControlY,
      endX,
      endY,
      streetWidth,
      district.routeRepeatCount
    );
  }
}

function appendCubicRoute(
  routes: SyntheticTaxiRoute[],
  startX: number,
  startY: number,
  firstControlX: number,
  firstControlY: number,
  secondControlX: number,
  secondControlY: number,
  endX: number,
  endY: number,
  width: number,
  repeatCount: number
): void {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const routeLength = Math.hypot(deltaX, deltaY);
  const route: SyntheticTaxiRoute = {
    xCubicCoefficient: endX - startX + 3 * (firstControlX - secondControlX),
    xQuadraticCoefficient: 3 * (startX - 2 * firstControlX + secondControlX),
    xLinearCoefficient: 3 * (firstControlX - startX),
    xConstant: startX,
    yCubicCoefficient: endY - startY + 3 * (firstControlY - secondControlY),
    yQuadraticCoefficient: 3 * (startY - 2 * firstControlY + secondControlY),
    yLinearCoefficient: 3 * (firstControlY - startY),
    yConstant: startY,
    longitudinalDirectionX: deltaX / routeLength,
    longitudinalDirectionY: deltaY / routeLength,
    lateralDirectionX: -deltaY / routeLength,
    lateralDirectionY: deltaX / routeLength,
    width
  };
  for (let repeatIndex = 0; repeatIndex < repeatCount; repeatIndex++) {
    routes.push(route);
  }
}

/**
 * Builds several compact pickup clouds inside every advertised taxi zone, plus clouds around the
 * public sample positions. Zone centers are selected with a small deterministic polylabel search;
 * each cloud radius stays within its nearest polygon edge, including holes.
 */
function makeSyntheticTaxiHotspots(): readonly SyntheticTaxiHotspot[] {
  const hotspots: SyntheticTaxiHotspot[] = [];
  for (const zone of TAXI_ZONES) {
    hotspots.push(...makeTaxiZoneHotspots(zone));
  }

  const sampleCount = NYC_TAXI_SAMPLE.length / 2;
  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
    const centerX = (NYC_TAXI_SAMPLE[sampleIndex * 2] + 73.97) * 8;
    const centerY = (NYC_TAXI_SAMPLE[sampleIndex * 2 + 1] - 40.75) * 9;
    const directionX = symmetricRandom(50_000 + sampleIndex * 3);
    const directionY = symmetricRandom(50_001 + sampleIndex * 3);
    const directionLength = Math.max(Math.hypot(directionX, directionY), 0.001);
    hotspots.push({
      centerX,
      centerY,
      horizontalDirectionX: directionX / directionLength,
      horizontalDirectionY: directionY / directionLength,
      verticalDirectionX: -directionY / directionLength,
      verticalDirectionY: directionX / directionLength,
      horizontalRadius: 0.009 + unsignedRandom(50_002 + sampleIndex * 3) * 0.009,
      verticalRadius: 0.006 + unsignedRandom(60_000 + sampleIndex) * 0.007
    });
  }
  return hotspots;
}

type TaxiZoneHotspotCandidate = {
  centerX: number;
  centerY: number;
  clearance: number;
  boundaryDirectionX: number;
  boundaryDirectionY: number;
};

function makeTaxiZoneHotspots(zone: TaxiZone): SyntheticTaxiHotspot[] {
  const candidates: TaxiZoneHotspotCandidate[] = [];
  const gridResolution = 19;
  const [minimumX, minimumY, maximumX, maximumY] = zone.bounds;
  for (let rowIndex = 0; rowIndex < gridResolution; rowIndex++) {
    const centerY = minimumY + ((rowIndex + 0.5) / gridResolution) * (maximumY - minimumY);
    for (let columnIndex = 0; columnIndex < gridResolution; columnIndex++) {
      const centerX = minimumX + ((columnIndex + 0.5) / gridResolution) * (maximumX - minimumX);
      if (!isPointInsideTaxiZone(centerX, centerY, zone)) continue;
      candidates.push(makeTaxiZoneHotspotCandidate(centerX, centerY, zone));
    }
  }
  candidates.sort((left, right) => right.clearance - left.clearance);

  const selectedCandidates: TaxiZoneHotspotCandidate[] = [];
  const minimumSpacing = Math.max(maximumX - minimumX, maximumY - minimumY) * 0.13;
  for (const candidate of candidates) {
    if (
      selectedCandidates.every(
        selected =>
          Math.hypot(candidate.centerX - selected.centerX, candidate.centerY - selected.centerY) >=
          minimumSpacing
      )
    ) {
      selectedCandidates.push(candidate);
      if (selectedCandidates.length === 5) break;
    }
  }
  if (selectedCandidates.length === 0 && candidates.length > 0) {
    selectedCandidates.push(candidates[0]);
  }

  return selectedCandidates.map(candidate => ({
    centerX: candidate.centerX,
    centerY: candidate.centerY,
    horizontalDirectionX: candidate.boundaryDirectionX,
    horizontalDirectionY: candidate.boundaryDirectionY,
    verticalDirectionX: -candidate.boundaryDirectionY,
    verticalDirectionY: candidate.boundaryDirectionX,
    horizontalRadius: Math.max(candidate.clearance * 0.46, 0.00035),
    verticalRadius: Math.max(candidate.clearance * 0.3, 0.00024)
  }));
}

function makeTaxiZoneHotspotCandidate(
  centerX: number,
  centerY: number,
  zone: TaxiZone
): TaxiZoneHotspotCandidate {
  let minimumDistanceSquared = Number.POSITIVE_INFINITY;
  let boundaryDirectionX = 1;
  let boundaryDirectionY = 0;
  for (let ringIndex = 0; ringIndex < zone.ringOffsets.length - 1; ringIndex++) {
    const ringStart = zone.ringOffsets[ringIndex];
    const ringEnd = zone.ringOffsets[ringIndex + 1];
    for (let vertexIndex = ringStart; vertexIndex < ringEnd; vertexIndex++) {
      const nextVertexIndex = vertexIndex + 1 < ringEnd ? vertexIndex + 1 : ringStart;
      const startX = zone.positions[vertexIndex * 2];
      const startY = zone.positions[vertexIndex * 2 + 1];
      const endX = zone.positions[nextVertexIndex * 2];
      const endY = zone.positions[nextVertexIndex * 2 + 1];
      const edgeX = endX - startX;
      const edgeY = endY - startY;
      const edgeLengthSquared = edgeX * edgeX + edgeY * edgeY;
      const projection =
        edgeLengthSquared === 0
          ? 0
          : Math.max(
              0,
              Math.min(
                1,
                ((centerX - startX) * edgeX + (centerY - startY) * edgeY) / edgeLengthSquared
              )
            );
      const differenceX = centerX - (startX + edgeX * projection);
      const differenceY = centerY - (startY + edgeY * projection);
      const distanceSquared = differenceX * differenceX + differenceY * differenceY;
      if (distanceSquared < minimumDistanceSquared) {
        minimumDistanceSquared = distanceSquared;
        const edgeLength = Math.max(Math.sqrt(edgeLengthSquared), 0.000_001);
        boundaryDirectionX = edgeX / edgeLength;
        boundaryDirectionY = edgeY / edgeLength;
      }
    }
  }
  return {
    centerX,
    centerY,
    clearance: Math.sqrt(minimumDistanceSquared),
    boundaryDirectionX,
    boundaryDirectionY
  };
}

function isPointInsideTaxiZone(pointX: number, pointY: number, zone: TaxiZone): boolean {
  let inside = false;
  for (let ringIndex = 0; ringIndex < zone.ringOffsets.length - 1; ringIndex++) {
    const ringStart = zone.ringOffsets[ringIndex];
    const ringEnd = zone.ringOffsets[ringIndex + 1];
    let previousVertexIndex = ringEnd - 1;
    for (let vertexIndex = ringStart; vertexIndex < ringEnd; vertexIndex++) {
      const vertexX = zone.positions[vertexIndex * 2];
      const vertexY = zone.positions[vertexIndex * 2 + 1];
      const previousX = zone.positions[previousVertexIndex * 2];
      const previousY = zone.positions[previousVertexIndex * 2 + 1];
      if (
        vertexY > pointY !== previousY > pointY &&
        pointX < ((previousX - vertexX) * (pointY - vertexY)) / (previousY - vertexY) + vertexX
      ) {
        inside = !inside;
      }
      previousVertexIndex = vertexIndex;
    }
  }
  return inside;
}

const SYNTHETIC_TAXI_DISTRICTS: readonly SyntheticTaxiDistrict[] = [
  {
    centerX: -0.12,
    centerY: 0.02,
    longitudinalDirectionX: 0.36,
    longitudinalDirectionY: 0.93,
    length: 1.02,
    width: 0.3,
    longitudinalStreetCount: 13,
    crossStreetCount: 31,
    curvature: 0.032,
    routeRepeatCount: 3,
    seed: 1_000
  },
  {
    centerX: 0.02,
    centerY: -0.48,
    longitudinalDirectionX: 0.91,
    longitudinalDirectionY: 0.41,
    length: 0.78,
    width: 0.62,
    longitudinalStreetCount: 14,
    crossStreetCount: 20,
    curvature: 0.05,
    routeRepeatCount: 2,
    seed: 2_000
  },
  {
    centerX: 0.43,
    centerY: -0.02,
    longitudinalDirectionX: 0.98,
    longitudinalDirectionY: 0.2,
    length: 1.08,
    width: 0.58,
    longitudinalStreetCount: 16,
    crossStreetCount: 22,
    curvature: 0.06,
    routeRepeatCount: 2,
    seed: 3_000
  },
  {
    centerX: 0.23,
    centerY: 0.45,
    longitudinalDirectionX: 0.38,
    longitudinalDirectionY: 0.92,
    length: 0.72,
    width: 0.42,
    longitudinalStreetCount: 9,
    crossStreetCount: 15,
    curvature: 0.045,
    routeRepeatCount: 1,
    seed: 4_000
  },
  {
    centerX: 0.82,
    centerY: -0.46,
    longitudinalDirectionX: 0.94,
    longitudinalDirectionY: -0.34,
    length: 1.12,
    width: 0.46,
    longitudinalStreetCount: 9,
    crossStreetCount: 15,
    curvature: 0.07,
    routeRepeatCount: 1,
    seed: 5_000
  }
];

const SYNTHETIC_TAXI_HOTSPOT_SHARE = 0.26;
const SYNTHETIC_TAXI_ROUTES = makeSyntheticTaxiRoutes();
const SYNTHETIC_TAXI_HOTSPOTS = makeSyntheticTaxiHotspots();

function unsignedRandom(seed: number): number {
  let value = (seed + 0x9e3779b9) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x21f0aaad);
  value ^= value >>> 15;
  value = Math.imul(value, 0x735a2d97);
  value ^= value >>> 15;
  return (value >>> 0) / 0x1_0000_0000;
}

function symmetricRandom(seed: number): number {
  return unsignedRandom(seed) * 2 - 1;
}
