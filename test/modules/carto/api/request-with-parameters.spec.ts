import test from 'tape-catch';
import {requestWithParameters} from '@deck.gl/carto/api/request-with-parameters';
import {withMockFetchMapsV3} from '../mock-fetch';

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

test('requestWithParameters#cacheAccessToken', async t => {
  await withMockFetchMapsV3(async calls => {
    t.equals(calls.length, 0, '0 initial calls');

    const responses = await Promise.all([
      requestWithParameters({
        baseUrl: 'https://example.com/v1/accessToken',
        accessToken: '<TOKEN#1>'
      }),
      requestWithParameters({
        baseUrl: 'https://example.com/v1/accessToken',
        accessToken: '<TOKEN#2>'
      }),
      requestWithParameters({
        baseUrl: 'https://example.com/v1/accessToken',
        accessToken: '<TOKEN#3>'
      }),
      requestWithParameters({
        baseUrl: 'https://example.com/v1/accessToken',
        accessToken: ''
      })
    ]);

    t.equals(calls.length, 1, '1 unique request');
    t.equals(responses.length, 4, '4 responses');
    t.equals(responses[0].accessToken, '<TOKEN#1>', 'response 1');
    t.equals(responses[1].accessToken, '<TOKEN#2>', 'response 2');
    t.equals(responses[2].accessToken, '<TOKEN#3>', 'response 3');
    t.equals(responses[3].accessToken, undefined, 'response 4');
  });
  t.end();
});
