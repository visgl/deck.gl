// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {parseSQLExpression, parseSQLPredicate, parseSQLQuery} from '@math.gl/core/sql';
import type {SQLParser} from '../../types/layer-props';

/** The math.gl parser for SQL strings in Deck column queries. */
export const sqlParser = {
  parseQuery: parseSQLQuery,
  parseExpression: parseSQLExpression,
  parsePredicate: parseSQLPredicate
} satisfies SQLParser;
