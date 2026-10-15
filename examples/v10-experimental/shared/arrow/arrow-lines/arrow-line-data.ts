// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {getArrowVectorByteLength, makeArrowFixedSizeListVector} from '@luma.gl/arrow';
import * as arrow from 'apache-arrow';
import type {
  ArrowLineRendererModel,
  ArrowLineRendererMode,
  ArrowLineRendererSourceData,
  ArrowLineRendererTimeColumn,
  ArrowLineSourceCoordinateType,
  ArrowLineSourceTimestampType
} from './arrow-line-renderer';

export const TEMPORAL_EPOCH_MILLISECONDS = 1_700_000_000_000n;
export const TEMPORAL_MILLISECONDS_PER_MEASURE_UNIT = 1000;
export const MEASURE_SWEEP_DURATION = 1.48;
export const TEMPORAL_TRAIL_LENGTH_MILLISECONDS = 220;
export const STREAMING_PATH_BATCH_COUNT = 10;
export const STREAMING_PATH_BATCH_INTERVAL_MS = 1000;
export const STREAMING_PATH_ROWS_PER_CHUNK = 240;
const GEOARROW_LINESTRING_XYM_TYPE_ID = 12;
const GEOARROW_LINESTRING_XYZM_TYPE_ID = 13;
const GEOARROW_MULTILINESTRING_XYM_TYPE_ID = 15;
const GEOARROW_POLYGON_TYPE_ID = 3;
const GEOARROW_MULTIPOLYGON_TYPE_ID = 6;
const POLYGON_GRID_COLUMN_COUNT = 24;

type ArrowLineVertexColorType = arrow.List<arrow.FixedSizeList<arrow.Uint8>>;
export type ArrowLineBaseRowCountKind = '240' | '960' | '2400';
export type ArrowLineRowCountKind = '240-stream' | '2400-stream';
export type ArrowLineMode = ArrowLineRendererMode;
export type ArrowLineCoordinateKind = 'float32' | 'float64' | 'dense-union';
export type ArrowLineColorKind = 'none' | 'row-colors' | 'vertex-colors';
export type ArrowLineTimeKind = ArrowLineRendererTimeColumn;
export type ArrowLineCapKind = 'square' | 'round';
export type ArrowLineJointKind = 'miter' | 'round';
export type ArrowLineDataset = {
  pathCount: number;
  pointCount: number;
  label: string;
};

export const PATH_DATASETS: Record<ArrowLineBaseRowCountKind, ArrowLineDataset> = {
  '240': {
    pathCount: 240,
    pointCount: 18,
    label: '240 paths, 4.1K segments'
  },
  '960': {
    pathCount: 960,
    pointCount: 22,
    label: '960 paths, 20K segments'
  },
  '2400': {
    pathCount: 2400,
    pointCount: 26,
    label: '2.4K paths, 60K segments'
  }
};

export function getValidPathModelKindForTimeKind(
  modelKind: ArrowLineRendererModel,
  timeKind: ArrowLineTimeKind
): ArrowLineRendererModel {
  if (timeKind === 'timestamps') {
    return modelKind === 'auto' ? 'auto' : 'trips';
  }
  return modelKind === 'trips' ? 'auto' : modelKind;
}

export function makeArrowLineSourceData(
  dataset: ArrowLineDataset,
  mode: ArrowLineMode,
  coordinateKind: ArrowLineCoordinateKind,
  colorKind: ArrowLineColorKind,
  timeKind: ArrowLineTimeKind,
  rowsPerChunk: number | null = null
): ArrowLineRendererSourceData {
  const buildStartTime = getNow();
  const effectiveCoordinateKind = mode === 'polygons' ? 'dense-union' : coordinateKind;
  const effectiveColorKind = mode === 'polygons' && colorKind !== 'none' ? 'row-colors' : colorKind;
  const effectiveTimeKind = mode === 'polygons' ? 'none' : timeKind;
  const includeSplitDenseUnionRows =
    mode === 'polygons' ||
    (effectiveColorKind !== 'vertex-colors' && effectiveTimeKind !== 'timestamps');
  const paths = makePathVector(
    dataset.pathCount,
    dataset.pointCount,
    mode,
    effectiveCoordinateKind,
    includeSplitDenseUnionRows,
    rowsPerChunk
  );
  const timestamps =
    effectiveTimeKind === 'timestamps'
      ? makePathTimestampVector(dataset.pathCount, dataset.pointCount, rowsPerChunk)
      : undefined;
  const colors =
    effectiveColorKind === 'none'
      ? undefined
      : effectiveColorKind === 'vertex-colors'
        ? makePathColorListVector(dataset.pathCount, dataset.pointCount, rowsPerChunk)
        : makePathRowColorVector(dataset.pathCount, rowsPerChunk);
  const widths = makePathWidthVector(dataset.pathCount, rowsPerChunk);
  const arrowVectorBuildTimeMs = getNow() - buildStartTime;
  const pathArrowByteLength =
    getArrowVectorByteLength(paths) + (timestamps ? getArrowVectorByteLength(timestamps) : 0);
  const styleArrowByteLength =
    (colors ? getArrowVectorByteLength(colors) : 0) + getArrowVectorByteLength(widths);
  return {
    sourceVectors: {
      paths,
      ...(colors ? {colors} : {}),
      widths,
      ...(timestamps ? {timestamps} : {})
    },
    pathArrowByteLength,
    styleArrowByteLength,
    arrowVectorBuildTimeMs
  };
}

