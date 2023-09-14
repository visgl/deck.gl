import test from 'tape-promise/tape';
import {Deck} from '@deck.gl/core';
import {JSONConverter} from '@deck.gl/json';
import configuration from './json-configuration-for-deck';
import JSON_DATA from './data/deck-props.json';
import {gl} from '@deck.gl/test-utils';

test('JSONConverter#render', t => {
  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');

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
