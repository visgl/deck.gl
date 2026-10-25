// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import * as arrow from 'apache-arrow';

export type ArrowPolygonRowCountKind = '10k-stream' | '100k-stream';
export type ArrowPolygonSourceKind = 'polygon' | 'multipolygon' | 'tessellated' | 'dense-union';
export type ArrowPolygonColorKind = 'constant' | 'row-colors' | 'vertex-colors';

export type ArrowPolygonDataset = {
  rowCount: number;
  rowsPerChunk: number;
  label: string;
};

export type ArrowPolygonViewState = {
  startCenter: [number, number];
  endCenter: [number, number];
  scale: number;
  scrollDurationSeconds: number;
};

export type ArrowPolygonExampleData = {
  recordBatches: arrow.RecordBatch[];
  tessellated: boolean;
  rowCount: number;
  batchCount: number;
  label: string;
  viewState: ArrowPolygonViewState;
};

const COORDINATE_COMPONENTS = 2;
const COLOR_COMPONENTS = 4;
const STREAMING_BATCH_DELAY_MS = 650;
const GRID_COLUMN_COUNT = 16;
const GRID_WIDTH = 1.86;
const GRID_TOP = 0.88;
const GRID_CELL_ASPECT = 0.96;
const POLYGON_VIEW_SCALE = 1.42;
const POLYGON_SCROLL_START_CENTER_Y = 0;
const POLYGON_SCROLL_BOTTOM_PADDING = 0.82;
const POLYGON_SCROLL_SPEED = 0.64;
const GEOARROW_POLYGON_TYPE_ID = 3;
const GEOARROW_MULTIPOLYGON_TYPE_ID = 6;

type PolygonGridLayout = {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  left: number;
  top: number;
  bottom: number;
};

type PolygonRowsLayout = {
  coordinateCount: number;
  ringOffsets: Int32Array;
  rowOffsets: Int32Array;
  rowCoordinateStarts: Int32Array;
  rowCoordinateCounts: Int32Array;
};

type MultiPolygonRowsLayout = PolygonRowsLayout & {
  polygonOffsets: Int32Array;
};

type TessellatedRowsLayout = {
  coordinateCount: number;
  rowOffsets: Int32Array;
  rowCoordinateStarts: Int32Array;
  rowCoordinateCounts: Int32Array;
};

export const POLYGON_DATASETS: Record<ArrowPolygonRowCountKind, ArrowPolygonDataset> = {
  '10k-stream': {
    rowCount: 10_000,
    rowsPerChunk: 1000,
    label: '10K polygon rows, 10 batches'
  },
  '100k-stream': {
    rowCount: 100_000,
    rowsPerChunk: 5000,
    label: '100K polygon rows, 20 batches'
  }
};

export function makeArrowPolygonExampleData(
  rowCountKind: ArrowPolygonRowCountKind,
  sourceKind: ArrowPolygonSourceKind,
  colorKind: ArrowPolygonColorKind
): ArrowPolygonExampleData {
  const dataset = POLYGON_DATASETS[rowCountKind];
  const effectiveColorKind =
    sourceKind === 'dense-union' && colorKind === 'vertex-colors' ? 'row-colors' : colorKind;
  const polygonDataChunks: arrow.Data[] = [];
  const colorDataChunks: arrow.Data[] = [];

  forEachPolygonBatch(dataset, (rowIndices, batchIndex) => {
    polygonDataChunks.push(makePolygonDataChunk(sourceKind, rowIndices, dataset.rowCount));
    if (effectiveColorKind === 'row-colors') {
      colorDataChunks.push(makeRowColorDataChunk(rowIndices, batchIndex));
    }
    if (effectiveColorKind === 'vertex-colors') {
      colorDataChunks.push(makeVertexColorDataChunk(sourceKind, rowIndices, batchIndex));
    }
  });

  const polygons = new arrow.Vector(polygonDataChunks) as arrow.Vector<any>;
  const colors =
    colorDataChunks.length > 0 ? (new arrow.Vector(colorDataChunks) as arrow.Vector<any>) : null;
  const table = new arrow.Table({
    polygons,
    ...(colors ? {colors} : {})
  });
  const recordBatches = table.batches;

  return {
    recordBatches,
    tessellated: sourceKind === 'tessellated',
    rowCount: dataset.rowCount,
    batchCount: recordBatches.length,
    label: `${dataset.label} - ${getSourceLabel(sourceKind)}`,
    viewState: makePolygonViewState(dataset.rowCount)
  };
}

