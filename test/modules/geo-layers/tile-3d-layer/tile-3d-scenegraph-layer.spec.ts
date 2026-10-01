// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {GroupNode, Model, ModelNode, CubeGeometry} from '@luma.gl/engine';
import Tile3DScenegraphLayer from '../../../../modules/geo-layers/src/tile-3d-layer/tile-3d-scenegraph-layer';
import TileProcessingScheduler from '../../../../modules/geo-layers/src/tile-3d-layer/tile-processing-scheduler';

test('deferred tile creation updates attributes and uses the latest scenegraph', () => {
  const scheduler = new TileProcessingScheduler(0);
  let allowCreation = false;
  vi.spyOn(scheduler, 'run').mockImplementation((_layer, task) => {
    if (!allowCreation) return false;
    task();
    return true;
  });
  const firstScenegraph = new GroupNode([]);
  const replacementScenegraph = new GroupNode([]);
  const getScene = vi.fn(
    (_scenegraph, {device, layer}) =>
      new GroupNode([
        new ModelNode({
          model: new Model(device, {
            geometry: new CubeGeometry(),
            isInstanced: true,
            bufferLayout: layer.getAttributeManager().getBufferLayouts(),
            vs: '#version 300 es\nin vec3 positions; in vec3 instancePositions; void main() { gl_Position = vec4(positions + instancePositions, 1.0); }',
            fs: '#version 300 es\nprecision highp float; out vec4 color; void main() { color = vec4(1.0); }'
          })
        })
      ])
  );

  testLayer({
    Layer: Tile3DScenegraphLayer,
    testCases: [
      {
        props: {
          data: [{position: [0, 0, 0]}, {position: [1, 1, 1]}],
          scenegraph: firstScenegraph,
          tileProcessingScheduler: scheduler,
          getScene
        },
        onAfterUpdate: ({layer}) => {
          expect(layer.state.scenegraphPending).toBe(true);
          expect(layer.isLoaded).toBe(false);
          expect(layer.getModels()).toHaveLength(0);
          expect(getScene).not.toHaveBeenCalled();
        }
      },
      {
        updateProps: {scenegraph: replacementScenegraph},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.scenegraphPending).toBe(true);
          expect(getScene).not.toHaveBeenCalled();
        }
      },
      {
        updateProps: {opacity: 0.5},
        onBeforeUpdate: () => {
          allowCreation = true;
        },
        onAfterUpdate: ({layer}) => {
          expect(layer.state.scenegraphPending).toBe(false);
          expect(layer.getModels()).toHaveLength(1);
          expect(getScene).toHaveBeenCalledOnce();
          expect(getScene.mock.calls[0][0].scenes[0]).toBe(replacementScenegraph);
          expect(layer.getAttributeManager()!.getAttributes().instancePositions.value).toBeTruthy();
          const model = layer.getModels()[0];
          expect(model.instanceCount).toBe(2);
          const positionLayout = model.pipeline.shaderLayout.attributes.find(
            attribute => attribute.name === 'instancePositions'
          )!;
          expect(model.vertexArray.attributes[positionLayout.location]).toBeTruthy();
        }
      }
    ],
    onError: error => expect(error).toBeFalsy()
  });
  scheduler.destroy();
});
