// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_registerColumnConverter} from '@deck.gl/core';
import type {Vector} from 'apache-arrow';
import {ArrowConverter} from '../lib/luma-upstream/arrow-converter';

export * from '../lib/luma-upstream/arrow-converter';
export * from '../lib/luma-upstream/arrow-conversion-utils';
export * from '../lib/luma-upstream/arrow-input';

/** Enables Arrow columns on standard layers using the optional core/arrow converter. */
export function registerArrowConverter(): void {
  _registerColumnConverter(device => {
    const converter = new ArrowConverter(device);
    return {convert: (source, options) => converter.convert(source as Vector, options)};
  });
}