export async function* createStreamingPolygonRecordBatchIterator(
  recordBatches: arrow.RecordBatch[]
): AsyncGenerator<arrow.RecordBatch> {
  for (let batchIndex = 0; batchIndex < recordBatches.length; batchIndex++) {
    if (batchIndex > 0) {
      await waitForStreamingBatchDelay();
    }
    const recordBatch = recordBatches[batchIndex];
    if (recordBatch) {
      yield recordBatch;
    }
  }
}

function forEachPolygonBatch(
  dataset: ArrowPolygonDataset,
  visitor: (rowIndices: number[], batchIndex: number) => void
): void {
  const batchCount = Math.ceil(dataset.rowCount / dataset.rowsPerChunk);
  const layout = getGridLayout(dataset.rowCount);
  for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
    const rowIndices: number[] = [];
    for (let gridRowIndex = 0; gridRowIndex < layout.rows; gridRowIndex++) {
      if (gridRowIndex % batchCount !== batchIndex) {
        continue;
      }

      const rowStart = gridRowIndex * layout.columns;
      const rowEnd = Math.min(rowStart + layout.columns, dataset.rowCount);
      for (let rowIndex = rowStart; rowIndex < rowEnd; rowIndex++) {
        rowIndices.push(rowIndex);
      }
    }
    visitor(rowIndices, batchIndex);
  }
}

function makePolygonDataChunk(
  sourceKind: ArrowPolygonSourceKind,
  rowIndices: number[],
  totalRowCount: number
): arrow.Data {
  switch (sourceKind) {
    case 'polygon':
      return makePolygonRowsDataChunkForRowIndices(rowIndices, totalRowCount);
    case 'multipolygon':
      return makeMultiPolygonRowsDataChunkForRowIndices(rowIndices, totalRowCount);
    case 'tessellated':
      return makeTessellatedRowsDataChunk(rowIndices, totalRowCount);
    case 'dense-union':
      return makeDenseUnionGeometryDataChunk(rowIndices, totalRowCount);
  }
}

function makePolygonRowsDataChunkForRowIndices(
  rowIndices: number[],
  totalRowCount: number
): arrow.Data {
  const layout = makePolygonRowsLayout(rowIndices);
  const values = new Float32Array(layout.coordinateCount * COORDINATE_COMPONENTS);
  for (let localRowIndex = 0; localRowIndex < rowIndices.length; localRowIndex++) {
    writePolygonWithHole(
      values,
      layout.rowCoordinateStarts[localRowIndex],
      rowIndices[localRowIndex],
      totalRowCount
    );
  }

  const coordinateData = makeCoordinateData(values);
  const ringData = makeListData(coordinateData, layout.ringOffsets);
  return makeListData(ringData, layout.rowOffsets);
}

function makeMultiPolygonRowsDataChunkForRowIndices(
  rowIndices: number[],
  totalRowCount: number
): arrow.Data {
  const layout = makeMultiPolygonRowsLayout(rowIndices);
  const values = new Float32Array(layout.coordinateCount * COORDINATE_COMPONENTS);
  for (let localRowIndex = 0; localRowIndex < rowIndices.length; localRowIndex++) {
    writeMultiPolygon(
      values,
      layout.rowCoordinateStarts[localRowIndex],
      rowIndices[localRowIndex],
      totalRowCount
    );
  }

  const coordinateData = makeCoordinateData(values);
  const ringData = makeListData(coordinateData, layout.ringOffsets);
  const polygonData = makeListData(ringData, layout.polygonOffsets);
  return makeListData(polygonData, layout.rowOffsets);
}

function makeTessellatedRowsDataChunk(rowIndices: number[], totalRowCount: number): arrow.Data {
  const layout = makeTessellatedRowsLayout(rowIndices);
  const values = new Float32Array(layout.coordinateCount * COORDINATE_COMPONENTS);
  for (let localRowIndex = 0; localRowIndex < rowIndices.length; localRowIndex++) {
    writeTessellatedPolygon(
      values,
      layout.rowCoordinateStarts[localRowIndex],
      rowIndices[localRowIndex],
      totalRowCount
    );
  }

  return makeListData(makeCoordinateData(values), layout.rowOffsets);
}

