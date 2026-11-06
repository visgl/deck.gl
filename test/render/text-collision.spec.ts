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
import {TextLayer, GeoJsonLayer, ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {PointLabelLayer} from '@deck.gl/carto';
import {
  ClipExtension,
  CollisionFilterExtension,
  DataFilterExtension,
  MaskExtension
} from '@deck.gl/extensions';
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
          data,
          collisionGreedy,
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
  'equal-priority labels with rounded backgrounds keep one label',
  async () => {
    // The second label's left corners lie inside the first label
    const layer = new TextLayer({
      id: 'rounded',
      data: [
        {position: [0, 0], text: 'Collision label', priority: 1},
        {position: [40, 0], text: 'Collision label', priority: 2}
      ],
      getSize: 24,
      background: true,
      backgroundBorderRadius: 12,
      extensions,
      pickable: true
    });
    for (const collisionGreedy of [false, true]) {
      expect(
        await drawLayers([layer.clone({collisionGreedy})]),
        `greedy=${collisionGreedy}`
      ).toHaveLength(1);
    }
  }
);

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
      const message = `greedy=${collisionGreedy}`;
      expect(await drawLayers([high, low]), message).toEqual([1]);
      expect(await drawLayers([low.clone(), high.clone()]), message).toEqual([1]);
      expect(
        await drawLayers([
          high.clone({getPolygonOffset: () => [0, 1000]}),
          low.clone({getPolygonOffset: () => [0, -1000]})
        ]),
        message
      ).toEqual([1]);
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text collision clamps priorities consistently in GPU and greedy placement',
  async () => {
    for (const collisionGreedy of [false, true]) {
      const layer = new TextLayer({
        id: 'clamped-priorities',
        data: [
          {position: [0, 0], text: 'Label', priority: 2000},
          {position: [0, 0], text: 'Label', priority: 1000}
        ],
        getSize: 24,
        collisionGreedy,
        extensions,
        pickable: true,
        getCollisionPriority: d => d.priority
      });
      const message = `greedy=${collisionGreedy}`;
      // Both priorities clamp to 1000, so the later label wins the tie.
      expect(await drawLayers([layer]), message).toEqual([1000]);
      expect(
        await drawLayers([
          layer.clone({data: layer.props.data.map(d => ({...d, priority: d.priority + 1000}))})
        ]),
        message
      ).toEqual([2000]);
      // A priority below the supported range must remain visible when isolated.
      expect(
        await drawLayers([
          layer.clone({data: [{position: [0, 0], text: 'Label', priority: -2000}]})
        ]),
        message
      ).toEqual([-2000]);
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
  'text collision under GlobeView back-face culling',
  async () => {
    deck.setProps({views: new GlobeView()});
    try {
      for (const [background, collisionGreedy] of [
        [false, false],
        [true, false],
        [false, true],
        [true, true]
      ]) {
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
          collisionGreedy,
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
        expect(priorities, `background=${background}, greedy=${collisionGreedy}`).toEqual([0, 1]);
      }
    } finally {
      deck.setProps({views: new OrthographicView()});
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'labels crossing behind the camera do not change other labels',
  async () => {
    deck.setProps({views: new MapView()});
    try {
      // Pairs of overlapping labels: only the higher-priority label of each pair is visible
      const pairs = Array.from({length: 30}, (_, i) => {
        const position = [-0.2 + (i % 6) * 0.08, 0.02 + Math.floor(i / 6) * 0.04];
        return [
          {position, text: 'Pair', priority: 100 + i},
          {position: [position[0] + 0.002, position[1]], text: 'Pair', priority: i}
        ];
      }).flat();
      const overlapping = new TextLayer({
        id: 'overlapping',
        data: pairs,
        getSize: 16,
        extensions,
        pickable: true,
        getCollisionPriority: d => d.priority
      });
      const draw = async (pitch: number, layers: TextLayer[]) => {
        await new Promise<void>((resolve, reject) => {
          deck.setProps({
            layers,
            viewState: {longitude: 0, latitude: 0, zoom: 10, pitch, bearing: 0},
            onError: reject,
            onAfterRender: () => layers.every(layer => layer.isLoaded) && resolve()
          });
        });
        const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
        return objects
          .map(({object}) => object.priority)
          .filter(priority => priority >= 0)
          .sort((a, b) => a - b);
      };
      for (const {pitch, position, size, behindCamera} of [
        {pitch: 45, position: [-0.1, -0.1], size: 400, behindCamera: true},
        {pitch: 45, position: [0.05, -0.1], size: 400, behindCamera: true},
        // In front of the camera: the label is drawn, so only the lowest priority is checked
        {pitch: 60, position: [-0.1, -0.2], size: 100, behindCamera: false}
      ]) {
        const baseline = await draw(pitch, [overlapping]);
        // A ground label running north to south. When its near end passes behind the camera it is
        // hidden, so it must not hide the pairs even at the highest priority.
        const text = 'Collision label';
        const binaryData = {
          length: 1,
          startIndices: [0, text.length],
          attributes: {
            getText: new Uint8Array(Array.from(text).map(char => char.charCodeAt(0))),
            getPosition: {
              value: new Float32Array(text.length * 3).map((_, i) => position[i % 3] ?? 0),
              size: 3
            }
          }
        };
        for (const priority of behindCamera ? [-100, 1000] : [-100]) {
          for (const variant of ['object', 'background', 'binary']) {
            const crossing = new TextLayer({
              id: 'crossing',
              data: variant === 'binary' ? binaryData : [{position, text, priority}],
              background: variant === 'background',
              getSize: size,
              getAngle: 90,
              billboard: false,
              extensions,
              pickable: true,
              getCollisionPriority: priority
            });
            expect(
              await draw(pitch, [overlapping, crossing]),
              `pitch=${pitch}, ${position}, priority=${priority}, ${variant}`
            ).toEqual(baseline);
          }
        }
      }
    } finally {
      deck.setProps({views: new OrthographicView()});
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text behind the globe does not hide visible text',
  async () => {
    deck.setProps({views: new GlobeView()});
    // The hidden label on the far side projects onto the visible label
    const labels = [
      {text: 'Front', x: 0, priority: 0},
      {text: 'Back', x: 180, priority: 10}
    ];
    const {data: binaryData, buffer} = createBinaryText(labels);
    const draw = async (layer: TextLayer) => {
      await new Promise<void>((resolve, reject) => {
        deck.setProps({
          layers: [layer],
          viewState: {longitude: 0, latitude: 0, zoom: 2},
          onError: reject,
          onAfterRender: () => layer.isLoaded && resolve()
        });
      });
      const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
      return objects.map(({index}) => index);
    };
    try {
      for (const collisionGreedy of [false, true]) {
        for (const billboard of [false, true]) {
          const props = {
            extensions,
            collisionGreedy,
            billboard,
            pickable: true,
            getSize: 24,
            // Binary rows have no objects
            getCollisionPriority: (_, {index}) => labels[index].priority
          };
          const message = `greedy=${collisionGreedy}, billboard=${billboard}`;
          const objects = new TextLayer({
            id: 'globe-back',
            data: labels.map(({text, x}) => ({text, position: [x, 0]})),
            ...props
          });
          expect(await draw(objects), message).toEqual([0]);
          // Binary text tests collisions with its characters
          const binary = new TextLayer({id: 'globe-back-binary', data: binaryData, ...props});
          expect(await draw(binary), `binary, ${message}`).toEqual([0]);
        }
        // A large label behind the globe must not draw over the visibility cells of the two
        // overlapping front labels, of which only the higher-priority one is visible
        const rows = [
          {position: [0, 0], text: 'Front', priority: 0, size: 24},
          {position: [3, 0], text: 'Front', priority: 5, size: 24},
          {position: [150, 10], text: 'BackBackBack', priority: 10, size: 5000}
        ];
        const large = new TextLayer({
          id: 'globe-back-large',
          data: rows,
          extensions,
          collisionGreedy,
          billboard: false,
          pickable: true,
          getSize: d => d.size,
          getCollisionPriority: d => d.priority
        });
        expect(await draw(large), `large, greedy=${collisionGreedy}`).toEqual([1]);
      }
    } finally {
      deck.setProps({views: new OrthographicView()});
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

async function expectMultilineAgreement(collisionGreedy: boolean) {
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
            collisionGreedy,
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
          const message = JSON.stringify({collisionGreedy, devicePixels, splitLayers, reverse});
          expect(await drawLayers(layers, 0), message).toEqual([100]);
          expect(
            await drawLayers(
              layers.map(layer => layer.clone()),
              2
            ),
            message
          ).toEqual([-100, 100]);
        }
      }
    }
  } finally {
    deck.setProps({useDevicePixels: false});
  }
}

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'multiline collision agrees within and across layers at fractional pixel ratios',
  () => expectMultilineAgreement(false)
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'greedy multiline placement agrees within and across layers at fractional pixel ratios',
  () => expectMultilineAgreement(true)
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
  'rejected labels do not block non-overlapping neighbors',
  async () => {
    const layer = new TextLayer({
      id: 'greedy-collision-chain',
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
      // Greedy placement reads label bounds back, and the rejected middle label frees its space.
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
  'greedy placement fills a long chain at different zoom levels',
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
  'greedy placement respects non-text collision priorities',
  async () => {
    const text = new TextLayer({
      id: 'greedy-mixed-text',
      collisionGreedy: true,
      data: [data[0]],
      getSize: 24,
      extensions,
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    const point = new ScatterplotLayer({
      id: 'greedy-mixed-point',
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
  'filtered text does not reserve greedy placement space',
  async () => {
    const layer = new TextLayer({
      id: 'greedy-filtered-collision-text',
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
  'clipped text does not hide visible text',
  async () => {
    const rows = [
      {position: [0, 0], text: 'Clipped label', priority: 20},
      {position: [40, 0], text: 'Visible label', priority: 10}
    ];
    // The higher-priority label's anchor is outside the clip bounds, so ClipExtension hides it
    const props = {
      getSize: 24,
      extensions: [...extensions, new ClipExtension()],
      clipBounds: [20, -100, 400, 100],
      pickable: true,
      // Binary rows have no objects
      getCollisionPriority: (_, {index}) => rows[index].priority
    };
    const {data: binaryData, buffer} = createBinaryText([
      {text: 'Clipped label', x: 0},
      {text: 'Visible label', x: 40}
    ]);
    try {
      for (const collisionGreedy of [false, true]) {
        for (const background of [false, true]) {
          const layer = new TextLayer({
            id: 'clipped',
            data: rows,
            background,
            collisionGreedy,
            ...props
          });
          expect(
            await drawLayers([layer]),
            `background=${background}, greedy=${collisionGreedy}`
          ).toEqual([10]);
        }
        // Binary text tests collisions with its characters
        const binary = new TextLayer({
          id: 'clipped-binary',
          data: binaryData,
          collisionGreedy,
          ...props
        });
        expect(await pickBinaryText(binary), `binary, greedy=${collisionGreedy}`).toEqual([1]);
      }
    } finally {
      buffer.destroy();
    }
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
    // One greedy layer makes the whole group greedy
    expect(await drawLayers([low, middle, high])).toEqual([10, 30]);
    // In its own group, the greedy layer no longer affects the others
    expect(
      await drawLayers([low.clone(), middle.clone(), high.clone({collisionGroup: 'other'})])
    ).toEqual([20, 30]);
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
    for (const collisionGreedy of [false, true]) {
      expect(
        await drawLayers([layer.clone({collisionGreedy})]),
        `greedy=${collisionGreedy}`
      ).toEqual([0, 10]);
      // Secondary labels are drawn last, so they are picked when they are visible.
      const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
      expect(objects.every(({sourceLayer}) => sourceLayer!.id.endsWith('-secondary'))).toBe(true);
    }
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
    for (const collisionGreedy of [false, true]) {
      for (const sublayer of ['points-circle', 'points-text']) {
        // Pick one sublayer at a time, because picking deduplicates features
        const pickedLayer = layer.clone({
          collisionGreedy,
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
        expect(priorities, `${sublayer}, greedy=${collisionGreedy}`).toEqual([0, 10]);
      }
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
    for (const collisionGreedy of [false, true]) {
      expect(
        await drawLayers([
          new LabelGroupLayer({
            id: 'label-group',
            extensions,
            collisionGreedy,
            pickable: true,
            getCollisionPriority: d => d.priority
          })
        ]),
        `greedy=${collisionGreedy}`
      ).toEqual([100]);
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'text layers sharing their parent data test their labels separately',
  async () => {
    // Each row draws a main label and a sublabel 40 pixels below it
    class MainAndSubLabelLayer extends CompositeLayer {
      static layerName = 'MainAndSubLabelLayer';
      renderLayers() {
        return [
          ['main', [0, 0]],
          ['sub', [0, 40]]
        ].map(
          ([id, getPixelOffset]) =>
            new TextLayer(
              this.getSubLayerProps({id, data: this.props.data, getPixelOffset, getSize: 24})
            )
        );
      }
    }
    const rows = [
      {position: [0, 0], text: 'Collision label', priority: 10},
      // Only this row's sublabel overlaps the first row's main label
      {position: [150, -40], text: 'Collision label', priority: 5},
      {position: [0, 150], text: 'Collision label', priority: 0}
    ];
    const draw = async (collisionGreedy: boolean) => {
      deck.setProps({
        layers: [
          new MainAndSubLabelLayer({
            id: 'main-and-sub',
            data: rows,
            extensions,
            collisionGreedy,
            pickable: true,
            getCollisionPriority: d => d.priority
          })
        ],
        viewState: {target: [0, 0, 0], zoom: 0}
      });
      await new Promise<void>((resolve, reject) =>
        deck.setProps({onError: reject, onAfterRender: () => resolve()})
      );
    };
    // The labels of a row share picking colors, so identify each label by where it is picked
    const pickLabel = async ([x, y]: number[]) => {
      const objects = await deck.pickObjectsAsync({x: 380 + x, y: 220 + y, width: 40, height: 10});
      return objects.map(({object}) => object.priority);
    };
    const labels = [
      {name: 'main 10', center: [0, 0], visible: [10]},
      {name: 'sub 10', center: [0, 40], visible: [10]},
      {name: 'main 5', center: [150, -40], visible: [5]},
      {name: 'sub 5', center: [150, 0], visible: []},
      {name: 'main 0', center: [0, 150], visible: [0]},
      {name: 'sub 0', center: [0, 190], visible: [0]}
    ];
    for (const collisionGreedy of [false, true]) {
      await draw(collisionGreedy);
      for (const {name, center, visible} of labels) {
        expect(await pickLabel(center), `${name}, greedy=${collisionGreedy}`).toEqual(visible);
      }
    }
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
    for (const collisionGreedy of [false, true]) {
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
          collisionGreedy,
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
        expect(priorities, `${layerId}, greedy=${collisionGreedy}`).toEqual([0, 10]);
      }
    }
  }
);

// Binary text with one GPU position per glyph
function createBinaryText(labels: {text: string; x: number; y?: number}[]) {
  const startIndices = [0];
  const positions: number[] = [];
  labels.forEach(({text, x, y = 0}, index) => {
    startIndices.push(startIndices[index] + text.length);
    for (const char of text) positions.push(x, y, 0);
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

async function pickLayerIds(layers): Promise<string[]> {
  await new Promise<void>((resolve, reject) => {
    deck.setProps({
      layers,
      viewState: {target: [0, 0, 0], zoom: 0},
      onError: reject,
      onAfterRender: () => {
        if (layers.every(layer => layer.isLoaded)) resolve();
      }
    });
  });
  const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
  return Array.from(new Set(objects.map(({layer}) => layer!.id))).sort();
}

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'binary text collision includes background padding',
  async () => {
    // The glyph boxes are apart; only the padded backgrounds overlap
    const labels = [
      {text: 'AB', x: 0},
      {text: 'AB', x: 60}
    ];
    const {data: textData, buffer} = createBinaryText(labels);
    // Binary data with background: true supplies one background vertex per label
    const data = {
      ...textData,
      attributes: {
        ...textData.attributes,
        background: {getPosition: {value: new Float32Array([0, 0, 0, 60, 0, 0]), size: 3}}
      }
    };
    try {
      for (const backgroundPadding of [
        [0, 0],
        [20, 0]
      ]) {
        const props = {
          getSize: 24,
          background: true,
          backgroundPadding,
          extensions,
          pickable: true
        };
        const binary = new TextLayer({id: 'binary-padding', data, ...props});
        const objects = new TextLayer({
          id: 'object-padding',
          data: labels.map(({text, x}) => ({text, position: [x, 0]})),
          ...props
        });
        const count = backgroundPadding[0] ? 1 : 2;
        expect(await pickBinaryText(objects), `objects, ${backgroundPadding}`).toHaveLength(count);
        expect(await pickBinaryText(binary), `binary, ${backgroundPadding}`).toHaveLength(count);
      }
    } finally {
      buffer.destroy();
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'rotated labels collide alike in every collision rectangle path',
  async () => {
    // Stacked labels are apart, and overlap once rotated 90 degrees
    const labels = [
      {text: 'Collision', x: 0, y: 0},
      {text: 'Collision', x: 0, y: 40}
    ];
    const {data: binaryData, buffer} = createBinaryText(labels);
    const binaryWithBackground = {
      ...binaryData,
      attributes: {
        ...binaryData.attributes,
        background: {getPosition: {value: new Float32Array([0, 0, 0, 0, 40, 0]), size: 3}}
      }
    };
    const objectData = labels.map(({text, x, y}) => ({text, position: [x, y]}));
    // Each case names the sublayer that draws the label rectangle in the collision passes
    const cases = [
      {input: 'objects', data: objectData, background: false, drawnBy: 'background'},
      {input: 'objects', data: objectData, background: true, drawnBy: 'background'},
      {input: 'binary', data: binaryData, background: false, drawnBy: 'characters'},
      {input: 'binary', data: binaryWithBackground, background: false, drawnBy: 'background'},
      {input: 'binary', data: binaryWithBackground, background: true, drawnBy: 'background'}
    ];
    try {
      for (const {input, data, background, drawnBy} of cases) {
        for (const billboard of [true, false]) {
          for (const angle of [0, 90]) {
            const layer = new TextLayer({
              id: 'collision-paths',
              data,
              background,
              billboard,
              getAngle: angle,
              getSize: 24,
              fontFamily: 'Arial',
              getCollisionPriority: (_, {index}) => [100, -100][index],
              extensions,
              pickable: true
            });
            const name = `${input}, background=${background}, billboard=${billboard}, angle=${angle}`;
            expect(await pickBinaryText(layer), name).toEqual(angle ? [0] : [0, 1]);
            const collisionSubLayers = layer
              .getSubLayers()
              .filter(subLayer =>
                layer.filterSubLayer({layer: subLayer, renderPass: 'collision'} as any)
              )
              .map(subLayer => subLayer.id);
            expect(collisionSubLayers, name).toEqual([`collision-paths-${drawnBy}`]);
          }
        }
      }
    } finally {
      deck.setProps({layers: []});
      await new Promise(requestAnimationFrame);
      buffer.destroy();
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'binary row indexes identify labels drawn with background attributes',
  async () => {
    const buffers: {destroy: () => void}[] = [];
    // Characters set picking colors from row indexes, such as feature ids, not label indexes
    const createData = (x: number, backgroundAttributes: boolean) => {
      const {data, buffer} = createBinaryText([
        {text: 'AB', x: 0},
        {text: 'AB', x}
      ]);
      buffers.push(buffer);
      const attributes = {
        ...data.attributes,
        rowIndexes: {value: new Uint32Array([5, 5, 9, 9]), size: 1}
      };
      if (backgroundAttributes) {
        attributes.background = {
          getPosition: {value: new Float32Array([0, 0, 0, x, 0, 0]), size: 3}
        };
      }
      return {...data, attributes};
    };
    try {
      for (const {backgroundAttributes, background} of [
        {backgroundAttributes: false, background: false},
        {backgroundAttributes: true, background: false},
        {backgroundAttributes: true, background: true}
      ]) {
        for (const x of [200, 20]) {
          const layer = new TextLayer({
            id: 'binary-row-indexes',
            data: createData(x, backgroundAttributes),
            background,
            getSize: 24,
            extensions,
            pickable: true
          });
          const name = `background attributes=${backgroundAttributes}, background=${background}, x=${x}`;
          // Apart, both labels are visible; overlapping, one is
          expect(await pickBinaryText(layer), name).toHaveLength(x === 20 ? 1 : 2);
        }
      }
    } finally {
      deck.setProps({layers: []});
      await new Promise(requestAnimationFrame);
      buffers.forEach(buffer => buffer.destroy());
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'labels shrunk by DataFilterExtension collide at their drawn size',
  async () => {
    // At full size the labels overlap; at the half size they are drawn at they are apart
    const labels = [
      {text: 'Collision label', x: 0, priority: 1},
      {text: 'Collision label', x: 140, priority: 0}
    ];
    const {data: binaryData, buffer} = createBinaryText(labels);
    try {
      for (const [filtered, collisionGreedy] of [
        [false, false],
        [true, false],
        [false, true],
        [true, true]
      ]) {
        const message = `filtered=${filtered}, greedy=${collisionGreedy}`;
        const props = {
          collisionGreedy,
          getSize: 24,
          extensions: filtered
            ? [new CollisionFilterExtension(), new DataFilterExtension({filterSize: 1})]
            : extensions,
          // A filter value halfway into the soft range draws labels at half size
          getFilterValue: 0.5,
          filterRange: [0, 10],
          filterSoftRange: [1, 10],
          getCollisionPriority: (d, {index}) => labels[index].priority,
          pickable: true
        };
        const count = filtered ? 2 : 1;
        for (const background of [false, true]) {
          const layer = new TextLayer({
            id: 'filtered',
            data: labels.map(({text, x, priority}) => ({text, priority, position: [x, 0]})),
            background,
            ...props
          });
          expect(await drawLayers([layer]), `${message}, background=${background}`).toHaveLength(
            count
          );
        }
        const binary = new TextLayer({id: 'filtered-binary', data: binaryData, ...props});
        expect(await pickBinaryText(binary), `binary, ${message}`).toHaveLength(count);
      }
    } finally {
      buffer.destroy();
    }
  }
);

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
    const createLayers = (pixelOffset: [number, number], collisionGreedy: boolean) => [
      new TextLayer({
        id: 'same-data-a',
        data: rows,
        getSize: 24,
        getCollisionPriority: d => d.priority,
        extensions,
        collisionGreedy,
        pickable: true
      }),
      new TextLayer({
        id: 'same-data-b',
        data: rows,
        getSize: 24,
        getPixelOffset: pixelOffset,
        getCollisionPriority: d => d.priority,
        extensions,
        collisionGreedy,
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

    for (const collisionGreedy of [false, true]) {
      const message = `greedy=${collisionGreedy}`;
      // Labels of the same row overlap, and do not hide each other
      await drawLayers(createLayers([0, 10], collisionGreedy));
      expect(await pickPriorities('same-data-a'), message).toEqual([10, 20]);
      expect(await pickPriorities('same-data-b'), message).toEqual([10, 20]);

      // The second layer's first label overlaps the first layer's higher-priority second label
      await drawLayers(createLayers([250, 0], collisionGreedy));
      expect(await pickPriorities('same-data-a'), message).toEqual([10, 20]);
      expect(await pickPriorities('same-data-b'), message).toEqual([20]);
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'labels hidden by the content cutoff do not hide other labels',
  async () => {
    // The high-priority label's 40-pixel content box is cut off below 50 pixels
    const labels = [
      {text: 'Collision label', x: 0, priority: 100},
      {text: 'Collision label', x: 0, priority: -100}
    ];
    const {data: binaryData, buffer} = createBinaryText(labels);
    try {
      for (const [cutoff, collisionGreedy, billboard] of [
        [30, false, true],
        [50, false, true],
        [30, true, true],
        [50, true, true],
        [50, true, false]
      ] as const) {
        const props = {
          getSize: 24,
          extensions,
          collisionGreedy,
          billboard,
          pickable: true,
          getCollisionPriority: (d, {index}) => labels[index].priority,
          getContentBox: (d, {index}) =>
            labels[index].priority > 0 ? [-20, -20, 40, 40] : [0, 0, -1, -1],
          contentCutoffPixels: [cutoff, 0]
        };
        const hidden = cutoff > 40;
        const message = `cutoff=${cutoff}, greedy=${collisionGreedy}, billboard=${billboard}`;
        const layer = new TextLayer({
          id: 'cutoff',
          data: labels.map(({text, x, priority}) => ({text, priority, position: [x, 0]})),
          ...props
        });
        expect(await drawLayers([layer]), message).toEqual(hidden ? [-100] : [100]);
        const binary = new TextLayer({id: 'cutoff-binary', data: binaryData, ...props});
        expect(await pickBinaryText(binary), `binary, ${message}`).toEqual(hidden ? [1] : [0]);
      }
    } finally {
      buffer.destroy();
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'rotated labels clipped on one axis test the shape they reserve',
  async () => {
    // A rotated label clipped to a horizontal band, and a small label moved along the band.
    // Overlapping labels keep exactly one label whichever has the higher priority.
    const text = 'Collision label';
    const binaryData = {
      length: 1,
      startIndices: [0, text.length],
      attributes: {
        getText: new Uint8Array(Array.from(text).map(char => char.charCodeAt(0))),
        getPosition: {value: new Float32Array(text.length * 3), size: 3}
      }
    };
    for (const variant of ['object', 'background', 'binary']) {
      const counts = new Set<number>();
      for (let x = -200; x <= 200; x += 20) {
        const visibleCounts: number[] = [];
        for (const rotatedPriority of [1, -1]) {
          const rotated = new TextLayer({
            id: 'rotated',
            data: variant === 'binary' ? binaryData : [{position: [0, 0], text}],
            background: variant === 'background',
            getSize: 48,
            getAngle: 45,
            getContentBox: [0, -20, -1, 40],
            extensions,
            pickable: true,
            getCollisionPriority: rotatedPriority
          });
          const small = new TextLayer({
            id: 'small',
            data: [{position: [x, 15], text: 'o'}],
            getSize: 12,
            extensions,
            pickable: true
          });
          await new Promise<void>((resolve, reject) => {
            deck.setProps({
              layers: [rotated, small],
              viewState: {target: [0, 0, 0], zoom: 0},
              onError: reject,
              onAfterRender: () => rotated.isLoaded && small.isLoaded && resolve()
            });
          });
          const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
          visibleCounts.push(objects.length);
        }
        expect.soft(visibleCounts[0], `${variant}, x=${x}`).toBe(visibleCounts[1]);
        counts.add(visibleCounts[0]);
      }
      // The small label both overlaps and misses the rotated label along the band
      expect(counts, variant).toEqual(new Set([1, 2]));
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'repeated world copies keep overlapping labels hidden',
  async () => {
    // At zoom 0 the labels are drawn in three world copies; only the middle one is onscreen
    deck.setProps({views: new MapView({repeat: true})});
    try {
      for (const collisionGreedy of [false, true]) {
        const layer = new TextLayer({
          id: 'repeated',
          data: [
            {position: [0, 0], text: 'Collision label', priority: 100},
            {position: [2, 0], text: 'Collision label', priority: -100}
          ],
          getSize: 24,
          extensions,
          collisionGreedy,
          pickable: true,
          getCollisionPriority: d => d.priority
        });
        await new Promise<void>((resolve, reject) => {
          deck.setProps({
            layers: [layer],
            viewState: {longitude: 0, latitude: 0, zoom: 0},
            onError: reject,
            onAfterRender: () => layer.isLoaded && resolve()
          });
        });
        const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
        expect(
          objects.map(({object}) => object.priority),
          `greedy=${collisionGreedy}`
        ).toEqual([100]);
      }
    } finally {
      deck.setProps({views: new OrthographicView()});
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'culled world copies do not hide a visible label',
  async () => {
    // Looking east, one world copy of the label is behind the camera
    deck.setProps({views: new MapView({repeat: true})});
    try {
      for (const [billboard, collisionGreedy] of [
        [true, false],
        [false, false],
        [true, true],
        [false, true]
      ]) {
        const layer = new TextLayer({
          id: 'repeated-pitched',
          data: [{position: [0, 0], text: 'Collision label'}],
          getSize: 24,
          billboard,
          extensions,
          collisionGreedy,
          pickable: true
        });
        await new Promise<void>((resolve, reject) => {
          deck.setProps({
            layers: [layer],
            viewState: {longitude: 0, latitude: 0, zoom: 1, pitch: 85, bearing: 90},
            onError: reject,
            onAfterRender: () => layer.isLoaded && resolve()
          });
        });
        const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
        expect(objects, `billboard=${billboard}, greedy=${collisionGreedy}`).toHaveLength(1);
      }
    } finally {
      deck.setProps({views: new OrthographicView()});
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'labels crossing a clip boundary keep their unclipped part',
  async () => {
    // The clip bounds keep the left half of the view. The other label overlaps only the clipped part.
    const {data: binaryData, buffer} = createBinaryText([{text: 'Collision label', x: 0}]);
    const objectData = [{position: [0, 0], text: 'Collision label'}];
    try {
      for (const collisionGreedy of [false, true]) {
        for (const clippedPriority of [-100, 100]) {
          const other = new TextLayer({
            id: 'unclipped',
            data: [{position: [120, 0], text: 'Collision label'}],
            getSize: 24,
            billboard: false,
            extensions,
            collisionGreedy,
            pickable: true,
            getCollisionPriority: -clippedPriority
          });
          for (const {input, data, background} of [
            {input: 'objects', data: objectData, background: false},
            {input: 'objects', data: objectData, background: true},
            {input: 'binary', data: binaryData, background: false}
          ]) {
            const layer = new TextLayer({
              id: 'clipped',
              data,
              background,
              getSize: 24,
              billboard: false,
              clipBounds: [-1000, -1000, 0, 1000],
              clipByInstance: false,
              extensions: [new CollisionFilterExtension(), new ClipExtension()],
              collisionGreedy,
              pickable: true,
              getCollisionPriority: clippedPriority
            });
            expect(
              await pickLayerIds([layer, other]),
              `${input}, background=${background}, greedy=${collisionGreedy}, priority=${clippedPriority}`
            ).toEqual(['clipped', 'unclipped']);
          }
        }
      }
    } finally {
      deck.setProps({layers: []});
      await new Promise(requestAnimationFrame);
      buffer.destroy();
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'labels crossing a mask boundary keep their unmasked part',
  async () => {
    // The mask covers the right or the bottom half of the view; the labels cross its edge
    for (const {polygon, offset} of [
      {
        polygon: [
          [0, -1000],
          [1000, -1000],
          [1000, 1000],
          [0, 1000]
        ],
        offset: [60, 0]
      },
      {
        polygon: [
          [-1000, 0],
          [1000, 0],
          [1000, 1000],
          [-1000, 1000]
        ],
        offset: [0, 10]
      }
    ]) {
      const mask = new SolidPolygonLayer({
        id: 'text-mask',
        operation: 'mask',
        data: [{polygon}],
        getPolygon: d => d.polygon
      });
      const single = new TextLayer({
        id: 'masked',
        data: [{position: [0, 0], text: 'Collision label', priority: -100}],
        getSize: 24,
        billboard: false,
        maskId: 'text-mask',
        maskByInstance: false,
        extensions: [new CollisionFilterExtension(), new MaskExtension()],
        pickable: true,
        getCollisionPriority: d => d.priority
      });
      expect(await drawLayers([mask, single]), `${offset}`).toEqual([-100]);
      // The second label overlaps the first one's unmasked part
      const overlapping = single.clone({
        data: [...single.props.data, {position: offset, text: 'Collision label', priority: 100}]
      });
      expect(await drawLayers([mask, overlapping]), `${offset}`).toEqual([100]);
    }
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'greedy placement hides labels that a mask partly covers',
  async () => {
    // The mask keeps the right half of the view, which the first label crosses. Greedy placement
    // reads label bounds from the label's fragments, and masked fragments leave it without bounds.
    const mask = new SolidPolygonLayer({
      id: 'text-mask',
      operation: 'mask',
      data: [
        {
          polygon: [
            [0, -1000],
            [1000, -1000],
            [1000, 1000],
            [0, 1000]
          ]
        }
      ],
      getPolygon: d => d.polygon
    });
    const layer = new TextLayer({
      id: 'masked',
      data: [
        {position: [20, 0], text: 'Collision label', priority: 1},
        {position: [300, 0], text: 'Collision label', priority: 2}
      ],
      getSize: 24,
      billboard: false,
      maskId: 'text-mask',
      maskByInstance: false,
      collisionGreedy: true,
      extensions: [new CollisionFilterExtension(), new MaskExtension()],
      pickable: true,
      getCollisionPriority: d => d.priority
    });
    expect(await drawLayers([mask, layer])).toEqual([2]);
  }
);

test.skipIf(!isRenderTestDeviceEnabled('webgl'))(
  'rotated labels crossing a mask boundary test their unmasked part',
  async () => {
    // A vertical label whose right half is unmasked, and a small label beside its axis on either
    // side. Only the unmasked half collides, whichever label has the higher priority.
    // Few renders: many masked renders in one page crash the headless browser, also on master.
    const mask = new SolidPolygonLayer({
      id: 'text-mask',
      operation: 'mask',
      data: [
        {
          polygon: [
            [0, -1000],
            [1000, -1000],
            [1000, 1000],
            [0, 1000]
          ]
        }
      ],
      getPolygon: d => d.polygon
    });
    const maskedExtensions = [new CollisionFilterExtension(), new MaskExtension()];
    for (const position of [
      [-5, 30],
      [5, 30],
      [-5, -30],
      [5, -30]
    ]) {
      for (const rotatedPriority of [1, -1]) {
        const rotated = new TextLayer({
          id: 'masked-rotated',
          data: [{position: [0, 0], text: 'Collision label'}],
          getSize: 24,
          getAngle: 90,
          billboard: false,
          maskId: 'text-mask',
          maskByInstance: false,
          extensions: maskedExtensions,
          pickable: true,
          getCollisionPriority: rotatedPriority
        });
        const small = new TextLayer({
          id: 'small',
          data: [{position, text: 'o'}],
          getSize: 12,
          extensions,
          pickable: true
        });
        await new Promise<void>((resolve, reject) => {
          deck.setProps({
            layers: [mask, rotated, small],
            viewState: {target: [0, 0, 0], zoom: 0},
            onError: reject,
            onAfterRender: () => rotated.isLoaded && small.isLoaded && resolve()
          });
        });
        const objects = await deck.pickObjectsAsync({x: 0, y: 0, width: 800, height: 450});
        expect
          .soft(objects.length, `small label at ${position}, rotated priority ${rotatedPriority}`)
          .toBe(position[0] > 0 ? 1 : 2);
      }
    }
  }
);
