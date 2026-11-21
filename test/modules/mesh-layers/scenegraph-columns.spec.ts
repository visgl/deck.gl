// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {CubeGeometry, Model, ModelNode, GroupNode} from '@luma.gl/engine';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {device as webglDevice} from '@deck.gl/test-utils/vitest';
import {makeGPUVectorFromArrow} from '@luma.gl/graph/arrow';
import {Vector, vectorFromArray, FixedSizeList, Field, Float32} from 'apache-arrow';

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Scenegraph columns preserve model identity and borrowed buffers (${backend})`, async ({
    skip
  }) => {
    const device = backend === 'webgl' ? webglDevice : await getWebGPUTestDevice('core');
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
      getPosition: arrowPositions,
      scenegraph: new GroupNode([]),
      _lighting: 'flat' as const,
      getColor: [255, 0, 0, 255] as [number, number, number, number],
      getScale: [10, 10, 10] as [number, number, number],
      pickable: true,
      onFirstDraw: () => expect(layer.state.columns?.length).toBe(2),
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
    let layer: ScenegraphLayer = new ScenegraphLayer({...props, numInstances: 2});
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
      const gpuProps = {
        ...props,
        positions,
        getColor: [0, 255, 0, 255] as [number, number, number, number]
      };
      layer = new ScenegraphLayer(gpuProps);
      deck.setProps({layers: [layer]});
      await expect.poll(() => layer.isLoaded).toBe(true);
      expect(model).toBe(firstModel);
      expect(await deck.pickObjectAsync({x: 100, y: 64})).toBeNull();
      layer = new ScenegraphLayer({...gpuProps, getScale: () => [20, 20, 20]});
      deck.setProps({layers: [layer]});
      await expect.poll(() => layer.isLoaded).toBe(true);
      expect((await deck.pickObjectAsync({x: 100, y: 64}))?.index).toBe(1);
      expect((await deck.pickObjectAsync({x: 84, y: 64}))?.index).toBe(1);
      layer = new ScenegraphLayer({
        ...props,
        getPosition: row => row.position,
        data: [{position: [0, 0, 0]}]
      });
      deck.setProps({layers: [layer]});
      await expect.poll(() => layer.getNumInstances()).toBe(1);
      expect(model).toBe(firstModel);
    } finally {
      deck.finalize();
      expect(device.isLost).toBe(false);
      parent.remove();
      expect(positions.data[0].buffer.destroyed).toBe(false);
      positions.destroy();
    }
  });
}
