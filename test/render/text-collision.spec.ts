// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterAll, beforeAll, expect, test, vi} from 'vitest';
import {Deck, OrthographicView, MapView} from '@deck.gl/core';
import {TextLayer, GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {CollisionFilterExtension, DataFilterExtension} from '@deck.gl/extensions';
import {createContainer, createTestDevice, removeContainer} from './deck-test-utils';
import {isRenderTestDeviceEnabled} from './render-test-suite';

const data = [
  {position: [0, 0], text: 'Collision label', priority: 100},
  {position: [12, 0], text: 'Collision label', priority: -100}
];
const geojson = {
  type: 'FeatureCollection',
  features: data.map(d => ({
    type: 'Feature',
    properties: d,
    geometry: {type: 'Point', coordinates: d.position}
  }))
};
const extensions = [new CollisionFilterExtension()];
let deck: Deck;
let container: HTMLDivElement;
let device;

beforeAll(async () => {
  if (!isRenderTestDeviceEnabled('webgl')) return;
  container = createContainer('text-collision');
  device = await createTestDevice('webgl', container);
  deck = new Deck({
    device,
    container,
    width: 800,
    height: 450,
    views: new OrthographicView(),
    useDevicePixels: false
  });
});
afterAll(() => {
  deck?.finalize();
  device?.destroy();
  removeContainer(container);
});

const cases = ['start', 'middle', 'end'].flatMap(anchor =>
  ['top', 'center', 'bottom'].flatMap(baseline =>
    [false, true].flatMap(useGeoJson =>
      [false, true].map(collisionGreedy => ({anchor, baseline, useGeoJson, collisionGreedy}))
    )
  )
);

test.skipIf(!isRenderTestDeviceEnabled('webgl')).each(cases)(
  'text collision: $anchor / $baseline / GeoJSON=$useGeoJson / greedy=$collisionGreedy',
  async ({anchor, baseline, useGeoJson, collisionGreedy}) => {
    for (const reverse of [false, true]) {
      for (const zoom of [-1, 0, 5]) {
        const props = {
          id: 'collision-text',
          collisionGreedy,
          data,
          getSize: 20,
          getTextAnchor: anchor,
          getAlignmentBaseline: baseline,
          getPixelOffset: [40, -35],
          getCollisionPriority: d => d.priority * (reverse ? -1 : 1),
          getColor: d => (d.priority > 0 ? [0, 150, 0] : [220, 0, 0]),
          collisionTestProps: {sizeScale: 1.5},
          extensions,
          pickable: true,
          fontFamily: 'Arial',
          updateTriggers: {getCollisionPriority: reverse}
        };
        const layer = useGeoJson
          ? new GeoJsonLayer({
              ...props,
              data: geojson,
              pointType: 'text',
              getText: f => f.properties.text,
              getTextSize: 20,
              getTextAlignmentBaseline: baseline,
              getTextPixelOffset: [40, -35],
              getCollisionPriority: f => props.getCollisionPriority(f.properties),
              getTextColor: f => props.getColor(f.properties)
            })
          : new TextLayer(props);
        await new Promise<void>((resolve, reject) => {
          deck.setProps({
            layers: [layer],
            viewState: {target: [6, 0, 0], zoom},
            onError: reject,
            onAfterRender: () => {
              if (layer.isLoaded) resolve();
            }
          });
        });
        const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
        const priorities = objects
          .map(({object}) => (object.properties || object).priority)
          .sort((a, b) => a - b);
        expect(priorities, `zoom=${zoom}, reverse=${reverse}`).toEqual(
          zoom === 5 ? [-100, 100] : [reverse ? -100 : 100]
        );
      }
    }
  }
);

async function drawLayers(layers, zoom = 0) {
  await new Promise<void>((resolve, reject) => {
    deck.setProps({
      layers,
      viewState: {target: [0, 0, 0], zoom},
      onError: reject,
      onAfterRender: () => {
        if (layers.every(layer => layer.isLoaded)) resolve();
      }
    });
  });
  const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
  return objects.map(({object}) => object.priority).sort((a, b) => a - b);
}

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text collision distinguishes source layers',
  async () => {
    const high = new TextLayer({
      id: 'high',
      data: [data[0]],
      getSize: 24,
      extensions,
      pickable: true,
      getPixelOffset: [60, -30],
      getCollisionPriority: d => d.priority
    });
    const low = high.clone({id: 'low', data: [{...data[0], priority: -100}]});
    expect(await drawLayers([high, low])).toEqual([100]);
    expect(await drawLayers([low.clone(), high.clone()])).toEqual([100]);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text collision priorities are independent of layer depth offsets',
  async () => {
    for (const collisionGreedy of [false, true]) {
      const high = new TextLayer({
        id: 'priority-high',
        data: [{position: [0, 0], text: 'Label\nsecond line', priority: 1}],
        getSize: 24,
        collisionGroup: 'shared-priority',
        collisionGreedy,
        getCollisionPriority: d => d.priority,
        extensions,
        pickable: true
      });
      const low = high.clone({
        id: 'priority-low',
        data: [{position: [12, 0], text: 'Label\nsecond line', priority: 0}]
      });
      expect(await drawLayers([high, low]), `greedy=${collisionGreedy}`).toEqual([1]);
      expect(await drawLayers([low.clone(), high.clone()])).toEqual([1]);
      expect(
        await drawLayers([
          high.clone({getPolygonOffset: () => [0, 1000]}),
          low.clone({getPolygonOffset: () => [0, -1000]})
        ])
      ).toEqual([1]);
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text collision size, rotation, background and font settings',
  async () => {
    const layer = new TextLayer({
      id: 'variants',
      data: data.map(d => ({...d, position: [0, 0]})),
      extensions,
      pickable: true,
      getSize: 24,
      getCollisionPriority: d => d.priority,
      getPixelOffset: d => [40, -20],
      getTextAnchor: d => 'end',
      getAlignmentBaseline: d => 'bottom'
    });
    for (const props of [
      {getAngle: 90},
      {getAngle: -45, billboard: false},
      {sizeUnits: 'common', getSize: 10, sizeMinPixels: 20},
      {getSize: 100, sizeMaxPixels: 30, collisionTestProps: {sizeScale: 3, sizeMaxPixels: 45}},
      {background: true, backgroundPadding: [10, 5, 30, 20], backgroundBorderRadius: 5},
      {fontSettings: {sdf: true}, outlineWidth: 2},
      {getText: () => '  multiline\nlabel  ', lineHeight: 1.5},
      {maxWidth: 3, wordBreak: 'break-all'},
      {getContentBox: [-80, -40, 160, 80], contentAlignHorizontal: 'center'},
      {getText: () => 'i', getSize: 8},
      {collisionEnabled: false}
    ]) {
      expect(await drawLayers([layer.clone(props)]), JSON.stringify(props)).toEqual(
        props.collisionEnabled === false ? [-100] : [100]
      );
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text collision with binary GPU attributes',
  async () => {
    const texts = ['First', 'Second label', 'Third'];
    const priorities = [10, 100, -100];
    const startIndices = [0];
    const positions: number[] = [];
    texts.forEach((text, index) => {
      startIndices.push(startIndices[index] + text.length);
      for (const char of text) positions.push(index === 0 ? -150 : 80, 0, 0);
    });
    const buffer = device.createBuffer({data: new Float32Array(positions)});
    const layer = new TextLayer({
      id: 'binary-collision',
      data: {
        length: texts.length,
        startIndices,
        attributes: {
          getText: new Uint8Array(Array.from(texts.join('')).map(char => char.charCodeAt(0))),
          getPosition: {buffer, type: 'float32', size: 3, stride: 12}
        }
      },
      extensions,
      pickable: true,
      getSize: 24,
      getPixelOffset: [40, -20],
      getTextAnchor: 'start',
      getAlignmentBaseline: 'top',
      getCollisionPriority: (_, {index}) => priorities[index]
    });
    try {
      await new Promise<void>((resolve, reject) => {
        deck.setProps({
          layers: [layer],
          viewState: {target: [0, 0, 0], zoom: 0},
          onError: reject,
          onAfterRender: () => {
            if (layer.isLoaded) resolve();
          }
        });
      });
      const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
      expect(objects.map(({index}) => index).sort()).toEqual([0, 1]);
    } finally {
      deck.setProps({layers: []});
      await new Promise(requestAnimationFrame);
      buffer.destroy();
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text collision on pitched geographic views and HiDPI',
  async () => {
    deck.setProps({views: new MapView(), useDevicePixels: 2});
    try {
      for (const billboard of [true, false]) {
        for (const zoom of [8, 14, 18]) {
          for (const pitch of [0, 45, 70]) {
            const layer = new TextLayer({
              id: 'geographic-text',
              data: data.map(d => ({...d, position: [-122.4, 37.8]})),
              extensions,
              pickable: true,
              getSize: 24,
              getPixelOffset: [40, -20],
              getTextAnchor: 'end',
              getAlignmentBaseline: 'bottom',
              getAngle: 30,
              billboard,
              getCollisionPriority: d => d.priority
            });
            await new Promise<void>((resolve, reject) => {
              deck.setProps({
                layers: [layer],
                viewState: {longitude: -122.4, latitude: 37.8, zoom, pitch, bearing: 30},
                onError: reject,
                onAfterRender: () => {
                  if (layer.isLoaded) resolve();
                }
              });
            });
            const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
            expect(
              objects.map(({object}) => object.priority),
              JSON.stringify({billboard, zoom, pitch})
            ).toEqual([100]);
          }
        }
      }
    } finally {
      deck.setProps({views: new OrthographicView(), useDevicePixels: false});
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'multiline collision rejects overlap away from label centers',
  async () => {
    const layer = new TextLayer({
      id: 'multiline-edge-overlap',
      data: [
        {position: [-40, 0], text: 'Label\nsecond line', priority: 100},
        {position: [40, 0], text: 'Label\nsecond line', priority: -100}
      ],
      getSize: 24,
      fontFamily: 'Arial',
      extensions,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    expect(await drawLayers([layer])).toEqual([100]);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text collision checks edges and contained labels',
  async () => {
    const commonProps = {
      extensions,
      pickable: true,
      getSize: 24,
      fontFamily: 'Arial',
      getCollisionPriority: d => d.priority
    };
    for (const [name, first, second] of [
      [
        'long second line',
        {text: 'Label\nsecond line', position: [-40, 0]},
        {text: 'Label\nsecond line', position: [40, 0]}
      ],
      [
        'long first line',
        {text: 'second line\nLabel', position: [-40, 0]},
        {text: 'second line\nLabel', position: [40, 0]}
      ],
      [
        'vertical edge',
        {text: 'Label\nsecond line', position: [0, -15]},
        {text: 'Label\nsecond line', position: [0, 15]}
      ],
      [
        'contained small label',
        {text: 'i', position: [50, 0]},
        {text: 'XXXXXXXXXXXX', position: [0, 0]}
      ],
      [
        'different line widths',
        {text: 'Second line', position: [-50, 0]},
        {text: 'Much longer second line', position: [50, 0]}
      ]
    ]) {
      const layer = new TextLayer({
        ...commonProps,
        id: 'overlap-cases',
        data: [
          {...first, priority: 100},
          {...second, priority: -100}
        ]
      });
      expect(await drawLayers([layer]), name).toEqual([100]);
      expect(
        await drawLayers([
          layer.clone({
            getCollisionPriority: d => -d.priority,
            updateTriggers: {getCollisionPriority: 'reversed'}
          })
        ]),
        `${name}: reversed`
      ).toEqual([-100]);
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'multiline collision switches visibility at the longest line edge',
  async () => {
    for (const devicePixels of [1, 2]) {
      deck.setProps({useDevicePixels: devicePixels});
      try {
        for (const distance of [120, 124]) {
          const layer = new TextLayer({
            id: 'multiline-touching',
            data: [
              {position: [-distance / 2, 0], text: 'Label\nsecond line', priority: 100},
              {position: [distance / 2, 0], text: 'Label\nsecond line', priority: -100}
            ],
            getSize: 24,
            fontFamily: 'Arial',
            extensions,
            pickable: true,
            getCollisionPriority: d => d.priority
          });
          expect(await drawLayers([layer]), `distance=${distance}, DPR=${devicePixels}`).toEqual(
            distance === 120 ? [100] : [-100, 100]
          );
        }
      } finally {
        deck.setProps({useDevicePixels: false});
      }
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'greedy multiline placement agrees within and across layers at fractional pixel ratios',
  async () => {
    try {
      for (const devicePixels of [1, 1.5, 2]) {
        deck.setProps({useDevicePixels: devicePixels});
        for (const splitLayers of [false, true]) {
          for (const reverse of [false, true]) {
            const labels = [
              {position: [-30, 0], text: 'Label\nsecond line', priority: reverse ? -100 : 100},
              {position: [30, 0], text: 'Much longer line\nshort', priority: reverse ? 100 : -100}
            ];
            const text = new TextLayer({
              id: 'multiline-greedy',
              data: labels,
              collisionGreedy: true,
              collisionGroup: 'multiline',
              getSize: 24,
              fontFamily: 'Arial',
              extensions,
              pickable: true,
              getPixelOffset: [40, -25],
              getCollisionPriority: d => d.priority
            });
            const layers = splitLayers
              ? labels.map((label, index) => text.clone({id: `multiline-${index}`, data: [label]}))
              : [text];
            // Leave room around the collision threshold: system font metrics can differ by OS.
            expect(await drawLayers(layers, 0)).toEqual([100]);
            expect(
              await drawLayers(
                layers.map(layer => layer.clone()),
                2
              )
            ).toEqual([-100, 100]);
          }
        }
      }
    } finally {
      deck.setProps({useDevicePixels: false});
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'long wrapped labels share visibility across every glyph',
  async () => {
    const layer = new TextLayer({
      id: 'long-paragraph',
      data: [{position: [0, 0], text: 'Label text '.repeat(45), priority: 100}],
      getSize: 24,
      maxWidth: 20,
      wordBreak: 'break-word',
      fontFamily: 'Arial',
      extensions,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    expect(await drawLayers([layer])).toEqual([100]);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text and padded backgrounds share the same collision result',
  async () => {
    const layer = new TextLayer({
      id: 'padded-labels',
      data: [
        {position: [-40, 0], text: 'Label', priority: 100},
        {position: [40, 0], text: 'Label', priority: -100}
      ],
      getSize: 24,
      background: true,
      backgroundPadding: [20, 10],
      fontFamily: 'Arial',
      extensions,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    expect(await drawLayers([layer])).toEqual([100]);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'rejected labels do not block non-overlapping neighbors',
  async () => {
    const layer = new TextLayer({
      id: 'collision-chain',
      data: [
        {position: [-60, 0], text: 'XXXXX', priority: 10},
        {position: [0, 0], text: 'XXXXX', priority: 20},
        {position: [60, 0], text: 'XXXXX', priority: 30}
      ],
      getSize: 24,
      fontFamily: 'Arial',
      extensions,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    const readPixels = vi.spyOn(device, 'readPixelsToArrayWebGL');
    const readCollisionBounds = () =>
      readPixels.mock.calls.some(([target]) =>
        (target as {id?: string}).id?.startsWith('collision-visibility-')
      );
    try {
      expect(await drawLayers([layer])).toEqual([30]);
      expect(readCollisionBounds()).toBe(false);
      readPixels.mockClear();
      expect(await drawLayers([layer.clone({collisionGreedy: true})])).toEqual([10, 30]);
      expect(readCollisionBounds()).toBe(true);
      readPixels.mockClear();
      expect(await drawLayers([layer.clone({collisionGreedy: false})])).toEqual([30]);
      expect(readCollisionBounds()).toBe(false);
    } finally {
      readPixels.mockRestore();
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text placement fills a long chain at different zoom levels',
  async () => {
    const layer = new TextLayer({
      id: 'long-collision-chain',
      collisionGreedy: true,
      data: Array.from({length: 10}, (_, index) => ({
        position: [index * 60 - 270, 0],
        text: 'XXXXX',
        priority: index
      })),
      getSize: 24,
      fontFamily: 'Arial',
      extensions,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    expect(await drawLayers([layer], 0)).toEqual([1, 3, 5, 7, 9]);
    expect(await drawLayers([layer.clone()], -1)).toEqual([0, 3, 6, 9]);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text placement respects non-text collision priorities',
  async () => {
    const text = new TextLayer({
      id: 'mixed-text',
      collisionGreedy: true,
      data: [data[0]],
      getSize: 24,
      extensions,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    const point = new ScatterplotLayer({
      id: 'mixed-point',
      data: [{position: [0, 0], priority: 200}],
      getRadius: 8,
      radiusUnits: 'pixels',
      extensions,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    expect(await drawLayers([text, point])).toEqual([200]);
    expect(
      await drawLayers([text.clone(), point.clone({data: [{position: [0, 0], priority: -200}]})])
    ).toEqual([100]);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'filtered text does not reserve placement space',
  async () => {
    const layer = new TextLayer({
      id: 'filtered-collision-text',
      collisionGreedy: true,
      data,
      getSize: 24,
      extensions: [...extensions, new DataFilterExtension({filterSize: 1})],
      filterRange: [-100, 0],
      getFilterValue: d => d.priority,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    expect(await drawLayers([layer])).toEqual([-100]);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'greedy placement applies to its collision group only',
  async () => {
    const low = new TextLayer({
      id: 'group-low',
      data: [{position: [-60, 0], text: 'XXXXX', priority: 10}],
      getSize: 24,
      fontFamily: 'Arial',
      extensions,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    const middle = low.clone({
      id: 'group-middle',
      data: [{position: [0, 0], text: 'XXXXX', priority: 20}]
    });
    const high = low.clone({
      id: 'group-high',
      data: [{position: [60, 0], text: 'XXXXX', priority: 30}],
      collisionGreedy: true
    });
    expect(await drawLayers([low, middle, high])).toEqual([10, 30]);
    expect(
      await drawLayers([low.clone(), middle.clone(), high.clone({collisionGroup: 'other'})])
    ).toEqual([20, 30]);
  }
);
