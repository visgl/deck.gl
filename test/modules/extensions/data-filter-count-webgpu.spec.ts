// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {beforeEach, expect, test, vi} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer, PathLayer} from '@deck.gl/layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import {luma} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';

beforeEach(async context => {
  if (!(await getWebGPUTestDevice())) context.skip();
});

async function createDeck(layer, counts: number[], configureDevice = device => {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const device = await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
    createCanvasContext: {container, width: 64, height: 64, useDevicePixels: false}
  });
  configureDevice(device);
  device.handle.pushErrorScope('validation');
  const errors: Error[] = [];
  const deck = new Deck({
    device,
    parent: container,
    width: 64,
    height: 64,
    useDevicePixels: false,
    views: new OrthographicView(),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    layers: [layer.clone({onFilteredItemsChange: ({count}) => counts.push(count)})],
    onError: error => errors.push(error)
  });
  return {
    deck,
    async cleanup() {
      deck.finalize();
      expect(errors).toEqual([]);
      const gpuError = await device.handle.popErrorScope();
      expect(gpuError?.message).toBeUndefined();
      device.destroy();
      container.remove();
    }
  };
}

function delayReadbacks(device, release: (() => void)[]) {
  const createBuffer = device.createBuffer.bind(device);
  vi.spyOn(device, 'createBuffer').mockImplementation((props: any) => {
    const buffer = createBuffer(props);
    if (props.id === 'data-filter-count-readback') {
      const readAsync = buffer.readAsync.bind(buffer);
      vi.spyOn(buffer, 'readAsync').mockImplementation(async () => {
        const result = await readAsync();
        await new Promise<void>(resolve => release.push(resolve));
        return result;
      });
    }
    return buffer;
  });
}

test('DataFilterExtension#WebGPU counts, updates, constants and empty data', async () => {
  const counts: number[] = [];
  const layer = new ScatterplotLayer({
    id: 'count-points',
    data: Array.from({length: 1024}, (_, index) => index),
    getPosition: [0, 0],
    getFilterValue: value => value,
    filterRange: [200, 800],
    extensions: [new DataFilterExtension({countItems: true})]
  });
  const fixture = await createDeck(layer, counts);
  try {
    await expect.poll(() => counts, {timeout: 20000}).toEqual([601]);
    const callback = ({count}) => counts.push(count);
    fixture.deck.setProps({
      layers: [layer.clone({filterRange: [300, 350], onFilteredItemsChange: callback})]
    });
    await expect.poll(() => counts.at(-1), {timeout: 20000}).toBe(51);
    fixture.deck.setProps({
      layers: [
        layer.clone({getFilterValue: 1, filterRange: [0, 2], onFilteredItemsChange: callback})
      ]
    });
    await expect.poll(() => counts.at(-1), {timeout: 20000}).toBe(1024);
    fixture.deck.setProps({layers: [layer.clone({data: [], onFilteredItemsChange: callback})]});
    await expect.poll(() => counts.at(-1), {timeout: 20000}).toBe(0);
  } finally {
    await fixture.cleanup();
  }
});

test('DataFilterExtension#WebGPU counts source objects in variable-length paths', async () => {
  const counts: number[] = [];
  const fixture = await createDeck(
    new PathLayer({
      id: 'count-paths',
      data: [
        {
          path: [
            [0, 0],
            [1, 1],
            [2, 1]
          ],
          value: 1
        },
        {
          path: [
            [0, 0],
            [1, 0]
          ],
          value: 2
        }
      ],
      getPath: d => d.path,
      getFilterValue: d => d.value,
      filterRange: [0, 3],
      extensions: [new DataFilterExtension({countItems: true})]
    }),
    counts
  );
  try {
    await expect.poll(() => counts, {timeout: 20000}).toEqual([2]);
  } finally {
    await fixture.cleanup();
  }
});

test.each([1, 2, 3, 4])(
  'DataFilterExtension#WebGPU counts fp64 and %s filter channels',
  async filterSize => {
    const counts: number[] = [];
    const range = [1e9 + 0.25, 1e9 + 0.75];
    const fixture = await createDeck(
      new ScatterplotLayer({
        id: 'count-double',
        data: [0, 0.5, 1],
        getPosition: [0, 0],
        getFilterValue: value =>
          filterSize === 1 ? 1e9 + value : Array(filterSize).fill(1e9 + value),
        getFilterCategory: () => 'accepted',
        filterCategories: ['accepted'],
        filterRange: filterSize === 1 ? range : Array(filterSize).fill(range),
        extensions: [
          new DataFilterExtension({
            filterSize: filterSize as 1 | 2 | 3 | 4,
            categorySize: 1,
            fp64: true,
            countItems: true
          })
        ]
      }),
      counts
    );
    try {
      await expect.poll(() => counts, {timeout: 20000}).toEqual([1]);
    } finally {
      await fixture.cleanup();
    }
  }
);