export function makeArrowLineRecordBatches(
  sourceData: ArrowLineRendererSourceData
): arrow.RecordBatch[] {
  return new arrow.Table(sourceData.sourceVectors).batches;
}

export async function* createStreamingPathRecordBatchIterator(
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

function waitForStreamingBatchDelay(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, STREAMING_PATH_BATCH_INTERVAL_MS);
  });
}

function makePathVector(
  pathCount: number,
  pointCount: number,
  mode: ArrowLineMode,
  coordinateKind: ArrowLineCoordinateKind,
  includeSplitDenseUnionRows: boolean,
  rowsPerChunk: number | null = null
): arrow.Vector<ArrowLineSourceCoordinateType> {
  if (coordinateKind === 'dense-union') {
    return mode === 'polygons'
      ? makeDenseUnionPolygonVector(pathCount, rowsPerChunk)
      : makeDenseUnionLineVector(pathCount, pointCount, includeSplitDenseUnionRows, rowsPerChunk);
  }

  const coordinateValueType =
    coordinateKind === 'float64' ? new arrow.Float64() : new arrow.Float32();
  const dataChunks: arrow.Data<ArrowLineSourceCoordinateType>[] = [];
  forEachPathChunk(pathCount, rowsPerChunk, (pathStart, chunkPathCount) => {
    dataChunks.push(
      makePathListDataChunk(
        makePathIndexRange(pathStart, chunkPathCount),
        pathCount,
        pointCount,
        coordinateValueType,
        4
      )
    );
  });
  return new arrow.Vector(dataChunks) as arrow.Vector<ArrowLineSourceCoordinateType>;
}

function makeDenseUnionLineVector(
  pathCount: number,
  pointCount: number,
  includeMultiLineStrings: boolean,
  rowsPerChunk: number | null = null
): arrow.Vector<ArrowLineSourceCoordinateType> {
  const dataChunks: arrow.Data<arrow.DenseUnion>[] = [];
  forEachPathChunk(pathCount, rowsPerChunk, (pathStart, chunkPathCount) => {
    const typeIds = new Int8Array(chunkPathCount);
    const valueOffsets = new Int32Array(chunkPathCount);
    const lineStringXYMPathIndices: number[] = [];
    const lineStringXYZMPathIndices: number[] = [];
    const multiLineStringXYMPathIndices: number[] = [];

    for (let localPathIndex = 0; localPathIndex < chunkPathCount; localPathIndex++) {
      const pathIndex = pathStart + localPathIndex;
      const denseUnionKind = includeMultiLineStrings ? pathIndex % 3 : pathIndex % 2;
      if (denseUnionKind === 0) {
        typeIds[localPathIndex] = GEOARROW_LINESTRING_XYM_TYPE_ID;
        valueOffsets[localPathIndex] = lineStringXYMPathIndices.length;
        lineStringXYMPathIndices.push(pathIndex);
      } else if (denseUnionKind === 1) {
        typeIds[localPathIndex] = GEOARROW_LINESTRING_XYZM_TYPE_ID;
        valueOffsets[localPathIndex] = lineStringXYZMPathIndices.length;
        lineStringXYZMPathIndices.push(pathIndex);
      } else {
        typeIds[localPathIndex] = GEOARROW_MULTILINESTRING_XYM_TYPE_ID;
        valueOffsets[localPathIndex] = multiLineStringXYMPathIndices.length;
        multiLineStringXYMPathIndices.push(pathIndex);
      }
    }

    const lineStringXYMData = makePathListDataChunk(
      lineStringXYMPathIndices,
      pathCount,
      pointCount,
      new arrow.Float32(),
      3
    );
    const lineStringXYZMData = makePathListDataChunk(
      lineStringXYZMPathIndices,
      pathCount,
      pointCount,
      new arrow.Float64(),
      4
    );
    const multiLineStringXYMData = makeMultiLineStringDataChunk(
      multiLineStringXYMPathIndices,
      pathCount,
      pointCount,
      new arrow.Float32(),
      3
    );
    const unionType = new arrow.DenseUnion(
      [
        GEOARROW_LINESTRING_XYM_TYPE_ID,
        GEOARROW_LINESTRING_XYZM_TYPE_ID,
        GEOARROW_MULTILINESTRING_XYM_TYPE_ID
      ],
      [
        new arrow.Field('LineStringXYM', lineStringXYMData.type, true),
        new arrow.Field('LineStringXYZM', lineStringXYZMData.type, true),
        new arrow.Field('MultiLineStringXYM', multiLineStringXYMData.type, true)
      ]
    );

    dataChunks.push(
      arrow.makeData({
        type: unionType,
        length: chunkPathCount,
        nullCount: 0,
        typeIds,
        valueOffsets,
        children: [lineStringXYMData, lineStringXYZMData, multiLineStringXYMData]
      }) as arrow.Data<arrow.DenseUnion>
    );
  });
  return new arrow.Vector(dataChunks) as arrow.Vector<ArrowLineSourceCoordinateType>;
}

