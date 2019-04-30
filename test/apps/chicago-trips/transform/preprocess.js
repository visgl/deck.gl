import fs from 'fs';
import {parseColumns, getLineObject} from './utils';

function processFile({inputFilePath, outputFilePath, valueFunc, prettify, sort}) {
  const content = fs.readFileSync(inputFilePath, 'utf8');
  const lines = content.split('\n').filter(Boolean);

  const header = parseColumns(lines[0]);
  let result = [];

  for (let i = 1; i < lines.length; i++) {
    result.push(getLineObject(header, lines[i]));
  }

  result = result.reduce((map, obj) => {
    const key = obj[header[0]];
    map[key] = typeof valueFunc === 'function' ? valueFunc(key, obj, map) : obj;
    return map;
  }, {});

  if (sort) {
    sortMapArray(result, sort);
  }

  const json = prettify ? JSON.stringify(result, null, 2) : JSON.stringify(result);

  fs.writeFileSync(outputFilePath, json, 'utf8');
}

function sortMapArray(map, compare) {
  Object.keys(map).forEach(k => {
    if (typeof compare === 'function') {
      map[k].sort(compare);
    } else {
      map[k].sort((o1, o2) => o1[compare] - o2[compare]);
    }
  });
}

function preprocess({enablePreprocess, inputDir, outputDir}) {
  if (!enablePreprocess) {
    return;
  }

  const routesInputFilePath = `${inputDir}/routes.txt`;
  const routesOutputFilePath = `${outputDir}/routes.json`;

  processFile({
    inputFilePath: routesInputFilePath,
    outputFilePath: routesOutputFilePath,
    prettify: true
  });

  const stopsInputFilePath = `${inputDir}/stops.txt`;
  const stopsOutputFilePath = `${outputDir}/stops.json`;

  processFile({
    inputFilePath: stopsInputFilePath,
    outputFilePath: stopsOutputFilePath,
    prettify: true
  });

  const shapesInputFilePath = `${inputDir}/shapes.txt`;
  const shapesOutputFilePath = `${outputDir}/shapes.json`;

  processFile({
    inputFilePath: shapesInputFilePath,
    outputFilePath: shapesOutputFilePath,
    valueFunc: (key, obj, map) => {
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(obj);
      return map[key];
    },
    sort: 'shape_dist_traveled',
    prettify: false
  });
}

module.exports = preprocess;
