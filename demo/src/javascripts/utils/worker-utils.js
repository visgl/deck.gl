const workers = {};

export function StreamParser(workerUrl, callback) {
  var parsedLength = 0;

  if (workers[workerUrl]) {
    workers[workerUrl].terminate();
  }

  const workerInstance = new Worker(workerUrl);
  workers[workerUrl] = workerInstance;
  let streamedData = [];

  workerInstance.onmessage = e => {
    const {action, data, meta} = e.data;
    switch(action) {
    case 'add':
      if (data && data.length) {
        streamedData = streamedData.concat(data);
        callback(streamedData, meta);
      }
      break;
    case 'end':
      workerInstance.terminate();
      break;
    }
  };

  this.onProgress = function(e) {
    const {responseText} = e.target;
    const lineBreak = responseText.lastIndexOf('\n') + 1;

    workerInstance.postMessage({
      event: 'progress',
      text: responseText.slice(parsedLength, lineBreak)
    });
    parsedLength = lineBreak;
  };

  this.onLoad = function(target) {
    const {responseText} = target;
    workerInstance.postMessage({
      event: 'load',
      text: responseText.slice(parsedLength)
    });
  };
}