function makeDenseUnionPolygonVector(
  pathCount: number,
  rowsPerChunk: number | null = null
): arrow.Vector<ArrowLineSourceCoordinateType> {
  const dataChunks: arrow.Data<arrow.DenseUnion>[] = [];
  forEachPathChunk(pathCount, rowsPerChunk, (pathStart, chunkPathCount) => {
    const typeIds = new Int8Array(chunkPathCount);
    const valueOffsets = new Int32Array(chunkPathCount);
    const polygonPathIndices: number[] = [];
    const multiPolygonPathIndices: number[] = [];

    for (let localPathIndex = 0; localPathIndex < chunkPathCount; localPathIndex++) {
      const pathIndex = pathStart + localPathIndex;
      if (pathIndex % 4 === 0) {
        typeIds[localPathIndex] = GEOARROW_MULTIPOLYGON_TYPE_ID;
        valueOffsets[localPathIndex] = multiPolygonPathIndices.length;
        multiPolygonPathIndices.push(pathIndex);
      } else {
        typeIds[localPathIndex] = GEOARROW_POLYGON_TYPE_ID;
        valueOffsets[localPathIndex] = polygonPathIndices.length;
        polygonPathIndices.push(pathIndex);
      }
    }

    const polygonData = makePolygonRowsDataChunk(polygonPathIndices, pathCount);
    const multiPolygonData = makeMultiPolygonRowsDataChunk(multiPolygonPathIndices, pathCount);
    const unionType = new arrow.DenseUnion(
      [GEOARROW_POLYGON_TYPE_ID, GEOARROW_MULTIPOLYGON_TYPE_ID],
      [
        new arrow.Field('Polygon', polygonData.type, true),
        new arrow.Field('MultiPolygon', multiPolygonData.type, true)
      ]
    );

    dataChunks.push(
      arrow.makeData({
        type: unionType,
        length: chunkPathCount,
        nullCount: 0,
        typeIds,
        valueOffsets,
        children: [polygonData, multiPolygonData]
      }) as arrow.Data<arrow.DenseUnion>
    );
  });
  return new arrow.Vector(dataChunks) as arrow.Vector<ArrowLineSourceCoordinateType>;
}

