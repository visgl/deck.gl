importScripts('./util.js');

const flights = [];
onmessage = function (e) {
  const lines = e.data.text.split('\n');

  let time = 0;
  for (const line of lines) {
    if (!line) {
      continue;
    }

    let i = 0;
    time += decodeNumber(line.slice(i, (i += 1)), 90, 32);
    const time2 = decodeNumber(line.slice(i, (i += 3)), 90, 32);
    const lon1 = decodeNumber(line.slice(i, (i += 3)), 90, 32) / 1e3 - 180;
    const lat1 = decodeNumber(line.slice(i, (i += 3)), 90, 32) / 1e3 - 90;
    const lon2 = decodeNumber(line.slice(i, (i += 3)), 90, 32) / 1e3 - 180;
    const lat2 = decodeNumber(line.slice(i, (i += 3)), 90, 32) / 1e3 - 90;

    flights.push({
      time1: time,
      time2,
      lon1,
      lat1,
      lon2,
      lat2
    });
  }

  if (e.data.event === 'load') {
    postMessage({
      action: 'add',
      data: flights,
      meta: {count: flights.length}
    });
    postMessage({action: 'end'});
  }
};
