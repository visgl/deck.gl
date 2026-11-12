// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {CompositeLayer, Deck, OrthographicView, type Layer} from '@deck.gl/core';
import {IconLayer, TextLayer} from '@deck.gl/layers';
import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/core/webgl';
import type {Texture} from '@luma.gl/core';

type Row = {positions: [number, number][]};

class IconCompositeLayer extends CompositeLayer<{
  data: Row[];
  iconAtlas: Texture;
  wrap?: boolean;
}> {
  static layerName = 'IconCompositeLayer';

  renderLayers() {
    const data = this.props.data.flatMap((row, index) =>
      row.positions.map(position =>
        this.props.wrap === false ? {position} : this.getSubLayerRow({position}, row, index)
      )
    );
    return new IconLayer(
      this.getSubLayerProps({
        id: 'icons',
        data,
        iconAtlas: this.props.iconAtlas,
        iconMapping: {icon: {x: 0, y: 0, width: 1, height: 1, mask: true}},
        getIcon: () => 'icon',
        getSize: 8,
        getColor: [255, 0, 0]
      })
    );
  }
}

test('IconLayer highlights and picks source rows from a composite layer', async () => {
  const parent = document.createElement('div');
  parent.style.cssText = 'position:absolute;top:0;left:0;width:128px;height:128px;';
  document.body.appendChild(parent);
  const device = await luma.createDevice({
    type: 'webgl',
    adapters: [webgl2Adapter],
    createCanvasContext: {
      container: parent,
      width: 128,
      height: 128,
      useDevicePixels: false,
      autoResize: true
    }
  });
  const atlas = device.createTexture({
    width: 1,
    height: 1,
    format: 'rgba8unorm',
    data: new Uint8Array([255, 255, 255, 255])
  });
  const data: Row[] = [
    {
      positions: [
        [-36, 0],
        [-12, 0]
      ]
    },
    {positions: []},
    {
      positions: [
        [12, 0],
        [36, 0]
      ]
    }
  ];
  const layer = new IconCompositeLayer({
    id: 'composite',
    data,
    iconAtlas: atlas,
    pickable: true,
    highlightedObjectIndex: 2,
    highlightColor: [0, 255, 0, 255]
  });
  const errors: Error[] = [];
  let pixels: Uint8Array;
  const deck = new Deck({
    device,
    parent,
    width: 128,
    height: 128,
    useDevicePixels: false,
    views: new OrthographicView(),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    layers: [layer],
    onError: error => errors.push(error)
  });
  const render = (nextLayer: Layer) =>
    new Promise<void>(resolve => {
      deck.setProps({
        layers: [nextLayer],
        onAfterRender: () => {
          if (nextLayer.isLoaded || errors.length) {
            const gl = (device as any).gl;
            pixels = new Uint8Array(128 * 4);
            gl.readPixels(0, 64, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            resolve();
          }
        }
      });
    });
  const colors = () => [28, 52, 76, 100].map(x => [...pixels.slice(x * 4, x * 4 + 3)]);
  try {
    await render(layer);
    expect(errors).toEqual([]);
    expect(colors()).toEqual([
      [255, 0, 0],
      [255, 0, 0],
      [0, 255, 0],
      [0, 255, 0]
    ]);
    for (const x of [76, 100]) {
      const info = await deck.pickObjectAsync({x, y: 64});
      expect(info?.index).toBe(2);
      expect(info?.object).toBe(data[2]);
    }
    const icons = layer.getSubLayers()[0];
    icons.disablePickingIndex(2);
    expect(await deck.pickObjectAsync({x: 76, y: 64})).toBeNull();
    expect(await deck.pickObjectAsync({x: 100, y: 64})).toBeNull();
    expect((await deck.pickObjectAsync({x: 28, y: 64}))?.object).toBe(data[0]);
    icons.restorePickingColors();
    expect((await deck.pickObjectAsync({x: 100, y: 64}))?.object).toBe(data[2]);

    // Switching data shapes must also update the shader and attribute layout.
    const plain = layer.clone({wrap: false});
    await render(plain);
    expect(colors()).toEqual([
      [255, 0, 0],
      [255, 0, 0],
      [0, 255, 0],
      [255, 0, 0]
    ]);
    expect((await deck.pickObjectAsync({x: 100, y: 64}))?.index).toBe(3);
    const empty = plain.clone({data: []});
    await render(empty);
    expect(await deck.pickObjectAsync({x: 100, y: 64})).toBeNull();
    const restored = empty.clone({data, wrap: true});
    await render(restored);
    expect(colors()).toEqual([
      [255, 0, 0],
      [255, 0, 0],
      [0, 255, 0],
      [0, 255, 0]
    ]);

    // TextLayer owns character-to-text indices, even when its rows are wrapped.
    const textData = restored.getSubLayers()[0].props.data as {position: number[]}[];
    const text = new TextLayer({
      data: textData,
      getText: () => 'XX',
      getPosition: row => row.position as [number, number],
      getSize: 16,
      fontFamily: 'monospace',
      pickable: true
    });
    await render(text);
    const characters = text.getSubLayers().find(subLayer => subLayer.id.endsWith('-characters'))!;
    expect((await deck.pickObjectAsync({x: 100, y: 64, radius: 4}))?.object).toBe(textData[3]);
    characters.disablePickingIndex(3);
    expect(await deck.pickObjectAsync({x: 100, y: 64, radius: 4})).toBeNull();
    expect((await deck.pickObjectAsync({x: 76, y: 64, radius: 4}))?.object).toBe(textData[2]);
    characters.restorePickingColors();
    expect((await deck.pickObjectAsync({x: 100, y: 64, radius: 4}))?.object).toBe(textData[3]);
    expect(errors).toEqual([]);
  } finally {
    deck.finalize();
    parent.remove();
    atlas.destroy();
    device.destroy();
  }
});
