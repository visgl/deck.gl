/* global window,document */
import test from 'tape-catch';

const WIDTH = 800;
const HEIGHT = 450;

const TEST_CASES = [
  {
    name: 'ScatterplotLayer',
    json: {
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 12
      },
      layers: [
        {
          '@@type': 'ScatterplotLayer',
          data: [[0, 0], [0.01, 0.01]],
          getPosition: '-',
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
          getColor: 'rgb',
          getPosition: 'position',
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
          getPosition: 'position',
          getTextAnchor: '"start"',
          fontFamily: 'Times, Times New Roman, Georgia, serif'
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
        zoom: 10
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
  }
];

test.only('jupyter-widget Render Test', t => {
  const iframe = document.createElement('iframe');
  iframe.width = WIDTH;
  iframe.height = HEIGHT;
  iframe.style.border = 'none';
  Object.assign(iframe.style, {
    position: 'absolute',
    top: 0,
    left: 0
  });

  let testIndex = 0;

  function runTest(testCase) {
    return new Promise(resolve => {
      t.comment(testCase.name);

      iframe.contentWindow.postMessage({
        json: testCase.json
      });

      window.onmessage = event => {
        if (event.data === 'done') {
          resolve();
        }
      };
    });
    // TODO can add a done POST here
  }

  function nextTest() {
    const testCase = TEST_CASES[testIndex++];

    if (!testCase) {
      iframe.remove();
      t.end();
      return;
    }

    const diffOptions = {
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
    };

    runTest(testCase)
      .then(() => window.browserTestDriver_captureAndDiffScreen(diffOptions))
      .then(result => {
        if (result.success) {
          t.pass(`match: ${result.matchPercentage}`);
        } else {
          t.fail(result.error || `match: ${result.matchPercentage}`);
        }
        nextTest();
      });
  }

  iframe.src = '/test/render/jupyter-widget-test.html';
  iframe.onload = nextTest;
  document.body.appendChild(iframe);
});
