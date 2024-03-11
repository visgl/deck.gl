import { fetchMap } from '@deck.gl/carto';
import test from 'tape-catch';

test('fetchMap#export', async t => {
    t.ok(fetchMap, 'fetchMap exists');
    t.end();
});
