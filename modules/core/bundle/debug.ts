// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// @ts-nocheck
import {getLoggers} from '@deck.gl/core/debug/loggers';

const loggers = getLoggers(globalThis.deck.log);
globalThis.deck._registerLoggers(loggers);

export {loggers};
