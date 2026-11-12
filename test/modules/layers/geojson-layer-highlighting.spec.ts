// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {CompositeLayer, Deck, OrthographicView, type Layer} from '@deck.gl/core';
import {GeoJsonLayer, IconLayer, ScatterplotLayer} from '@deck.gl/layers';
import {convertGeojsonToBinaryFeatureCollection} from '@loaders.gl/core/geoarrow';
import {luma, type Texture} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/core/webgl';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';
import type {Feature} from 'geojson';

const features: Feature[] = [
  {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [-36, 32],
        [36, 32]
      ]
    }
  },
  {type: 'Feature', properties: {}, geometry: {type: 'Point', coordinates: [-36, 0]}},
  {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPoint',
      coordinates: [
        [-12, 0],
        [12, 0]
      ]
    }
  },
  {type: 'Feature', properties: {}, geometry: {type: 'Point', coordinates: [36, 0]}},
  {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-10, -42],
          [10, -42],
          [10, -54],
          [-10, -54],
          [-10, -42]
        ]
      ]
    }
  }
];

class GeoJsonCompositeLayer extends CompositeLayer<{iconAtlas: Texture}> {
  static layerName = 'GeoJsonCompositeLayer';

  renderLayers() {
    return [
      createGeoJsonLayer(this.props.iconAtlas).clone({
        ...this.getSubLayerProps({id: 'geojson'}),
        data: features.map((feature, index) =>
          this.getSubLayerRow({...feature}, feature, index + 10)
        )
      }),
      // The outer composite also forwards hover info to siblings without point features.
      new GeoJsonLayer(this.getSubLayerProps({id: 'lines', data: [features[0]]}))
    ];
  }
}

function createGeoJsonLayer(iconAtlas: Texture) {
  return new GeoJsonLayer({
    id: 'geojson',
    data: features,
    pointType: 'circle+icon+text',
    iconAtlas,
    iconMapping: {icon: {x: 0, y: 0, width: 1, height: 1, mask: true}},
    getIcon: () => 'icon',
    getIconSize: 8,
    getIconColor: [255, 0, 0],
    getIconPixelOffset: [0, -24],
    getPointRadius: 4,
    pointRadiusUnits: 'pixels',
    getFillColor: [255, 0, 0],
    stroked: false,
    getText: () => 'X',
    getTextSize: 16,
    textFontFamily: 'monospace',
    getTextColor: [255, 0, 0],
    getTextPixelOffset: [0, 24],
    highlightColor: [0, 255, 0, 255],
    pickable: true,
    autoHighlight: true
  });
}

async function createScene() {
  const parent = document.createElement('div');
  parent.style.cssText = 'position:absolute;top:0;left:0;width:128px;height:128px;';
  document.body.appendChild(parent);
  const device = await luma.createDevice({
    type: 'webgl',
    adapters: [webgl2Adapter],
    createCanvasContext: {container: parent, width: 128, height: 128, useDevicePixels: false}
  });
  const atlas = device.createTexture({
    width: 1,
    height: 1,
    format: 'rgba8unorm',
    data: new Uint8Array([255, 255, 255, 255])
  });
  const errors: Error[] = [];
  const deck = new Deck({
    device,
    parent,
    width: 128,
    height: 128,
    useDevicePixels: false,
    views: new OrthographicView(),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    onError: error => errors.push(error)
  });
  let pixels: Uint8Array;
  const render = (layer: Layer) =>
    new Promise<void>(resolve => {
      deck.setProps({
        layers: [layer],
        onAfterRender: () => {
          if (layer.isLoaded || errors.length) {
            pixels = new Uint8Array(128 * 128 * 4);
            (device as any).gl.readPixels(
              0,
              0,
              128,
              128,
              (device as any).gl.RGBA,
              (device as any).gl.UNSIGNED_BYTE,
              pixels
            );
            resolve();
          }
        }
      });
    });
  // Count colored pixels in each marker, including antialiased text glyphs.
  const highlighted = (screenY: number) =>
    [28, 52, 76, 100].map(x => {
      let red = 0;
      let green = 0;
      for (let y = 128 - screenY - 4; y <= 128 - screenY + 4; y++) {
        for (let dx = -4; dx <= 4; dx++) {
          const offset = (y * 128 + x + dx) * 4;
          red += pixels[offset];
          green += pixels[offset + 1];
        }
      }
      expect(red + green, `marker at ${x},${screenY} is rendered`).toBeGreaterThan(0);
      return green > red;
    });
  const hover = async (x: number, y: number) => {
    const {result} = await (deck as any)._pickAsync('pickObjectAsync', 'pickObject Time', {
      x,
      y,
      radius: 4,
      mode: 'hover'
    });
    return result[0];
  };
  return {
    atlas,
    deck,
    render,
    highlighted,
    hover,
    errors,
    finalize() {
      deck.finalize();
      parent.remove();
      atlas.destroy();
      device.destroy();
    }
  };
}

