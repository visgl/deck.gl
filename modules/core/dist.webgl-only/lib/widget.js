// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { deepEqual } from "../utils/deep-equal.js";
import { applyStyles, removeStyles } from "../utils/apply-styles.js";
export class Widget {
    constructor(props) {
        /**
         * The view id that this widget controls and is positioned relative to. Default `null`.
         * If assigned, this widget only responds to events inside the matching view.
         */
        this.viewId = null;
        this.props = {
            // @ts-expect-error `defaultProps` may not exist on constructor
            ...this.constructor.defaultProps,
            ...props
        };
        // @ts-expect-error TODO(ib) - why is id considered optional even though we use Required<>
        this.id = this.props.id;
    }
    /** Called to update widget options */
    setProps(props) {
        const oldProps = this.props;
        const el = this.rootElement;
        // Update className and style
        if (el && oldProps.className !== props.className) {
            if (oldProps.className)
                el.classList.remove(oldProps.className);
            if (props.className)
                el.classList.add(props.className);
        }
        // Update style
        if (el && !deepEqual(oldProps.style, props.style, 1)) {
            removeStyles(el, oldProps.style);
            applyStyles(el, props.style);
        }
        Object.assign(this.props, props);
        // Update the HTML to match the new props
        this.updateHTML();
    }
    /** Update the HTML to reflect latest props and state */
    updateHTML() {
        if (this.rootElement) {
            this.onRenderHTML(this.rootElement);
        }
    }
    // VIEW STATE HELPERS
    get viewIds() {
        return this.viewId ? [this.viewId] : (this.deck?.getViews().map(v => v.id) ?? []);
    }
    /** Returns the current view state for the given view */
    getViewState(viewId) {
        // @ts-ignore viewManager is private
        return this.deck?.viewManager?.getViewState(viewId) || {};
    }
    /** Updates the view state for the given view */
    setViewState(viewId, viewState) {
        // @ts-ignore Using private method temporary until there's a public one
        this.deck?._onViewStateChange({ viewId, viewState, interactionState: {} });
    }
    // @note empty method calls have an overhead in V8 but it is very low, ~1ns
    /**
     * Common utility to create the root DOM element for this widget
     * Configures the top-level styles and adds basic class names for theming
     * @returns an UI element that should be appended to the Deck container
     */
    onCreateRootElement() {
        const CLASS_NAMES = [
            // Add class names for theming
            'deck-widget',
            this.className,
            // plus any app-supplied class name
            this.props.className
        ];
        const element = document.createElement('div');
        CLASS_NAMES.filter((cls) => typeof cls === 'string' && cls.length > 0).forEach(className => element.classList.add(className));
        applyStyles(element, this.props.style);
        return element;
    }
    /** Internal API called by Deck when the widget is first added to a Deck instance */
    _onAdd(params) {
        return this.onAdd(params) ?? this.onCreateRootElement();
    }
    /** Overridable by subclass - called when the widget is first added to a Deck instance
     * @returns an optional UI element that should be appended to the Deck container
     */
    onAdd(params) { }
    /** Called when the widget is removed */
    onRemove() { }
    // deck integration - Event hooks
    /** Called when the containing view is changed */
    onViewportChange(viewport) { }
    /** Called when the containing view is redrawn */
    onRedraw(params) { }
    /** Called when a hover event occurs */
    onHover(info, event) { }
    /** Called when a click event occurs */
    onClick(info, event) { }
    /** Called when a drag event occurs */
    onDrag(info, event) { }
    /** Called when a dragstart event occurs */
    onDragStart(info, event) { }
    /** Called when a dragend event occurs */
    onDragEnd(info, event) { }
}
Widget.defaultProps = {
    id: 'widget',
    style: {},
    _container: null,
    className: ''
};
//# sourceMappingURL=widget.js.map