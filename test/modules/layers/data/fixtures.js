export const geoJSONData = [
  {
    id: 1,
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0.80908203125, 0.8935546875],
          [0.8095703125, 0.89404296875],
          [0.80908203125, 0.89404296875],
          [0.80908203125, 0.8935546875]
        ]
      ]
    },
    properties: {
      cartodb_id: 148,
      name: 'First'
    }
  },
  {
    id: 2,
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0.90908203125, 0.9935546875],
          [0.9095703125, 0.99404296875],
          [0.90908203125, 0.99404296875],
          [0.90908203125, 0.9935546875]
        ]
      ]
    },
    properties: {
      cartodb_id: 149,
      name: 'Second'
    }
  }
];

// prettier-ignore
export const pickingColorsSample = Uint8ClampedArray.from([ 
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0
]);
