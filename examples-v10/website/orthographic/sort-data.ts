// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Station, StationGroup} from './app';

export function sortData(data: Station[], groupBy: 'Country' | 'Latitude'): StationGroup[] {
  if (!data) return [];

  switch (groupBy) {
    case 'Country': {
      const dataByCountry: {[country: string]: StationGroup} = {};
      for (const station of data) {
        const country = (dataByCountry[station.country] = dataByCountry[station.country] || {
          name: station.country,
          stations: []
        });
        country.stations.push(station);
      }
      return Object.values(dataByCountry).sort((d1, d2) => (d1.name < d2.name ? -1 : 1));
    }

    case 'Latitude': {
      const dataByLat: StationGroup[] = Array.from({length: 12}, (_, i) => ({
        name: `${-90 + i * 15}°/${-75 + i * 15}°`,
        stations: []
      }));
      for (const station of data) {
        const index = Math.floor((station.latitude + 90) / 15);
        dataByLat[index].stations.push(station);
      }
      return dataByLat;
    }

    default:
      throw new Error('Unknown groupBy mode');
  }
}