function makeDenseUnionGeometryDataChunk(rowIndices: number[], totalRowCount: number): arrow.Data {
  const rowCount = rowIndices.length;
  const typeIds = new Int8Array(rowCount);
  const valueOffsets = new Int32Array(rowCount);
  const polygonRowIndices: number[] = [];
  const multiPolygonRowIndices: number[] = [];

  for (let localRowIndex = 0; localRowIndex < rowCount; localRowIndex++) {
    const rowIndex = rowIndices[localRowIndex];
    if (isDenseUnionMultiPolygonRow(rowIndex)) {
      typeIds[localRowIndex] = GEOARROW_MULTIPOLYGON_TYPE_ID;
      valueOffsets[localRowIndex] = multiPolygonRowIndices.length;
      multiPolygonRowIndices.push(rowIndex);
    } else {
      typeIds[localRowIndex] = GEOARROW_POLYGON_TYPE_ID;
      valueOffsets[localRowIndex] = polygonRowIndices.length;
      polygonRowIndices.push(rowIndex);
    }
  }

  const polygonData = makePolygonRowsDataChunkForRowIndices(polygonRowIndices, totalRowCount);
  const multiPolygonData = makeMultiPolygonRowsDataChunkForRowIndices(
    multiPolygonRowIndices,
    totalRowCount
  );
  const unionType = new arrow.DenseUnion(
    [GEOARROW_POLYGON_TYPE_ID, GEOARROW_MULTIPOLYGON_TYPE_ID],
    [
      new arrow.Field('Polygon', polygonData.type, true),
      new arrow.Field('MultiPolygon', multiPolygonData.type, true)
    ]
  );

  return arrow.makeData({
    type: unionType,
    length: rowCount,
    nullCount: 0,
    typeIds,
    valueOffsets,
    children: [polygonData, multiPolygonData]
  });
}

function makeRowColorDataChunk(rowIndices: number[], batchIndex: number): arrow.Data {
  const values = new Uint8Array(rowIndices.length * COLOR_COMPONENTS);
  for (let localRowIndex = 0; localRowIndex < rowIndices.length; localRowIndex++) {
    writePaletteColor(values, localRowIndex, rowIndices[localRowIndex], batchIndex, 255);
  }
  return makeColorData(values);
}

function makeVertexColorDataChunk(
  sourceKind: ArrowPolygonSourceKind,
  rowIndices: number[],
  batchIndex: number
): arrow.Data {
  switch (sourceKind) {
    case 'polygon': {
      const layout = makePolygonRowsLayout(rowIndices);
      const values = makeVertexColorValues(rowIndices, batchIndex, layout);
      const ringData = makeListData(makeColorData(values), layout.ringOffsets);
      return makeListData(ringData, layout.rowOffsets);
    }
    case 'multipolygon': {
      const layout = makeMultiPolygonRowsLayout(rowIndices);
      const values = makeVertexColorValues(rowIndices, batchIndex, layout);
      const ringData = makeListData(makeColorData(values), layout.ringOffsets);
      const polygonData = makeListData(ringData, layout.polygonOffsets);
      return makeListData(polygonData, layout.rowOffsets);
    }
    case 'tessellated': {
      const layout = makeTessellatedRowsLayout(rowIndices);
      const values = makeVertexColorValues(rowIndices, batchIndex, layout);
      return makeListData(makeColorData(values), layout.rowOffsets);
    }
    case 'dense-union':
      throw new Error('DenseUnion polygon example uses constant or per-row colors');
  }
}

function makeVertexColorValues(
  rowIndices: number[],
  batchIndex: number,
  layout: Pick<
    TessellatedRowsLayout,
    'coordinateCount' | 'rowCoordinateStarts' | 'rowCoordinateCounts'
  >
): Uint8Array {
  const values = new Uint8Array(layout.coordinateCount * COLOR_COMPONENTS);
  for (let localRowIndex = 0; localRowIndex < rowIndices.length; localRowIndex++) {
    const rowIndex = rowIndices[localRowIndex];
    const rowCoordinateStart = layout.rowCoordinateStarts[localRowIndex];
    const rowCoordinateCount = layout.rowCoordinateCounts[localRowIndex];
    for (let coordinateIndex = 0; coordinateIndex < rowCoordinateCount; coordinateIndex++) {
      writeVertexColor(
        values,
        rowCoordinateStart + coordinateIndex,
        rowIndex,
        batchIndex,
        coordinateIndex
      );
    }
  }
  return values;
}

