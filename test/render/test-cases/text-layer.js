// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {TextLayer} from '@deck.gl/layers';
import {points} from 'deck.gl-test/data';
import fontMapping from '../../data/font-atlas.json';

function getBinaryAttributes(data, getText, accessors) {
  const startIndices = new Uint16Array(
    data.reduce(
      (acc, d) => {
        const lastIndex = acc[acc.length - 1];
        acc.push(lastIndex + getText(d).length);
        return acc;
      },
      [0]
    )
  );

  const attributes = {};

  attributes.getText = {
    value: new Uint8Array(
      data.map(d => Array.from(getText(d)).map(char => char.charCodeAt(0))).flat()
    )
  };
  for (const accessorName in accessors) {
    const {accessor, ...props} = accessors[accessorName];
    props.value = new Float32Array(
      data
        .slice(0, 50)
        .map(d => Array.from(getText(d)).map(d1 => accessor(d)))
        .flat(2)
    );
    attributes[accessorName] = props;
  }

  return {
    length: data.length,
    startIndices,
    attributes
  };
}

/** Text rendering is highly platform dependent. We insert a custom font renderer here to remove the discrepancy between dev box and CI */
let fontRenderer = null;
export async function loadPrepackedFontAtlas() {
  const image = new Image();

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = '/test/data/font-atlas.png';
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  ctx.drawImage(image, 0, 0);

  fontRenderer = {
    measure: char => {
      const frame = fontMapping[char] ?? fontMapping[''];
      return {
        advance: frame.advance,
        width: frame.width,
        ascent: frame.anchorY,
        descent: frame.height - frame.anchorY
      };
    },
    draw: char => {
      const frame = fontMapping[char] ?? fontMapping[''];
      const glyph = ctx.getImageData(frame.x, frame.y, frame.width, frame.height);
      return {data: glyph};
    }
  };
}

export default [
  {
    name: 'text-layer-background-border-radius',
    viewState: {
      latitude: 37.75,
      longitude: -122.44,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TextLayer({
        id: 'text-layer-2',
        data: points.slice(0, 10),
        coordinateOrigin: [-122.44, 37.75],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        background: true,
        backgroundPadding: [10, 10],
        backgroundBorderRadius: [100, 5, 15, 0],
        getBackgroundColor: [255, 255, 0, 200],
        getBorderWidth: 1,
        getText: x => `${x.ADDRESS}-${x.SPACES}`,
        getPosition: (_, {index}) => [0, (index - 5) * 1000],
        getColor: [255, 0, 0],
        getAngle: 15,
        getSize: 20,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'center'
      })
    ],
    goldenImage: './test/render/golden-images/text-layer-background-border-radius.png'
  },
  {
    name: 'text-layer',
    viewState: {
      latitude: 37.751,
      longitude: -122.427,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TextLayer({
        id: 'text-layer',
        data: points.slice(0, 50),
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        getText: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
        getPosition: x => x.COORDINATES,
        getColor: x => [255, 0, 0],
        getSize: x => 20,
        getAngle: x => 0,
        sizeScale: 1,
        getTextAnchor: x => 'start',
        getAlignmentBaseline: x => 'center',
        getPixelOffset: x => [10, 0]
      })
    ],
    goldenImage: './test/render/golden-images/text-layer.png'
  },
  {
    name: 'text-layer-meter-size',
    viewState: {
      latitude: 37.751,
      longitude: -122.427,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TextLayer({
        id: 'text-layer',
        data: points.slice(0, 50),
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        getText: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
        getPosition: x => x.COORDINATES,
        getColor: x => [255, 0, 0],
        getSize: x => 20,
        getAngle: x => 0,
        sizeScale: 21.343755,
        sizeUnits: 'meters',
        getTextAnchor: x => 'start',
        getAlignmentBaseline: x => 'center',
        getPixelOffset: x => [10, 0]
      })
    ],
    goldenImage: './test/render/golden-images/text-layer.png'
  },
  {
    name: 'text-layer-binary',
    viewState: {
      latitude: 37.751,
      longitude: -122.427,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TextLayer({
        id: 'text-layer',
        data: getBinaryAttributes(points.slice(0, 50), x => `${x.PLACEMENT}-${x.YR_INSTALLED}`, {
          getPosition: {accessor: x => x.COORDINATES, size: 2},
          getColor: {accessor: x => [1, 0, 0], size: 3, normalized: false}
        }),
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        getSize: 20,
        getAngle: 0,
        sizeScale: 1,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'center',
        getPixelOffset: [10, 0]
      })
    ],
    goldenImage: './test/render/golden-images/text-layer.png'
  },
  {
    name: 'text-layer-multi-lines',
    viewState: {
      latitude: 37.75,
      longitude: -122.44,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TextLayer({
        id: 'text-layer-2',
        data: points.slice(0, 10),
        coordinateOrigin: [-122.44, 37.75],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        getText: x => `${x.ADDRESS}\n${x.SPACES}`,
        getPosition: (_, {index}) => [0, (index - 5) * 1000],
        getColor: [255, 0, 0],
        getSize: 20,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center'
      })
    ],
    goldenImage: './test/render/golden-images/text-layer-multi-lines.png'
  },
  {
    name: 'text-layer-auto-wrapping',
    viewState: {
      latitude: 37.75,
      longitude: -122.44,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TextLayer({
        id: 'text-layer-2',
        data: points.slice(0, 5),
        coordinateOrigin: [-122.44, 37.75],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        wordBreak: 'break-word',
        maxWidth: 16,
        getText: x => `${x.LOCATION_NAME} ${x.ADDRESS}`,
        getPosition: (_, {index}) => [0, (index - 2) * 2000],
        getColor: [255, 0, 0],
        getSize: 20,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center'
      })
    ],
    goldenImage: './test/render/golden-images/text-layer-auto-wrapping.png'
  },
  {
    name: 'text-layer-background',
    viewState: {
      latitude: 37.75,
      longitude: -122.44,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TextLayer({
        id: 'text-layer-2',
        data: points.slice(0, 10),
        coordinateOrigin: [-122.44, 37.75],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        background: true,
        backgroundPadding: [10, 10],
        getBackgroundColor: [255, 255, 0, 200],
        getBorderWidth: 1,
        getText: x => `${x.ADDRESS}-${x.SPACES}`,
        getPosition: (_, {index}) => [0, (index - 5) * 1000],
        getColor: [255, 0, 0],
        getAngle: 15,
        getSize: 20,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'center'
      })
    ],
    goldenImage: './test/render/golden-images/text-layer-background.png'
  }
];
