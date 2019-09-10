// TODO - default parsing code should not be part of the configuration.
import parseExpressionString from './helpers/parse-expression-string';
import assert from '../utils/assert';
const DEFAULT_TYPE_KEY = 'type';

const DEFAULT_CONFIGURATION = {
  typeKey: DEFAULT_TYPE_KEY,
  classes: {},
  reactComponents: {},
  enumerations: {},
  // TODO - this needs to be simpler, function conversion should be built in
  convertFunction,

  // DEPRECATED - these were deck.gl specific. Use `configuration.classes` instead.
  layers: {},
  views: {}
};

const isObject = value => value && typeof value === 'object';

export default class JSONConfiguration {
  constructor(configuration) {
    // Merge configuration with default values
    const config = Object.assign({}, DEFAULT_CONFIGURATION, configuration);

    // DEPRECATED: For backwards compatibility, add views and layers to classes
    config.classes = Object.assign(config.classes, configuration.layers, configuration.views);
    delete config.layers;
    delete config.views;

    // Store configuration as root fields (this.classes, ...)
    Object.assign(this, config);
  }

  validate(configuration) {
    assert(!this.typeKey || typeof this.typeKey === 'string');
    assert(isObject(this.classes));
    return true;
  }
}

function convertFunction(value, key, configuration) {
  if (key.startsWith('get')) {
    const isAccessor = true;
    return parseExpressionString(value, configuration, isAccessor);
  }
  return value;
}
