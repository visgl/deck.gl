// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  getArrowVectorByteLength,
  makeArrowFixedSizeListVector,
  type ArrowTextRendererSource,
  type CharacterColorDataType,
  type RowColorColumnDataType
} from '@luma.gl/arrow';
import * as arrow from 'apache-arrow';

export const LABEL_COLUMN_COUNT = 400;
export const LABEL_COLUMN_SPACING = 540;
export const LABEL_ROW_SPACING = 72;
export const LABEL_FIELD_WIDTH = LABEL_COLUMN_COUNT * LABEL_COLUMN_SPACING;
const LABEL_CLIP_WIDTH = 720;
export const STREAMING_TEXT_BATCH_COUNT = 10;
const STREAMING_TEXT_BATCH_DELAY_MS = 1000;
const TEXT_DICTIONARY_ROWS_PER_CHUNK = 100_000;
const DICTIONARY_LABEL_COUNT_PER_CHUNK = 1_000;
const ARROW_UTF8_DICTIONARY_TYPE = new arrow.Dictionary(new arrow.Utf8(), new arrow.Int32(), 0);

export type ArrowUtf8DictionaryIndexType =
  | arrow.Int8
  | arrow.Int16
  | arrow.Int32
  | arrow.Uint8
  | arrow.Uint16
  | arrow.Uint32;
export type ArrowUtf8Dictionary = arrow.Dictionary<arrow.Utf8, ArrowUtf8DictionaryIndexType>;
export type ArrowUtf8TextType = arrow.Utf8 | ArrowUtf8Dictionary;
export type ArrowUtf8TextVector = arrow.Vector<ArrowUtf8TextType>;
export type TextRowCountKind = '10k' | '100k' | '1m';
export type TextSourceKind = 'utf8' | 'dictionary';
export type TextColorKind = 'constant' | 'string-colors' | 'character-colors';
export type Utf8TextDatasetKind = TextRowCountKind;
export type TextDictionaryDatasetKind = '10k-dict' | '100k-dict' | '1m-dict';
export type EagerTextDatasetKind = Utf8TextDatasetKind | TextDictionaryDatasetKind;
export type StreamingTextDatasetKind = `${EagerTextDatasetKind}-stream`;
export type StreamingTextTableSizeKind = `${Utf8TextDatasetKind}-stream`;
export type TextTableSizeKind = TextRowCountKind | StreamingTextTableSizeKind;
export type TextDatasetKind = EagerTextDatasetKind | StreamingTextDatasetKind;
export type TextInputKind = `${EagerTextDatasetKind}-${TextColorKind}`;
export type TextDataset = {
  labelCount: number;
  label: string;
  textType: 'utf8' | 'dictionary';
};
export type ArrowTextSource = ArrowTextRendererSource & {
  /** Time spent building the CPU Arrow source vectors before layer upload. */
  arrowVectorBuildTimeMs: number;
};
export type ArrowTextStyleColumnOptions = {
  clipRects?: boolean;
  angles?: boolean;
  sizes?: boolean;
};
export type StreamingArrowTextSource = {
  recordBatches: arrow.RecordBatch[];
  arrowVectorBuildTimeMs: number;
};
type ExampleArrowTextSourceVectors = Pick<
  ArrowTextRendererSource,
  'positions' | 'texts' | 'clipRects' | 'colors' | 'angles' | 'sizes' | 'pixelOffsets'
>;

export const TEXT_DATASETS: Record<EagerTextDatasetKind, TextDataset> = {
  '10k': {labelCount: 10_000, label: '10K Utf8 texts, 300K glyphs', textType: 'utf8'},
  '100k': {labelCount: 100_000, label: '100K Utf8 texts, 3M glyphs', textType: 'utf8'},
  '1m': {labelCount: 1_000_000, label: '1M Utf8 texts, 31M glyphs', textType: 'utf8'},
  '10k-dict': {
    labelCount: 10_000,
    label: '10K Dictionary<Utf8>, 1K strings / 10K rows',
    textType: 'dictionary'
  },
  '100k-dict': {
    labelCount: 100_000,
    label: '100K Dictionary<Utf8>, 1K strings / 100K rows',
    textType: 'dictionary'
  },
  '1m-dict': {
    labelCount: 1_000_000,
    label: '1M Dictionary<Utf8>, 1K strings / 100K rows',
    textType: 'dictionary'
  }
};