test('GeoJsonLayer preserves selected Points in mixed geometries', async () => {
  const scene = await createScene();
  try {
    await scene.render(createGeoJsonLayer(scene.atlas).clone({highlightedObjectIndex: 1}));
    for (const y of [40, 64, 88]) {
      expect(scene.highlighted(y), `selected point at y=${y}`).toEqual([true, false, false, false]);
    }
    expect(scene.errors).toEqual([]);
  } finally {
    scene.finalize();
  }
});

test('GeoJsonLayer preserves Point hover in mixed and nested geometries', async () => {
  const scene = await createScene();
  const {atlas, render, highlighted, hover, errors} = scene;
  const geojson = createGeoJsonLayer(atlas);
  const selected = [true, false, false, false];
  try {
    // The outer composite changes the returned index and sourceLayer after GeoJSON picking.
    for (const layer of [
      geojson,
      new GeoJsonCompositeLayer({
        id: 'outer',
        iconAtlas: atlas,
        pickable: true,
        autoHighlight: true,
        highlightColor: [0, 255, 0, 255]
      })
    ]) {
      await render(layer);
      for (const y of [40, 64, 88]) {
        const info = await hover(28, y);
        expect(info?.object).toBe(features[1]);
        expect(info?.index).toBe(layer === geojson ? 1 : 11);
        await render(layer);
        for (const markerY of [40, 64, 88]) {
          expect(highlighted(markerY), `hover y=${y}, marker y=${markerY}`).toEqual(selected);
        }
      }
      // Moving to another geometry clears point highlights without remapping its color.
      const polygonInfo = await hover(64, 16);
      expect(polygonInfo?.object).toBe(features[4]);
      expect(polygonInfo?.index).toBe(layer === geojson ? 4 : 14);
      await render(layer);
      for (const y of [40, 64, 88]) expect(highlighted(y)).toEqual([false, false, false, false]);
      await hover(28, 40);
      await hover(120, 120);
      await render(layer);
      for (const y of [40, 64, 88]) expect(highlighted(y)).toEqual([false, false, false, false]);
    }
    expect(errors).toEqual([]);
  } finally {
    scene.finalize();
  }
});

test('GeoJsonLayer highlights MultiPoint icons and preserves circle/text point indices', async () => {
  const scene = await createScene();
  const {atlas, deck, render, highlighted, hover, errors} = scene;
  const geojson = createGeoJsonLayer(atlas);
  try {
    await render(geojson.clone({highlightedObjectIndex: 2}));
    expect(highlighted(40)).toEqual([false, true, true, false]);
    for (const y of [64, 88]) expect(highlighted(y)).toEqual([false, true, false, false]);
    await render(geojson);
    for (const y of [40, 64, 88]) {
      const info = await hover(76, y);
      expect(info?.object).toBe(features[2]);
      expect(info?.index).toBe(2);
      await render(geojson);
      expect(highlighted(40)).toEqual([false, true, true, false]);
      // Icons encode the feature; circles and text retain the picked point within it.
      const selected = y === 40 ? [false, true, false, false] : [false, false, true, false];
      for (const markerY of [64, 88]) expect(highlighted(markerY)).toEqual(selected);
    }
    for (const data of [features, convertGeojsonToBinaryFeatureCollection(features)]) {
      await render(geojson.clone({data, pointType: 'icon', highlightedObjectIndex: 2}));
      expect(highlighted(40)).toEqual([false, true, true, false]);
      for (const x of [52, 76]) {
        expect((await deck.pickObjectAsync({x, y: 40}))?.index).toBe(2);
      }
    }
    expect(errors).toEqual([]);
  } finally {
    scene.finalize();
  }
});

