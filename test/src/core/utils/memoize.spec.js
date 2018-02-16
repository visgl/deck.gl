import test from 'tape-catch';
import memoize from 'deck.gl/core/utils/memoize';
import {spy} from 'probe.gl/test';

const sampleCompute = ({vector, object, number}) => {
  return `${vector.join(',')}:${object.name}:number`;
};
const sampleVector = [0, 0, 0];
const sampleObject = {name: 'Object'};
const sampleObject2 = {name: 'Object'};

const TEST = {
  FUNC: sampleCompute,
  CASES: [
    {
      parameters: {vector: sampleVector, object: sampleObject, number: 0},
      shouldRecompute: true
    },
    {
      parameters: {vector: sampleVector, object: sampleObject, number: 0},
      shouldRecompute: false
    },
    {
      parameters: {vector: sampleVector.slice(), object: sampleObject, number: 0},
      shouldRecompute: false
    },
    {
      parameters: {vector: sampleVector, object: sampleObject, number: 1},
      shouldRecompute: true
    },
    {
      parameters: {vector: sampleVector, object: {name: 'Object'}, number: 1},
      shouldRecompute: true
    },
    {
      parameters: {vector: sampleVector, object: sampleObject2, number: 1},
      shouldRecompute: true
    }
  ]
};

test('utils#memoize', t => {
  const spy1 = spy(TEST, 'FUNC');
  const memoized = memoize(TEST.FUNC);

  TEST.CASES.forEach(testCase => {
    const result = memoized(testCase.parameters);
    t.deepEquals(result, sampleCompute(testCase.parameters), 'returns correct result');
    t.is(
      spy1.called,
      testCase.shouldRecompute,
      testCase.shouldRecompute ? 'should recompute' : 'should not recompute'
    );
    spy1.reset();
  });

  t.end();
});