export function makeArrowTextSource(
  dataset: TextDataset,
  textColorKind: TextColorKind,
  styleColumns: ArrowTextStyleColumnOptions = {}
): ArrowTextSource {
  const resolvedStyleColumns = resolveArrowTextStyleColumnOptions(styleColumns);
  const labelRowCount = dataset.labelCount / LABEL_COLUMN_COUNT;
  const centerColumn = (LABEL_COLUMN_COUNT - 1) / 2;
  const centerRow = (labelRowCount - 1) / 2;
  const positions = new Float32Array(dataset.labelCount * 2);
  const clipRects = resolvedStyleColumns.clipRects
    ? new Float32Array(dataset.labelCount * 4)
    : undefined;
  const angles = resolvedStyleColumns.angles ? new Float32Array(dataset.labelCount) : undefined;
  const sizes = resolvedStyleColumns.sizes ? new Float32Array(dataset.labelCount) : undefined;
  let positionIndex = 0;
  let clipRectIndex = 0;

  for (let labelIndex = 0; labelIndex < dataset.labelCount; labelIndex++) {
    const columnIndex = labelIndex % LABEL_COLUMN_COUNT;
    const rowIndex = Math.floor(labelIndex / LABEL_COLUMN_COUNT);
    positions[positionIndex++] = (columnIndex - centerColumn) * LABEL_COLUMN_SPACING;
    positions[positionIndex++] = (rowIndex - centerRow) * LABEL_ROW_SPACING;
    if (clipRects) {
      clipRects[clipRectIndex++] = 0;
      clipRects[clipRectIndex++] = 0;
      clipRects[clipRectIndex++] = LABEL_CLIP_WIDTH;
      clipRects[clipRectIndex++] = -1;
    }
    if (angles) {
      angles[labelIndex] = ((labelIndex % 9) - 4) * 2;
    }
    if (sizes) {
      sizes[labelIndex] = 24 + (labelIndex % 5) * 4;
    }
  }

  const arrowVectorBuildStartTime = getNow();
  const rowChunkSize = getArrowTextInputRowChunkSize(dataset);
  const positionVector = splitArrowVectorByRows(
    makeArrowFixedSizeListVector(new arrow.Float32(), 2, positions) as arrow.Vector<
      arrow.FixedSizeList<arrow.Float32>
    >,
    rowChunkSize
  );
  const texts = makeArrowTextVector(dataset, dataset.labelCount, labelIndex => labelIndex);
  const clipRectVector = clipRects
    ? splitArrowVectorByRows(
        makeArrowFixedSizeListVector(new arrow.Float32(), 4, clipRects) as arrow.Vector<
          arrow.FixedSizeList<arrow.Float32>
        >,
        rowChunkSize
      )
    : undefined;
  const colorVector =
    textColorKind === 'constant'
      ? undefined
      : makeArrowTextColorVector(
          dataset,
          dataset.labelCount,
          labelIndex => labelIndex,
          textColorKind,
          rowChunkSize
        );
  const angleVector = angles
    ? splitArrowVectorByRows(makeFloat32ArrowVector(angles), rowChunkSize)
    : undefined;
  const sizeVector = sizes
    ? splitArrowVectorByRows(makeFloat32ArrowVector(sizes), rowChunkSize)
    : undefined;
  const sourceVectors: ExampleArrowTextSourceVectors = {
    positions: positionVector,
    texts,
    ...(clipRectVector ? {clipRects: clipRectVector} : {}),
    ...(colorVector ? {colors: colorVector} : {}),
    ...(angleVector ? {angles: angleVector} : {}),
    ...(sizeVector ? {sizes: sizeVector} : {})
  };

  return {
    ...sourceVectors,
    arrowVectorByteLength: getArrowVectorByteLength(texts),
    arrowVectorBuildTimeMs: getNow() - arrowVectorBuildStartTime
  };
}

export async function makeArrowTextSourceAsync(
  dataset: TextDataset,
  textColorKind: TextColorKind,
  styleColumns?: ArrowTextStyleColumnOptions
): Promise<ArrowTextSource> {
  await waitForBrowserPaint();
  return makeArrowTextSource(dataset, textColorKind, styleColumns);
}

export async function makeStreamingArrowTextSourceAsync(
  dataset: TextDataset,
  textColorKind: TextColorKind,
  styleColumns?: ArrowTextStyleColumnOptions
): Promise<StreamingArrowTextSource> {
  await waitForBrowserPaint();
  return makeStreamingArrowTextSource(dataset, textColorKind, styleColumns);
}

