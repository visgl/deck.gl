export default {
  'BART Stations': {
    type: 'ScatterplotLayer',
    data:
      'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/bart-stations.json',
    getPosition: d => d.coordinates,
    getRadius: d => Math.sqrt(d.entries),
    getColor: [255, 200, 0]
  },
  'BART Lines': {
    type: 'PathLayer',
    data:
      'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/bart-lines.json',
    getPath: d => d.path,
    getColor: d => d.color.match(/\w\w/g).map(x => parseInt(x, 16)),
    getWidth: 50
  },
  'SF Zipcodes': {
    type: 'SolidPolygonLayer',
    data:
      'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/sf-zipcodes.json',
    getPolygon: d => d.contour,
    getFillColor: d => [d.population / 200, 100, 0]
  }
};
