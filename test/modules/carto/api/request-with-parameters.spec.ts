import test from 'tape-catch';
import {requestWithParameters} from '@deck.gl/carto/api/request-with-parameters';
import {V3_MINOR_VERSION} from '@deck.gl/carto/api/common';
import {withMockFetchMapsV3} from '../mock-fetch';
import {CartoAPIError} from '@deck.gl/carto';

test('requestWithParameters#cacheBaseURL', async t => {
  await withMockFetchMapsV3(async calls => {
    t.equals(calls.length, 0, '0 initial calls');

    await Promise.all([
      requestWithParameters({baseUrl: 'https://example.com/v1/baseURL', headers: {}}),
      requestWithParameters({baseUrl: 'https://example.com/v2/baseURL', headers: {}}),
      requestWithParameters({baseUrl: 'https://example.com/v2/baseURL', headers: {}})
    ]);

    t.equals(calls.length, 2, '2 unique requests');
  });
  t.end();
});

test('requestWithParameters#cacheHeaders', async t => {
  await withMockFetchMapsV3(async calls => {
    t.equals(calls.length, 0, '0 initial calls');

    await Promise.all([
      requestWithParameters({baseUrl: 'https://example.com/v1/headers', headers: {a: 1}}),
      requestWithParameters({baseUrl: 'https://example.com/v1/headers', headers: {a: 1}}),
      requestWithParameters({baseUrl: 'https://example.com/v1/headers', headers: {b: 1}})
    ]);

    t.equals(calls.length, 2, '2 unique requests');
  });
  t.end();
});

test('requestWithParameters#cacheParameters', async t => {
  await withMockFetchMapsV3(async calls => {
    t.equals(calls.length, 0, '0 initial calls');

    await Promise.all([
      requestWithParameters({
        baseUrl: 'https://example.com/v1/params',
        headers: {},
        parameters: {}
      }),
      requestWithParameters({
        baseUrl: 'https://example.com/v1/params',
        headers: {},
        parameters: {}
      }),
      requestWithParameters({
        baseUrl: 'https://example.com/v1/params',
        headers: {},
        parameters: {a: 1}
      })
    ]);

    t.equals(calls.length, 2, '2 unique requests');
  });
  t.end();
});

test('requestWithParameters#nocacheErrorContext', async t => {
  await withMockFetchMapsV3(
    async calls => {
      t.equals(calls.length, 0, '0 initial calls');

      let error1: Error | undefined;
      let error2: Error | undefined;

      try {
        await requestWithParameters({
          baseUrl: 'https://example.com/v1/errorContext',
          errorContext: {requestType: 'Map data'}
        });
        t.fail('request #1 should fail, but did not');
      } catch (error) {
        error1 = error as Error;
      }

      try {
        await requestWithParameters({
          baseUrl: 'https://example.com/v1/errorContext',
          errorContext: {requestType: 'SQL'}
        });
        t.fail('request #2 should fail, but did not');
      } catch (error) {
        error2 = error as Error;
      }

      t.deepEquals(
        (error1 as CartoAPIError).responseJson,
        {error: 'CustomError', customData: {abc: 'def'}},
        'responseJson',
        'propagates actual JSON error response '
      );
      t.equals(calls.length, 2, '2 unique requests, failures not cached');
      t.true(error1 instanceof CartoAPIError, 'error #1 type');
      t.is((error1 as CartoAPIError).errorContext.requestType, 'Map data', 'error #1 context');
      t.true(error2 instanceof CartoAPIError, 'error #2 type');
      t.is((error2 as CartoAPIError).errorContext.requestType, 'SQL', 'error #2 context');
    },
    // @ts-ignore
    (url: string, headers: HeadersInit) => {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({error: 'CustomError', customData: {abc: 'def'}})
      });
    }
  );
  t.end();
});

