// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck} from '@deck.gl/core';
import {JSONConverter} from '@deck.gl/json';
import {JSON_CONFIGURATION} from './json-configuration-for-deck';
import JSON_DATA from './data/deck-props.json';
import {device, gl} from '@deck.gl/test-utils/vitest';

const getDeckProps = () => (globalThis.__JSDOM__ ? {gl} : {device});

test('JSONConverter#render', async () => {
  const jsonConverter = new JSONConverter({configuration: JSON_CONFIGURATION});
  expect(jsonConverter, 'JSONConverter created').toBeTruthy();

  const deckProps = jsonConverter.convert(JSON_DATA);
  expect(deckProps, 'JSONConverter converted correctly').toBeTruthy();

  await new Promise<void>((resolve, reject) => {
    const jsonDeck = new Deck({
      ...getDeckProps(),
      onAfterRender: () => {
        try {
          expect(jsonDeck, 'JSONConverter rendered').toBeTruthy();
          jsonDeck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      ...deckProps
    });
  });
});
