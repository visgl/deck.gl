/*
import test from 'tape-catch';
import {Deck} from '@deck.gl/core';
import {_JSONConverter as JSONConverter} from '@deck.gl/json';
./no-longer-supported/deck-json-converter.spec
import {configuration, JSON_DATA} from './deck-json-converter.spec';

test('JSONConverter#render', t => {
  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');

  const deckProps = jsonConverter.convertJson(JSON_DATA);
  t.ok(deckProps, 'JSONConverter converted correctly');

  const jsonDeck = new Deck(
    Object.assign(
      {
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
*/
