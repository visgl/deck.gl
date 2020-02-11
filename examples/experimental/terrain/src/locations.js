export const getViewState = location => {
  switch (location) {
    case 'nyc':
      return {
        latitude: 40.731073741099145,
        longitude: -73.98384590997735,
        zoom: 13,
        pitch: 60,
        bearing: 0
      };
    case 'melbourne':
      return {
        latitude: -37.817349971409804,
        longitude: 144.9656091270625,
        zoom: 11.5,
        pitch: 60,
        bearing: 0
      };
    case 'dallas':
      return {
        latitude: 32.8,
        longitude: -97.03755072303063,
        zoom: 10,
        pitch: 60,
        bearing: 1
      };
    case 'la':
      return {
        latitude: 34.05243053697479,
        longitude: -118.24128468120529,
        zoom: 10,
        pitch: 60,
        bearing: 45
      };
    case 'sf':
      return {
        latitude: 37.6,
        longitude: -122.11731552444683,
        zoom: 10,
        pitch: 60,
        bearing: 25
      };
    case 'helens':
    default:
      return {
        latitude: 46.24,
        longitude: -122.18,
        zoom: 11.5,
        bearing: 140,
        pitch: 60
      };
  }
};
