// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-catch';
import {Layer, COORDINATE_SYSTEM, transformBoundsToWorld, Viewport} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';
import LayerState from '../../../../modules/core/src/lib/layer-state';

class WorldBoundsLayer extends Layer<{customKey?: number}> {
  initializeState() {}

  override getBounds() {
    return [
      [-1, 0, 0],
      [1, 0, 0]
    ];
  }

  protected override getWorldBoundsOptions() {
    const options = super.getWorldBoundsOptions();
    if (!options) {
      return null;
    }
    return {...options, worldBoundsCacheKey: this.props.customKey};
  }
}

WorldBoundsLayer.defaultProps = {
  customKey: 0
};

const VIEWPORT = new Viewport({
  id: 'identity',
  width: 1,
  height: 1,
  position: [0, 0, 0],
  viewMatrix: new Matrix4().identity(),
  projectionMatrix: new Matrix4().identity()
});

test('transformBoundsToWorld#modelMatrix applied to corners', t => {
  const modelMatrix = new Matrix4().rotateZ(Math.PI / 2);
  const bounds = [
    [-1, 0, 0],
    [1, 0, 0]
  ] as [number[], number[]];

  const obb = transformBoundsToWorld({
    bounds,
    coordinateOrigin: [0, 0, 0],
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    modelMatrix,
    viewport: VIEWPORT
  });

  const halfAxes = obb.halfAxes;
  t.ok(Math.abs(halfAxes[0]) < 1e-6, 'x component is rotated to zero');
  t.ok(Math.abs(halfAxes[1] - 1) < 1e-6, 'y component reflects rotation');
  t.deepEqual([...obb.center], [0, 0, 0], 'center is preserved');
  t.end();
});

test('Layer#getWorldBounds#cache invalidation and key', t => {
  const layer = new WorldBoundsLayer({
    id: 'world-bounds-layer',
    data: [],
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    customKey: 0
  });

  layer.context = {viewport: VIEWPORT} as any;
  layer.internalState = new LayerState({attributeManager: null, layer});
  layer.internalState.viewport = VIEWPORT;

  const first = layer.getWorldBounds();
  const second = layer.getWorldBounds();
  t.equal(first, second, 'bounds are cached when inputs are unchanged');

  layer.updateState({
    props: layer.props,
    oldProps: layer.props,
    context: layer.context,
    changeFlags: {
      dataChanged: false,
      propsChanged: false,
      updateTriggersChanged: false,
      extensionsChanged: false,
      viewportChanged: true,
      stateChanged: false,
      propsOrDataChanged: false,
      somethingChanged: true
    }
  });

  const afterViewportChange = layer.getWorldBounds();
  t.notEqual(afterViewportChange, first, 'cache invalidates when viewport changes');

  const cachedAgain = layer.getWorldBounds();
  t.equal(afterViewportChange, cachedAgain, 'bounds cache is reused after recompute');

  layer.props = {...layer.props, customKey: 1};
  const afterKeyChange = layer.getWorldBounds();
  t.notEqual(afterKeyChange, cachedAgain, 'cache key forces recomputation');
  t.end();
});