function writePolygonWithHole(
  values: Float32Array,
  coordinateStart: number,
  rowIndex: number,
  totalRowCount: number
): void {
  const cell = getGridCell(rowIndex, totalRowCount);
  const outerVertexCount = getPolygonOuterVertexCount(rowIndex);
  const radius = cell.radius * 0.92;

  writeIrregularRing(values, coordinateStart, outerVertexCount, cell.x, cell.y, radius, rowIndex);
  if (!hasPolygonHole(rowIndex)) {
    return;
  }

  const holeVertexCount = getPolygonHoleVertexCount(rowIndex);
  const holeRadius = radius * (0.24 + getShapeVariant(rowIndex, 5) * 0.025);
  const holeOffsetX = getJitter(rowIndex, 71) * radius * 0.16;
  const holeOffsetY = getJitter(rowIndex, 83) * radius * 0.16;

  writeIrregularRing(
    values,
    coordinateStart + outerVertexCount,
    holeVertexCount,
    cell.x + holeOffsetX,
    cell.y + holeOffsetY,
    holeRadius,
    rowIndex + 11,
    true
  );
}

function writeMultiPolygon(
  values: Float32Array,
  coordinateStart: number,
  rowIndex: number,
  totalRowCount: number
): void {
  const cell = getGridCell(rowIndex, totalRowCount);
  const firstOuterVertexCount = getMultiPolygonFirstOuterVertexCount(rowIndex);
  const secondOuterVertexCount = getMultiPolygonSecondOuterVertexCount(rowIndex);
  const thirdOuterVertexCount = getMultiPolygonThirdOuterVertexCount(rowIndex);
  const radius = cell.radius * 0.34;
  const leftX = cell.x - radius * 1.74;
  const middleX = cell.x - radius * 0.06;
  const rightX = cell.x + radius * 1.5;
  const upperY = cell.y - radius * 0.38;
  const lowerY = cell.y + radius * 0.42;

  writeIrregularRing(
    values,
    coordinateStart,
    firstOuterVertexCount,
    leftX,
    cell.y,
    radius,
    rowIndex
  );

  let secondPolygonCoordinateStart = coordinateStart + firstOuterVertexCount;
  if (hasMultiPolygonHole(rowIndex)) {
    const firstHoleVertexCount = getMultiPolygonFirstHoleVertexCount(rowIndex);
    writeIrregularRing(
      values,
      secondPolygonCoordinateStart,
      firstHoleVertexCount,
      leftX + getJitter(rowIndex, 47) * radius * 0.12,
      cell.y + getJitter(rowIndex, 53) * radius * 0.12,
      radius * 0.3,
      rowIndex + 23,
      true
    );
    secondPolygonCoordinateStart += firstHoleVertexCount;
  }

  const thirdPolygonCoordinateStart = secondPolygonCoordinateStart + secondOuterVertexCount;
  writeIrregularRing(
    values,
    secondPolygonCoordinateStart,
    secondOuterVertexCount,
    middleX,
    upperY,
    radius * 0.96,
    rowIndex + 37
  );
  writeIrregularRing(
    values,
    thirdPolygonCoordinateStart,
    thirdOuterVertexCount,
    rightX,
    lowerY,
    radius * 0.88,
    rowIndex + 59
  );
}

function writeTessellatedPolygon(
  values: Float32Array,
  coordinateStart: number,
  rowIndex: number,
  totalRowCount: number
): void {
  const cell = getGridCell(rowIndex, totalRowCount);
  const sourceVertexCount = getTessellatedSourceVertexCount(rowIndex);
  const radius = cell.radius * 0.92;
  const points = makeIrregularRingPoints(cell.x, cell.y, radius, sourceVertexCount, rowIndex + 7);
  const anchor = points[0];
  let coordinateIndex = coordinateStart;

  for (let pointIndex = 1; pointIndex < points.length - 1; pointIndex++) {
    const point = points[pointIndex];
    const nextPoint = points[pointIndex + 1];
    writeCoordinate(values, coordinateIndex++, anchor[0], anchor[1]);
    writeCoordinate(values, coordinateIndex++, point[0], point[1]);
    writeCoordinate(values, coordinateIndex++, nextPoint[0], nextPoint[1]);
  }
}

