importScripts('./util.js');

onmessage = function(e) {

  const lines = e.data.text.split('\n');
  let result = [];

  lines.forEach(function(line) {
    if (!line) {
      return;
    }
    const pts = decodePolyline(line);
    result = result.concat(pts);
  });

  postMessage({
    action: 'add',
    data: result,
    meta: {count: result.length}
  });
};
