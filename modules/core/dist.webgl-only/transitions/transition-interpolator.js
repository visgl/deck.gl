// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { equals } from '@math.gl/core';
import assert from "../utils/assert.js";
export default class TransitionInterpolator {
    /**
     * @param opts {array|object}
     * @param opts.compare {array} - prop names used in equality check
     * @param opts.extract {array} - prop names needed for interpolation
     * @param opts.required {array} - prop names that must be supplied
     * alternatively, supply one list of prop names as `opts` if all of the above are the same.
     */
    constructor(opts) {
        const { compare, extract, required } = opts;
        this._propsToCompare = compare;
        this._propsToExtract = extract || compare;
        this._requiredProps = required;
    }
    /**
     * Checks if two sets of props need transition in between
     * @param currentProps {object} - a list of viewport props
     * @param nextProps {object} - a list of viewport props
     * @returns {bool} - true if two props are equivalent
     */
    arePropsEqual(currentProps, nextProps) {
        for (const key of this._propsToCompare) {
            if (!(key in currentProps) ||
                !(key in nextProps) ||
                !equals(currentProps[key], nextProps[key])) {
                return false;
            }
        }
        return true;
    }
    /**
     * Called before transition starts to validate/pre-process start and end props
     * @param startProps {object} - a list of starting viewport props
     * @param endProps {object} - a list of target viewport props
     * @returns {Object} {start, end} - start and end props to be passed
     *   to `interpolateProps`
     */
    initializeProps(startProps, endProps) {
        const startViewStateProps = {};
        const endViewStateProps = {};
        for (const key of this._propsToExtract) {
            if (key in startProps || key in endProps) {
                startViewStateProps[key] = startProps[key];
                endViewStateProps[key] = endProps[key];
            }
        }
        this._checkRequiredProps(startViewStateProps);
        this._checkRequiredProps(endViewStateProps);
        return { start: startViewStateProps, end: endViewStateProps };
    }
    /**
     * Returns transition duration
     * @param startProps {object} - a list of starting viewport props
     * @param endProps {object} - a list of target viewport props
     * @returns {Number} - transition duration in milliseconds
     */
    getDuration(startProps, endProps) {
        return endProps.transitionDuration;
    }
    _checkRequiredProps(props) {
        if (!this._requiredProps) {
            return;
        }
        this._requiredProps.forEach(propName => {
            const value = props[propName];
            assert(Number.isFinite(value) || Array.isArray(value), `${propName} is required for transition`);
        });
    }
}
//# sourceMappingURL=transition-interpolator.js.map