// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  getSunLight,
  getMoonLight,
  getMoonPosition,
  getMoonIllumination,
  getSkyDirection
} from '@math.gl/sun';
import type {LightingProps} from '@luma.gl/shadertools';
import {CITY_ORIGIN} from './river-district-data';
import {getRiverfrontSun} from './soft-shadows/sun';

/** Shared astronomy and an illustrative night exposure for the riverfront scenes. */
export function getRiverfrontSkyLighting(hour: number, cloudCover = 0) {
  const sun = getRiverfrontSun(hour);
  const sunlight = getSunLight(sun.altitude, {cloudCover});
  const position = getMoonPosition(sun.timestamp, CITY_ORIGIN[1], CITY_ORIGIN[0]);
  const illumination = getMoonIllumination(sun.timestamp);
  const moonlight = getMoonLight(position.altitude, {
    phaseAngle: Math.acos(2 * illumination.fraction - 1),
    distance: position.distance,
    cloudCover
  });
  const moonDirection = getSkyDirection(position.altitude, position.azimuth);
  // Moon intensity has its own full-moon reference, not the solar intensity scale.
  // Lift night exposure for readability; the cool tint approximates night vision.
  const night = 1 - Math.min(1, sunlight.intensity * 4 + sunlight.diffuse.intensity * 6);
  const moonIntensity = Math.sqrt(moonlight.intensity) * night * 0.45;
  const moonColor: [number, number, number] = [
    moonlight.color[0] * 0.7,
    moonlight.color[1] * 0.82,
    moonlight.color[2]
  ];
  const ambientColor: [number, number, number] =
    sunlight.diffuse.intensity > 0 ? sunlight.diffuse.color : [0.65, 0.75, 1];
  const lights: LightingProps = {
    enabled: true,
    useByteColors: false,
    lights: [
      {
        type: 'ambient',
        color: ambientColor,
        intensity: 0.08 + sunlight.diffuse.intensity * 1.8 + moonIntensity * 0.12
      },
      {
        type: 'directional',
        color: sunlight.color,
        intensity: sunlight.intensity,
        direction: [-sun.direction[0], -sun.direction[1], -sun.direction[2]]
      },
      {
        type: 'directional',
        color: moonColor,
        intensity: moonIntensity,
        direction: [-moonDirection[0], -moonDirection[1], -moonDirection[2]]
      }
    ]
  };
  return {sun, sunlight, moonDirection, moonIntensity, moonColor, lights};
}
