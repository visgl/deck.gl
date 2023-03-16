const PROP_BLACK_LIST = ['dataComparator', 'fetch'];
const BASE_LAYER_PROP_WHITE_LIST = [
  'autoHighlight',
  'coordinateOrigin',
  'coordinateSystem',
  'highlightColor',
  'modelMatrix',
  'opacity',
  'pickable',
  'visible',
  'wrapLongitude'
];
const PROP_OVERRIDES = {
  loaders: [],
  coordinateSystem: 'COORDINATE_SYSTEM.LNGLAT',
  renderSubLayers: 'props => new GeoJsonLayer(props)',
  characterSet:
    '" !\\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~"'
};

/*
 * Adjust indent to a block of code
 * @param text (String) - source code
 * @param spaces (Number) - positive: add x spaces to indent; negative: remove x spaces to indent
 */
function addIndent(text, spaces) {
  if (!text.includes('\n') || spaces === 0) {
    return text;
  }
  const lines = text.split('\n');
  if (spaces > 0) {
    const indent = ''.padStart(spaces, ' ');
    return lines
      .map((line, i) => {
        return i > 0 ? indent + line : line;
      })
      .join('\n');
  }
  return lines
    .map((line, i) => {
      return i > 0 ? line.slice(-spaces) : line;
    })
    .join('\n');
}

/*
 * Format an object for use in source code
 */
