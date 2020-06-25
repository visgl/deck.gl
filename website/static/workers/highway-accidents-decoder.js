importScripts('./util.js');
let result = [];

const ID_PATTERN = /(\w\w)(I|US|SR)(.*)/;

onmessage = function(e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function(line) {
    if (!line) {
      return;
    }

    const parts = line.split('\x01');

    const match = parts[0].match(ID_PATTERN);
    const state = match[1];
    const type = match[2];
    const id = match[3];

    parts.slice(1).forEach(function(str) {

      const items = str.split('\t').map(x => decodeNumber(x, 90, 32));

      result.push({
        state,
        type,
        id,
        year: 1990 + items[0] * 5,
        incidents: items[1],
        fatalities: items[1] + (items[2] || 0)
      });
    });
  });

  if (e.data.event === 'load') {
    flush();
    postMessage({action: 'end'});
  }
};

function flush() {
  postMessage({
    action: 'add',
    data: result
  });
  result = [];
}
