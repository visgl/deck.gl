import test from 'tape-catch';
import {DataFilterExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

test.only('DataFilterExtension', t => {
  const testCases = [
    {
      props: {
        data: [
          {position: [-122.453, 37.782], timestamp: 120, entry: 13567, exit: 4802},
          {position: [-122.454, 37.781], timestamp: 140, entry: 144, exit: 5493}
        ],
        getPosition: d => d.position,
        getFilterValue: d => d.timestamp,
        extensions: [new DataFilterExtension()]
      },
      onAfterRender: ({layer}) => {
        // layer.state.model
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});
