// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// The fflate decoder supports synchronous parsing without WASM preloading.
import {GZipFflateDecompressor} from '@loaders.gl/compression/gzip-decompressor-fflate';

type ReadPackedOptions = {
  compression: null | 'gzip';
};

// Optimized (100X speed improvement) reading function for binary data
export function readPackedTypedArray(TypedArray, pbf, obj, options?: ReadPackedOptions) {
  const end = pbf.type === 2 ? pbf.readVarint() + pbf.pos : pbf.pos + 1;
  const data = pbf.buf.buffer.slice(pbf.pos, end);

  if (options?.compression === 'gzip') {
    const decompressor = new GZipFflateDecompressor();
    const decompressedData = decompressor.decompressSync(data);
    obj.value = new TypedArray(decompressedData);
  } else {
    obj.value = new TypedArray(data);
  }

  pbf.pos = end;
  return obj.value;
}