function makeStreamingArrowTextSource(
  dataset: TextDataset,
  textColorKind: TextColorKind,
  styleColumns: ArrowTextStyleColumnOptions = {}
): StreamingArrowTextSource {
  const resolvedStyleColumns = resolveArrowTextStyleColumnOptions(styleColumns);
  const arrowVectorBuildStartTime = getNow();
  const recordBatches = new Array<arrow.RecordBatch>(STREAMING_TEXT_BATCH_COUNT);
  const labelRowCount = dataset.labelCount / LABEL_COLUMN_COUNT;
  const centerColumn = (LABEL_COLUMN_COUNT - 1) / 2;
  const centerRow = (labelRowCount - 1) / 2;

  for (let batchIndex = 0; batchIndex < STREAMING_TEXT_BATCH_COUNT; batchIndex++) {
    const batchRowIndices = getStreamingTextBatchRowIndices(labelRowCount, batchIndex);
    const batchLabelCount = batchRowIndices.length * LABEL_COLUMN_COUNT;
    const positions = new Float32Array(batchLabelCount * 2);
    const clipRects = resolvedStyleColumns.clipRects
      ? new Float32Array(batchLabelCount * 4)
      : undefined;
    const colors =
      textColorKind === 'string-colors' ? new Uint8Array(batchLabelCount * 4) : undefined;
    const angles = resolvedStyleColumns.angles ? new Float32Array(batchLabelCount) : undefined;
    const sizes = resolvedStyleColumns.sizes ? new Float32Array(batchLabelCount) : undefined;

    for (let localLabelIndex = 0; localLabelIndex < batchLabelCount; localLabelIndex++) {
      const localRowIndex = Math.floor(localLabelIndex / LABEL_COLUMN_COUNT);
      const columnIndex = localLabelIndex % LABEL_COLUMN_COUNT;
      const rowIndex = batchRowIndices[localRowIndex];
      const labelIndex = rowIndex * LABEL_COLUMN_COUNT + columnIndex;
      const positionIndex = localLabelIndex * 2;
      const clipRectIndex = localLabelIndex * 4;

      positions[positionIndex] = (columnIndex - centerColumn) * LABEL_COLUMN_SPACING;
      positions[positionIndex + 1] = (rowIndex - centerRow) * LABEL_ROW_SPACING;
      if (clipRects) {
        clipRects[clipRectIndex] = 0;
        clipRects[clipRectIndex + 1] = 0;
        clipRects[clipRectIndex + 2] = LABEL_CLIP_WIDTH;
        clipRects[clipRectIndex + 3] = -1;
      }
      if (colors) {
        const colorIndex = localLabelIndex * 4;
        colors[colorIndex] = 96 + ((labelIndex * 17) % 128);
        colors[colorIndex + 1] = 172 + ((labelIndex * 11) % 72);
        colors[colorIndex + 2] = 210 + ((labelIndex * 7) % 45);
        colors[colorIndex + 3] = 255;
      }
      if (angles) {
        angles[localLabelIndex] = ((labelIndex % 9) - 4) * 2;
      }
      if (sizes) {
        sizes[localLabelIndex] = 24 + (labelIndex % 5) * 4;
      }
    }

    const colorVector =
      textColorKind === 'constant'
        ? undefined
        : textColorKind === 'string-colors'
          ? makeArrowFixedSizeListVector(new arrow.Uint8(), 4, colors!)
          : makeArrowTextCharacterColorVector(dataset, batchLabelCount, localLabelIndex => {
              const localRowIndex = Math.floor(localLabelIndex / LABEL_COLUMN_COUNT);
              const columnIndex = localLabelIndex % LABEL_COLUMN_COUNT;
              return batchRowIndices[localRowIndex] * LABEL_COLUMN_COUNT + columnIndex;
            });
    const table = new arrow.Table({
      positions: makeArrowFixedSizeListVector(new arrow.Float32(), 2, positions),
      texts: makeArrowTextVector(dataset, batchLabelCount, localLabelIndex => {
        const localRowIndex = Math.floor(localLabelIndex / LABEL_COLUMN_COUNT);
        const columnIndex = localLabelIndex % LABEL_COLUMN_COUNT;
        return batchRowIndices[localRowIndex] * LABEL_COLUMN_COUNT + columnIndex;
      }),
      ...(clipRects
        ? {clipRects: makeArrowFixedSizeListVector(new arrow.Float32(), 4, clipRects)}
        : {}),
      ...(colorVector ? {colors: colorVector} : {}),
      ...(angles ? {angles: makeFloat32ArrowVector(angles)} : {}),
      ...(sizes ? {sizes: makeFloat32ArrowVector(sizes)} : {})
    });
    const recordBatch = table.batches[0];
    if (!recordBatch) {
      throw new Error('Streaming Arrow text source requires non-empty record batches');
    }
    recordBatches[batchIndex] = recordBatch;
  }

  return {
    recordBatches,
    arrowVectorBuildTimeMs: getNow() - arrowVectorBuildStartTime
  };
}

