// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* wgsl */`\
struct ScatterplotUniforms {
  radiusScale: f32,
  radiusMinPixels: f32,
  radiusMaxPixels: f32,
  lineWidthScale: f32,
  lineWidthMinPixels: f32,
  lineWidthMaxPixels: f32,
  stroked: f32,
  filled: i32,
  antialiasing: i32,
  billboard: i32,
  radiusUnits: i32,
  lineWidthUnits: i32,
};

@group(0) @binding(0) var<uniform> scatterplot: ScatterplotUniforms;

// Geometry module mock

struct Geometry {
  worldPosition: vec3<f32>,
  uv: vec2<f32>,
  pickingColor: vec3<f32>,
  position: vec4<f32>,
};

const SMOOTH_EDGE_RADIUS: f32 = 0.5;

// Project module mock

fn project_size_to_pixel(size: f32, units: i32) -> f32 {
  return size;
}

fn project_position_to_clipspace(position: vec3<f32>, position64Low: vec3<f32>, offset: vec3<f32>, result: vec4<f32>) -> vec4<f32> {
  return result;
}

fn project_pixel_size_to_clipspace(pixelSize: vec2<f32>) -> vec2<f32> {
  return pixelSize;
}

// Main shaders

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) unitPosition: vec2<f32>,
  @location(3) innerUnitRadius: f32,
  @location(4) outerRadiusPixels: f32,
};

@vertex
fn vertexMain(
  @location(0) positions: vec3<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceRadius: f32,
  @location(4) instanceLineWidths: f32,
  @location(5) instanceFillColors: vec4<f32>,
  @location(6) instanceLineColors: vec4<f32>,
  @location(7) instancePickingColors: vec3<f32>
) -> VertexOutput {
  var output: VertexOutput;
  var geometry: Geometry;

  geometry.worldPosition = instancePositions;

  // Multiply out radius and clamp to limits
  output.outerRadiusPixels = clamp(
    project_size_to_pixel(scatterplot.radiusScale * instanceRadius, scatterplot.radiusUnits),
    scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
  );

  // Multiply out line width and clamp to limits
  let lineWidthPixels = clamp(
    project_size_to_pixel(scatterplot.lineWidthScale * instanceLineWidths, scatterplot.lineWidthUnits),
    scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
  );

  // outer radius needs to offset by half stroke width
  output.outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
  // Expand geometry to accommodate edge smoothing
  let edgePadding = select(
    (output.outerRadiusPixels + SMOOTH_EDGE_RADIUS) / output.outerRadiusPixels,
    1.0,
    scatterplot.antialiasing != 0
  );

  // position on the containing square in [-1, 1] space
  output.unitPosition = edgePadding * positions.xy;
  geometry.uv = output.unitPosition;
  geometry.pickingColor = instancePickingColors;

  output.innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / output.outerRadiusPixels;

  if (scatterplot.billboard) {
    output.position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3<f32>(0.0), geometry.position);
    // DECKGL_FILTER_GL_POSITION(output.position, geometry);
    let offset = edgePadding * positions * output.outerRadiusPixels;
    // DECKGL_FILTER_SIZE(offset, geometry);
    output.position.xy += project_pixel_size_to_clipspace(offset.xy);
  } else {
    let offset = edgePadding * positions * project_pixel_size(output.outerRadiusPixels);
    // DECKGL_FILTER_SIZE(offset, geometry);
    output.position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
    // DECKGL_FILTER_GL_POSITION(output.position, geometry);
  }

  // Apply opacity to instance color, or return instance picking color
  output.vFillColor = vec4<f32>(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(output.vFillColor, geometry);
  output.vLineColor = vec4<f32>(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(output.vLineColor, geometry);

  return output;
}

@fragment
fn fragmentMain(
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) unitPosition: vec2<f32>,
  @location(3) innerUnitRadius: f32,
  @location(4) outerRadiusPixels: f32
) -> @location(0) vec4<f32> {
  var geometry: Geometry;
  geometry.uv = unitPosition;

  let distToCenter = length(unitPosition) * outerRadiusPixels;
  let inCircle = select(
    smoothedge(distToCenter, outerRadiusPixels),
    step(distToCenter, outerRadiusPixels),
    scatterplot.antialiasing
  );

  if (inCircle == 0.0) {
    discard;
  }

  var fragColor: vec4<f32>;

  if (scatterplot.stroked > 0.5) {
    let isLine = select(
      smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter),
      step(innerUnitRadius * outerRadiusPixels, distToCenter),
      scatterplot.antialiasing
    );

    if (scatterplot.filled) {
      fragColor = mix(vFillColor, vLineColor, isLine);
    } else {
      if (isLine == 0.0) {
        discard;
      }
      fragColor = vec4<f32>(vLineColor.rgb, vLineColor.a * isLine);
    }
  } else if (scatterplot.filled == false) {
    discard;
  } else {
    fragColor = vFillColor;
  }

  fragColor.a *= inCircle;
  // DECKGL_FILTER_COLOR(fragColor, geometry);

  return fragColor;
}
`;
