/* global window,document */
import test from 'tape-promise/tape';

import {WIDTH, HEIGHT} from './constants';

const TEST_CASES = [
  {
    name: 'ScatterplotLayer',
    json: {
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 13
      },
      layers: [
        {
          '@@type': 'ScatterplotLayer',
          data: [[0, 0], [0.01, 0.01]],
          getPosition: '@@=-',
          getRadius: 500,
          getFillColor: [255, 0, 0]
        }
      ]
    },
    goldenImage: './test/render/golden-images/jupyter-widget-scatterplot.png'
  },
  {
    name: 'ScatterplotLayer and TextLayer',
    json: {
      description: 'Test of plotting multiple layers at once',
      viewState: {
        maxZoom: 20,
        zoom: 15
      },
      layers: [
        {
          '@@type': 'ScatterplotLayer',
          data: [
            {
              position: [-0.002, 0.002],
              rgb: [136, 45, 97]
            },
            {
              position: [-0.002, -0.002],
              rgb: [170, 57, 57]
            },
            {
              position: [0.002, -0.002],
              rgb: [45, 136, 45]
            },
            {
              position: [0.002, 0.002],
              rgb: [123, 159, 53]
            }
          ],
          getFillColor: '@@=rgb',
          getPosition: '@@=position',
          getRadius: 100
        },
        {
          '@@type': 'TextLayer',
          data: [
            {
              position: [0, 0],
              text: 'Test'
            },
            {
              position: [0.002, 0],
              text: 'Testing'
            }
          ],
          fontSize: 144,
          getColor: [0, 0, 255],
          getPosition: '@@=position',
          getTextAnchor: 'start',
          fontFamily: 'Times'
        }
      ]
    },
    goldenImage: './test/render/golden-images/jupyter-widget-scatterplot-and-text.png'
  },
  {
    name: 'GeoJsonLayer',
    json: {
      description: 'Test of GeoJsonLayer',
      viewState: {
        longitude: -122.45,
        latitude: 37.8,
        zoom: 1
      },
      layers: [
        {
          '@@type': 'GeoJsonLayer',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [-122.42923736572264, 37.80544394934271],
                      [0, 37.80544394934271],
                      [-122.42923736572264, 0],
                      [-122.42923736572264, 37.80544394934271]
                    ]
                  ]
                }
              }
            ]
          },
          stroked: true,
          filled: true,
          lineWidthMinPixels: 2,
          opacity: 0.4,
          getLineColor: [255, 100, 100],
          getFillColor: [200, 160, 0, 180]
        }
      ]
    },
    goldenImage: './test/render/golden-images/jupyter-widget-geojsonlayer.png'
  },
  {
    name: 'HexagonLayer with Function',
    json: {
      description: 'HexagonLayer with a function string',
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 6,
        pitch: 40.5,
        bearing: -27
      },
      views: [
        {
          '@@type': 'MapView',
          controller: true
        }
      ],
      layers: [
        {
          '@@type': 'HexagonLayer',
          id: 'heatmap',
          data: [
            {lat: 0, lon: 0},
            {lat: 0, lon: 0},
            {lat: 0, lon: 0},
            {lat: 0, lon: 1},
            {lat: 0.1, lon: 1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.2, lon: 1.2},
            {lat: 0.2, lon: 1.2},
            {lat: 0.2, lon: 1.2},
            {lat: 0.2, lon: 1.2},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 0.1, lon: 0.1},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 0.1, lon: 0.1},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2}
          ],
          elevationRange: [0, 150],
          elevationScale: 1800,
          extruded: true,
          getPosition: '@@=[lon, lat]',
          radius: 10000,
          upperPercentile: 100,
          colorRange: [
            [1, 152, 189],
            [73, 227, 206],
            [216, 254, 181],
            [254, 237, 177],
            [254, 173, 84],
            [209, 55, 78]
          ]
        }
      ]
    },
    goldenImage: './test/render/golden-images/jupyter-widget-hexagon-layer-function-syntax.png'
  },
  {
    name: 'Failed HexagonLayer, Successful Heatmap',
    json: {
      description:
        'HexagonLayer without a function string should fail but HeatmapLayer should succeed',
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 6,
        pitch: 40.5,
        bearing: -27
      },
      views: [
        {
          '@@type': 'MapView',
          controller: true
        }
      ],
      layers: [
        {
          '@@type': 'HexagonLayer',
          id: 'failed-heatmap',
          data: [
            {lat: 0, lon: 0},
            {lat: 0, lon: 0},
            {lat: 0, lon: 0},
            {lat: 0, lon: 1},
            {lat: 0.1, lon: 1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.2, lon: 1.2},
            {lat: 0.2, lon: 1.2},
            {lat: 0.2, lon: 1.2},
            {lat: 0.2, lon: 1.2},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 0.1, lon: 0.1},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 0.1, lon: 0.1},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2}
          ],
          elevationRange: [0, 15],
          elevationScale: 1800,
          getPosition: '[lon, lat]',
          radius: 10000,
          upperPercentile: 100,
          colorRange: [
            [1, 152, 189],
            [73, 227, 206],
            [216, 254, 181],
            [254, 237, 177],
            [254, 173, 84],
            [209, 55, 78]
          ]
        },
        {
          '@@type': 'HeatmapLayer',
          id: 'successful-heatmap',
          data: [
            {lat: 0, lon: 0},
            {lat: 0, lon: 0},
            {lat: 0, lon: 0},
            {lat: 0, lon: 1},
            {lat: 0.1, lon: 1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 0.2, lon: 1.2},
            {lat: 0.2, lon: 1.2},
            {lat: 0.2, lon: 1.2},
            {lat: 0.2, lon: 1.2},
            {lat: 0.1, lon: 0.1},
            {lat: 0.1, lon: 0.1},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 0.1, lon: 0.1},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 0.1, lon: 0.1},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2},
            {lat: 1.2, lon: 1.2}
          ],
          getPosition: '@@=[lon, lat]',
          radiusPixels: 100,
          colorRange: [
            [1, 152, 189],
            [73, 227, 206],
            [216, 254, 181],
            [254, 237, 177],
            [254, 173, 84],
            [209, 55, 78]
          ]
        }
      ]
    },
    goldenImage: './test/render/golden-images/jupyter-widget-failed-function.png'
  },
  {
    name: 'CustomLayer',
    json: {
      description: 'Test of custom layer loading',
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 4
      },
      layers: [
        {
          '@@type': 'DemoCompositeLayer',
          data: [[0, 0], [2, 0], [0, 2], [2, 2], [3, 3], [4, 4]],
          getPosition: '@@=-',
          getLineColor: [0, 0, 0],
          getFillColor: [20, 160, 0, 180],
          getRadius: 1000000
        }
      ]
    },
    goldenImage: './test/render/golden-images/jupyter-widget-custom-layer.png'
  }
].filter(Boolean);

