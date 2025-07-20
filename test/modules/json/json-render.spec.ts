// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {Deck} from '@deck.gl/core';
import {JSONConverter} from '@deck.gl/json';
import {JSON_CONFIGURATION} from './json-configuration-for-deck';
import JSON_DATA from './data/deck-props.json';
import {gl} from '@deck.gl/test-utils';

test('JSONConverter#render', t => {
  const jsonConverter = new JSONConverter({configuration: JSON_CONFIGURATION});

  const deckProps = jsonConverter.convert(JSON_DATA);
  t.ok(deckProps, 'JSONConverter converted correctly');
  const jsonDeck = new Deck({
    gl,
    onAfterRender: () => {
      t.ok(jsonDeck, 'JSONConverter rendered');
      jsonDeck.finalize();
      t.end();
    },
    ...deckProps
  });
});
