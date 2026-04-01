// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  gouraudMaterial as lumaGouraudMaterial,
  phongMaterial as lumaPhongMaterial
} from '@luma.gl/shadertools';

import type {
  GouraudMaterialProps as LumaGouraudMaterialProps,
  PhongMaterialProps as LumaPhongMaterialProps
} from '@luma.gl/shadertools';

function omitUseByteColors<T extends {useByteColors?: unknown}>(uniforms: T): Omit<T, 'useByteColors'> {
  const {useByteColors: _useByteColors, ...rest} = uniforms;
  return rest;
}

// luma.gl 9.3.1 currently ships material uniformTypes that include `useByteColors`,
// while the bundled GLSL uniform blocks in the same package do not. Strip the
// extra uniform until the upstream package is consistent again.
export const gouraudMaterial = {
  ...lumaGouraudMaterial,
  uniformTypes: omitUseByteColors(lumaGouraudMaterial.uniformTypes),
  defaultUniforms: omitUseByteColors(lumaGouraudMaterial.defaultUniforms),
  getUniforms(props: LumaGouraudMaterialProps) {
    return omitUseByteColors(lumaGouraudMaterial.getUniforms(props));
  }
};

export const phongMaterial = {
  ...lumaPhongMaterial,
  uniformTypes: omitUseByteColors(lumaPhongMaterial.uniformTypes),
  defaultUniforms: omitUseByteColors(lumaPhongMaterial.defaultUniforms),
  getUniforms(props: LumaPhongMaterialProps) {
    return omitUseByteColors(lumaPhongMaterial.getUniforms(props));
  }
};

export type GouraudMaterialProps = LumaGouraudMaterialProps;
export type PhongMaterialProps = LumaPhongMaterialProps;
