// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* wgsl */ `\
struct VertexInputs {
  @location(0) positions: vec3<f32>,
#ifdef HAS_NORMALS
  @location(1) normals: vec3<f32>,
#endif
  @location(2) colors: vec4<f32>,
#ifdef HAS_UV
  @location(3) texCoords: vec2<f32>,
#endif
#ifdef HAS_UV_REGIONS
  @location(4) uvRegions: vec4<f32>,
#endif
#ifdef HAS_FEATURE_IDS
  @location(5) rowIndexes: u32,
#endif
  @location(6) instanceColors: vec4<f32>,
  @location(7) instanceModelMatrixCol0: vec3<f32>,
  @location(8) instanceModelMatrixCol1: vec3<f32>,
  @location(9) instanceModelMatrixCol2: vec3<f32>,
};

struct FragmentInputs {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) texCoord: vec2<f32>,
  @location(2) pbrPosition: vec3<f32>,
  @location(3) pbrNormal: vec3<f32>,
  @location(4) pickingColor: vec3<f32>,
};

fn applyUVRegion(uv: vec2<f32>, uvRegion: vec4<f32>) -> vec2<f32> {
#ifdef HAS_UV_REGIONS
  // https://github.com/Esri/i3s-spec/blob/master/docs/1.7/geometryUVRegion.cmn.md
  return fract(uv) * (uvRegion.zw - uvRegion.xy) + uvRegion.xy;
#else
  return uv;
#endif
}

@vertex
fn vertexMain(
  inputs: VertexInputs,
  @builtin(instance_index) instanceIndex: u32
) -> FragmentInputs {
  var outputs: FragmentInputs;
  var texCoord = vec2<f32>(0.0);
  var normal = vec3<f32>(0.0, 0.0, 1.0);
  var uvRegion = vec4<f32>(0.0);

#ifdef HAS_UV
  texCoord = inputs.texCoords;
#endif
#ifdef HAS_NORMALS
  normal = inputs.normals;
#endif
#ifdef HAS_UV_REGIONS
  uvRegion = inputs.uvRegions;
#endif

  texCoord = applyUVRegion(texCoord, uvRegion);
  geometry.uv = texCoord;
#ifdef HAS_FEATURE_IDS
  geometry.pickingColor = picking_getPickingColorFromIndex(inputs.rowIndexes);
#else
  geometry.pickingColor = picking_getPickingColorFromIndex(instanceIndex);
#endif

  let instanceModelMatrix = mat3x3<f32>(
    inputs.instanceModelMatrixCol0,
    inputs.instanceModelMatrixCol1,
    inputs.instanceModelMatrixCol2
  );
  let commonPosition = vec4<f32>(project_position_vec3_f32(inputs.positions), 1.0);

  geometry.position = commonPosition;
  geometry.normal = project_normal(instanceModelMatrix * normal);

  outputs.position = project_common_position_to_clipspace(commonPosition);
  outputs.color = vec4<f32>(
    inputs.colors.rgb * inputs.instanceColors.rgb,
    inputs.instanceColors.a
  );
  outputs.texCoord = texCoord;
  outputs.pbrPosition = commonPosition.xyz;
  outputs.pbrNormal = geometry.normal;
  outputs.pickingColor = geometry.pickingColor;
  return outputs;
}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  fragmentGeometry.uv = inputs.texCoord;

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inputs.pickingColor)) {
      discard;
    }
    return vec4<f32>(inputs.pickingColor, 1.0);
  }

  fragmentInputs.pbr_vPosition = inputs.pbrPosition;
  fragmentInputs.pbr_vUV0 = inputs.texCoord;
  fragmentInputs.pbr_vUV1 = vec2<f32>(0.0);
  fragmentInputs.pbr_vNormal = inputs.pbrNormal;

  var color = inputs.color * pbr_filterColor(vec4<f32>(0.0));
  color.a *= layer.opacity;

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inputs.pickingColor - highlightedObjectColor))) {
      let highlightAlpha = picking.highlightColor.a;
      let blendedAlpha = highlightAlpha + color.a * (1.0 - highlightAlpha);
      if (blendedAlpha > 0.0) {
        color = vec4<f32>(
          mix(color.rgb, picking.highlightColor.rgb, highlightAlpha / blendedAlpha),
          blendedAlpha
        );
      }
    }
  }

  return deckgl_premultiplied_alpha(color);
}
`;
