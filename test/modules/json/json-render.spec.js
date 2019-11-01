import test from 'tape-catch';
import {Deck} from '@deck.gl/core';
import {JSONConverter} from '@deck.gl/json';
import configuration from './json-configuration-for-deck';
import JSON_DATA from './data/deck-props.json';

test('JSONConverter#render', t => {
  const {gl} = require('@deck.gl/test-utils');
  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');

  const deckProps = jsonConverter.convert(JSON_DATA);
  t.ok(deckProps, 'JSONConverter converted correctly');

  const jsonDeck = new Deck(
    Object.assign(
      {
        gl,
        onAfterRender: () => {
          t.ok(jsonDeck, 'JSONConverter rendered');
          jsonDeck.finalize();
          t.end();
        }
      },
      deckProps
    )
  );
});