export async function* createStreamingRecordBatchIterator(
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
    setTimeout(resolve, STREAMING_TEXT_BATCH_DELAY_MS);
  });
}

function resolveArrowTextStyleColumnOptions(
  options: ArrowTextStyleColumnOptions
): Required<ArrowTextStyleColumnOptions> {
  return {
    clipRects: options.clipRects ?? true,
    angles: options.angles ?? true,
    sizes: options.sizes ?? true
  };
}

function getStreamingTextBatchRowIndices(rowCount: number, batchIndex: number): number[] {
  const rowIndices: number[] = [];
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    if (rowIndex % STREAMING_TEXT_BATCH_COUNT === batchIndex) {
      rowIndices.push(rowIndex);
    }
  }
  return rowIndices;
}

async function waitForBrowserPaint(): Promise<void> {
  if (typeof requestAnimationFrame !== 'function') {
    await Promise.resolve();
    return;
  }

  await new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0);
    });
  });
}

function makeArrowTextVector(
  dataset: TextDataset,
  labelCount: number,
  getGlobalLabelIndex: (localLabelIndex: number) => number
): ArrowUtf8TextVector {
  if (dataset.textType === 'dictionary') {
    return makeArrowTextDictionaryVector(labelCount, getGlobalLabelIndex);
  }

  const labels = new Array<string>(labelCount);
  for (let localLabelIndex = 0; localLabelIndex < labelCount; localLabelIndex++) {
    labels[localLabelIndex] = makeUtf8Label(getGlobalLabelIndex(localLabelIndex));
  }
  return arrow.vectorFromArray(labels, new arrow.Utf8()) as arrow.Vector<arrow.Utf8>;
}

function makeArrowTextDictionaryVector(
  labelCount: number,
  getGlobalLabelIndex: (localLabelIndex: number) => number
): arrow.Vector<ArrowUtf8Dictionary> {
  const dataChunks: arrow.Data<ArrowUtf8Dictionary>[] = [];
  let localStartIndex = 0;

  while (localStartIndex < labelCount) {
    const dictionaryChunkIndex = getDictionaryChunkIndex(getGlobalLabelIndex(localStartIndex));
    let localEndIndex = localStartIndex + 1;
    while (
      localEndIndex < labelCount &&
      getDictionaryChunkIndex(getGlobalLabelIndex(localEndIndex)) === dictionaryChunkIndex
    ) {
      localEndIndex++;
    }

    const chunkLabelCount = localEndIndex - localStartIndex;
    const dictionary = arrow.vectorFromArray(
      makeDictionaryLabels(dictionaryChunkIndex),
      new arrow.Utf8()
    ) as arrow.Vector<arrow.Utf8>;
    const indices = new Int32Array(chunkLabelCount);
    for (
      let localLabelIndex = localStartIndex;
      localLabelIndex < localEndIndex;
      localLabelIndex++
    ) {
      indices[localLabelIndex - localStartIndex] = getDictionaryLabelIndex(
        getGlobalLabelIndex(localLabelIndex)
      );
    }
    dataChunks.push(
      arrow.makeData({
        type: ARROW_UTF8_DICTIONARY_TYPE,
        length: chunkLabelCount,
        data: indices,
        dictionary
      }) as arrow.Data<ArrowUtf8Dictionary>
    );
    localStartIndex = localEndIndex;
  }

  return new arrow.Vector<ArrowUtf8Dictionary>(dataChunks);
}

function makeArrowTextColorVector(
  dataset: TextDataset,
  labelCount: number,
  getGlobalLabelIndex: (localLabelIndex: number) => number,
  textColorKind: TextColorKind,
  rowChunkSize: number
): arrow.Vector<RowColorColumnDataType | CharacterColorDataType> {
  if (textColorKind === 'character-colors') {
    return splitArrowVectorByRows(
      makeArrowTextCharacterColorVector(dataset, labelCount, getGlobalLabelIndex),
      rowChunkSize
    ) as arrow.Vector<RowColorColumnDataType | CharacterColorDataType>;
  }
  return splitArrowVectorByRows(
    makeArrowFixedSizeListVector(new arrow.Uint8(), 4, makeTextRowColors(labelCount)),
    rowChunkSize
  ) as arrow.Vector<RowColorColumnDataType | CharacterColorDataType>;
}

