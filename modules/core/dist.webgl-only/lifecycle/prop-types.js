// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { createTexture, destroyTexture } from "../utils/texture.js";
import { deepEqual } from "../utils/deep-equal.js";
const TYPE_DEFINITIONS = {
    boolean: {
        validate(value, propType) {
            return true;
        },
        equal(value1, value2, propType) {
            return Boolean(value1) === Boolean(value2);
        }
    },
    number: {
        validate(value, propType) {
            return (Number.isFinite(value) &&
                (!('max' in propType) || value <= propType.max) &&
                (!('min' in propType) || value >= propType.min));
        }
    },
    color: {
        validate(value, propType) {
            return ((propType.optional && !value) ||
                (isArray(value) && (value.length === 3 || value.length === 4)));
        },
        equal(value1, value2, propType) {
            return deepEqual(value1, value2, 1);
        }
    },
    accessor: {
        validate(value, propType) {
            const valueType = getTypeOf(value);
            return valueType === 'function' || valueType === getTypeOf(propType.value);
        },
        equal(value1, value2, propType) {
            if (typeof value2 === 'function') {
                return true;
            }
            return deepEqual(value1, value2, 1);
        }
    },
    array: {
        validate(value, propType) {
            return (propType.optional && !value) || isArray(value);
        },
        equal(value1, value2, propType) {
            const { compare } = propType;
            const depth = Number.isInteger(compare) ? compare : compare ? 1 : 0;
            return compare ? deepEqual(value1, value2, depth) : value1 === value2;
        }
    },
    object: {
        equal(value1, value2, propType) {
            if (propType.ignore) {
                return true;
            }
            const { compare } = propType;
            const depth = Number.isInteger(compare) ? compare : compare ? 1 : 0;
            return compare ? deepEqual(value1, value2, depth) : value1 === value2;
        }
    },
    function: {
        validate(value, propType) {
            return (propType.optional && !value) || typeof value === 'function';
        },
        equal(value1, value2, propType) {
            // Backward compatibility - {compare: true} and {ignore: false} are equivalent
            const shouldIgnore = !propType.compare && propType.ignore !== false;
            return shouldIgnore || value1 === value2;
        }
    },
    data: {
        transform: (value, propType, component) => {
            if (!value) {
                return value;
            }
            const { dataTransform } = component.props;
            if (dataTransform) {
                return dataTransform(value);
            }
            // Detect loaders.gl v4 table format
            if (typeof value.shape === 'string' &&
                value.shape.endsWith('-table') &&
                Array.isArray(value.data)) {
                return value.data;
            }
            return value;
        }
    },
    image: {
        transform: (value, propType, component) => {
            const context = component.context;
            if (!context || !context.device) {
                return null;
            }
            return createTexture(component.id, context.device, value, {
                ...propType.parameters,
                ...component.props.textureParameters
            });
        },
        release: (value, propType, component) => {
            destroyTexture(component.id, value);
        }
    }
};
export function parsePropTypes(propDefs) {
    const propTypes = {};
    const defaultProps = {};
    const deprecatedProps = {};
    for (const [propName, propDef] of Object.entries(propDefs)) {
        const deprecated = propDef?.deprecatedFor;
        if (deprecated) {
            deprecatedProps[propName] = Array.isArray(deprecated) ? deprecated : [deprecated];
        }
        else {
            const propType = parsePropType(propName, propDef);
            propTypes[propName] = propType;
            defaultProps[propName] = propType.value;
        }
    }
    return { propTypes, defaultProps, deprecatedProps };
}
// Parses one property definition entry. Either contains:
// * a valid prop type object ({type, ...})
// * or just a default value, in which case type and name inference is used
function parsePropType(name, propDef) {
    switch (getTypeOf(propDef)) {
        case 'object':
            return normalizePropDefinition(name, propDef);
        case 'array':
            return normalizePropDefinition(name, { type: 'array', value: propDef, compare: false });
        case 'boolean':
            return normalizePropDefinition(name, { type: 'boolean', value: propDef });
        case 'number':
            return normalizePropDefinition(name, { type: 'number', value: propDef });
        case 'function':
            // return guessFunctionType(name, propDef);
            return normalizePropDefinition(name, { type: 'function', value: propDef, compare: true });
        default:
            return { name, type: 'unknown', value: propDef };
    }
}
function normalizePropDefinition(name, propDef) {
    if (!('type' in propDef)) {
        if (!('value' in propDef)) {
            // If no type and value this object is likely the value
            return { name, type: 'object', value: propDef };
        }
        return { name, type: getTypeOf(propDef.value), ...propDef };
    }
    return { name, ...TYPE_DEFINITIONS[propDef.type], ...propDef };
}
function isArray(value) {
    return Array.isArray(value) || ArrayBuffer.isView(value);
}
// improved version of javascript typeof that can distinguish arrays and null values
function getTypeOf(value) {
    if (isArray(value)) {
        return 'array';
    }
    if (value === null) {
        return 'null';
    }
    return typeof value;
}
//# sourceMappingURL=prop-types.js.map