function writeIrregularRing(
  values: Float32Array,
  coordinateStart: number,
  vertexCount: number,
  x: number,
  y: number,
  radius: number,
  rowIndex: number,
  clockwise = false
): void {
  const points = makeIrregularRingPoints(x, y, radius, vertexCount, rowIndex, clockwise);
  for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
    writeCoordinate(
      values,
      coordinateStart + pointIndex,
      points[pointIndex][0],
      points[pointIndex][1]
    );
  }
}

function makeIrregularRingPoints(
  x: number,
  y: number,
  radius: number,
  vertexCount: number,
  rowIndex: number,
  clockwise = false
): [number, number][] {
  const points: [number, number][] = [];
  const angleOffset = -Math.PI / 2 + getJitter(rowIndex, 97) * 0.54;
  const stretchX = 0.82 + getShapeVariant(rowIndex, 17) * 0.09;
  const stretchY = 0.78 + getShapeVariant(rowIndex, 23) * 0.1;
  const skew = getJitter(rowIndex, 31) * 0.14;
  const phaseA = getJitter(rowIndex, 101) * Math.PI * 2;
  const phaseB = getJitter(rowIndex, 113) * Math.PI * 2;
  const phaseC = getJitter(rowIndex, 127) * Math.PI * 2;
  const hasBay = radius >= 0.02 && rowIndex % 4 === 0;
  const bayAngle = Math.PI * 0.45 + getJitter(rowIndex, 139) * Math.PI;

  for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
    const orderedVertexIndex = clockwise ? vertexCount - vertexIndex : vertexIndex;
    const normalizedVertex = orderedVertexIndex / vertexCount;
    const angle = angleOffset + normalizedVertex * Math.PI * 2;
    const localAngle = normalizedVertex * Math.PI * 2;
    const coastlineNoise =
      Math.sin(localAngle * 2 + phaseA) * 0.1 +
      Math.cos(localAngle * 3 + phaseB) * 0.07 +
      Math.sin(localAngle * 5 + phaseC) * 0.035;
    const bayDistance = getAngularDistance(localAngle, bayAngle);
    const bayIndent = hasBay ? Math.exp(-(bayDistance * bayDistance) / 0.18) * 0.18 : 0;
    const headland =
      radius >= 0.02
        ? Math.exp(-(getAngularDistance(localAngle, bayAngle + Math.PI) ** 2) / 0.3) * 0.1
        : 0;
    const pointRadius = radius * clampNumber(1 + coastlineNoise - bayIndent + headland, 0.74, 1.18);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);

    points.push([
      x + pointRadius * (cosine * stretchX + sine * skew),
      y + pointRadius * sine * stretchY
    ]);
  }

  return points;
}

function writeCoordinate(
  values: Float32Array,
  coordinateIndex: number,
  x: number,
  y: number
): void {
  const valueOffset = coordinateIndex * COORDINATE_COMPONENTS;
  values[valueOffset] = x;
  values[valueOffset + 1] = y;
}

function writePaletteColor(
  values: Uint8Array,
  colorIndex: number,
  rowIndex: number,
  batchIndex: number,
  alpha: number
): void {
  const paletteColor = getPaletteColor(rowIndex, batchIndex);
  const valueOffset = colorIndex * COLOR_COMPONENTS;
  values[valueOffset] = paletteColor[0];
  values[valueOffset + 1] = paletteColor[1];
  values[valueOffset + 2] = paletteColor[2];
  values[valueOffset + 3] = alpha;
}

function writeVertexColor(
  values: Uint8Array,
  colorIndex: number,
  rowIndex: number,
  batchIndex: number,
  coordinateIndex: number
): void {
  const paletteColor = getPaletteColor(rowIndex, batchIndex);
  const redOffset = coordinateIndex % 2 === 0 ? 72 : -24;
  const greenOffset = coordinateIndex % 3 === 0 ? 8 : -16;
  const blueOffset = coordinateIndex % 2 === 0 ? 76 : 28;
  const valueOffset = colorIndex * COLOR_COMPONENTS;
  values[valueOffset] = clampColor(paletteColor[0] + redOffset);
  values[valueOffset + 1] = clampColor(paletteColor[1] + greenOffset);
  values[valueOffset + 2] = clampColor(paletteColor[2] + blueOffset);
  values[valueOffset + 3] = 255;
}

