// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import deckLog from '../utils/log';
import {getLoggers} from './loggers';

/* debug utility */

let loggers: Record<string, Function> = {};

// Conditionally load default loggers in development mode
// eslint-disable-next-line
if (process.env.NODE_ENV !== 'production') {
  loggers = getLoggers(deckLog);
}

export function register(handlers: Record<string, Function>): void {
  loggers = handlers;
}

export default function debug(eventType: string, arg1?: any, arg2?: any, arg3?: any): void {
  if (deckLog.level > 0 && loggers[eventType]) {
    // Not using rest parameters to defeat perf hit from array construction
    loggers[eventType].call(null, arg1, arg2, arg3);
  }
}
