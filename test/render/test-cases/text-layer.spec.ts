// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

import {COORDINATE_SYSTEM, OrthographicView} from '@deck.gl/core';
import {TextLayer, PathLayer} from '@deck.gl/layers';
import {PointLabelLayer} from '@deck.gl/carto';
import {PathStyleExtension} from '@deck.gl/extensions';
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
async function loadPrepackedFontAtlas() {
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

const sdfGlyphPadding = 10;
const sdfRadius = 12;
const sdfCutoff = 0.25;

function getSignedDistanceToRectangle(x, y, {left, top, right, bottom}) {
  const outsideX = Math.max(left - x, 0, x - right);
  const outsideY = Math.max(top - y, 0, y - bottom);
  if (outsideX > 0 || outsideY > 0) {
    return Math.hypot(outsideX, outsideY);
  }
  return -Math.min(x - left, right - x, y - top, bottom - y);
}

function getSignedDistanceToCircle(x, y, centerX, centerY, radius) {
  return Math.hypot(x - centerX, y - centerY) - radius;
}

const sdfGlyphDefinitions = {
  H: {
    width: 32,
    height: 48,
    advance: 40,
    ascent: 38,
    descent: 10,
    getDistance: (x, y) =>
      Math.min(
        getSignedDistanceToRectangle(x, y, {left: 0, top: 0, right: 8, bottom: 48}),
        getSignedDistanceToRectangle(x, y, {left: 24, top: 0, right: 32, bottom: 48}),
        getSignedDistanceToRectangle(x, y, {left: 0, top: 20, right: 32, bottom: 28})
      )
  },
  O: {
    width: 40,
    height: 40,
    advance: 48,
    ascent: 36,
    descent: 4,
    getDistance: (x, y) => Math.abs(getSignedDistanceToCircle(x, y, 20, 20, 16)) - 4
  },
  g: {
    width: 32,
    height: 48,
    advance: 40,
    ascent: 32,
    descent: 16,
    getDistance: (x, y) =>
      Math.min(
        Math.abs(getSignedDistanceToCircle(x, y, 16, 16, 12)) - 4,
        getSignedDistanceToRectangle(x, y, {left: 24, top: 14, right: 32, bottom: 48}),
        getSignedDistanceToRectangle(x, y, {left: 12, top: 40, right: 32, bottom: 48})
      )
  },
  I: {
    width: 14,
    height: 48,
    advance: 22,
    ascent: 38,
    descent: 10,
    getDistance: (x, y) =>
      Math.min(
        getSignedDistanceToRectangle(x, y, {left: 0, top: 0, right: 14, bottom: 6}),
        getSignedDistanceToRectangle(x, y, {left: 4, top: 0, right: 10, bottom: 48}),
        getSignedDistanceToRectangle(x, y, {left: 0, top: 42, right: 14, bottom: 48})
      )
  },
  '.': {
    width: 10,
    height: 10,
    advance: 18,
    ascent: 0,
    descent: 10,
    getDistance: (x, y) => getSignedDistanceToCircle(x, y, 5, 5, 5)
  }
};

const sdfFontRenderer = {
  measure: char => {
    if (!char) {
      return {advance: 0, width: 0, ascent: 38, descent: 16};
    }
    const {advance, width, ascent, descent} = sdfGlyphDefinitions[char];
    return {advance, width, ascent, descent};
  },
  draw: char => {
    const glyph = sdfGlyphDefinitions[char];
    const width = glyph.width + sdfGlyphPadding * 2;
    const height = glyph.height + sdfGlyphPadding * 2;
    const imageData = new ImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const glyphX = x - sdfGlyphPadding + 0.5;
        const glyphY = y - sdfGlyphPadding + 0.5;
        const distance = glyph.getDistance(glyphX, glyphY);
        const alpha = Math.max(
          0,
          Math.min(255, Math.round(255 - 255 * (distance / sdfRadius + sdfCutoff)))
        );
        imageData.data[(y * width + x) * 4 + 3] = alpha;
      }
    }

    return {data: imageData, left: sdfGlyphPadding, top: sdfGlyphPadding};
  }
};

