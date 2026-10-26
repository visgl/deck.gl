// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {CompositeLayer, Layer, type UpdateParameters} from '@deck.gl/core';
import {testLayerAsync} from '@deck.gl/test-utils/vitest';

class AsyncDataLayer extends Layer {
  static layerName = 'AsyncDataLayer';

  initializeState(): void {
    this.setState({dataLength: 0});
  }

  updateState({props}: UpdateParameters<this>): void {
    this.setState({dataLength: Array.isArray(props.data) ? props.data.length : 0});
  }
}

for (const asyncAssertion of [false, true]) {
  test(`testLayerAsync checks resolved data with asyncAssertion=${asyncAssertion}`, async () => {
    const rows = [1, 2];
    const checkedLengths: number[] = [];
    await testLayerAsync({
      Layer: AsyncDataLayer,
      draw: false,
      testCases: [
        {
          title: 'resolved data',
          props: {data: Promise.resolve(rows)},
          onAfterUpdate: ({layer}) => {
            const check = () => {
              if (layer.isLoaded) checkedLengths.push(layer.state.dataLength);
            };
            return asyncAssertion ? Promise.resolve().then(check) : check();
          }
        }
      ]
    });
    expect(checkedLengths.at(-1)).toBe(rows.length);
  });
}

class ParentUpdateLayer extends Layer {
  static layerName = 'ParentUpdateLayer';

  initializeState(): void {
    this.parent?.setState({ready: true});
  }
}

class DeferredParentLayer extends CompositeLayer {
  static layerName = 'DeferredParentLayer';

  initializeState(): void {
    this.setState({ready: false});
  }

  renderLayers() {
    return new ParentUpdateLayer(this.getSubLayerProps({id: 'child'}), {
      data: [this.state.ready]
    });
  }
}

test('testLayerAsync applies updates requested by initializing sublayers', async () => {
  let checkedReady = false;
  await testLayerAsync({
    Layer: DeferredParentLayer,
    draw: false,
    testCases: [
      {
        title: 'initializing sublayer updates parent',
        props: {},
        onAfterUpdate: ({subLayer}) => {
          checkedReady = subLayer?.props.data[0];
        }
      }
    ]
  });
  expect(checkedReady).toBe(true);
});