async function loadPage() {
  const iframe = document.createElement('iframe');
  iframe.width = WIDTH;
  iframe.height = HEIGHT;
  iframe.style.border = 'none';
  Object.assign(iframe.style, {
    position: 'fixed',
    top: 0,
    left: 0
  });
  document.body.appendChild(iframe);

  return new Promise(resolve => {
    iframe.onload = () => resolve(iframe);
    iframe.src = '/test/render/jupyter-widget-test.html';
  });
}

async function runTest(iframe, testCase) {
  return new Promise(resolve => {
    iframe.contentWindow.postMessage({
      json: testCase.json
    });

    window.onmessage = event => {
      if (event.data === 'done') {
        resolve();
      }
    };
  });
}

test('jupyter-widget Render Test', async t => {
  const iframe = await loadPage();

  for (const testCase of TEST_CASES) {
    t.comment(testCase.name);
    await runTest(iframe, testCase);

    const result = await window.browserTestDriver_captureAndDiffScreen({
      // uncomment to save screenshot to disk
      // saveOnFail: true,
      threshold: 0.99,
      ...testCase.imageDiffOptions,
      region: {
        x: 0,
        y: 0,
        width: WIDTH,
        height: HEIGHT
      },
      goldenImage: testCase.goldenImage
    });

    if (result.success) {
      t.pass(`match: ${result.matchPercentage}`);
    } else {
      t.fail(result.error || `match: ${result.matchPercentage}`);
    }
  }

  iframe.remove();

  t.end();
});
