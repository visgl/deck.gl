// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/** A geocoder that translates an address string into a location */
export type Geocoder = {
  /** The name of the geocoder, e.g. google, mapbox, ... */
  name: string;
  /** Does the geocoder require an api key? */
  requiresApiKey?: boolean;
  /** A string that can be used to indicate the accepted format */
  placeholderLocation?: string;
  /** Calls the geocoder service, translating an address string into a location */
  geocode(address: string, apiKey: string): Promise<{longitude: number; latitude: number} | null>;
};
