// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterAll, beforeAll, expect, test} from 'vitest';
import {Deck, OrthographicView, MapView} from '@deck.gl/core';
import {TextLayer, GeoJsonLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
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
      for (const zoom of [-1, 0, 4]) {
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
            viewState: {target: [0, 0, 0], zoom},
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
          zoom === 4 ? [-100, 100] : [reverse ? -100 : 100]
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
          getPosition: {buffer, size: 3}
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