function makeMultiLineStringDataChunk(
  pathIndices: number[],
  pathCount: number,
  pointCount: number,
  coordinateValueType: arrow.Float32 | arrow.Float64,
  coordinateComponentCount: 3 | 4
): arrow.Data<arrow.List<arrow.List<arrow.FixedSizeList<arrow.Float32 | arrow.Float64>>>> {
  const lineStringCount = pathIndices.length * 2;
  const rowOffsets = new Int32Array(pathIndices.length + 1);
  const lineOffsets = new Int32Array(lineStringCount + 1);
  const values =
    coordinateValueType instanceof arrow.Float64
      ? new Float64Array(lineStringCount * pointCount * coordinateComponentCount)
      : new Float32Array(lineStringCount * pointCount * coordinateComponentCount);

  for (let localPathIndex = 0; localPathIndex < pathIndices.length; localPathIndex++) {
    const pathIndex = pathIndices[localPathIndex];
    rowOffsets[localPathIndex] = localPathIndex * 2;
    for (let linePartIndex = 0; linePartIndex < 2; linePartIndex++) {
      const lineIndex = localPathIndex * 2 + linePartIndex;
      lineOffsets[lineIndex] = lineIndex * pointCount;
      for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
        const valueOffset = (lineIndex * pointCount + pointIndex) * coordinateComponentCount;
        writePathCoordinate(
          values,
          valueOffset,
          pathIndex,
          pathCount,
          pointIndex,
          pointCount,
          coordinateComponentCount
        );
        values[valueOffset] = values[valueOffset] * 0.43 + (linePartIndex === 0 ? -0.38 : 0.38);
        values[valueOffset + 1] += linePartIndex === 0 ? -0.036 : 0.036;
      }
    }
  }
  rowOffsets[pathIndices.length] = lineStringCount;
  lineOffsets[lineStringCount] = lineStringCount * pointCount;

  const coordinateData = makeFixedSizeListData(
    coordinateValueType,
    coordinateComponentCount,
    values
  );
  const lineStringData = makeListData(coordinateData, lineOffsets);
  return makeListData(lineStringData, rowOffsets) as arrow.Data<
    arrow.List<arrow.List<arrow.FixedSizeList<arrow.Float32 | arrow.Float64>>>
  >;
}

function makePolygonRowsDataChunk(
  pathIndices: number[],
  totalPathCount: number
): arrow.Data<arrow.List<arrow.List<arrow.FixedSizeList<arrow.Float32>>>> {
  const rowOffsets = new Int32Array(pathIndices.length + 1);
  const ringOffsets = new Int32Array(getPolygonRingCount(pathIndices) + 1);
  const coordinateCount = getPolygonCoordinateCount(pathIndices);
  const values = new Float32Array(coordinateCount * 2);
  let ringIndex = 0;
  let coordinateIndex = 0;

  for (let localPathIndex = 0; localPathIndex < pathIndices.length; localPathIndex++) {
    const pathIndex = pathIndices[localPathIndex];
    rowOffsets[localPathIndex] = ringIndex;
    ringOffsets[ringIndex++] = coordinateIndex;
    coordinateIndex = writePolygonRing(values, coordinateIndex, pathIndex, totalPathCount, 0);
    if (hasPolygonHole(pathIndex)) {
      ringOffsets[ringIndex++] = coordinateIndex;
      coordinateIndex = writePolygonRing(values, coordinateIndex, pathIndex, totalPathCount, 1);
    }
  }
  rowOffsets[pathIndices.length] = ringIndex;
  ringOffsets[ringIndex] = coordinateIndex;

  const coordinateData = makeFixedSizeListData(new arrow.Float32(), 2, values);
  const ringData = makeListData(coordinateData, ringOffsets);
  return makeListData(ringData, rowOffsets);
}

function makeMultiPolygonRowsDataChunk(
  pathIndices: number[],
  totalPathCount: number
): arrow.Data<arrow.List<arrow.List<arrow.List<arrow.FixedSizeList<arrow.Float32>>>>> {
  const rowOffsets = new Int32Array(pathIndices.length + 1);
  const polygonOffsets = new Int32Array(pathIndices.length * 2 + 1);
  const ringOffsets = new Int32Array(getMultiPolygonRingCount(pathIndices) + 1);
  const coordinateCount = getMultiPolygonCoordinateCount(pathIndices);
  const values = new Float32Array(coordinateCount * 2);
  let polygonIndex = 0;
  let ringIndex = 0;
  let coordinateIndex = 0;

  for (let localPathIndex = 0; localPathIndex < pathIndices.length; localPathIndex++) {
    const pathIndex = pathIndices[localPathIndex];
    rowOffsets[localPathIndex] = polygonIndex;
    for (let polygonPartIndex = 0; polygonPartIndex < 2; polygonPartIndex++) {
      polygonOffsets[polygonIndex++] = ringIndex;
      ringOffsets[ringIndex++] = coordinateIndex;
      coordinateIndex = writePolygonRing(
        values,
        coordinateIndex,
        pathIndex + polygonPartIndex * 17,
        totalPathCount,
        polygonPartIndex + 2
      );
    }
  }
  rowOffsets[pathIndices.length] = polygonIndex;
  polygonOffsets[polygonIndex] = ringIndex;
  ringOffsets[ringIndex] = coordinateIndex;

  const coordinateData = makeFixedSizeListData(new arrow.Float32(), 2, values);
  const ringData = makeListData(coordinateData, ringOffsets);
  const polygonData = makeListData(ringData, polygonOffsets);
  return makeListData(polygonData, rowOffsets);
}

