// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {parseAsString} from 'nuqs/server';

/**
 * Parser for selected airport ID URL parameter
 */
export const selectedParser = parseAsString.withDefault('').withOptions({
  clearOnDefault: true
});

/**
 * Parser for search query URL parameter
 */
export const searchParser = parseAsString.withDefault('');
