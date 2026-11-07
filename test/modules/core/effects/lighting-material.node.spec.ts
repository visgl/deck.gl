// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {AmbientLight, LightingEffect, phongMaterial, gouraudMaterial} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';
import {ShaderInputs} from '@luma.gl/engine';

for (const materialModule of [phongMaterial, gouraudMaterial]) {
  test(`LightingEffect#material false disables ${materialModule.name}`, () => {
    const effect = new LightingEffect({ambientLight: new AmbientLight()});
    const shaderInputs = new ShaderInputs({[materialModule.name]: materialModule});
    const layer = new PolygonLayer({id: 'unlit-material', material: false});
    const props = effect.getShaderModuleProps(layer, {});

    // Exercise luma's prop conversion: passing false directly restores lit defaults.
    shaderInputs.setProps({[materialModule.name]: props[materialModule.name]});
    expect(shaderInputs.getUniformValues()[materialModule.name].unlit).toBe(true);
    expect(props.lighting.enabled).toBe(true);

    const litLayer = layer.clone({material: true});
    const litProps = effect.getShaderModuleProps(litLayer, {});
    shaderInputs.setProps({[materialModule.name]: litProps[materialModule.name]});
    expect(shaderInputs.getUniformValues()[materialModule.name].unlit).toBe(false);
  });

  test(`LightingEffect#preserves custom ${materialModule.name} settings`, () => {
    const effect = new LightingEffect({ambientLight: new AmbientLight()});
    const material = {ambient: 0.2, diffuse: 0.4, shininess: 8, specularColor: [10, 20, 30]};
    const layer = new PolygonLayer({id: 'custom-material', material});
    const props = effect.getShaderModuleProps(layer, {});
    const shaderInputs = new ShaderInputs({[materialModule.name]: materialModule});

    shaderInputs.setProps({[materialModule.name]: props[materialModule.name]});
    expect(shaderInputs.getUniformValues()[materialModule.name]).toMatchObject({
      ...material,
      unlit: false
    });
  });
}
