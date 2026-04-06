// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, OrthographicView} from '@deck.gl/core';
import {TextLayer, PathLayer} from '@deck.gl/layers';
import {points} from 'deck.gl-test/data';
import fontMapping from '../../data/font-atlas.json';

const TextAnchors = ['start', 'middle', 'end'];
const TextBaselines = ['top', 'center', 'bottom'];
const ContentAlignment = ['start', 'center', 'end'];
const alignmentTestData = [
  {anchor: [-200, -100], hAlign: 2, vAlign: 2},
  {anchor: [0, -100], hAlign: 1, vAlign: 2},
  {anchor: [200, -100], hAlign: 0, vAlign: 2},
  {anchor: [-200, 0], hAlign: 2, vAlign: 1},
  {anchor: [0, 0], hAlign: 1, vAlign: 1},
  {anchor: [200, 0], hAlign: 0, vAlign: 1},
  {anchor: [-200, 100], hAlign: 2, vAlign: 0},
  {anchor: [0, 100], hAlign: 1, vAlign: 0},
  {anchor: [200, 100], hAlign: 0, vAlign: 0}
];

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
    name: 'text-layer',
    viewState: {
      latitude: 37.766,
      longitude: -122.42,
      zoom: 14,
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
      latitude: 37.766,
      longitude: -122.42,
      zoom: 14,
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
        sizeScale: 3.77307847,
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
      latitude: 37.766,
      longitude: -122.42,
      zoom: 14,
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
  ...[
    {flipY: false, billboard: false},
    {flipY: false, billboard: true},
    {flipY: true, billboard: false},
    {flipY: true, billboard: true}
  ].map(({flipY, billboard}, i) => ({
    name: `text-layer-alignment-${i}`,
    viewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    views: [new OrthographicView({flipY})],
    layers: [
      new TextLayer({
        id: 'labels',
        data: alignmentTestData,
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        getPosition: ({anchor: [x, y]}) => (flipY ? [x, y] : [x, -y]),
        getText: d => 'Hello TextLayer',
        billboard,
        getSize: 20,
        getAlignmentBaseline: d => TextBaselines[d.vAlign],
        getTextAnchor: d => TextAnchors[d.hAlign],
        getColor: [0, 0, 0],
        background: true,
        getBackgroundColor: [255, 255, 0]
      }),
      new PathLayer({
        id: 'reference-lines',
        data: alignmentTestData,
        getPath: ({anchor: [x, y], hAlign}) => [
          [x - hAlign * 100, y],
          [x + (2 - hAlign) * 100, y]
        ],
        getColor: [255, 0, 0],
        getWidth: 1,
        widthUnits: 'pixels'
      })
    ],
    goldenImage: './test/render/golden-images/text-layer-alignment.png'
  })),
  ...[
    {target: [0, 0, 0]},
    {target: [100, 0, 0]},
    {target: [-100, 0, 0]},
    {target: [0, 100, 0]},
    {target: [0, -100, 0]}
  ].map((viewState, caseIndex) => ({
    name: `text-layer-content-box-${caseIndex}`,
    viewState: {
      ...viewState,
      zoom: 0
    },
    views: [new OrthographicView()],
    layers: alignmentTestData.map(
      ({anchor: [x, y], hAlign, vAlign}, i) =>
        new TextLayer({
          id: `labels-${i}`,
          data: [0],
          _getFontRenderer: () => fontRenderer,
          fontFamily: 'Arial',
          getPosition: _ => [-x * 2, -y * 2],
          getText: _ => 'Hello',
          getSize: 16,
          getTextAnchor: TextAnchors[hAlign],
          getAlignmentBaseline: TextBaselines[vAlign],
          getColor: [0, 0, 0],
          getPixelOffset: [(1 - hAlign) * 4, (1 - vAlign) * 4],
          background: true,
          getBackgroundColor: [255, 255, 0],
          getContentBox: [-hAlign * 100, -vAlign * 60, 200, 120],
          contentAlignHorizontal: ContentAlignment[hAlign],
          contentAlignVertical: ContentAlignment[vAlign]
        })
    ),
    goldenImage: `./test/render/golden-images/text-layer-content-alignment-${caseIndex}.png`
  })),
  {
    name: 'text-layer-multi-lines',
    viewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    views: [new OrthographicView()],
    layers: [
      new TextLayer({
        id: 'labels',
        data: points.slice(2, 5),
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        getPosition: (_, {index}) => [0, (index - 1) * 160],
        getText: d => `${d.ADDRESS}\n${d.LOCATION_NAME}\n${d.RACKS} racks - ${d.SPACES} spaces`,
        getSize: 20,
        getTextAnchor: (_, {index}) => TextAnchors[index],
        getAlignmentBaseline: (_, {index}) => TextBaselines[index],
        background: true,
        getBackgroundColor: [255, 255, 0]
      })
    ],
    goldenImage: './test/render/golden-images/text-layer-multi-lines.png'
  },
  {
    name: 'text-layer-background',
    viewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    views: [new OrthographicView({padding: {bottom: '100%'}})],
    layers: [
      new TextLayer({
        id: 'labels',
        data: points.slice(0, 10),
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        getPosition: (_, {index}) => [0, index * 60],
        getText: d => d.ADDRESS,
        getAngle: 30,
        lineHeight: 2,
        getSize: 16,
        getColor: [200, 0, 0],
        getTextAnchor: 'start',
        getAlignmentBaseline: 'top',
        background: true,
        getBackgroundColor: [200, 255, 255],
        getBorderWidth: 2,
        getBorderColor: [0, 100, 150],
        backgroundPadding: [12, 8],
        backgroundBorderRadius: 8
      })
    ],
    goldenImage: './test/render/golden-images/text-layer-background.png'
  },
  {
    name: 'text-layer-auto-wrapping',
    viewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    views: [new OrthographicView({padding: {bottom: '100%', right: '100%'}})],
    layers: [
      new TextLayer({
        id: 'labels',
        data: [0],
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        getPosition: d => [40, 40],
        getText: d => `The TextLayer renders text labels at given coordinates.
TextLayer is a CompositeLayer that wraps around the IconLayer. It automatically creates an atlas texture from the specified font settings and characterSet.`,
        getSize: 24,
        maxWidth: 20,
        lineHeight: 1.5,
        getAlignmentBaseline: 'top',
        getTextAnchor: 'start',
        getColor: [0, 0, 0],
        background: true,
        getBackgroundColor: [255, 255, 0],
        backgroundPadding: [10, 10]
      })
    ],
    goldenImage: './test/render/golden-images/text-layer-auto-wrapping.png'
  }
];
