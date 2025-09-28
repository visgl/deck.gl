// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {registerLoaders} from '@loaders.gl/core';
import {ImageLoader} from '@loaders.gl/images';

import log from '../utils/log';
import {register} from '../debug/index';
import jsonLoader from '../utils/json-loader';

declare global {
  const __VERSION__: string;
}

function checkVersion() {
  // Version detection using typescript plugin.
  // Fallback for tests and SSR since global variable is defined by esbuild.
  const version =
    typeof __VERSION__ !== 'undefined'
      ? __VERSION__
      : globalThis.DECK_VERSION || 'untranspiled source';

  // Note: a `deck` object not created by deck.gl may exist in the global scope
  const existingVersion = globalThis.deck && globalThis.deck.VERSION;

  if (existingVersion && existingVersion !== version) {
    throw new Error(`deck.gl - multiple versions detected: ${existingVersion} vs ${version}`);
  }

  if (!existingVersion) {
    log.log(1, `deck.gl ${version}`)();

    globalThis.deck = {
      ...globalThis.deck,
      VERSION: version,
      version,
      log,
      // experimental
      _registerLoggers: register
    };

    registerLoaders([
      jsonLoader,
      // @ts-expect-error non-standard Loader format
      [ImageLoader, {imagebitmap: {premultiplyAlpha: 'none'}}]
    ]);
  }

  return version;
}

export const VERSION = checkVersion();