test('GeoJsonLayer respects replacement point layer types', async () => {
  const scene = await createScene();
  const {atlas, render, highlighted, hover, errors} = scene;
  const layer = createGeoJsonLayer(atlas).clone({
    _subLayerProps: {
      'points-circle': {
        type: IconLayer,
        // GeoJSON geometry positions take precedence over sublayer accessors.
        getPosition: () => [1000, 1000],
        iconAtlas: atlas,
        iconMapping: {icon: {x: 0, y: 0, width: 1, height: 1, mask: true}},
        getIcon: () => 'icon',
        getSize: 8,
        getColor: [255, 0, 0],
        getPixelOffset: [0, -24],
        billboard: true
      },
      'points-icon': {
        type: ScatterplotLayer,
        getPixelOffset: [0, 0],
        getRadius: 4,
        radiusUnits: 'pixels',
        getFillColor: [255, 0, 0],
        stroked: false
      }
    }
  });
  try {
    const selectedLayer = layer.clone({highlightedObjectIndex: 1});
    await render(selectedLayer);
    expect(errors).toEqual([]);
    for (const y of [40, 64, 88]) expect(highlighted(y)).toEqual([true, false, false, false]);
    await render(layer);
    for (const y of [40, 64, 88]) {
      const info = await hover(28, y);
      expect(info?.object).toBe(features[1]);
      expect(info?.index).toBe(1);
      await render(layer);
      for (const markerY of [40, 64, 88]) {
        expect(highlighted(markerY)).toEqual([true, false, false, false]);
      }
    }
    // An explicit sublayer override must still be able to disable manual highlighting.
    await render(
      layer.clone({
        highlightedObjectIndex: 1,
        autoHighlight: false,
        _subLayerProps: {
          ...layer.props._subLayerProps,
          'points-circle': {
            ...layer.props._subLayerProps['points-circle'],
            highlightedObjectIndex: -1
          }
        }
      })
    );
    expect(highlighted(40)).toEqual([false, false, false, false]);
    for (const y of [64, 88]) expect(highlighted(y)).toEqual([true, false, false, false]);
    expect(errors).toEqual([]);
  } finally {
    scene.finalize();
  }
});

test('GeoJsonLayer preserves Arrow point indexing', async () => {
  const scene = await createScene();
  const type = new FixedSizeList(2, new Field('value', new Float32(), false));
  const layer = createGeoJsonLayer(scene.atlas).clone({
    _subLayerProps: {
      'points-icon': {
        positions: vectorFromArray(
          [
            [-36, 0],
            [-12, 0],
            [12, 0],
            [36, 0]
          ],
          type
        )
      }
    }
  });
  try {
    await scene.render(layer.clone({highlightedObjectIndex: 1}));
    for (const y of [40, 64, 88]) {
      expect(scene.highlighted(y)).toEqual([true, false, false, false]);
    }
    await scene.render(layer);
    const info = await scene.hover(76, 40);
    expect(info?.object).toBe(features[2]);
    expect(info?.index).toBe(2);
    await scene.render(layer);
    for (const y of [40, 64, 88]) {
      expect(scene.highlighted(y)).toEqual([false, false, true, false]);
    }
    expect(scene.errors).toEqual([]);
  } finally {
    scene.finalize();
  }
});