function makeArrowTextCharacterColorVector(
  dataset: TextDataset,
  labelCount: number,
  getGlobalLabelIndex: (localLabelIndex: number) => number
): arrow.Vector<CharacterColorDataType> {
  const valueOffsets = new Int32Array(labelCount + 1);
  const colorValues: number[] = [];

  for (let localLabelIndex = 0; localLabelIndex < labelCount; localLabelIndex++) {
    valueOffsets[localLabelIndex] = colorValues.length / 4;
    const globalLabelIndex = getGlobalLabelIndex(localLabelIndex);
    const textLength = getTextLabelLength(dataset, globalLabelIndex);
    for (let characterIndex = 0; characterIndex < textLength; characterIndex++) {
      appendTextCharacterColor(colorValues, globalLabelIndex, characterIndex);
    }
  }
  valueOffsets[labelCount] = colorValues.length / 4;

  const values = Uint8Array.from(colorValues);
  const colorType = new arrow.FixedSizeList(4, new arrow.Field('values', new arrow.Uint8(), false));
  const textColorType = new arrow.List(new arrow.Field('colors', colorType, false));
  const colorValueData = new arrow.Data(new arrow.Uint8(), 0, values.length, 0, {
    [arrow.BufferType.DATA]: values
  });
  const colorData = new arrow.Data(colorType, 0, values.length / 4, 0, {}, [colorValueData]);
  const textColorData = new arrow.Data(
    textColorType,
    0,
    labelCount,
    0,
    {[arrow.BufferType.OFFSET]: valueOffsets},
    [colorData]
  );
  return new arrow.Vector([textColorData]) as arrow.Vector<CharacterColorDataType>;
}

function makeTextRowColors(labelCount: number): Uint8Array {
  const colors = new Uint8Array(labelCount * 4);
  for (let labelIndex = 0; labelIndex < labelCount; labelIndex++) {
    const colorIndex = labelIndex * 4;
    colors[colorIndex] = 96 + ((labelIndex * 17) % 128);
    colors[colorIndex + 1] = 172 + ((labelIndex * 11) % 72);
    colors[colorIndex + 2] = 210 + ((labelIndex * 7) % 45);
    colors[colorIndex + 3] = 255;
  }
  return colors;
}

function appendTextCharacterColor(
  colors: number[],
  labelIndex: number,
  characterIndex: number
): void {
  colors.push(
    clampColor(82 + ((labelIndex * 17 + characterIndex * 37) % 154)),
    clampColor(146 + ((labelIndex * 11 + characterIndex * 29) % 96)),
    clampColor(198 + ((labelIndex * 7 + characterIndex * 19) % 58)),
    255
  );
}

function makeDictionaryLabels(dictionaryChunkIndex: number): string[] {
  const labels = new Array<string>(DICTIONARY_LABEL_COUNT_PER_CHUNK);
  for (let dictionaryLabelIndex = 0; dictionaryLabelIndex < labels.length; dictionaryLabelIndex++) {
    labels[dictionaryLabelIndex] = makeDictionaryLabel(dictionaryChunkIndex, dictionaryLabelIndex);
  }
  return labels;
}

function makeUtf8Label(labelIndex: number): string {
  return `NODE ${String(labelIndex).padStart(6, '0')} / ARROW TEXT VECTOR`;
}

function makeDictionaryLabel(dictionaryChunkIndex: number, dictionaryLabelIndex: number): string {
  return `DICT ${String(dictionaryChunkIndex).padStart(2, '0')} KEY ${String(
    dictionaryLabelIndex
  ).padStart(4, '0')} / ARROW TEXT`;
}

function getTextLabelLength(dataset: TextDataset, labelIndex: number): number {
  const label =
    dataset.textType === 'dictionary'
      ? makeDictionaryLabel(
          getDictionaryChunkIndex(labelIndex),
          getDictionaryLabelIndex(labelIndex)
        )
      : makeUtf8Label(labelIndex);
  return Array.from(label).length;
}

function getDictionaryChunkIndex(labelIndex: number): number {
  return Math.floor(labelIndex / TEXT_DICTIONARY_ROWS_PER_CHUNK);
}

