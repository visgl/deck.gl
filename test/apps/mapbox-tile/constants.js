export const MAP_STYLE = {
  stroked: false,

  getLineColor: [192, 192, 192],

  getFillColor: f => {
    if (f.properties['DisplayNaturalFeature.type'] === 'WATER') {
      return [120, 120, 120];
    }
    if (f.properties['PlaceAreaFeature.categoryName'] === 'PARK') {
      return [100, 180, 90];
    }
    return [122, 122, 122];
  },

  getLineWidth: f => {
    if (f.properties.layer === 'roads') {
      switch (f.properties['Segment.roadClass']) {
        case 'MAJOR_ARTERY':
          return 10;
        case 'MINOR_ARTERY':
          return 6;
        case 'MOTORWAY':
          return 14;
        default:
          return 3;
      }
    }
    return 1;
  },
  lineWidthMinPixels: 1,

  getPointRadius: 100,
  pointRadiusMinPixels: 2
};
