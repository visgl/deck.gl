// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/** Length of the loop in trip timestamp units. */
export const tripLoopLength = 1800;
/** Visible duration of a trail in trip timestamp units. */
export const tripTrailLength = 120;
/** Trip fixture path relative to the website base URL. */
export const tripDataPath = 'data/home/trips-data-s.txt';
/** Building fixture path relative to the website base URL. */
export const buildingDataPath = 'data/home/building-data-s.txt';

/** Fetches a fixture and collects its decoded records from a short-lived worker. */
function loadData(dataUrl, workerUrl, signal) {
  signal.throwIfAborted();

  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl);
    let result = [];

    function finish() {
      worker.terminate();
      signal.removeEventListener('abort', abort);
    }

    function fail(error) {
      finish();
      reject(error);
    }

    function abort() {
      fail(signal.reason);
    }

    worker.onmessage = ({data: {action, data}}) => {
      if (action === 'add') {
        result = result.concat(data);
      } else if (action === 'end') {
        finish();
        resolve(result);
      }
    };
    worker.onerror = () => fail(new Error(`Could not decode ${dataUrl}`));
    signal.addEventListener('abort', abort, {once: true});

    fetch(dataUrl, {signal})
      .then(response => {
        if (!response.ok) {
          throw new Error(`Could not load ${dataUrl} (${response.status})`);
        }
        return response.text();
      })
      .then(text => {
        signal.throwIfAborted();
        worker.postMessage({event: 'load', text});
      })
      .catch(fail);
  });
}

/** Loads the decoded trips and building footprints in parallel. */
export function loadTaxiData(baseUrl, signal) {
  return Promise.all([
    loadData(
      `${baseUrl}${tripDataPath}`,
      `${baseUrl}workers/trips-data-decoder.js?loop=${tripLoopLength}&trail=${tripTrailLength}`,
      signal
    ),
    loadData(`${baseUrl}${buildingDataPath}`, `${baseUrl}workers/building-data-decoder.js`, signal)
  ]);
}