function getDictionaryLabelIndex(labelIndex: number): number {
  return (labelIndex * 37) % DICTIONARY_LABEL_COUNT_PER_CHUNK;
}

function getArrowTextInputRowChunkSize(dataset: TextDataset): number {
  return dataset.textType === 'dictionary' ? TEXT_DICTIONARY_ROWS_PER_CHUNK : dataset.labelCount;
}

function splitArrowVectorByRows<T extends arrow.DataType>(
  vector: arrow.Vector<T>,
  rowChunkSize: number
): arrow.Vector<T> {
  if (rowChunkSize <= 0 || rowChunkSize >= vector.length) {
    return vector;
  }

  const dataChunks: arrow.Data<T>[] = [];
  for (let rowStart = 0; rowStart < vector.length; rowStart += rowChunkSize) {
    const rowEnd = Math.min(rowStart + rowChunkSize, vector.length);
    const chunk = vector.slice(rowStart, rowEnd) as arrow.Vector<T>;
    const data = chunk.data[0];
    if (data) {
      dataChunks.push(data);
    }
  }
  return new arrow.Vector<T>(dataChunks);
}

function makeFloat32ArrowVector(values: Float32Array): arrow.Vector<arrow.Float32> {
  return arrow.makeVector(
    arrow.makeData({
      type: new arrow.Float32(),
      length: values.length,
      data: values
    })
  ) as arrow.Vector<arrow.Float32>;
}

function clampColor(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

export function isStreamingTextDatasetKind(
  value: TextDatasetKind
): value is StreamingTextDatasetKind {
  return value.endsWith('-stream');
}

export function isTextDictionaryDatasetKind(
  value: TextDatasetKind
): value is TextDictionaryDatasetKind {
  return value.endsWith('-dict');
}

export function getEagerTextDatasetKind(value: TextDatasetKind): EagerTextDatasetKind {
  return (
    isStreamingTextDatasetKind(value) ? value.slice(0, -'-stream'.length) : value
  ) as EagerTextDatasetKind;
}

export function getTextDatasetKind(
  tableSizeKind: TextTableSizeKind,
  sourceKind: TextSourceKind
): TextDatasetKind {
  const isStreamingDataset = isStreamingTextDatasetKind(tableSizeKind);
  const streamingSuffix = isStreamingDataset ? '-stream' : '';
  if (sourceKind === 'dictionary') {
    const rowCountKind = getTextDatasetRowCountKind(tableSizeKind);
    return `${rowCountKind}-dict${streamingSuffix}` as TextDatasetKind;
  }
  return tableSizeKind;
}

export function getTextInputKind(
  textDatasetKind: EagerTextDatasetKind,
  textColorKind: TextColorKind
): TextInputKind {
  return `${textDatasetKind}-${textColorKind}`;
}

export function getTextDatasetRowCountKind(value: TextDatasetKind): TextRowCountKind {
  const eagerDatasetKind = getEagerTextDatasetKind(value);
  if (isTextDictionaryDatasetKind(eagerDatasetKind)) {
    return eagerDatasetKind.slice(0, -'-dict'.length) as TextRowCountKind;
  }
  return eagerDatasetKind;
}

export function getTextDatasetSourceKind(value: TextDatasetKind): TextSourceKind {
  if (isTextDictionaryDatasetKind(getEagerTextDatasetKind(value))) {
    return 'dictionary';
  }
  return 'utf8';
}

export function getTextTableSizeKind(value: TextDatasetKind): TextTableSizeKind {
  const rowCountKind = getTextDatasetRowCountKind(value);
  return (
    isStreamingTextDatasetKind(value) ? `${rowCountKind}-stream` : rowCountKind
  ) as TextTableSizeKind;
}

export function isTextDatasetKind(value: string): value is TextDatasetKind {
  const eagerDatasetKind = getEagerTextDatasetKind(value as TextDatasetKind);
  return eagerDatasetKind in TEXT_DATASETS;
}

export function isArrowTextCharacterColorType(
  type: arrow.DataType | undefined
): type is CharacterColorDataType {
  return Boolean(type) && arrow.DataType.isList(type);
}

export function isArrowTextDictionarySource(
  sourceVectors: Pick<ArrowTextRendererSource, 'texts'>
): boolean {
  return arrow.DataType.isDictionary(sourceVectors.texts.type);
}

function getNow(): number {
  return globalThis.performance?.now() ?? Date.now();
}
