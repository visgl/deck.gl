// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {Deck, DirectionalLight, LayerExtension, LightingEffect} from '@deck.gl/core';
import {CollisionFilterExtension, _TerrainExtension as TerrainExtension} from '@deck.gl/extensions';
import {ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {Texture} from '@luma.gl/core';

import type {Layer} from '@deck.gl/core';

test('LightingEffect binds shadow samplers in terrain, collision and picking draws', async () => {
  const bindings = new Map<string, boolean>();
  class RecordShadowBindings extends LayerExtension {
    static extensionName = 'RecordShadowBindings';

    override draw(this: Layer, {renderPass, shaderModuleProps}: Parameters<Layer['draw']>[0]) {
      const framebufferId = renderPass.props.framebuffer?.id;
      const pass =
        framebufferId === 'height-map' || framebufferId === 'collision-default'
          ? framebufferId
          : shaderModuleProps.picking?.isActive
            ? 'picking'
            : null;
      if (pass) {
        const {shadow_uShadowMap0, shadow_uShadowMap1} =
          this.getModels()[0].shaderInputs.getBindingValues();
        bindings.set(
          pass,
          shadow_uShadowMap0 instanceof Texture && shadow_uShadowMap1 instanceof Texture
        );
      }
    }
  }

  const recordShadowBindings = new RecordShadowBindings();
  const layers = [
    new SolidPolygonLayer({
      id: 'terrain',
      data: [
        [
          [-0.04, -0.04],
          [0.04, -0.04],
          [0.04, 0.04],
          [-0.04, 0.04]
        ]
      ],
      getPolygon: polygon => polygon,
      operation: 'terrain+draw',
      extensions: [recordShadowBindings]
    }),
    new ScatterplotLayer({
      id: 'overlay',
      data: [[0.007, 0]],
      getPosition: point => point,
      radiusUnits: 'pixels',
      getRadius: 8,
      pickable: true,
      extensions: [new TerrainExtension(), new CollisionFilterExtension(), recordShadowBindings]
    }),
    new ScatterplotLayer({
      id: 'pick-target',
      data: [[0, 0]],
      getPosition: point => point,
      radiusUnits: 'pixels',
      getRadius: 8,
      pickable: true,
      extensions: [recordShadowBindings]
    })
  ];
  const lighting = new LightingEffect({
    light: new DirectionalLight({direction: [1, 1, -1], _shadow: true})
  });
  let resolveFrame: () => void;
  const frame = new Promise<void>(resolve => {
    resolveFrame = resolve;
  });
  const errors: Error[] = [];
  let context: WebGL2RenderingContext | undefined;
  const deck = new Deck({
    width: 128,
    height: 128,
    useDevicePixels: false,
    initialViewState: {longitude: 0, latitude: 0, zoom: 12},
    layers,
    effects: [lighting],
    layerFilter: ({layer, renderPass}) =>
      layer.id !== 'terrain' || !renderPass.startsWith('picking'),
    onAfterRender: ({gl}) => {
      context = gl;
      resolveFrame();
    },
    onError: error => errors.push(error)
  });
  try {
    await frame;
    const hit = deck.pickObject({x: 64, y: 64});
    expect(errors).toEqual([]);
    expect(bindings.get('height-map'), 'terrain height map draws with both samplers').toBe(true);
    expect(bindings.get('collision-default'), 'collision map draws with both samplers').toBe(true);
    expect(bindings.get('picking'), 'picking draws with both samplers').toBe(true);
    expect(hit?.layer?.id).toBe('pick-target');
  } finally {
    deck.finalize();
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  }
});
