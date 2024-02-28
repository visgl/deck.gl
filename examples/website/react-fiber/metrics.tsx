import React from 'react';
import {Flex, LabeledValue} from '@adobe/react-spectrum';

export function Metrics(props) {
  const {data} = props;

  const output = Object.entries(data).reduce((prev, next, i) => {
    if (prev[i]) {
      prev[i] = next;
    } else {
      prev.push(next);
    }

    return prev;
  }, []);

  return (
    <Flex direction="column" gap="size-100">
      {output.map(pairs => {
        return (
          <LabeledValue key={pairs[0]} label={pairs[0]} value={pairs[1]} labelPosition="side" />
        );
      })}
    </Flex>
  );
}
