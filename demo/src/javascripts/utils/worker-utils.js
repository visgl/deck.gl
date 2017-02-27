/* global Worker */

const workers = {};

export function StreamParser(workerUrl, callback) {
  let parsedLength = 0;

  if (workers[workerUrl]) {
    workers[workerUrl].terminate();
  }

  const workerInstance = new Worker(workerUrl);
  workers[workerUrl] = workerInstance;
  let streamedData = [];

  workerInstance.onmessage = e => {
    const {action, data, meta} = e.data;
    if (action === 'end') {
      workerInstance.terminate();
    } else if (action === 'add' && data && data.length) {
      streamedData = streamedData.concat(data);
      callback(streamedData, meta); // eslint-disable-line callback-return
    }
  };

  this.onProgress = e => {
    const {responseText} = e.target;
    const lineBreak = responseText.lastIndexOf('\n') + 1;

    workerInstance.postMessage({
      event: 'progress',
      text: responseText.slice(parsedLength, lineBreak)
    });

    parsedLength = lineBreak;
  };

  this.onLoad = target => {
    const {responseText} = target;
    workerInstance.postMessage({
      event: 'load',
      text: responseText.slice(parsedLength)
    });
  };
}
