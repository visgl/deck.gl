/* global window,document */
import test from 'tape-catch';

const WIDTH = 800;
const HEIGHT = 450;

const TEST_CASES = [
  {
    name: 'ScatterplotLayer',
    json: {
      longitude: 0,
      latitude: 0,
      zoom: 12,
      layers: [
        {
          type: 'ScatterplotLayer',
          data: [[0, 0], [0.01, 0.01]],
          getPosition: '-',
          getRadius: 500,
          getFillColor: [255, 0, 0]
        }
      ]
    },
    goldenImage: './test/render/golden-images/jupyter-widget-scatterplot.png'
  }
];

test('jupyter-widget Render Test', t => {
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
