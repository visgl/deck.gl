// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {mergeLoadOptions} from '../../src/layers/utils';

test('utils#mergeLoadOptions', t => {
  const accessToken = 'test-token';
  const loadOptions = {
    fetch: {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  };

  const result = mergeLoadOptions(loadOptions, {
    fetch: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });

  t.deepEqual(result, {
    fetch: {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  });

  // Test with no existing headers
  const loadOptions2 = {
    fetch: {}
  };

  const result2 = mergeLoadOptions(loadOptions2, {
    fetch: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });

  t.deepEqual(result2, {
    fetch: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });

  // Test with no existing fetch
  const loadOptions3 = {};

  const result3 = mergeLoadOptions(loadOptions3, {
    fetch: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });

  t.deepEqual(result3, {
    fetch: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });

  // Test with no additional options
  const result4 = mergeLoadOptions(loadOptions, null);
  t.deepEqual(result4, loadOptions);

  // Test with no load options
  const result5 = mergeLoadOptions(null, loadOptions);
  t.deepEqual(result5, loadOptions);
});
