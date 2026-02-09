// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = /* glsl */ `\
uniform columnShapeUniforms {
  bool bevelEnabled;
  float bevelTopZ;
} columnShape;
`;

const vs = /* glsl */ `
${uniformBlock}

in float instanceBevelSegs;
in float instanceBevelHeights;
in float instanceBevelBulge;
in float instanceRadii;
`;

const fs = `
${uniformBlock}
`;

const inject = {
  // DECKGL_FILTER_SIZE receives `inout vec3 size` (the offset vector passed as `pos` in main).
  // Instance attributes declared in `vs` are in scope here.
  'vs:DECKGL_FILTER_SIZE': /* glsl */ `
    if (columnShape.bevelEnabled) {
      size.xy *= instanceRadii;
    }
  `,

  // vs:#main-end is injected at the end of main() where all vertex/instance
  // attributes (positions, instanceElevations, etc.) are in scope.
  // We recompute ALL vertex positions when bevel is enabled because the standard
  // elevation formula (positions.z * fullElevation) is wrong for truncated cylinder + dome.
  'vs:#main-end': /* glsl */ `
    if (columnShape.bevelEnabled && column.extruded) {
      float bevelSegs = instanceBevelSegs;
      float bevelHeight = instanceBevelHeights;
      float bevelBulge = instanceBevelBulge;

      float fullElevation = instanceElevations * column.elevationScale;

      // Per-instance bevel flags
      bool isFlat = bevelHeight < 0.001 || bevelSegs < 1.5;
      bool isCone = bevelSegs > 1.5 && bevelSegs < 2.5;
      bool isBevelVertex = positions.z > columnShape.bevelTopZ;

      // Bevel size clamped to full elevation
      float bevelSize = isFlat ? 0.0 : min(bevelHeight, fullElevation);

      float elevation = 0.0;
      vec2 adjustedXY = positions.xy;
      vec3 adjustedNormal = normals;

      if (isBevelVertex) {
        // Dome/bevel vertex: z encodes the spherical phi angle via asin
        float phi = asin(clamp(positions.z, 0.0, 1.0));
        float t = phi / 1.5708; // normalize to [0, 1] (pi/2)

        if (isFlat) {
          // Flat instance: collapse dome to flat top
          elevation = fullElevation;
          adjustedXY = length(positions.xy) > 0.001 ? normalize(positions.xy) : vec2(1.0, 0.0);
          adjustedNormal = vec3(0.0, 0.0, 1.0);
        } else if (isCone) {
          // Cone: linear interpolation
          elevation = fullElevation - bevelSize + t * bevelSize;
          adjustedXY = (length(positions.xy) > 0.001 ? normalize(positions.xy) : vec2(1.0, 0.0)) * (1.0 - t);
          adjustedNormal = vec3(normalize(positions.xy) * 0.7071, 0.7071);
        } else {
          // Dome: use z directly for elevation (smooth curve from geometry)
          elevation = fullElevation - bevelSize + positions.z * bevelSize;
          float r = length(positions.xy);
          vec2 xyDir = r > 0.001 ? positions.xy / r : vec2(1.0, 0.0);
          // Bulge effect: radial distortion along the dome surface
          float bulgeEffect = bevelBulge * sin(t * 3.14159) * (1.0 - t * t);
          adjustedXY = xyDir * max(r + bulgeEffect, 0.0);
          // Use geometry's smooth normals (already correct from dome-column-geometry)
        }
      } else {
        // Cylinder vertex: z in [-1, bevelTopZ]
        // Map z from [-1, bevelTopZ] to [0, 1] range for cylinder height
        float cylinderT = (positions.z + 1.0) / (columnShape.bevelTopZ + 1.0);
        elevation = cylinderT * (isFlat ? fullElevation : (fullElevation - bevelSize));
      }

      // Recompute position with corrected elevation
      float shouldRender = float(instanceFillColors.a > 0.0 && instanceElevations >= 0.0);
      float dotRadius = column.radius * instanceRadii * column.coverage * shouldRender;

      vec3 centroidPosition = vec3(instancePositions.xy, instancePositions.z + elevation);
      mat2 rm = mat2(cos(column.angle), sin(column.angle), -sin(column.angle), cos(column.angle));
      vec2 ofs = (rm * adjustedXY + column.offset) * dotRadius;
      if (column.radiusUnits == UNIT_METERS) {
        ofs = project_size(ofs);
      }
      vec3 bevelPos = vec3(ofs, 0.0);

      gl_Position = project_position_to_clipspace(centroidPosition, instancePositions64Low, bevelPos, geometry.position);

      // Recompute normal
      geometry.normal = project_normal(vec3(rm * adjustedNormal.xy, adjustedNormal.z));

      // Recompute Gouraud lighting
      if (!column.isStroke) {
        #ifndef FLAT_SHADING
        vec3 lightColor = lighting_getLightColor(vColor.rgb / max(layer.opacity, 0.001), project.cameraPosition, geometry.position.xyz, geometry.normal);
        vColor = vec4(lightColor, vColor.a);
        #endif
      }
    }
  `
};

export type ColumnShapeModuleProps = {
  bevelEnabled?: boolean;
  bevelTopZ?: number;
};

type ColumnShapeModuleUniforms = {
  bevelEnabled?: boolean;
  bevelTopZ?: number;
};

function getUniforms(opts?: ColumnShapeModuleProps | {}): ColumnShapeModuleUniforms {
  if (!opts) {
    return {};
  }
  const uniforms: ColumnShapeModuleUniforms = {};
  if ('bevelEnabled' in opts) {
    uniforms.bevelEnabled = opts.bevelEnabled;
  }
  if ('bevelTopZ' in opts) {
    uniforms.bevelTopZ = opts.bevelTopZ;
  }
  return uniforms;
}

export const columnShapeShaders = {
  name: 'columnShape',
  vs,
  fs,
  inject,
  getUniforms,
  uniformTypes: {
    bevelEnabled: 'i32',
    bevelTopZ: 'f32'
  }
} as const satisfies ShaderModule<ColumnShapeModuleProps, ColumnShapeModuleUniforms>;
