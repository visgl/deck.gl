// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {CubeGeometry, Model, ModelNode, GroupNode} from '@luma.gl/engine';
import {getWebGLTestDevice, getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {makeGPUVectorFromArrow} from '@luma.gl/graph/arrow';
import {Vector, vectorFromArray, FixedSizeList, Field, Float32} from 'apache-arrow';

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Scenegraph columns preserve model identity and borrowed buffers (${backend})`, async ({
    skip
  }) => {
    const device = await (backend === 'webgl' ? getWebGLTestDevice : getWebGPUTestDevice)('core');
    if (!device) return skip();
    const type = new FixedSizeList(3, new Field('component', new Float32()));
    const arrowPositions = new Vector([
      vectorFromArray([[-20, 0, 0]], type).data[0],
      vectorFromArray([[20, 0, 0]], type).data[0]
    ]);
    const positions = makeGPUVectorFromArrow(
      device,
      vectorFromArray(
        [
          [-20, 0, 0],
          [20, 0, 0]
        ],
        type
      ),
      {format: 'float32x3'}
    );
    const parent = document.createElement('div');
    document.body.append(parent);
    let model: Model | undefined;
    const props = {
      id: 'scene',
      positions: arrowPositions,
      scenegraph: new GroupNode([]),
      _lighting: 'flat' as const,
      getColor: [255, 0, 0, 255] as [number, number, number, number],
      getScale: [10, 10, 10] as [number, number, number],
      pickable: true,
      getScene: (_: unknown, {layer}: {layer: ScenegraphLayer}) => {
        model = new Model(device, {
          ...layer.getShaders(),
          geometry: new CubeGeometry(),
          isInstanced: true,
          bufferLayout: layer.state.columns!.getBufferLayouts()
        });
        return new GroupNode([new ModelNode({model})]);
      }
    };
    let layer = new ScenegraphLayer(props);
    const deck = new Deck({
      device,
      parent,
      width: 128,
      height: 128,
      useDevicePixels: false,
      views: new OrthographicView(),
      initialViewState: {target: [0, 0, 0], zoom: 0},
      layers: [layer]
    });
    try {
      await expect.poll(() => layer.isLoaded).toBe(true);
      await expect.poll(() => model?.pipeline.linkStatus, {timeout: 15000}).toBe('success');
      expect(layer.getNumInstances()).toBe(2);
      expect((await deck.pickObjectAsync({x: 84, y: 64}))?.index).toBe(1);
      const firstModel = model;
      layer = new ScenegraphLayer({...props, positions, getColor: [0, 255, 0, 255]});
      deck.setProps({layers: [layer]});
      await expect.poll(() => layer.isLoaded).toBe(true);
      expect(model).toBe(firstModel);
      expect((await deck.pickObjectAsync({x: 84, y: 64}))?.index).toBe(1);
      layer = new ScenegraphLayer({...props, positions: null, data: [{position: [0, 0, 0]}]});
      deck.setProps({layers: [layer]});
      await expect.poll(() => layer.getNumInstances()).toBe(1);
      expect(model).toBe(firstModel);
    } finally {
      deck.finalize();
      parent.remove();
      expect(positions.data[0].buffer.destroyed).toBe(false);
      positions.destroy();
    }
  });
}
