// TODO - default parsing code should not be part of the configuration.
import parseExpressionString from './helpers/parse-expression-string';
import assert from './utils/assert';

const DEFAULT_TYPE_KEY = 'type';

const isObject = value => value && typeof value === 'object';

export default class JSONConfiguration {
  constructor(...configurations) {
    // Initialize config with default values
    this.typeKey = DEFAULT_TYPE_KEY;
    this.log = console; // eslint-disable-line
    this.classes = {};
    this.reactComponents = {};
    this.enumerations = {};
    this.constants = {};
    // TODO - this needs to be simpler, function conversion should be built in
    this.convertFunction = convertFunction;
    this.preProcessClassProps = (Class, props) => props;
    this.postProcessConvertedJson = json => json;

    for (const configuration of configurations) {
      this._merge(configuration);
    }
  }

  _merge(configuration) {
    for (const key in configuration) {
      switch (key) {
        // DEPRECATED = For backwards compatibility, add views and layers to classes;
        case 'layers':
        case 'views':
          Object.assign(this.classes, configuration[key]);
          break;
        default:
          // Store configuration as root fields (this.classes, ...)
          if (key in this) {
            const value = configuration[key];
            this[key] = isObject(this[key]) ? Object.assign(this[key], value) : value;
          }
      }
    }
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
