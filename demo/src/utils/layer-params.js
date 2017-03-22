/*
 * infer parameter type from a prop
 */
export function propToParam(key, value) {
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

/*
 * get array of parameters from a layer's default props
 */
export function getLayerParams(layer) {
  const params = {};

  Object.keys(layer.props).forEach(key => {
    const p = propToParam(key, layer.props[key]);
    if (p) {
      params[key] = p;
    }
  });

  return params;
}
