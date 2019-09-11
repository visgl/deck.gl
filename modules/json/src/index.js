// @deck.gl/json: top-level exports

// Generic JSON converter, usable by other wrapper modules
export {default as JSONConverter} from './lib/json-converter';
export {default as JSONConfiguration} from './lib/json-configuration';

// Helpers
export {default as _parseExpressionString} from './lib/helpers/parse-expression-string';
export {shallowEqualObjects as _shallowEqualObjects} from './utils/shallow-equal-objects';
