// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

interface AirportFeature {
  properties: {
    OBJECTID: number;
    NAME: string;
    CITY: string;
    STATE: string;
    LATITUDE: number;
    LONGITUDE: number;
    [key: string]: unknown;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface AirportsResponse {
  type: string;
  features: AirportFeature[];
}

export interface Airport {
  id: number;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  coordinates: [number, number];
}
