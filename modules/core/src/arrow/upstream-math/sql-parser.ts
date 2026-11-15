// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {parseSQLExpression, parseSQLQuery} from '@math.gl/expressions/sql';
import type {SQLParser} from '../../types/layer-props';

/** The math.gl parser for SQL strings in Deck layer queries. */
export const sqlParser = {
  parseQuery: parseSQLQuery,
  parseExpression: parseSQLExpression
} satisfies SQLParser;