test('requestWithParameters#method', async t => {
  await withMockFetchMapsV3(async calls => {
    t.equals(calls.length, 0, '0 initial calls');

    await Promise.all([
      requestWithParameters({
        baseUrl: 'https://example.com/v1/params',
        headers: {},
        parameters: {object: {a: 1, b: 2}, array: [1, 2, 3], string: 'short'}
      }),
      requestWithParameters({
        baseUrl: `https://example.com/v1/params`,
        headers: {},
        parameters: {object: {a: 1, b: 2}, array: [1, 2, 3], string: 'long'.padEnd(10_000, 'g')}
      })
    ]);

    t.equals(calls.length, 2, '2 requests');

    // GET
    t.true(calls[0].url.startsWith('https://example.com/v1/params?'), 'get - url');
    t.equals(calls[0].method, undefined, 'get - method');
    t.equals(calls[0].body, undefined, 'get - body');
    t.deepEquals(
      Array.from(new URL(calls[0].url).searchParams.entries()),
      [
        ['v', '3.4'],
        ['deckglVersion', 'untranspiled source'],
        ['object', '{"a":1,"b":2}'],
        ['array', '[1,2,3]'],
        ['string', 'short']
      ],
      'get - params'
    );

    // POST
    const postBody = JSON.parse(calls[1].body as string);
    t.equals(calls[1].method, 'POST', 'post - method');
    t.equals(postBody.v, '3.4', 'post - body.v');
    t.equals(postBody.deckglVersion, 'untranspiled source', 'post - body.deckglVersion');
    t.deepEquals(postBody.object, {a: 1, b: 2}, 'post - body.object');
    t.deepEquals(postBody.array, [1, 2, 3], 'post - body.array');
    t.true(postBody.string.startsWith('longgg'), 'post - body.string');
    t.equals(calls[1].url, 'https://example.com/v1/params', 'post - url');
  });
  t.end();
});

test('requestWithParameters#precedence', async t => {
  await withMockFetchMapsV3(async calls => {
    t.equals(calls.length, 0, '0 initial calls');

    await Promise.all([
      requestWithParameters({
        baseUrl: 'https://example.com/v1/params?test=1',
        headers: {},
        parameters: {}
      }),
      requestWithParameters({
        baseUrl: `https://example.com/v1/params?test=2&v=3.0`,
        headers: {},
        parameters: {}
      }),
      requestWithParameters({
        baseUrl: `https://example.com/v1/params?test=3&v=3.0`,
        headers: {},
        parameters: {v: '3.2'}
      })
    ]);

    t.equals(calls.length, 3, '3 requests');

    const [url1, url2, url3] = calls.map(call => new URL(call.url));

    t.equals(url1.searchParams.get('v'), V3_MINOR_VERSION, 'unset');
    t.equals(url2.searchParams.get('v'), V3_MINOR_VERSION, 'default overrides url');
    t.equals(url3.searchParams.get('v'), '3.2', 'param overrides default');
  });
  t.end();
});

test('requestWithParameters#maxLengthURL', async t => {
  await withMockFetchMapsV3(async calls => {
    t.equals(calls.length, 0, '0 initial calls');

    await Promise.all([
      requestWithParameters({
        baseUrl: 'https://example.com/v1/item/1'
      }),
      requestWithParameters({
        baseUrl: 'https://example.com/v1/item/2',
        maxLengthURL: 10
      }),
      requestWithParameters({
        baseUrl: `https://example.com/v1/item/3`,
        parameters: {content: 'long'.padEnd(10_000, 'g')} // > default limit
      }),
      requestWithParameters({
        baseUrl: `https://example.com/v1/item/4`,
        parameters: {content: 'long'.padEnd(10_000, 'g')},
        maxLengthURL: 15_000
      })
    ]);

    t.equals(calls.length, 4, '4 requests');
    t.deepEquals(
      calls.map(({method}) => method ?? 'GET'),
      ['GET', 'POST', 'POST', 'GET'],
      'request method'
    );
  });
  t.end();
});
