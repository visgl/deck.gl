// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {makeArrowFixedSizeListVector} from '@luma.gl/arrow';
import * as arrow from 'apache-arrow';
import {
  makeTraceGroups,
  TRACE_GROUPS,
  TRACE_SPAN_RECORD_WORD_LENGTH,
  type TraceGroupName
} from '../../experimental/gpu-trace-viewer/trace-data';

export type DeckTraceData = {
  count: number;
  spans: Uint32Array;
  textTable: arrow.Table;
  names: string[];
};

/** Builds one globally indexed span table shared by blocks, labels, and picking. */
export function makeDeckTraceData(count: number): DeckTraceData {
  const groups = makeTraceGroups(count);
  const spans = new Uint32Array(count * 4);
  const positions = new Float32Array(count * 2);
  const clipRects = new Float32Array(count * 4);
  const names = new Array<string>(count);
  const spanFloats = new Float32Array(spans.buffer);
  let rowIndex = 0;

  for (const group of groups) {
    const groupFloats = new Float32Array(
      group.data.buffer,
      group.data.byteOffset,
      group.data.length
    );
    for (let groupRowIndex = 0; groupRowIndex < group.count; groupRowIndex++, rowIndex++) {
      const sourceWordOffset = groupRowIndex * TRACE_SPAN_RECORD_WORD_LENGTH;
      const destinationWordOffset = rowIndex * 4;
      const start = groupFloats[sourceWordOffset]!;
      const duration = groupFloats[sourceWordOffset + 1]!;
      const lane = group.data[sourceWordOffset + 2]!;
      spanFloats[destinationWordOffset] = start;
      spanFloats[destinationWordOffset + 1] = duration;
      spans[destinationWordOffset + 2] = lane;
      spans[destinationWordOffset + 3] = group.groupIndex;
      positions[rowIndex * 2] = start;
      positions[rowIndex * 2 + 1] = lane + 0.5;
      clipRects[destinationWordOffset] = 0;
      clipRects[destinationWordOffset + 1] = -0.5;
      clipRects[destinationWordOffset + 2] = duration;
      clipRects[destinationWordOffset + 3] = 1;
      names[rowIndex] = makeTraceName(group.name, rowIndex);
    }
  }

  return {
    count,
    spans,
    names,
    textTable: new arrow.Table({
      positions: makeArrowFixedSizeListVector(new arrow.Float32(), 2, positions),
      texts: arrow.vectorFromArray(names, new arrow.Utf8()),
      clipRects: makeArrowFixedSizeListVector(new arrow.Float32(), 4, clipRects)
    })
  };
}

export function getTraceRow(
  data: DeckTraceData,
  rowIndex: number
): {
  name: string;
  group: TraceGroupName;
  start: number;
  duration: number;
  lane: number;
} | null {
  if (rowIndex < 0 || rowIndex >= data.count) return null;
  const wordOffset = rowIndex * 4;
  const floats = new Float32Array(data.spans.buffer, data.spans.byteOffset, data.spans.length);
  return {
    name: data.names[rowIndex]!,
    group: TRACE_GROUPS[data.spans[wordOffset + 3]!]!,
    start: floats[wordOffset]!,
    duration: floats[wordOffset + 1]!,
    lane: data.spans[wordOffset + 2]!
  };
}

function makeTraceName(group: TraceGroupName, rowIndex: number): string {
  const prefix = group === 'compute' ? 'μtask' : group === 'network' ? 'café' : 'parse';
  return `${group} ${prefix}-${String(rowIndex).padStart(6, '0')}`;
}
