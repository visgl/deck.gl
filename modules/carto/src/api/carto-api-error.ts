import {MapType, RequestType} from './maps-api-common';

export type APIErrorContext = {
  requestType: RequestType;
  mapId?: string;
  connection?: string;
  source?: string;
  type?: MapType;
};

/**
 *
 * Custom error for reported errors in CARTO Maps API.
 * Provides useful debugging information in console and context for applications.
 *
 */
export class CartoAPIError extends Error {
  /** Source error from server */
  error: Error;

  /** Context (API call & parameters) in which error occured */
  errorContext: APIErrorContext;

  /** Response from server */
  response?: Response;

  constructor(error: Error, errorContext: APIErrorContext, response?: Response) {
    let responseString = 'Failed to connect';
    if (response) {
      responseString = 'Server returned: ';
      if (response.status === 400) {
        responseString += 'Bad request';
      } else if (response.status === 401 || response.status === 403) {
        responseString += 'Unauthorized access';
      } else if (response.status === 404) {
        responseString += 'Not found';
      } else {
        responseString += 'Error';
      }

      responseString += ` (${response.status}):`;
    }
    responseString += ` ${error.message || error}`;

    let message = `${errorContext.requestType} API request failed`;
    message += `\n${responseString}`;
    for (const key of Object.keys(errorContext)) {
      if (key === 'requestType') continue; // eslint-disable-line no-continue
      message += `\n${formatErrorKey(key)}: ${errorContext[key]}`;
    }
    message += '\n';

    super(message);

    this.name = 'CartoAPIError';
    this.response = response;
    this.error = error;
    this.errorContext = errorContext;
  }
}

/**
 * Converts camelCase to Camel Case
 */
function formatErrorKey(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}