function makePathListDataChunk(
  pathIndices: number[],
  pathCount: number,
  pointCount: number,
  coordinateValueType: arrow.Float32 | arrow.Float64,
  coordinateComponentCount: 3 | 4
): arrow.Data<ArrowLineSourceCoordinateType> {
  const coordinateType = new arrow.FixedSizeList(
    coordinateComponentCount,
    new arrow.Field('values', coordinateValueType, false)
  );
  const pathType = new arrow.List(new arrow.Field('coordinates', coordinateType, false));
  const valueOffsets = new Int32Array(pathIndices.length + 1);
  const values =
    coordinateValueType instanceof arrow.Float64
      ? new Float64Array(pathIndices.length * pointCount * coordinateComponentCount)
      : new Float32Array(pathIndices.length * pointCount * coordinateComponentCount);

  for (let localPathIndex = 0; localPathIndex < pathIndices.length; localPathIndex++) {
    const pathIndex = pathIndices[localPathIndex];
    valueOffsets[localPathIndex] = localPathIndex * pointCount;
    for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
      writePathCoordinate(
        values,
        (localPathIndex * pointCount + pointIndex) * coordinateComponentCount,
        pathIndex,
        pathCount,
        pointIndex,
        pointCount,
        coordinateComponentCount
      );
    }
  }

  valueOffsets[pathIndices.length] = pathIndices.length * pointCount;
  const coordinateValueData = new arrow.Data(coordinateValueType, 0, values.length, 0, {
    [arrow.BufferType.DATA]: values
  });
  const coordinateData = new arrow.Data(
    coordinateType,
    0,
    values.length / coordinateComponentCount,
    0,
    {},
    [coordinateValueData]
  );
  return new arrow.Data(
    pathType,
    0,
    pathIndices.length,
    0,
    {[arrow.BufferType.OFFSET]: valueOffsets},
    [coordinateData]
  ) as arrow.Data<ArrowLineSourceCoordinateType>;
}

function makeFixedSizeListData<T extends arrow.Float32 | arrow.Float64 | arrow.Uint8>(
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

function makePathIndexRange(pathStart: number, pathCount: number): number[] {
  const pathIndices: number[] = [];
  for (let localPathIndex = 0; localPathIndex < pathCount; localPathIndex++) {
    pathIndices.push(pathStart + localPathIndex);
  }
  return pathIndices;
}

function makePathTimestampVector(
  pathCount: number,
  pointCount: number,
  rowsPerChunk: number | null = null
): arrow.Vector<ArrowLineSourceTimestampType> {
  const timestampType = new arrow.TimestampMillisecond();
  const pathTimestampType = new arrow.List(new arrow.Field('timestamps', timestampType, false));
  const dataChunks: arrow.Data<ArrowLineSourceTimestampType>[] = [];
  forEachPathChunk(pathCount, rowsPerChunk, (pathStart, chunkPathCount) => {
    const valueOffsets = new Int32Array(chunkPathCount + 1);
    const timestamps = new BigInt64Array(chunkPathCount * pointCount);
    for (let localPathIndex = 0; localPathIndex < chunkPathCount; localPathIndex++) {
      const pathIndex = pathStart + localPathIndex;
      valueOffsets[localPathIndex] = localPathIndex * pointCount;
      for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
        const timestampIndex = localPathIndex * pointCount + pointIndex;
        timestamps[timestampIndex] =
          TEMPORAL_EPOCH_MILLISECONDS +
          BigInt(
            Math.round(
              getPathMeasure(pathIndex, pointIndex, pointCount) *
                TEMPORAL_MILLISECONDS_PER_MEASURE_UNIT
            )
          );
      }
    }
    valueOffsets[chunkPathCount] = chunkPathCount * pointCount;
    const timestampData = new arrow.Data(timestampType, 0, timestamps.length, 0, {
      [arrow.BufferType.DATA]: timestamps
    });
    dataChunks.push(
      new arrow.Data(
        pathTimestampType,
        0,
        chunkPathCount,
        0,
        {[arrow.BufferType.OFFSET]: valueOffsets},
        [timestampData]
      ) as arrow.Data<ArrowLineSourceTimestampType>
    );
  });
  return new arrow.Vector(dataChunks) as arrow.Vector<ArrowLineSourceTimestampType>;
}

