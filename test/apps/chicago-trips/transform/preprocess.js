import fs from 'fs';
import {parseColumns, getLineObject} from './utils';

function processFile({inputFilePath, outputFilePath, toMap, prettify}) {
  const content = fs.readFileSync(inputFilePath, 'utf8');
  const lines = content.split('\n').filter(Boolean);

  const header = parseColumns(lines[0]);
  let result = [];

  for (let i = 1; i < lines.length; i++) {
    result.push(getLineObject(header, lines[i]));
  }

  if (toMap) {
    result = result.reduce((map, obj) => {
      const key = obj[header[0]];
      map[key] = obj;
      return map;
    }, {});
  }

  const json = prettify ? JSON.stringify(result, null, 2) : JSON.stringify(result);

  fs.writeFileSync(outputFilePath, json, 'utf8');
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
    toMap: true,
    prettify: true
  });

  const stopsInputFilePath = `${inputDir}/stops.txt`;
  const stopsOutputFilePath = `${outputDir}/stops.json`;

  processFile({
    inputFilePath: stopsInputFilePath,
    outputFilePath: stopsOutputFilePath,
    toMap: true,
    prettify: true
  });
}

module.exports = preprocess;
