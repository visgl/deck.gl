import {_deepEqual as deepEqual} from '@deck.gl/core';
import type {TilejsonResult} from '../sources/types';

/**
 * Adds access token to Authorization header in loadOptions
 */
export function injectAccessToken(loadOptions: any, accessToken: string): void {
  if (!loadOptions?.fetch?.headers?.Authorization) {
    loadOptions.fetch = {
      ...loadOptions.fetch,
      headers: {...loadOptions.fetch?.headers, Authorization: `Bearer ${accessToken}`}
    };
  }
}

export const TilejsonPropType = {
  type: 'object' as const,
  value: null as null | TilejsonResult,
  validate: (value: TilejsonResult, propType) =>
    (propType.optional && value === null) ||
    (typeof value === 'object' &&
      Array.isArray(value.tiles) &&
      value.tiles.every(url => typeof url === 'string')),
  equal(value1, value2) {
    return deepEqual(value1, value2, 2);
  },
  async: true
};
