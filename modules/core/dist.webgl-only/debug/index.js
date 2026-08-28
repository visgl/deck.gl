// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import deckLog from "../utils/log.js";
import { getLoggers } from "./loggers.js";
/* debug utility */
let loggers = {};
// Conditionally load default loggers in development mode
// eslint-disable-next-line
if (process.env.NODE_ENV !== 'production') {
    loggers = getLoggers(deckLog);
}
export function register(handlers) {
    loggers = handlers;
}
export default function debug(eventType, arg1, arg2, arg3) {
    if (deckLog.level > 0 && loggers[eventType]) {
        // Not using rest parameters to defeat perf hit from array construction
        loggers[eventType].call(null, arg1, arg2, arg3);
    }
}
//# sourceMappingURL=index.js.map