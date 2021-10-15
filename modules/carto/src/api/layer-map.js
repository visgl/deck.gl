import CartoLayer from '../layers/carto-layer';

const sharedPropMap = {
  filled: 'filled',
  radius: 'getPointRadius',
  opacity: 'opacity',
  fixedRadius: {pointRadiusUnits: v => (v ? 'meters' : 'pixels')},
  outline: 'stroked',
  isVisible: 'visible'
};

// Have to wrap in function to be able to import CartoLayer without errors
let layerMap;
export function getLayerMap() {
  if (!layerMap) {
    layerMap = {
      point: {
        Layer: CartoLayer,
        propMap: {
          color: 'getFillColor',
          ...sharedPropMap
        }
      },
      mvt: {
        Layer: CartoLayer,
        propMap: {
          color: 'getFillColor',
          ...sharedPropMap
        }
      }
    };
  }

  return layerMap;
}
