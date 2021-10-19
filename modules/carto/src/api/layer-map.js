import CartoLayer from '../layers/carto-layer';

const sharedPropMap = {
  color: 'getFillColor',
  extruded: 'enable3d',
  filled: 'filled',
  fixedRadius: {pointRadiusUnits: v => (v ? 'meters' : 'pixels')},
  getLineColor: 'strokeColor',
  highlightColor: 'highlightColor',
  isVisible: 'visible',
  opacity: 'opacity',
  outline: 'stroked',
  // Hack: match Builder output
  // radius: 'getPointRadius',
  radius: {getPointRadius: r => r / 4},
  wireframe: 'wireframe'
};

// Have to wrap in function to be able to import CartoLayer without errors
let layerMap;
export function getLayerMap() {
  if (!layerMap) {
    layerMap = {
      point: {
        Layer: CartoLayer,
        propMap: {
          ...sharedPropMap
        }
      },
      mvt: {
        Layer: CartoLayer,
        propMap: {
          ...sharedPropMap
        }
      }
    };
  }

  return layerMap;
}