const testCases = [
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
    name: 'text-layer-sdf-outline',
    viewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    views: [new OrthographicView()],
    layers: [
      new TextLayer({
        id: 'text-layer-sdf-outline',
        data: [0],
        _getFontRenderer: () => sdfFontRenderer,
        fontFamily: 'Render Test SDF Variants',
        characterSet: 'auto',
        fontSettings: {
          sdf: true,
          fontSize: 64,
          buffer: sdfGlyphPadding,
          radius: sdfRadius,
          cutoff: sdfCutoff,
          smoothing: 0.1
        },
        getText: () => 'HOgI.',
        getPosition: () => [-126, 0],
        getColor: [255, 255, 255],
        getSize: 96,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'bottom',
        getPixelOffset: [12, 0],
        outlineWidth: 8,
        outlineColor: [0, 128, 255, 255]
      })
    ],
    goldenImage: './test/render/golden-images/text-layer-sdf-outline.png',
    imageDiffOptions: {threshold: 0.999}
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
    name: 'point-label-layer-background',
    viewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    views: [new OrthographicView()],
    layers: [
      new PointLabelLayer({
        id: 'point-label',
        data: [0],
        getPosition: () => [0, 0],
        getText: () => 'PointLabelLayer',
        getRadius: 0,
        sizeScale: 32,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        getColor: [180, 0, 0],
        background: true,
        getBackgroundColor: [240, 250, 255],
        getBorderWidth: 3,
        getBorderColor: [0, 100, 180],
        backgroundPadding: [12, 8],
        backgroundBorderRadius: 8,
        updateTriggers: {getText: 'point-label'},
        _subLayerProps: {
          'point-label-primary': {_getFontRenderer: () => fontRenderer}
        }
      })
    ],
    goldenImage: './test/render/golden-images/point-label-layer-background.png'
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
  },
  {
    name: 'text-layer-background-dash',
    skip: ['webgpu'],
    viewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    views: [new OrthographicView()],
    layers: [
      // Rounded corners
      new TextLayer({
        id: 'rounded',
        data: [
          {
            text: 'Multi-line\nwith longer dashes',
            anchor: 'middle',
            baseline: 'center',
            dash: [6, 3]
          },
          {text: 'Dense dots', anchor: 'end', baseline: 'bottom', dash: [1, 1]}
        ],
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        getPosition: (_, {index}) => [-120, (index - 0.5) * 120],
        getText: d => d.text,
        getSize: 18,
        getColor: [40, 40, 40],
        getTextAnchor: d => d.anchor,
        getAlignmentBaseline: d => d.baseline,
        background: true,
        getBackgroundColor: [230, 240, 255],
        getBorderWidth: 2,
        getBorderColor: [0, 80, 160],
        backgroundPadding: [12, 8],
        backgroundBorderRadius: 10,
        getDashArray: d => d.dash,
        extensions: [new PathStyleExtension({dash: true})]
      }),
      // Sharp corners
      new TextLayer({
        id: 'sharp',
        data: [
          {text: 'Sharp short dash', anchor: 'start', baseline: 'top', dash: [2, 1]},
          {
            text: 'Wide gaps between\ndash segments here',
            anchor: 'start',
            baseline: 'center',
            dash: [3, 5]
          }
        ],
        _getFontRenderer: () => fontRenderer,
        fontFamily: 'Arial',
        getPosition: (_, {index}) => [120, (index - 0.5) * 120],
        getText: d => d.text,
        getSize: 18,
        getColor: [40, 40, 40],
        getTextAnchor: d => d.anchor,
        getAlignmentBaseline: d => d.baseline,
        background: true,
        getBackgroundColor: [255, 240, 220],
        getBorderWidth: 2,
        getBorderColor: [160, 80, 0],
        backgroundPadding: [12, 8],
        backgroundBorderRadius: 0,
        getDashArray: d => d.dash,
        extensions: [new PathStyleExtension({dash: true})]
      })
    ],
    goldenImage: './test/render/golden-images/text-layer-background-dash.png'
  }
];

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(testCases as TestCase[], deviceType, {
    beforeAll: loadPrepackedFontAtlas
  });
});
