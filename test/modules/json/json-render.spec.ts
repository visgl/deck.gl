// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck} from '@deck.gl/core';
import {JSONConverter} from '@deck.gl/json';
import configuration from './json-configuration-for-deck';
import JSON_DATA from './data/deck-props.json';
import {gl} from '@deck.gl/test-utils';

test('JSONConverter#render', () => {
  const jsonConverter = new JSONConverter({configuration});
  expect(jsonConverter, 'JSONConverter created').toBeTruthy();

  const deckProps = jsonConverter.convert(JSON_DATA);
  expect(deckProps, 'JSONConverter converted correctly').toBeTruthy();
  const jsonDeck = new Deck({
    gl,
    onAfterRender: () => {
      expect(jsonDeck, 'JSONConverter rendered').toBeTruthy();
      jsonDeck.finalize();
    },
    ...deckProps
  });
});