function makePathColorListVector(
  pathCount: number,
  pointCount: number,
  rowsPerChunk: number | null = null
): arrow.Vector<ArrowLineVertexColorType> {
  const colorType = new arrow.FixedSizeList(4, new arrow.Field('values', new arrow.Uint8(), false));
  const pathColorType = new arrow.List(new arrow.Field('colors', colorType, false));
  const dataChunks: arrow.Data<ArrowLineVertexColorType>[] = [];
  forEachPathChunk(pathCount, rowsPerChunk, (pathStart, chunkPathCount) => {
    const valueOffsets = new Int32Array(chunkPathCount + 1);
    const colors = makePathVertexColors(pathStart, chunkPathCount, pointCount);
    for (let localPathIndex = 0; localPathIndex < chunkPathCount; localPathIndex++) {
      valueOffsets[localPathIndex] = localPathIndex * pointCount;
    }
    valueOffsets[chunkPathCount] = chunkPathCount * pointCount;
    const colorValueData = new arrow.Data(new arrow.Uint8(), 0, colors.length, 0, {
      [arrow.BufferType.DATA]: colors
    });
    const colorData = new arrow.Data(colorType, 0, colors.length / 4, 0, {}, [colorValueData]);
    dataChunks.push(
      new arrow.Data(
        pathColorType,
        0,
        chunkPathCount,
        0,
        {[arrow.BufferType.OFFSET]: valueOffsets},
        [colorData]
      ) as arrow.Data<ArrowLineVertexColorType>
    );
  });
  return new arrow.Vector(dataChunks) as arrow.Vector<ArrowLineVertexColorType>;
}

function makePathRowColorVector(
  pathCount: number,
  rowsPerChunk: number | null = null
): arrow.Vector<arrow.FixedSizeList<arrow.Uint8>> {
  const dataChunks: arrow.Data<arrow.FixedSizeList<arrow.Uint8>>[] = [];
  forEachPathChunk(pathCount, rowsPerChunk, (pathStart, chunkPathCount) => {
    dataChunks.push(
      makeArrowFixedSizeListVector(
        new arrow.Uint8(),
        4,
        makePathRowColors(pathStart, chunkPathCount)
      ).data[0] as arrow.Data<arrow.FixedSizeList<arrow.Uint8>>
    );
  });
  return new arrow.Vector(dataChunks) as arrow.Vector<arrow.FixedSizeList<arrow.Uint8>>;
}

function makePathWidthVector(
  pathCount: number,
  rowsPerChunk: number | null = null
): arrow.Vector<arrow.Float32> {
  const dataChunks: arrow.Data<arrow.Float32>[] = [];
  forEachPathChunk(pathCount, rowsPerChunk, (pathStart, chunkPathCount) => {
    const values = makePathWidths(pathStart, chunkPathCount);
    dataChunks.push(
      arrow.makeData({
        type: new arrow.Float32(),
        length: values.length,
        data: values
      }) as arrow.Data<arrow.Float32>
    );
  });
  return new arrow.Vector(dataChunks);
}

function forEachPathChunk(
  pathCount: number,
  rowsPerChunk: number | null,
  visitor: (pathStart: number, chunkPathCount: number) => void
): void {
  const safeRowsPerChunk =
    rowsPerChunk && rowsPerChunk > 0 && rowsPerChunk < pathCount ? rowsPerChunk : pathCount;
  for (let pathStart = 0; pathStart < pathCount; pathStart += safeRowsPerChunk) {
    visitor(pathStart, Math.min(safeRowsPerChunk, pathCount - pathStart));
  }
}

