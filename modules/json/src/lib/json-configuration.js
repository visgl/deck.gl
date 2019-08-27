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
  convertFunction
};

const isObject = value => value && typeof value === 'object';

export default class JSONConfiguration {
  constructor(configuration) {
    Object.assign(this, DEFAULT_CONFIGURATION, configuration);
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