function getGridCell(
  rowIndex: number,
  totalRowCount: number
): {x: number; y: number; radius: number} {
  const layout = getGridLayout(totalRowCount);
  const columnIndex = rowIndex % layout.columns;
  const rowGridIndex = Math.floor(rowIndex / layout.columns);
  const jitterX = getJitter(rowIndex, 13) * layout.cellWidth * 0.14;
  const jitterY = getJitter(rowIndex, 29) * layout.cellHeight * 0.14;

  return {
    x: layout.left + (columnIndex + 0.5) * layout.cellWidth + jitterX,
    y: layout.top - (rowGridIndex + 0.5) * layout.cellHeight + jitterY,
    radius: Math.min(layout.cellWidth, layout.cellHeight) * 0.58
  };
}

function makePolygonViewState(totalRowCount: number): ArrowPolygonViewState {
  const layout = getGridLayout(totalRowCount);
  const endCenterY = Math.min(
    POLYGON_SCROLL_START_CENTER_Y,
    layout.bottom + POLYGON_SCROLL_BOTTOM_PADDING
  );
  const scrollDistance = Math.abs(POLYGON_SCROLL_START_CENTER_Y - endCenterY);
  return {
    startCenter: [0, POLYGON_SCROLL_START_CENTER_Y],
    endCenter: [0, endCenterY],
    scale: POLYGON_VIEW_SCALE,
    scrollDurationSeconds: Math.max(14, scrollDistance / POLYGON_SCROLL_SPEED)
  };
}

function getGridLayout(totalRowCount: number): PolygonGridLayout {
  const columns = GRID_COLUMN_COUNT;
  const rows = Math.ceil(totalRowCount / columns);
  const cellWidth = GRID_WIDTH / columns;
  const cellHeight = cellWidth * GRID_CELL_ASPECT;
  const top = GRID_TOP;
  return {
    columns,
    rows,
    cellWidth,
    cellHeight,
    left: -GRID_WIDTH / 2,
    top,
    bottom: top - rows * cellHeight
  };
}

function getShapeVariant(rowIndex: number, salt: number): number {
  return Math.floor((getJitter(rowIndex, salt) + 0.5) * 4);
}

function getJitter(rowIndex: number, salt: number): number {
  const value = Math.sin((rowIndex + 1) * (salt + 37) * 12.9898) * 43758.5453;
  return value - Math.floor(value) - 0.5;
}

function makeCoordinateData(values: Float32Array): arrow.Data<arrow.FixedSizeList<arrow.Float32>> {
  return makeFixedSizeListData(new arrow.Float32(), COORDINATE_COMPONENTS, values);
}

function makeColorData(values: Uint8Array): arrow.Data<arrow.FixedSizeList<arrow.Uint8>> {
  return makeFixedSizeListData(new arrow.Uint8(), COLOR_COMPONENTS, values);
}

function makeFixedSizeListData<T extends arrow.DataType>(
  childType: T,
  listSize: number,
  values: T['TArray']
): arrow.Data<arrow.FixedSizeList<T>> {
  const childData = new arrow.Data(childType, 0, values.length, 0, {
    [arrow.BufferType.DATA]: values
  });
  const listType = new arrow.FixedSizeList(listSize, new arrow.Field('values', childType, false));
  return new arrow.Data(listType, 0, values.length / listSize, 0, {}, [childData]);
}

function makeListData<T extends arrow.DataType>(
  childData: arrow.Data<T>,
  offsets: Int32Array
): arrow.Data<arrow.List<T>> {
  const listType = new arrow.List(new arrow.Field('values', childData.type, false));
  return new arrow.Data(listType, 0, offsets.length - 1, 0, {[arrow.BufferType.OFFSET]: offsets}, [
    childData
  ]);
}

