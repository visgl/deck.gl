// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {injectAccessToken} from '../../src/layers/utils';

test('utils#injectAccessToken', t => {
  t.test('should add Authorization header when not present', t => {
    const loadOptions = {
      fetch: {
        headers: {}
      }
    };
    const accessToken = 'test-token';
    const result = injectAccessToken(loadOptions, accessToken);

    t.deepEqual(result, {
      fetch: {
        headers: {
          Authorization: 'Bearer test-token'
        }
      }
    }, 'should return new object with Authorization header');
    t.deepEqual(loadOptions.fetch.headers, {}, 'should not mutate original object');
    t.end();
  });

  t.test('should not modify existing Authorization header', t => {
    const loadOptions = {
      fetch: {
        headers: {
          Authorization: 'Bearer existing-token'
        }
      }
    };
    const accessToken = 'test-token';
    const result = injectAccessToken(loadOptions, accessToken);

    t.deepEqual(result, loadOptions, 'should return original object');
    t.equal(result.fetch.headers.Authorization, 'Bearer existing-token', 'should preserve existing token');
    t.end();
  });

  t.test('should handle missing fetch object', t => {
    const loadOptions = {};
    const accessToken = 'test-token';
    const result = injectAccessToken(loadOptions, accessToken);

    t.deepEqual(result, {
      fetch: {
        headers: {
          Authorization: 'Bearer test-token'
        }
      }
    }, 'should create fetch object with Authorization header');
    t.deepEqual(loadOptions, {}, 'should not mutate original object');
    t.end();
  });

  t.test('should handle missing headers object', t => {
    const loadOptions = {
      fetch: {}
    };
    const accessToken = 'test-token';
    const result = injectAccessToken(loadOptions, accessToken);

    t.deepEqual(result, {
      fetch: {
        headers: {
          Authorization: 'Bearer test-token'
        }
      }
    }, 'should create headers object with Authorization header');
    t.deepEqual(loadOptions.fetch, {}, 'should not mutate original object');
    t.end();
  });

  t.end();
}); 