importScripts('./util.js');
let result = [];
let count = 0;

onmessage = function(e) {
  const lines = e.data.text.split('\n');

  for (const line of lines) {
    if (!line) {
      return;
    }

    const date = line.slice(0, 10);
    const flights = [];
    let i = 10;
    let time = 0;
    while (i < line.length) {
      time += decodeNumber(line.slice(i, (i += 1)), 90, 32);
      const time2 = decodeNumber(line.slice(i, (i += 3)), 90, 32);
      const lon1 = decodeNumber(line.slice(i, (i += 3)), 90, 32) / 1e3 - 180;
      const lat1 = decodeNumber(line.slice(i, (i += 3)), 90, 32) / 1e3 - 90;
      const alt1 = decodeNumber(line.slice(i, (i += 1)), 90, 32) * 100;
      const lon2 = decodeNumber(line.slice(i, (i += 3)), 90, 32) / 1e3 - 180;
      const lat2 = decodeNumber(line.slice(i, (i += 3)), 90, 32) / 1e3 - 90;
      const alt2 = decodeNumber(line.slice(i, (i += 1)), 90, 32) * 100;

      flights.push({
        time1: time,
        time2,
        lon1, lat1, alt1,
        lon2, lat2, alt2
      });
    }

    count += flights.length;
    result.push({date, flights});
  }

  if (e.data.event === 'load') {
    flush();
    postMessage({action: 'end'});
  }
};

function flush() {
  postMessage({
    action: 'add',
    data: result,
    meta: {count}
  });
  result = [];
}
