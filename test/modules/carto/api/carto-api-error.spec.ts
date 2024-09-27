// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-catch';

import {CartoAPIError} from '@deck.gl/carto';

[
  {
    title: '400 error',
    error: new Error('Bad'),
    errorContext: {requestType: 'Map data'},
    response: {status: 400},
    message: `
Map data API request failed
Server returned: Bad request (400): Bad
`
  },
  {
    title: '401 error',
    error: new Error('Unauthorized'),
    errorContext: {requestType: 'Map data'},
    response: {status: 401},
    message: `
Map data API request failed
Server returned: Unauthorized access (401): Unauthorized
`
  },
  {
    title: '403 error',
    error: new Error('Forbidden'),
    errorContext: {requestType: 'Map data'},
    response: {status: 403},
    message: `
Map data API request failed
Server returned: Unauthorized access (403): Forbidden
`
  },
  {
    title: '404 error',
    error: new Error('Not found'),
    errorContext: {requestType: 'Map data'},
    response: {status: 404},
    message: `
Map data API request failed
Server returned: Not found (404): Not found
`
  },
  {
    title: '500 error',
    error: new Error('Source error'),
    errorContext: {requestType: 'Map data'},
    response: {status: 500},
    message: `
Map data API request failed
Server returned: Error (500): Source error
`
  },
  {
    title: 'Full error context: instantiation',
    error: new Error('Source error'),
    errorContext: {
      requestType: 'Map instantiation',
      connection: 'connectionName',
      source: 'sourceName',
      type: 'query'
    },
    response: {status: 500},
    message: `
Map instantiation API request failed
Server returned: Error (500): Source error
Connection: connectionName
Source: sourceName
Type: query
`
  },
  {
    title: 'Full error context: public map',
    error: new Error('Source error'),
    errorContext: {
      requestType: 'Public map',
      mapId: 'abcd'
    },
    response: {status: 500},
    message: `
Public map API request failed
Server returned: Error (500): Source error
Map Id: abcd
`
  },
  {
    title: 'Full error context: custom value',
    error: new Error('Source error'),
    errorContext: {
      requestType: 'Tile stats',
      connection: 'connectionName',
      source: 'sourceName',
      type: 'tileset',
      customKey: 'customValue'
    },
    response: {status: 500},
    message: `
Tile stats API request failed
Server returned: Error (500): Source error
Connection: connectionName
Source: sourceName
Type: tileset
Custom Key: customValue
`
  }
].forEach(({title, error, errorContext, response, message}) => {
  test(`CartoAPIError: ${title}`, t => {
    const cartoAPIError = new CartoAPIError(error, errorContext, response);

    t.ok(cartoAPIError, 'Error created');
    t.equal(cartoAPIError.message, message.slice(1), 'Correct error message produced');

    t.end();
  });
});
