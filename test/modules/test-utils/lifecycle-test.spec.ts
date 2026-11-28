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

test('testLayerAsync lets timers finish between requested updates', async () => {
  let started = false;
  let completed = false;
  await testLayerAsync({
    Layer: AsyncDataLayer,
    draw: false,
    testCases: [
      {
        title: 'timer completion',
        props: {},
        onAfterUpdate: ({layer}) => {
          if (!started) {
            started = true;
            setTimeout(() => {
              completed = true;
            }, 0);
          }
          if (!completed) layer.setNeedsUpdate();
        }
      }
    ]
  });
  expect(completed).toBe(true);
});

class FailingDataLayer extends AsyncDataLayer {
  static layerName = 'FailingDataLayer';
  static finalized = false;

  updateState(params: UpdateParameters<this>): void {
    if (Array.isArray(params.props.data) && params.props.data.length) {
      throw new Error('loaded data update failed');
    }
    super.updateState(params);
  }

  finalizeState(): void {
    super.finalizeState(this.context);
    FailingDataLayer.finalized = true;
  }
}

test('testLayerAsync finalizes and rejects when a deferred layer update fails', async () => {
  FailingDataLayer.finalized = false;
  await expect(
    testLayerAsync({
      Layer: FailingDataLayer,
      draw: false,
      testCases: [
        {
          title: 'deferred update failure',
          props: {data: new Promise(resolve => setTimeout(() => resolve([1]), 0))}
        }
      ]
    })
  ).rejects.toThrow('loaded data update failed');
  expect(FailingDataLayer.finalized).toBe(true);
});
