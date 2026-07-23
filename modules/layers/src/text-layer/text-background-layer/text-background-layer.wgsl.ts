// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export const shaderWGSL = /* wgsl */ `\
struct TextBackgroundUniforms {
  billboard: f32,
  sizeScale: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  borderRadius: vec4<f32>,
  padding: vec4<f32>,
  sizeUnits: i32,
  stroked: f32
};

struct TextUniforms {
  cutoffPixels: vec2<f32>,
  align: vec2<i32>,
  fontSize: f32,
  flipY: f32
};

@group(0) @binding(auto) var<uniform> textBackground: TextBackgroundUniforms;
@group(0) @binding(auto) var<uniform> text: TextUniforms;

fn rotate_by_angle(vertex: vec2<f32>, angle_deg: f32) -> vec2<f32> {
  let angle_radian = angle_deg * PI / 180.0;
  let c = cos(angle_radian);
  let s = sin(angle_radian);
  let rotation = mat2x2<f32>(vec2<f32>(c, -s), vec2<f32>(s, c));
  return rotation * vertex;
}

fn round_rect(p: vec2<f32>, size: vec2<f32>, radii: vec4<f32>) -> f32 {
  let pixelPositionCB = (p - vec2<f32>(0.5)) * size;
  let sizeCB = size * 0.5;

  let maxBorderRadius = min(size.x, size.y) * 0.5;
  let borderRadius = min(radii, vec4<f32>(maxBorderRadius));
  let xRadii = select(borderRadius.zw, borderRadius.xy, pixelPositionCB.x > 0.0);
  let radius = select(xRadii.y, xRadii.x, pixelPositionCB.y > 0.0);
  let q = abs(pixelPositionCB) - sizeCB + radius;
  return -(min(max(q.x, q.y), 0.0) + length(max(q, vec2<f32>(0.0))) - radius);
}

fn rect(p: vec2<f32>, size: vec2<f32>) -> f32 {
  let pixelPosition = p * size;
  return min(
    min(pixelPosition.x, size.x - pixelPosition.x),
    min(pixelPosition.y, size.y - pixelPosition.y)
  );
}

fn premultiplied_alpha(color: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(color.rgb * color.a, color.a);
}

struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec2<f32>,

  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceRects: vec4<f32>,
  @location(6) instanceClipRect: vec4<f32>,
  @location(7) instancePixelOffsets: vec2<f32>,
  @location(8) instanceFillColors: vec4<f32>,
  @location(9) instanceLineColors: vec4<f32>,
  @location(10) instanceLineWidths: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,

  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) vLineWidth: f32,
  @location(3) uv: vec2<f32>,
  @location(4) dimensions: vec2<f32>,
  @location(5) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(inp: Attributes) -> Varyings {
  geometry.worldPosition = inp.instancePositions;
  geometry.uv = inp.positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(inp.instanceIndex);

  var outp: Varyings;
  outp.uv = inp.positions;
  outp.vLineWidth = inp.instanceLineWidths;

  let sizePixels = clamp(
    project_unit_size_to_pixel(inp.instanceSizes * textBackground.sizeScale, textBackground.sizeUnits),
    textBackground.sizeMinPixels,
    textBackground.sizeMaxPixels
  );
  let instanceScale = sizePixels / text.fontSize;

  outp.dimensions = inp.instanceRects.zw * instanceScale + textBackground.padding.xy + textBackground.padding.zw;

  var pixelOffset =
    (inp.positions * inp.instanceRects.zw + inp.instanceRects.xy) * instanceScale +
    mix(-textBackground.padding.xy, textBackground.padding.zw, inp.positions);
  pixelOffset = rotate_by_angle(pixelOffset, inp.instanceAngles);
  pixelOffset = pixelOffset + inp.instancePixelOffsets;
  pixelOffset.y = pixelOffset.y * -1.0;

  var xy = project_size_vec2(inp.instanceClipRect.xy) * project.scale;
  let wh = project_size_vec2(inp.instanceClipRect.zw) * project.scale;
  if (text.flipY > 0.5) {
    xy.y = -xy.y - wh.y;
  }
  if (inp.instanceClipRect.z >= 0.0) {
    outp.dimensions.x = wh.x;
    pixelOffset.x =
      xy.x + outp.uv.x * wh.x + mix(-textBackground.padding.x, textBackground.padding.z, outp.uv.x);
  }
  if (inp.instanceClipRect.w >= 0.0) {
    outp.dimensions.y = wh.y;
    pixelOffset.y =
      xy.y + outp.uv.y * wh.y + mix(-textBackground.padding.y, textBackground.padding.w, outp.uv.y);
  }

  if (textBackground.billboard > 0.5) {
    var pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0));
    let clipOffset = project_pixel_size_to_clipspace(pixelOffset);
    pos = vec4<f32>(pos.x + clipOffset.x, pos.y + clipOffset.y, pos.z, pos.w);
    outp.position = pos;
  } else {
    var offsetCommon = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    if (text.flipY > 0.5) {
      offsetCommon.y = offsetCommon.y * -1.0;
    }
    outp.position = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, offsetCommon);
  }

  outp.vFillColor = vec4<f32>(inp.instanceFillColors.rgb, inp.instanceFillColors.a * layer.opacity);
  outp.vLineColor = vec4<f32>(inp.instanceLineColors.rgb, inp.instanceLineColors.a * layer.opacity);
  outp.pickingColor = picking_getPickingColorFromIndex(inp.instanceIndex);

  return outp;
}

fn get_stroked_frag_color(dist: f32, lineWidth: f32, fillColor: vec4<f32>, lineColor: vec4<f32>) -> vec4<f32> {
  let isBorder = smoothedge(dist, lineWidth);
  return mix(fillColor, lineColor, isBorder);
}

@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = inp.uv;

  var fragColor: vec4<f32>;
  if (any(textBackground.borderRadius != vec4<f32>(0.0))) {
    let distToEdge = round_rect(inp.uv, inp.dimensions, textBackground.borderRadius);
    if (textBackground.stroked > 0.5) {
      fragColor = get_stroked_frag_color(distToEdge, inp.vLineWidth, inp.vFillColor, inp.vLineColor);
    } else {
      fragColor = inp.vFillColor;
    }
    let shapeAlpha = smoothedge(-distToEdge, 0.0);
    fragColor.a = fragColor.a * shapeAlpha;
  } else {
    if (textBackground.stroked > 0.5) {
      let distToEdge = rect(inp.uv, inp.dimensions);
      fragColor = get_stroked_frag_color(distToEdge, inp.vLineWidth, inp.vFillColor, inp.vLineColor);
    } else {
      fragColor = inp.vFillColor;
    }
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inp.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return premultiplied_alpha(fragColor);
}
`;
