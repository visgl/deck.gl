importScripts('./util.js');
let count = 0;
let dayIndex = 0;

onmessage = function (e) {
  const lines = e.data.text.split('\n');
  const SEC_PER_DAY = 60 * 60 * 24;

  for (const line of lines) {
    if (!line) {
      continue;
    }

    const timeOffset = dayIndex * SEC_PER_DAY;
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
        time1: time + timeOffset,
        time2: time2 + timeOffset,
        lon1,
        lat1,
        alt1,
        lon2,
        lat2,
        alt2
      });
    }

    count += flights.length;
    dayIndex++;
    postMessage({
      action: 'add',
      data: [{date, flights}],
      meta: {count}
    });
  }

  if (e.data.event === 'load') {
    postMessage({action: 'end'});
  }
};