function formatValue(value) {
  if (value === null || value === undefined) {
    return 'null';
  } else if (typeof value === 'string') {
    return `'${value}'`;
  } else if (typeof value === 'function') {
    return value.toString();
  } else if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`;
  } else if (value === Number.MAX_SAFE_INTEGER) {
    return 'Number.MAX_SAFE_INTEGER';
  }
  return addIndent(JSON.stringify(value, null, 2), 2);
}

/*
 * Convert the source code that describes a JS props object to a map of propName -> source
 */
function parsePropSource(source) {
  const lines = source.split('\n');
  lines.pop();
  const result = {};
  let indent = Infinity;
  let key;
  for (const line of lines) {
    const m = line.match(/^(\s*)(\w+):\s*(.*)/);
    if (m && m[1].length <= indent) {
      indent = m[1].length;
      key = m[2];
      result[key] = m[3];
    } else if (key) {
      result[key] += `\n${line}`;
    }
  }
  for (key in result) {
    result[key] = addIndent(result[key].replace(/,\s*$/, ''), 2 - indent);
  }
  return result;
}

/*
 * Takes a layer instance and returns JS code that reproduces it
 */
/* eslint-disable complexity, max-depth, max-statements */
function printLayerProps(layer, propsSource) {
  const result = [];
  const propNames = {};
  propsSource = parsePropSource(propsSource);
  let Class = layer.constructor;
  let isPrototype = false;

  const asyncOriginal = layer.props[Symbol.for('asyncPropOriginal')];
  const asyncResolved = layer.props[Symbol.for('asyncPropResolved')];

  function addProp(propName, value, shouldComment, insertPosition) {
    if (!propNames[propName] && !PROP_BLACK_LIST.includes(propName)) {
      const line = `${shouldComment ? '// ' : ''}${propName}: ${value},`;
      if (insertPosition === undefined) {
        result.push(line);
      } else {
        result.splice(insertPosition, 0, line);
      }
      propNames[propName] = true;
    }
  }

  let ownPropscount = 1;
  addProp('id', formatValue(layer.id));
  if (propsSource.data) {
    addProp('data', propsSource.data, false, ownPropscount++);
  }

  while (Class.layerName) {
    if (Class.hasOwnProperty('defaultProps')) {
      result.push(
        '',
        `/* props ${isPrototype ? 'inherited from' : 'from'} ${Class.layerName} class */`,
        ''
      );
      const keys = Object.keys(Class.defaultProps).sort();
      for (const key of keys) {
        const propDef = Class.defaultProps[key];
        const shouldComment =
          !(key in asyncOriginal) &&
          !(key in asyncResolved) &&
          !Object.hasOwnProperty.call(layer.props, key);
        let shouldSkip = false;
        let value;

        if (key in propsSource) {
          // this prop is explicitly specified, use source
          value = propsSource[key];
        } else {
          // Hide deprecated props
          shouldSkip = propDef && propDef.deprecatedFor;
          // Hide experimental props
          shouldSkip = shouldSkip || key.startsWith('_');
          // Hide accessors that are not exposed, e.g. `getPolygon` in `H3HexagonLayer`
          shouldSkip =
            shouldSkip ||
            (propDef && propDef.type === 'accessor' && typeof propDef.value === 'function');
          // Hide some base layer props
          shouldSkip =
            shouldSkip ||
            (Class.layerName === 'Layer' && !BASE_LAYER_PROP_WHITE_LIST.includes(key));

          value = asyncOriginal[key] || layer.props[key];
          if (typeof value === 'function') {
            // Hide default callbacks, e.g. `onTileError`
            value = null;
          } else if (key in PROP_OVERRIDES) {
            // Replace enums
            value = PROP_OVERRIDES[key];
          } else {
            value = formatValue(value);
          }
        }

        if (!shouldSkip) {
          addProp(key, value, shouldComment);
        }
      }
    }
    Class = Object.getPrototypeOf(Class);
    isPrototype = true;
  }

  for (const key in propsSource) {
    if (!(key in propNames)) {
      addProp(key, propsSource[key], false, ownPropscount++);
    }
  }

  return result.join('\n  ');
}

/*
 * Open a layer example in Codepen
 */
export function gotoLayerSource(config, layer) {
  const {
    Layer,
    isExperimental,
    getTooltip,
    props,
    mapStyle = true,
    dependencies = [],
    imports,
    initialViewState
  } = config;

  const layerName = isExperimental ? `_${Layer.layerName}` : Layer.layerName;

  const symbols = ['DeckGL', layerName];
  const loaders = [];
  if (imports) {
    for (const key in imports) {
      /* eslint-disable no-continue */
      if (key[0] >= 'a') continue;
      if (key.endsWith('Loader')) {
        loaders.push(key);
      } else {
        symbols.push(key);
      }
    }
  }

  const initialViewStateSerialized = addIndent(
    JSON.stringify(initialViewState, null, 2).replace(/"/g, ''), // remove quotes
    2
  );

  // https://blog.codepen.io/documentation/prefill/
  const source = `\
const {${symbols.join(', ')}} = deck;
${
  loaders.length
    ? `\
const {${loaders.join(', ')}} = loaders;
`
    : ''
}
const layer = new ${layerName}({
  ${printLayerProps(layer, props)}
});

new DeckGL({
  ${mapStyle ? `mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',` : ''}
  initialViewState: ${initialViewStateSerialized},
  controller: true,
  ${getTooltip ? `getTooltip: ${getTooltip},` : ''}
  layers: [layer]
});
  `;

  gotoSource({
    dependencies: dependencies.concat(['https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js']),
    title: `deck.gl ${Layer.layerName}`,
    source
  });
}

/* global document, window */
function gotoSource({dependencies = [], title, source}) {
  const formData = {
    js_external: dependencies.concat(['https://unpkg.com/deck.gl@latest/dist.min.js']).join(';'),
    title,
    parent: 48721472,
    tags: ['webgl', 'data visualization'],
    editors: '001',
    css: `
  body {
    margin: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  
  .deck-tooltip {
    font-size: 0.8em;
    font-family: Helvetica, Arial, sans-serif;
  }
  `,
    js: `\
/*
* ${window.location.href}
*/
${source}`
  };

  const form = document.createElement('form');
  form.action = 'https://codepen.io/pen/define/';
  form.method = 'POST';
  form.style.display = 'none';
  document.body.appendChild(form);
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'data';
  input.value = JSON.stringify(formData);
  form.appendChild(input);
  window.open('', 'deck-example-codepen');
  form.target = 'deck-example-codepen';
  form.submit();
  form.remove();
}