function writePathCoordinate(
  values: Float32Array | Float64Array,
  targetOffset: number,
  pathIndex: number,
  pathCount: number,
  pointIndex: number,
  pointCount: number,
  coordinateComponentCount: 3 | 4
): void {
  const pathProgress = pointCount <= 1 ? 0 : pointIndex / (pointCount - 1);
  const normalizedPathIndex = pathCount <= 1 ? 0 : pathIndex / (pathCount - 1);
  const baseY = -0.92 + normalizedPathIndex * 1.84;
  const phase = pathIndex * 0.13;
  values[targetOffset] = -1.24 + pathProgress * 2.48;
  values[targetOffset + 1] =
    baseY +
    Math.sin(pathProgress * 11.5 + phase) * 0.028 +
    Math.cos(pathProgress * 4.2 - phase * 0.55) * 0.014;
  if (coordinateComponentCount === 3) {
    values[targetOffset + 2] = getPathMeasure(pathIndex, pointIndex, pointCount);
    return;
  }
  values[targetOffset + 2] = 0;
  values[targetOffset + 3] = getPathMeasure(pathIndex, pointIndex, pointCount);
}

function writePolygonRing(
  values: Float32Array,
  coordinateIndex: number,
  pathIndex: number,
  totalPathCount: number,
  ringKind: number
): number {
  const {x, y, radius, cellWidth} = getPolygonCell(pathIndex, totalPathCount);
  const vertexCount = getPolygonRingVertexCount(pathIndex, ringKind);
  const isHole = ringKind === 1;
  const isMultiPolygonPart = ringKind >= 2;
  const partDirection = ringKind % 2 === 0 ? -1 : 1;
  const centerX = x + (isMultiPolygonPart ? partDirection * cellWidth * 0.22 : 0);
  const centerY =
    y + (isHole ? radius * 0.1 : isMultiPolygonPart ? partDirection * radius * 0.16 : 0);
  const ringRadius = radius * (isHole ? 0.38 : isMultiPolygonPart ? 0.58 : 0.92);
  const angleOffset = -Math.PI / 2 + getJitter(pathIndex, 19 + ringKind) * 0.42;
  const stretchX = 0.84 + getJitter(pathIndex, 31 + ringKind) * 0.12;
  const stretchY = 0.86 + getJitter(pathIndex, 43 + ringKind) * 0.12;

  for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
    const orderedVertexIndex = isHole ? vertexCount - vertexIndex : vertexIndex;
    const angle = angleOffset + (orderedVertexIndex / vertexCount) * Math.PI * 2;
    const wave = Math.sin(angle * 3 + pathIndex * 0.17) * 0.08;
    const pointRadius = ringRadius * (1 + wave);
    const valueOffset = (coordinateIndex + vertexIndex) * 2;
    values[valueOffset] = centerX + Math.cos(angle) * pointRadius * stretchX;
    values[valueOffset + 1] = centerY + Math.sin(angle) * pointRadius * stretchY;
  }

  return coordinateIndex + vertexCount;
}

function getPolygonRingCount(pathIndices: number[]): number {
  return pathIndices.reduce(
    (ringCount, pathIndex) => ringCount + (hasPolygonHole(pathIndex) ? 2 : 1),
    0
  );
}

function getPolygonCoordinateCount(pathIndices: number[]): number {
  return pathIndices.reduce(
    (coordinateCount, pathIndex) =>
      coordinateCount +
      getPolygonRingVertexCount(pathIndex, 0) +
      (hasPolygonHole(pathIndex) ? getPolygonRingVertexCount(pathIndex, 1) : 0),
    0
  );
}

function getMultiPolygonRingCount(pathIndices: number[]): number {
  return pathIndices.length * 2;
}

function getMultiPolygonCoordinateCount(pathIndices: number[]): number {
  return pathIndices.reduce(
    (coordinateCount, pathIndex) =>
      coordinateCount +
      getPolygonRingVertexCount(pathIndex, 2) +
      getPolygonRingVertexCount(pathIndex + 17, 3),
    0
  );
}

function getPolygonRingVertexCount(pathIndex: number, ringKind: number): number {
  if (ringKind === 1) {
    return 5 + (pathIndex % 3);
  }
  return 6 + ((pathIndex + ringKind) % 5);
}

function hasPolygonHole(pathIndex: number): boolean {
  return pathIndex % 5 === 0;
}

