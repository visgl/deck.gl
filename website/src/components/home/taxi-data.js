// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export const tripLoopLength = 1800;
export const tripTrailLength = 120;
export const tripDataPath = 'data/home/trips-data-s.txt';
export const buildingDataPath = 'data/home/building-data-s.txt';

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
