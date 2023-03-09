importScripts('./util.js');

const result = [];

onmessage = function (e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }
    const parts = line.split('\x01');
    const hex = parts[0];
    for (let i = 1; i < parts.length; i += 3) {
      const lng = decodeNumber(parts[i], 90, 32) / 1e5 - 180;
      const lat = decodeNumber(parts[i + 1], 90, 32) / 1e5;
      const count = decodeNumber(parts[i + 2], 90, 32);
      result.push({hex, home_lng: lng, home_lat: lat, count});
    }
  });

  if (e.data.event === 'load') {
    postMessage({
      action: 'add',
      data: result,
      meta: {
        count: result.length
      }
    });
    postMessage({action: 'end'});
  }
};
