const blackList = [
  'projectionMode',
  'modelMatrix'
];

/* eslint-disable complexity */
/*
 * infer parameter type from a prop
 */
export function propToParam(key, value) {
  if (blackList.indexOf(key) >= 0) {
    return null;
  }

  const param = {
    name: key,
    displayName: key,
    value
  };

  switch (typeof value) {
  case 'boolean':
    return {...param, type: 'checkbox'};
  case 'number':
    if (/pixels|width|height|size|scale|radius|limit/i.test(key)) {
      param.max = 100;
      param.step = 1;
    } else {
      param.max = 1;
      param.step = 0.01;
    }
    return {...param, type: 'range', min: 0};
  case 'function':
    if (key.indexOf('get') === 0) {
      // is accessor
      return {...param, type: 'function'};
    }
    break;
  case 'string':
    if (/\.(png|jpg|jpeg|gif)/i.test(value)) {
      return {...param, type: 'link'};
    }
    break;
  case 'object':
    if (/color/i.test(key) && value && Number.isFinite(value[0])) {
      return {...param, type: 'color'};
    }
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
export function getLayerParams(layer) {
  const paramsMap = {};
  const paramsArray = [];

  Object.keys(layer.props).forEach(key => {
    const param = propToParam(key, layer.props[key]);
    if (param) {
      paramsArray.push(param);
    }
  });

  paramsArray.sort((p1, p2) => p1.type.localeCompare(p2.type));

  paramsArray.forEach(param => {
    paramsMap[param.name] = param;
  });

  return paramsMap;
}
