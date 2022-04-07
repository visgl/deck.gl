import {log} from '@deck.gl/core';

export function assert(condition: unknown, message?: string): asserts condition {
  log.assert(condition, message);
}