function makePolygonRowsLayout(rowIndices: number[]): PolygonRowsLayout {
  const rowCount = rowIndices.length;
  const ringOffsets = new Int32Array(getPolygonRingCount(rowIndices) + 1);
  const rowOffsets = new Int32Array(rowCount + 1);
  const rowCoordinateStarts = new Int32Array(rowCount);
  const rowCoordinateCounts = new Int32Array(rowCount);
  let coordinateOffset = 0;
  let ringOffset = 0;

  for (let localRowIndex = 0; localRowIndex < rowCount; localRowIndex++) {
    const rowIndex = rowIndices[localRowIndex];
    const outerVertexCount = getPolygonOuterVertexCount(rowIndex);
    const holeVertexCount = hasPolygonHole(rowIndex) ? getPolygonHoleVertexCount(rowIndex) : 0;
    rowOffsets[localRowIndex] = ringOffset;
    rowCoordinateStarts[localRowIndex] = coordinateOffset;
    rowCoordinateCounts[localRowIndex] = outerVertexCount + holeVertexCount;
    ringOffsets[ringOffset++] = coordinateOffset;
    coordinateOffset += outerVertexCount;
    if (holeVertexCount > 0) {
      ringOffsets[ringOffset++] = coordinateOffset;
      coordinateOffset += holeVertexCount;
    }
  }
  rowOffsets[rowCount] = ringOffset;
  ringOffsets[ringOffset] = coordinateOffset;

  return {
    coordinateCount: coordinateOffset,
    ringOffsets,
    rowOffsets,
    rowCoordinateStarts,
    rowCoordinateCounts
  };
}

function makeMultiPolygonRowsLayout(rowIndices: number[]): MultiPolygonRowsLayout {
  const rowCount = rowIndices.length;
  const ringOffsets = new Int32Array(getMultiPolygonRingCount(rowIndices) + 1);
  const polygonOffsets = new Int32Array(rowCount * 3 + 1);
  const rowOffsets = new Int32Array(rowCount + 1);
  const rowCoordinateStarts = new Int32Array(rowCount);
  const rowCoordinateCounts = new Int32Array(rowCount);
  let coordinateOffset = 0;
  let ringOffset = 0;

  for (let localRowIndex = 0; localRowIndex < rowCount; localRowIndex++) {
    const rowIndex = rowIndices[localRowIndex];
    const firstOuterVertexCount = getMultiPolygonFirstOuterVertexCount(rowIndex);
    const firstHoleVertexCount = hasMultiPolygonHole(rowIndex)
      ? getMultiPolygonFirstHoleVertexCount(rowIndex)
      : 0;
    const secondOuterVertexCount = getMultiPolygonSecondOuterVertexCount(rowIndex);
    const thirdOuterVertexCount = getMultiPolygonThirdOuterVertexCount(rowIndex);
    rowOffsets[localRowIndex] = localRowIndex * 3;
    polygonOffsets[localRowIndex * 3] = ringOffset;
    rowCoordinateStarts[localRowIndex] = coordinateOffset;
    rowCoordinateCounts[localRowIndex] =
      firstOuterVertexCount + firstHoleVertexCount + secondOuterVertexCount + thirdOuterVertexCount;
    ringOffsets[ringOffset++] = coordinateOffset;
    coordinateOffset += firstOuterVertexCount;
    if (firstHoleVertexCount > 0) {
      ringOffsets[ringOffset++] = coordinateOffset;
      coordinateOffset += firstHoleVertexCount;
    }
    polygonOffsets[localRowIndex * 3 + 1] = ringOffset;
    ringOffsets[ringOffset++] = coordinateOffset;
    coordinateOffset += secondOuterVertexCount;
    polygonOffsets[localRowIndex * 3 + 2] = ringOffset;
    ringOffsets[ringOffset++] = coordinateOffset;
    coordinateOffset += thirdOuterVertexCount;
    polygonOffsets[localRowIndex * 3 + 3] = ringOffset;
  }
  rowOffsets[rowCount] = rowCount * 3;
  ringOffsets[ringOffset] = coordinateOffset;

  return {
    coordinateCount: coordinateOffset,
    ringOffsets,
    polygonOffsets,
    rowOffsets,
    rowCoordinateStarts,
    rowCoordinateCounts
  };
}

function makeTessellatedRowsLayout(rowIndices: number[]): TessellatedRowsLayout {
  const rowCount = rowIndices.length;
  const rowOffsets = new Int32Array(rowCount + 1);
  const rowCoordinateStarts = new Int32Array(rowCount);
  const rowCoordinateCounts = new Int32Array(rowCount);
  let coordinateOffset = 0;

  for (let localRowIndex = 0; localRowIndex < rowCount; localRowIndex++) {
    const rowIndex = rowIndices[localRowIndex];
    const coordinateCount = getTessellatedCoordinateCount(rowIndex);
    rowOffsets[localRowIndex] = coordinateOffset;
    rowCoordinateStarts[localRowIndex] = coordinateOffset;
    rowCoordinateCounts[localRowIndex] = coordinateCount;
    coordinateOffset += coordinateCount;
    rowOffsets[localRowIndex + 1] = coordinateOffset;
  }

  return {
    coordinateCount: coordinateOffset,
    rowOffsets,
    rowCoordinateStarts,
    rowCoordinateCounts
  };
}

