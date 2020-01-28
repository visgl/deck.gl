import {WebMercatorViewport} from 'deck.gl';
import AttributeManager from '@deck.gl/core/lib/attribute/attribute-manager';
import {gl} from '@deck.gl/test-utils';

const viewportProps = {
  longitude: -119.3,
  latitude: 35.6,
  zoom: 4,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
  width: 500,
  height: 500
};
const viewport = new WebMercatorViewport(viewportProps);

export function buildAttributes(opts) {
  const {weights, data} = opts;

  const numInstances = data.length;

  const attributeManager = new AttributeManager(gl);
  const accessorProps = {};
  attributeManager.add({
    positions: {size: 3, accessor: 'getPosition', type: gl.DOUBLE}
  });
  accessorProps.getPosition = opts.getPosition || (x => x.position);
  for (const weightId in weights) {
    const accessor = `get${weightId}`;
    attributeManager.add({
      [weightId]: {size: 3, accessor}
    });
    accessorProps[accessor] = x => x[weightId];
  }
  attributeManager.update({
    data,
    numInstances,
    props: accessorProps
  });
  return {
    attributes: attributeManager.getAttributes(),
    vertexCount: numInstances
  };
}

const {width, height} = viewport;
const fixture = {
  data: [
    // Inside the current viewport bounds
    {
      position: [-120.4193, 34.7751],
      weight1: [2, 11, 101]
    },

    // Merged to same grid
    {
      position: [-118.67079, 34.03948],
      weight1: [1, 22, 303]
    },
    {
      position: [-118.67079, 34.03948],
      weight1: [3, 31, 401]
    },

    // Outside the current viewport bounds
    {
      position: [-122.4193, 10],
      weight1: [33, 1, 500]
    }
  ],
  weights: {
    weight1: {
      size: 3,
      needMin: true,
      needMax: true
    }
  },
  cellSize: [25, 25],
  moduleSettings: {viewport},
  projectPoints: true,
  translation: [1, -1],
  scaling: [width / 2, -height / 2, 1],
  numCol: Math.ceil(width / 25),
  numRow: Math.ceil(height / 25)
};

// Object.assign(fixture, buildAttributes(fixture));

function generateRandomGridPoints(pointCount) {
  const topLeft = {
    lng: -128.0,
    lat: 40.0
  };
  const bottomRight = {
    lng: -126.0,
    lat: 38.0
  };

  const w = bottomRight.lng - topLeft.lng;
  const h = bottomRight.lat - topLeft.lat;

  const data = [];
  for (let i = 0; i < pointCount; i++) {
    data.push({
      position: [
        Math.floor(Math.random() * w) + topLeft.lng,
        Math.floor(Math.random() * h) + topLeft.lat
      ],
      // floor to avoid gpu precession issues
      weight1: [Math.random(), Math.random(), Math.random()].map(x => Math.floor(x * 10))
    });
  }
  return data;
}

export const GridAggregationData = {
  viewport,
  fixture,
  generateRandomGridPoints,
  buildAttributes
};
