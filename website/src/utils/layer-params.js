const blackList = ['coordinateSystem', 'modelMatrix'];

/* eslint-disable complexity */
/*
 * infer parameter type from a prop
 */
export function propToParam(key, propType, value) {
  if (blackList.indexOf(key) >= 0) {
    return null;
  }

  const param = {
    name: key,
    displayName: key,
    value
  };

  const type = !propType || propType.type === 'unknown' ? typeof value : propType.type;

  switch (type) {
    case 'boolean':
      return {...param, type: 'checkbox'};
    case 'number':
      param.min = propType && 'min' in propType ? propType.min : 0;
      param.max = propType && 'max' in propType ? propType.max : 100;
      return {...param, type: 'range', step: param.max === 100 ? 1 : 0.01};
    case 'accessor':
      return {...param, type: 'function'};
    case 'string':
      if (/\.(png|jpg|jpeg|gif)/i.test(value)) {
        return {...param, type: 'link'};
      }
      break;
    case 'color':
      return {...param, type: 'color'};
    case 'object':
      if (/mapping|domain|range/i.test(key)) {
        return {...param, type: 'json'};
      }
      break;
    default:
  }
  return null;
}
/* eslint-enable complexity */

/*
 * get array of parameters from a layer's default props
 * sorted by type
 */
export function getLayerParams(layer, propParameters = {}) {
  const paramsMap = {};
  const paramsArray = [];

  for (const key in layer.props) {
    if (propParameters[key]) {
      paramsArray.push({name: key, ...propParameters[key]});
    } else {
      const LAYER_PROPTYPES = layer.constructor._propTypes[key];
      const param = propToParam(key, LAYER_PROPTYPES, layer.props[key]);
      if (param) {
        paramsArray.push(param);
      }
    }
  }

  paramsArray.sort((p1, p2) => p1.type.localeCompare(p2.type));

  paramsArray.forEach(param => {
    paramsMap[param.name] = param;
  });

  return paramsMap;
}
