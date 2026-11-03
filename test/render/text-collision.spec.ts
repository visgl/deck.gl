// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterAll, beforeAll, expect, test, vi} from 'vitest';
import {
  CompositeLayer,
  Deck,
  _GlobeView as GlobeView,
  OrthographicView,
  MapView
} from '@deck.gl/core';
import {TextLayer, GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {PointLabelLayer} from '@deck.gl/carto';
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
    [false, true].map(useGeoJson => ({anchor, baseline, useGeoJson}))
  )
);

test.skipIf(!isRenderTestDeviceEnabled('webgl')).each(cases)(
  'text collision: $anchor / $baseline / GeoJSON=$useGeoJson',
  async ({anchor, baseline, useGeoJson}) => {
    for (const reverse of [false, true]) {
      for (const zoom of [-1, 0, 5]) {
        const props = {
          id: 'collision-text',
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
    const high = new TextLayer({
      id: 'priority-high',
      data: [{position: [0, 0], text: 'Label\nsecond line', priority: 1}],
      getSize: 24,
      collisionGroup: 'shared-priority',
      getCollisionPriority: d => d.priority,
      extensions,
      pickable: true
    });
    const low = high.clone({
      id: 'priority-low',
      data: [{position: [12, 0], text: 'Label\nsecond line', priority: 0}]
    });
    expect(await drawLayers([high, low])).toEqual([1]);
    expect(await drawLayers([low.clone(), high.clone()])).toEqual([1]);
    expect(
      await drawLayers([
        high.clone({getPolygonOffset: () => [0, 1000]}),
        low.clone({getPolygonOffset: () => [0, -1000]})
      ])
    ).toEqual([1]);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text collision clamps priorities to the supported range',
  async () => {
    const layer = new TextLayer({
      id: 'clamped-priorities',
      data: [
        {position: [0, 0], text: 'Label', priority: 2000},
        {position: [0, 0], text: 'Label', priority: 1000}
      ],
      getSize: 24,
      extensions,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    // Both priorities clamp to 1000, so the later label wins the tie.
    expect(await drawLayers([layer])).toEqual([1000]);
    expect(
      await drawLayers([
        layer.clone({data: layer.props.data.map(d => ({...d, priority: d.priority + 1000}))})
      ])
    ).toEqual([2000]);
    // A priority below the supported range must remain visible when isolated.
    expect(
      await drawLayers([layer.clone({data: [{position: [0, 0], text: 'Label', priority: -2000}]})])
    ).toEqual([-2000]);
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
  'text collision under GlobeView back-face culling',
  async () => {
    deck.setProps({views: new GlobeView()});
    try {
      for (const background of [false, true]) {
        const layer = new TextLayer({
          id: 'globe-text',
          data: [
            {position: [-10, 0], text: 'Left', priority: 1},
            {position: [10, 0], text: 'Right', priority: 0},
            {position: [10.2, 0], text: 'Right', priority: -1}
          ],
          extensions,
          pickable: true,
          background,
          getSize: 24,
          getCollisionPriority: d => d.priority
        });
        await new Promise<void>((resolve, reject) => {
          deck.setProps({
            layers: [layer],
            viewState: {longitude: 0, latitude: 0, zoom: 2},
            onError: reject,
            onAfterRender: () => layer.isLoaded && resolve()
          });
        });
        const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
        const priorities = objects.map(({object}) => object.priority).sort((a, b) => a - b);
        // The overlapping lower-priority label is hidden, the others stay visible
        expect(priorities, `background=${background}`).toEqual([0, 1]);
      }
    } finally {
      deck.setProps({views: new OrthographicView()});
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
  'multiline collision agrees within and across layers at fractional pixel ratios',
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
              id: 'multiline-split',
              data: labels,
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
  'hidden labels still reserve space in an overlap chain',
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
    // The hidden middle label still hides the lowest-priority label.
    // Visibility is resolved on the GPU, without reading pixels back.
    const readPixels = vi.spyOn(device, 'readPixelsToArrayWebGL');
    try {
      expect(await drawLayers([layer])).toEqual([30]);
      expect(readPixels).not.toHaveBeenCalled();
    } finally {
      readPixels.mockRestore();
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text collision respects non-text priorities in a shared group',
  async () => {
    // Both layers use object index 0, so this also checks per-layer picking color offsets.
    const text = new TextLayer({
      id: 'mixed-text',
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
  'filtered text does not reserve collision space',
  async () => {
    const layer = new TextLayer({
      id: 'filtered-collision-text',
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
  'PointLabelLayer secondary labels share the primary label result',
  async () => {
    const layer = new PointLabelLayer({
      id: 'point-labels',
      data: [
        {position: [0, 0], text: 'Primary', secondary: 'Secondary text', priority: 10},
        {position: [10, 10], text: 'Hidden', secondary: 'Hidden text', priority: 5},
        {position: [300, 0], text: 'Far', secondary: 'Far text', priority: 0}
      ],
      getPosition: d => d.position,
      getText: d => d.text,
      getSecondaryText: d => d.secondary,
      getCollisionPriority: d => d.priority,
      getRadius: 4,
      sizeScale: 16,
      extensions,
      pickable: true
    });
    expect(await drawLayers([layer])).toEqual([0, 10]);
    // Secondary labels are drawn last, so they are picked when they are visible.
    const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
    expect(objects.every(({sourceLayer}) => sourceLayer!.id.endsWith('-secondary'))).toBe(true);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'GeoJsonLayer points do not collide with their own labels',
  async () => {
    const features = [
      {position: [0, 0], text: 'Kept', priority: 10},
      {position: [10, 10], text: 'Hidden', priority: 5},
      {position: [300, 0], text: 'Far', priority: 0}
    ].map(properties => ({
      type: 'Feature',
      properties,
      geometry: {type: 'Point', coordinates: properties.position}
    }));
    const layer = new GeoJsonLayer({
      id: 'geojson-circle-text',
      data: {type: 'FeatureCollection', features},
      pointType: 'circle+text',
      pointRadiusUnits: 'pixels',
      getPointRadius: 6,
      getText: f => f.properties.text,
      getTextSize: 24,
      getCollisionPriority: f => f.properties.priority,
      extensions,
      pickable: true
    });
    for (const sublayer of ['points-circle', 'points-text']) {
      // Pick one sublayer at a time, because picking deduplicates features
      const pickedLayer = layer.clone({
        _subLayerProps: {
          'points-circle': {pickable: sublayer === 'points-circle'},
          'points-text': {pickable: sublayer === 'points-text'}
        }
      });
      await drawLayers([pickedLayer]);
      const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
      const priorities = objects
        .map(({object}) => object.properties.priority)
        .sort((a, b) => a - b);
      expect(priorities, sublayer).toEqual([0, 10]);
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text layers of one parent collide with each other',
  async () => {
    // Like a TileLayer's tiles, each TextLayer renders different rows from index 0
    class LabelGroupLayer extends CompositeLayer {
      static layerName = 'LabelGroupLayer';
      renderLayers() {
        return [100, -100].map(
          priority =>
            new TextLayer(
              this.getSubLayerProps({
                id: `labels-${priority}`,
                data: [{...data[0], priority}],
                getSize: 24
              })
            )
        );
      }
    }
    expect(
      await drawLayers([
        new LabelGroupLayer({
          id: 'label-group',
          extensions,
          pickable: true,
          getCollisionPriority: d => d.priority
        })
      ])
    ).toEqual([100]);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'top-level layers with the same data do not collide with their own objects',
  async () => {
    const points = [
      {position: [0, 0], text: 'Kept', priority: 10},
      {position: [10, 10], text: 'Hidden', priority: 5},
      {position: [300, 0], text: 'Far', priority: 0}
    ];
    const layers = [
      new ScatterplotLayer({
        id: 'same-data-points',
        data: points,
        getRadius: 6,
        radiusUnits: 'pixels',
        getCollisionPriority: d => d.priority,
        extensions,
        pickable: true
      }),
      new TextLayer({
        id: 'same-data-labels',
        data: points,
        getSize: 24,
        getCollisionPriority: d => d.priority,
        extensions,
        pickable: true
      })
    ];
    await drawLayers(layers);
    for (const layerId of ['same-data-points', 'same-data-labels']) {
      const objects = await deck.pickObjectsAsync({
        x: 0,
        y: 0,
        width: 800,
        height: 450,
        layerIds: [layerId]
      });
      const priorities = objects.map(({object}) => object.priority).sort((a, b) => a - b);
      expect(priorities, layerId).toEqual([0, 10]);
    }
  }
);

// Binary text with one GPU position per glyph
function createBinaryText(labels: {text: string; x: number}[]) {
  const startIndices = [0];
  const positions: number[] = [];
  labels.forEach(({text, x}, index) => {
    startIndices.push(startIndices[index] + text.length);
    for (const char of text) positions.push(x, 0, 0);
  });
  const buffer = device.createBuffer({data: new Float32Array(positions)});
  const data = {
    length: labels.length,
    startIndices,
    attributes: {
      getText: new Uint8Array(
        Array.from(labels.map(({text}) => text).join('')).map(char => char.charCodeAt(0))
      ),
      getPosition: {buffer, type: 'float32', size: 3, stride: 12}
    }
  };
  return {data, buffer};
}

async function pickBinaryText(layer: TextLayer): Promise<number[]> {
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
  return objects.map(({index}) => index).sort();
}

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'binary text collision follows updated label lengths',
  async () => {
    const buffers: {destroy: () => void}[] = [];
    const createLayer = (firstText: string) => {
      const {data, buffer} = createBinaryText([
        {text: firstText, x: -250},
        {text: 'Second label', x: 0},
        {text: 'Third', x: 250}
      ]);
      buffers.push(buffer);
      return new TextLayer({
        id: 'binary-collision-update',
        data,
        extensions,
        pickable: true,
        getSize: 24,
        getTextAnchor: 'start'
      });
    };
    try {
      expect(await pickBinaryText(createLayer('First'))).toEqual([0, 1, 2]);
      // Glyphs of later labels move to new instance indices
      expect(await pickBinaryText(createLayer('First, now longer'))).toEqual([0, 1, 2]);
    } finally {
      deck.setProps({layers: []});
      await new Promise(requestAnimationFrame);
      buffers.forEach(buffer => buffer.destroy());
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'binary text stays visible when its first glyph is clipped',
  async () => {
    const {data, buffer} = createBinaryText([{text: 'Clipped label', x: 0}]);
    const layer = new TextLayer({
      id: 'binary-collision-clipped',
      data,
      extensions,
      pickable: true,
      getSize: 24,
      getTextAnchor: 'start',
      // Clip the first glyph only
      getContentBox: [30, -50, 1000, 100]
    });
    try {
      expect(await pickBinaryText(layer)).toEqual([0]);
    } finally {
      deck.setProps({layers: []});
      await new Promise(requestAnimationFrame);
      buffer.destroy();
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text layers with the same data share rows but test labels separately',
  async () => {
    const rows = [
      {position: [-200, 0], text: 'Collision label', priority: 10},
      {position: [50, 0], text: 'Collision label', priority: 20}
    ];
    const createLayers = (pixelOffset: [number, number]) => [
      new TextLayer({
        id: 'same-data-a',
        data: rows,
        getSize: 24,
        getCollisionPriority: d => d.priority,
        extensions,
        pickable: true
      }),
      new TextLayer({
        id: 'same-data-b',
        data: rows,
        getSize: 24,
        getPixelOffset: pixelOffset,
        getCollisionPriority: d => d.priority,
        extensions,
        pickable: true
      })
    ];
    const pickPriorities = async (layerId: string) => {
      const objects = await deck.pickObjectsAsync({
        x: 0,
        y: 0,
        width: 800,
        height: 450,
        layerIds: [layerId]
      });
      return objects.map(({object}) => object.priority).sort((a, b) => a - b);
    };

    // Labels of the same row overlap, and do not hide each other
    await drawLayers(createLayers([0, 10]));
    expect(await pickPriorities('same-data-a')).toEqual([10, 20]);
    expect(await pickPriorities('same-data-b')).toEqual([10, 20]);

    // The second layer's first label overlaps the first layer's higher-priority second label
    await drawLayers(createLayers([250, 0]));
    expect(await pickPriorities('same-data-a')).toEqual([10, 20]);
    expect(await pickPriorities('same-data-b')).toEqual([20]);
  }
);
