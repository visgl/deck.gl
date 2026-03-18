// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {lighting, pbrMaterial} from '@luma.gl/shadertools';

import type {
  PBRMaterialBindings,
  PBRMaterialProps,
  PBRMaterialUniforms,
  ShaderModule
} from '@luma.gl/shadertools';

const source = (pbrMaterial.source as string)
  .replace(
    /fn pbr_setPositionNormalTangentUV\([\s\S]*?\n}\n/,
    `fn pbr_setPositionNormalTangentUV(position: vec4f, normal: vec4f, tangent: vec4f, uv: vec2f)
{
  fragmentInputs.pbr_vPosition = position.xyz;
  fragmentInputs.pbr_vNormal = normal.xyz;
  fragmentInputs.pbr_vTBN = mat3x3f(
    vec3f(1.0, 0.0, 0.0),
    vec3f(0.0, 1.0, 0.0),
    vec3f(0.0, 0.0, 1.0)
  );
  fragmentInputs.pbr_vUV = uv;
}
`
  )
  .replace(/pbrProjection\.camera/g, 'project.cameraPosition');

export const scenegraphPbrMaterial = {
  ...pbrMaterial,
  dependencies: [lighting],
  source
} as const satisfies ShaderModule<PBRMaterialProps, PBRMaterialUniforms, PBRMaterialBindings>;
