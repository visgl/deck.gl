export function sortData(data, groupBy) {
  if (!data) return [];

  calculateRange(data);

  switch (groupBy) {
    case 'Country': {
      const dataByCountry = {};
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
      const dataByLat = Array.from({length: 12}, (_, i) => ({
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

function calculateRange(data) {
  if (data[0].min) return;

  for (const station of data) {
    let min = null;
    let max = null;

    for (const p of station.meanTemp) {
      if (!min || min[1] > p[1]) {
        min = p;
      }
      if (!max || max[1] <= p[1]) {
        max = p;
      }
    }
    station.min = min;
    station.max = max;
  }
}