function getPolygonOuterVertexCount(rowIndex: number): number {
  return 10 + (rowIndex % 6);
}

function getPolygonHoleVertexCount(rowIndex: number): number {
  return 5 + (rowIndex % 3);
}

function hasPolygonHole(rowIndex: number): boolean {
  return rowIndex % 5 === 0 || rowIndex % 11 === 3;
}

function getMultiPolygonFirstOuterVertexCount(rowIndex: number): number {
  return 10 + ((rowIndex + 2) % 6);
}

function getMultiPolygonFirstHoleVertexCount(rowIndex: number): number {
  return 5 + (rowIndex % 2);
}

function hasMultiPolygonHole(rowIndex: number): boolean {
  return rowIndex % 4 === 0;
}

function getMultiPolygonSecondOuterVertexCount(rowIndex: number): number {
  return 10 + ((rowIndex + 1) % 5);
}

function getMultiPolygonThirdOuterVertexCount(rowIndex: number): number {
  return 10 + ((rowIndex + 3) % 5);
}

function getTessellatedSourceVertexCount(rowIndex: number): number {
  return 10 + ((rowIndex + 4) % 6);
}

function getTessellatedCoordinateCount(rowIndex: number): number {
  return (getTessellatedSourceVertexCount(rowIndex) - 2) * 3;
}

function getPolygonRingCount(rowIndices: number[]): number {
  let ringCount = 0;
  for (const rowIndex of rowIndices) {
    ringCount += hasPolygonHole(rowIndex) ? 2 : 1;
  }
  return ringCount;
}

function getMultiPolygonRingCount(rowIndices: number[]): number {
  let ringCount = 0;
  for (const rowIndex of rowIndices) {
    ringCount += hasMultiPolygonHole(rowIndex) ? 4 : 3;
  }
  return ringCount;
}

function isDenseUnionMultiPolygonRow(rowIndex: number): boolean {
  return rowIndex % 5 === 1 || rowIndex % 13 === 8;
}

function getSourceLabel(sourceKind: ArrowPolygonSourceKind): string {
  switch (sourceKind) {
    case 'polygon':
      return 'polygon rows with optional holes';
    case 'multipolygon':
      return 'multipolygon rows';
    case 'tessellated':
      return 'pre-tessellated triangle rows';
    case 'dense-union':
      return 'geoarrow.geometry DenseUnion Polygon and MultiPolygon rows';
  }
}

function getPaletteColor(rowIndex: number, batchIndex: number): [number, number, number] {
  const baseColor = getBatchBaseColor(batchIndex);
  const redJitter = getJitter(rowIndex, 191) * 24;
  const greenJitter = getJitter(rowIndex, 193) * 8;
  const blueJitter = getJitter(rowIndex, 197) * 24;
  const stripe = (Math.floor(rowIndex / GRID_COLUMN_COUNT) % 3) - 1;
  return [
    clampColor(baseColor[0] + redJitter + stripe * 12),
    clampColor(baseColor[1] + greenJitter),
    clampColor(baseColor[2] + blueJitter - stripe * 10)
  ];
}

function getBatchBaseColor(batchIndex: number): [number, number, number] {
  const batchColors: [number, number, number][] = [
    [0, 72, 255],
    [255, 20, 54],
    [130, 0, 255],
    [0, 20, 190],
    [255, 0, 180],
    [190, 0, 64],
    [64, 0, 255],
    [255, 54, 112],
    [0, 104, 255],
    [210, 0, 255],
    [255, 0, 36],
    [44, 0, 204],
    [0, 36, 255],
    [230, 0, 120],
    [154, 52, 255],
    [255, 70, 70],
    [20, 0, 255],
    [180, 0, 230],
    [255, 0, 88],
    [80, 24, 255]
  ];
  return batchColors[batchIndex % batchColors.length];
}

function clampColor(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getAngularDistance(angle: number, targetAngle: number): number {
  return Math.atan2(Math.sin(angle - targetAngle), Math.cos(angle - targetAngle));
}

function waitForStreamingBatchDelay(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, STREAMING_BATCH_DELAY_MS);
  });
}