function getPolygonCell(
  pathIndex: number,
  totalPathCount: number
): {x: number; y: number; radius: number; cellWidth: number} {
  const columns = POLYGON_GRID_COLUMN_COUNT;
  const rows = Math.ceil(totalPathCount / columns);
  const cellWidth = 1.86 / columns;
  const cellHeight = 1.76 / rows;
  const columnIndex = pathIndex % columns;
  const rowIndex = Math.floor(pathIndex / columns);
  const jitterX = getJitter(pathIndex, 61) * cellWidth * 0.15;
  const jitterY = getJitter(pathIndex, 73) * cellHeight * 0.15;
  return {
    x: -0.93 + (columnIndex + 0.5) * cellWidth + jitterX,
    y: 0.88 - (rowIndex + 0.5) * cellHeight + jitterY,
    radius: Math.min(cellWidth, cellHeight) * 0.46,
    cellWidth
  };
}

function getJitter(pathIndex: number, salt: number): number {
  const value = Math.sin((pathIndex + 1) * (salt + 29) * 12.9898) * 43758.5453;
  return value - Math.floor(value) - 0.5;
}

function getPathMeasure(pathIndex: number, pointIndex: number, pointCount: number): number {
  const pathProgress = pointCount <= 1 ? 0 : pointIndex / (pointCount - 1);
  const pathClusterIndex = pathIndex % 5;
  const pathMeasureRate = 0.58 + pathClusterIndex * 0.16;
  const pathMeasurePhase = (Math.floor(pathIndex / 5) % 4) * 0.08;
  return pathProgress * pathMeasureRate + pathMeasurePhase;
}

export function getTemporalCurrentTimeMilliseconds(measureTime: number): number {
  return Math.round(measureTime * TEMPORAL_MILLISECONDS_PER_MEASURE_UNIT);
}

function makePathVertexColors(
  pathStart: number,
  pathCount: number,
  pointCount: number
): Uint8Array {
  const colors = new Uint8Array(pathCount * pointCount * 4);
  for (let localPathIndex = 0; localPathIndex < pathCount; localPathIndex++) {
    const pathIndex = pathStart + localPathIndex;
    const evenColor = getPathPaletteColor(pathIndex);
    const oddColor = getPathPaletteColor(pathIndex + 2);
    const accentColor = getPathPaletteColor(pathIndex + 4);
    const blueTarget: [number, number, number] = [42, 116, 255];
    for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
      const pathProgress = pointCount <= 1 ? 0 : pointIndex / (pointCount - 1);
      const alternatingColor = pointIndex % 2 === 0 ? evenColor : oddColor;
      const pulseColor = pointIndex % 4 === 0 ? accentColor : alternatingColor;
      const blueFade = Math.min(1, Math.max(0, (pathProgress - 0.18) / 0.72));
      const bandBoost = pointIndex % 2 === 0 ? 72 : -28;
      const colorOffset = (localPathIndex * pointCount + pointIndex) * 4;
      colors[colorOffset] = clampColor(
        pulseColor[0] * (1 - blueFade) + blueTarget[0] * blueFade + bandBoost
      );
      colors[colorOffset + 1] = clampColor(
        pulseColor[1] * (1 - blueFade) + blueTarget[1] * blueFade + bandBoost
      );
      colors[colorOffset + 2] = clampColor(
        pulseColor[2] * (1 - blueFade) + blueTarget[2] * blueFade + bandBoost
      );
      colors[colorOffset + 3] = pointIndex % 2 === 0 ? 242 : 202;
    }
  }
  return colors;
}

function makePathRowColors(pathStart: number, pathCount: number): Uint8Array {
  const colors = new Uint8Array(pathCount * 4);
  for (let localPathIndex = 0; localPathIndex < pathCount; localPathIndex++) {
    const pathIndex = pathStart + localPathIndex;
    const paletteColor = getPathPaletteColor(pathIndex);
    const colorOffset = localPathIndex * 4;
    colors[colorOffset] = paletteColor[0];
    colors[colorOffset + 1] = paletteColor[1];
    colors[colorOffset + 2] = paletteColor[2];
    colors[colorOffset + 3] = 220;
  }
  return colors;
}

function makePathWidths(pathStart: number, pathCount: number): Float32Array {
  return Float32Array.from(
    {length: pathCount},
    (_, localPathIndex) => 0.0022 + ((pathStart + localPathIndex) % 7) * 0.00072
  );
}

function getPathPaletteColor(pathIndex: number): [number, number, number] {
  switch (pathIndex % 5) {
    case 0:
      return [72, 205, 217];
    case 1:
      return [255, 186, 73];
    case 2:
      return [255, 111, 97];
    case 3:
      return [120, 177, 255];
    default:
      return [152, 221, 132];
  }
}

function clampColor(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function getNow(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}
