// luma.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as arrow from 'apache-arrow';

type GraticulesArrowColumns = {
  paths: arrow.List<arrow.FixedSizeList<arrow.Float64>>;
};

export type GraticulesArrowTable = arrow.Table<GraticulesArrowColumns>;

/**
 * Generate an arrow table of graticule lines covering the whole world
 * @param interval - spacing of lines, in degrees
 * @param resolution - spacing of sample points on the line, in degrees
 * @returns Arrow table with one path row per graticule line
 */
export function generateGraticules(interval: number, resolution: number): GraticulesArrowTable {
  const halfLongitudeLineCount = Math.floor(180 / interval);
  const halfLatitudeLineCount = Math.floor(90 / interval);
  const halfLongitudePointCount = Math.floor(180 / resolution);
  const halfLatitudePointCount = Math.floor(90 / resolution);
  const lineCount = halfLongitudeLineCount * 2 + 1 + (halfLatitudeLineCount * 2 + 1);
  const pointCount =
    (halfLongitudeLineCount * 2 + 1) * (halfLatitudePointCount * 2 + 1) +
    (halfLatitudeLineCount * 2 + 1) * (halfLongitudePointCount * 2 + 1);

  const coordinateValues = new Float64Array(pointCount * 2);
  const pathOffsets = new Int32Array(lineCount + 1);
  let lineIndex = 0;
  let pointIndex = 0;

  // vertical lines
  for (
    let longitudeLineIndex = -halfLongitudeLineCount;
    longitudeLineIndex <= halfLongitudeLineCount;
    longitudeLineIndex++
  ) {
    pathOffsets[lineIndex++] = pointIndex;
    const longitude = longitudeLineIndex * interval;
    for (
      let latitudePointIndex = -halfLatitudePointCount;
      latitudePointIndex <= halfLatitudePointCount;
      latitudePointIndex++
    ) {
      const latitude = latitudePointIndex * resolution;
      const coordinateValueIndex = pointIndex++ * 2;
      coordinateValues[coordinateValueIndex] = longitude;
      coordinateValues[coordinateValueIndex + 1] = latitude;
    }
  }
  // horizontal lines
  for (
    let latitudeLineIndex = -halfLatitudeLineCount;
    latitudeLineIndex <= halfLatitudeLineCount;
    latitudeLineIndex++
  ) {
    pathOffsets[lineIndex++] = pointIndex;
    const latitude = latitudeLineIndex * interval;
    for (
      let longitudePointIndex = -halfLongitudePointCount;
      longitudePointIndex <= halfLongitudePointCount;
      longitudePointIndex++
    ) {
      const longitude = longitudePointIndex * resolution;
      const coordinateValueIndex = pointIndex++ * 2;
      coordinateValues[coordinateValueIndex] = longitude;
      coordinateValues[coordinateValueIndex + 1] = latitude;
    }
  }
  pathOffsets[lineIndex] = pointIndex;

  const coordinateType = new arrow.FixedSizeList(
    2,
    new arrow.Field('values', new arrow.Float64(), false)
  );
  const pathsType = new arrow.List(
    new arrow.Field('coordinates', coordinateType, false)
  ) as GraticulesArrowColumns['paths'];
  const coordinateValueData = new arrow.Data<arrow.Float64>(
    new arrow.Float64(),
    0,
    coordinateValues.length,
    0,
    {
      [arrow.BufferType.DATA]: coordinateValues
    }
  );
  const coordinateData = new arrow.Data<arrow.FixedSizeList<arrow.Float64>>(
    coordinateType,
    0,
    pointCount,
    0,
    {},
    [coordinateValueData]
  );
  const pathsData = new arrow.Data<GraticulesArrowColumns['paths']>(
    pathsType,
    0,
    lineCount,
    0,
    {[arrow.BufferType.OFFSET]: pathOffsets},
    [coordinateData]
  );
  const paths = new arrow.Vector<GraticulesArrowColumns['paths']>([pathsData]);

  return new arrow.Table<GraticulesArrowColumns>({paths});
}
