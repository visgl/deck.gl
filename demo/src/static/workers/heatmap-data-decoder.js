importScripts('./util.js');
let total = 0;

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

  total += result.length;

  postMessage({
    action: 'add',
    data: result,
    meta: {count: total}
  });
};
