// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {RADSource} from '@loaders.gl/splats';
import type {RADSplats, RADWorkerRequest, RADWorkerResponse} from './rad-source-client';
import {RADSelectionEngine} from './rad-selection';

let source: RADSource;
let selection: RADSelectionEngine;
const requests = new Map<number, AbortController>();

self.onmessage = async ({data: message}: MessageEvent<RADWorkerRequest>) => {
  if (message.type === 'cancel') {
    requests.get(message.id)?.abort();
    selection?.discard(message.id);
    return;
  }
  const controller = new AbortController();
  requests.set(message.id, controller);
  try {
    if (message.type === 'initialize') {
      source = new RADSource(message.data, {});
      const metadata = await source.getMetadata();
      respond({type: 'metadata', id: message.id, metadata});
    } else if (message.type === 'configure') {
      selection?.destroy();
      selection = new RADSelectionEngine(message.options);
      respond({type: 'ack', id: message.id});
    } else if (message.type === 'select') {
      const result = selection.select(message.view, message.viewVersion);
      respond(
        {type: 'selection', id: message.id, selection: result},
        result.frontier?.map(entry => entry.activeRows.buffer as ArrayBuffer)
      );
    } else if (message.type === 'admit' || message.type === 'discard') {
      selection[message.type](message.requestId);
      respond({type: 'ack', id: message.id});
    } else if (message.type === 'remove') {
      selection.remove(message.pageId);
      respond({type: 'ack', id: message.id});
    } else if (message.type === 'page') {
      const splats = await source.getChunkSplats(message.pageIndex, {
        signal: controller.signal,
        radChunk: {includeLoDTree: true, includeSphericalHarmonics: true}
      });
      controller.signal.throwIfAborted();
      const colors = makeFloatingPointColors(splats);
      selection.stage(message.id, message.pageIndex, splats);
      // Transfer, not clone, decoded storage. Shared views must transfer their buffer only once.
      const buffers = new Set<ArrayBuffer>();
      for (const value of [
        ...Object.values(splats),
        ...Object.values(splats.loaderData || {}),
        colors
      ]) {
        if (ArrayBuffer.isView(value) && value.buffer instanceof ArrayBuffer)
          buffers.add(value.buffer);
      }
      respond({type: 'page', id: message.id, page: {requestId: message.id, splats, colors}}, [
        ...buffers
      ]);
    }
  } catch (error) {
    respond({
      type: 'error',
      id: message.id,
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Error'
    });
  } finally {
    requests.delete(message.id);
  }
};

function respond(message: RADWorkerResponse, transfer: ArrayBuffer[] = []): void {
  self.postMessage(message, {transfer});
}

function makeFloatingPointColors(splats: RADSplats): Float32Array {
  const colors = new Float32Array(splats.splatCount * 4);
  for (let rowIndex = 0; rowIndex < splats.splatCount; rowIndex++) {
    for (let componentIndex = 0; componentIndex < 3; componentIndex++) {
      const sourceIndex = rowIndex * 3 + componentIndex;
      colors[rowIndex * 4 + componentIndex] = splats.sphericalHarmonicDcs
        ? 0.5 + 0.28209479177387814 * splats.sphericalHarmonicDcs[sourceIndex]
        : splats.colors[sourceIndex] / 255;
    }
    colors[rowIndex * 4 + 3] = 1;
  }
  return colors;
}
