// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/** A geocoder */
export type Geocoder = {
  name: string;
  geocode(address: string, apiKey: string): Promise<{longitude: number; latitude: number} | null>;
};