test('DataFilterExtension#WebGPU ignores superseded and finalized readbacks', async () => {
  const counts: number[] = [];
  const release: (() => void)[] = [];
  const layer = new ScatterplotLayer({
    id: 'count-stale',
    data: [0, 1, 2],
    getPosition: [0, 0],
    getFilterValue: value => value,
    filterRange: [0, 2],
    extensions: [new DataFilterExtension({countItems: true})]
  });
  const fixture = await createDeck(layer, counts, device => {
    delayReadbacks(device, release);
  });
  try {
    await expect.poll(() => release.length, {timeout: 20000}).toBe(1);
    fixture.deck.setProps({
      layers: [
        layer.clone({filterRange: [1, 1], onFilteredItemsChange: ({count}) => counts.push(count)})
      ]
    });
    await expect.poll(() => release.length, {timeout: 20000}).toBe(2);
    release[0]();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(counts).toEqual([]);
    release[1]();
    await expect.poll(() => counts).toEqual([1]);
    fixture.deck.setProps({
      layers: [
        layer.clone({filterRange: [2, 2], onFilteredItemsChange: ({count}) => counts.push(count)})
      ]
    });
    await expect.poll(() => release.length, {timeout: 20000}).toBe(3);
    fixture.deck.finalize();
    release[2]();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(counts).toEqual([1]);
  } finally {
    release.forEach(resolve => resolve());
    await fixture.cleanup();
  }
});

test.each([1, 2, 3, 4])(
  'DataFilterExtension#WebGPU counts %s category channels and disabled filters',
  async categorySize => {
    const counts: number[] = [];
    const callback = ({count}) => counts.push(count);
    const layer = new ScatterplotLayer({
      id: 'count-categories',
      data: ['yes', 'no', 'yes'],
      getPosition: [0, 0],
      getFilterCategory: value => (categorySize === 1 ? value : Array(categorySize).fill(value)),
      filterCategories: categorySize === 1 ? ['yes'] : Array(categorySize).fill(['yes']),
      extensions: [
        new DataFilterExtension({
          filterSize: 0,
          categorySize: categorySize as 1 | 2 | 3 | 4,
          countItems: true
        })
      ]
    });
    const fixture = await createDeck(layer, counts);
    try {
      await expect.poll(() => counts, {timeout: 20000}).toEqual([2]);
      fixture.deck.setProps({
        layers: [layer.clone({filterEnabled: false, onFilteredItemsChange: callback})]
      });
      await expect.poll(() => counts.at(-1), {timeout: 20000}).toBe(3);
    } finally {
      await fixture.cleanup();
    }
  }
);

test('DataFilterExtension#WebGPU preserves the soft-filter counting threshold', async () => {
  const counts: number[] = [];
  const fixture = await createDeck(
    new ScatterplotLayer({
      id: 'count-soft',
      data: [0, 1, 2, 4, 6, 8, 9, 10],
      getPosition: [0, 0],
      getFilterValue: value => value,
      filterRange: [0, 10],
      filterSoftRange: [4, 6],
      extensions: [new DataFilterExtension({countItems: true})]
    }),
    counts
  );
  try {
    await expect.poll(() => counts, {timeout: 20000}).toEqual([4]);
  } finally {
    await fixture.cleanup();
  }
});

test.each([true, false])(
  'DataFilterExtension#WebGPU callback-only update (replace=%s)',
  async replace => {
    const counts: number[] = [];
    const replacementCounts: number[] = [];
    const release: (() => void)[] = [];
    const layer = new ScatterplotLayer({
      id: 'count-callback',
      data: [0, 1, 2],
      getPosition: [0, 0],
      getFilterValue: value => value,
      filterRange: [0, 2],
      extensions: [new DataFilterExtension({countItems: true})]
    });
    const fixture = await createDeck(layer, counts, device => delayReadbacks(device, release));
    try {
      await expect.poll(() => release.length, {timeout: 20000}).toBe(1);
      const generations: number[] = [];
      // React-style inline callbacks change each render without invalidating the data.
      for (let generation = 0; generation < (replace ? 5 : 1); generation++) {
        await new Promise<void>(resolve =>
          fixture.deck.setProps({
            layers: [
              layer.clone({
                onFilteredItemsChange: replace
                  ? ({count}) => {
                      replacementCounts.push(count);
                      generations.push(generation);
                    }
                  : null
              })
            ],
            onAfterRender: () => resolve()
          })
        );
      }
      expect(release).toHaveLength(1);
      release[0]();
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(counts).toEqual([]);
      if (replace) {
        await expect.poll(() => replacementCounts).toEqual([3]);
        expect(generations).toEqual([4]);
      } else {
        expect(replacementCounts).toEqual([]);
        fixture.deck.setProps({
          layers: [layer.clone({onFilteredItemsChange: ({count}) => replacementCounts.push(count)})]
        });
        await expect.poll(() => release.length, {timeout: 20000}).toBe(2);
        release[1]();
        await expect.poll(() => replacementCounts).toEqual([3]);
      }
    } finally {
      release.forEach(resolve => resolve());
      await fixture.cleanup();
    }
  }
);
