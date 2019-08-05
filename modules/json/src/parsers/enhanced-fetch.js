import {csvParseRows} from 'd3-dsv';

export default function enhancedFetch(url) {
  /* global fetch */
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      try {
        return JSON.parse(text);
      } catch (error) {
        return parseCSV(text);
      }
    });
}

function parseCSV(text) {
  const csv = csvParseRows(text);

  // Remove header
  if (csv.length > 0) {
    csv.shift();
  }

  for (const row of csv) {
    for (const key in row) {
      const number = parseFloat(row[key]);
      if (!Number.isNaN(number)) {
        row[key] = number;
      }
    }
  }

  return csv;
}
