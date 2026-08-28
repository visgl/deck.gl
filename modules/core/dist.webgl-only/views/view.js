// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { parsePosition, getPosition } from "../utils/positions.js";
import { deepEqual } from "../utils/deep-equal.js";
import { deepMergeViewState } from "../utils/deep-merge.js";
export default class View {
    constructor(props) {
        const { id, x = 0, y = 0, width = '100%', height = '100%', padding = null } = props;
        // @ts-ignore
        this.id = id || this.constructor.displayName || 'view';
        this.props = { ...props, id: this.id };
        // Extents
        this._x = parsePosition(x);
        this._y = parsePosition(y);
        this._width = parsePosition(width);
        this._height = parsePosition(height);
        this._padding = padding && {
            left: parsePosition(padding.left || 0),
            right: parsePosition(padding.right || 0),
            top: parsePosition(padding.top || 0),
            bottom: parsePosition(padding.bottom || 0)
        };
        // Bind methods for easy access
        this.equals = this.equals.bind(this);
        Object.seal(this);
    }
    equals(view) {
        if (this === view) {
            return true;
        }
        // To correctly compare padding use depth=2
        return this.constructor === view.constructor && deepEqual(this.props, view.props, 2);
    }
    /** Clone this view with modified props */
    clone(newProps) {
        const ViewConstructor = this.constructor;
        return new ViewConstructor({ ...this.props, ...newProps });
    }
    /** Make viewport from canvas dimensions and view state */
    makeViewport({ width, height, viewState }) {
        viewState = this.filterViewState(viewState);
        // Resolve relative viewport dimensions
        const viewportDimensions = this.getDimensions({ width, height });
        if (!viewportDimensions.height || !viewportDimensions.width) {
            return null;
        }
        const ViewportType = this.getViewportType(viewState);
        return new ViewportType({ ...viewState, ...this.props, ...viewportDimensions });
    }
    getViewStateId() {
        const { viewState } = this.props;
        if (typeof viewState === 'string') {
            // if View.viewState is a string, return it
            return viewState;
        }
        return viewState?.id || this.id;
    }
    // Allows view to override (or completely define) viewState
    filterViewState(viewState) {
        if (this.props.viewState && typeof this.props.viewState === 'object') {
            // If we have specified an id, then intent is to override,
            // If not, completely specify the view state
            if (!this.props.viewState.id) {
                return this.props.viewState;
            }
            return deepMergeViewState(viewState, this.props.viewState);
        }
        return viewState;
    }
    /** Resolve the dimensions of the view from overall canvas dimensions */
    getDimensions({ width, height }) {
        const dimensions = {
            x: getPosition(this._x, width),
            y: getPosition(this._y, height),
            width: getPosition(this._width, width),
            height: getPosition(this._height, height)
        };
        if (this._padding) {
            dimensions.padding = {
                left: getPosition(this._padding.left, width),
                top: getPosition(this._padding.top, height),
                right: getPosition(this._padding.right, width),
                bottom: getPosition(this._padding.bottom, height)
            };
        }
        return dimensions;
    }
    // Used by sub classes to resolve controller props
    get controller() {
        const opts = this.props.controller;
        if (!opts) {
            return null;
        }
        if (opts === true) {
            return { type: this.ControllerType };
        }
        if (typeof opts === 'function') {
            return { type: opts };
        }
        return { type: this.ControllerType, ...opts };
    }
}
//# sourceMappingURL=view.js.map