import {MapType, RequestType} from './maps-api-common';
export declare type APIErrorContext = {
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
export declare class CartoAPIError extends Error {
  /** Source error from server */
  error: Error;
  /** Context (API call & parameters) in which error occured */
  errorContext: APIErrorContext;
  /** Response from server */
  response?: Response;
  constructor(error: Error, errorContext: APIErrorContext, response?: Response);
}
// # sourceMappingURL=carto-api-error.d.ts.map
