// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Widget } from "./widget.js";
/* global document */
const defaultStyle = {
    zIndex: '1',
    position: 'absolute',
    pointerEvents: 'none',
    color: '#a0a7b4',
    backgroundColor: '#29323c',
    padding: '10px',
    top: '0',
    left: '0',
    display: 'none'
};
export class TooltipWidget extends Widget {
    constructor(props = {}) {
        super(props);
        this.id = 'default-tooltip';
        this.placement = 'fill';
        this.className = 'deck-tooltip';
        this.isVisible = false;
        this.setProps(props);
    }
    // TODO(ib) - does this really need to be overridden?
    onCreateRootElement() {
        const el = document.createElement('div');
        el.className = this.className;
        Object.assign(el.style, defaultStyle);
        return el;
    }
    onRenderHTML(rootElement) { }
    onViewportChange(viewport) {
        if (this.isVisible &&
            viewport.id === this.lastViewport?.id &&
            !viewport.equals(this.lastViewport)) {
            // Camera has moved, clear tooltip
            this.setTooltip(null);
        }
        // Always update lastViewport from the render loop to ensure consistent
        // viewport source for comparisons (avoids mismatches with picking viewports)
        this.lastViewport = viewport;
    }
    onHover(info) {
        const { deck } = this;
        const getTooltip = deck && deck.props.getTooltip;
        if (!getTooltip) {
            return;
        }
        const displayInfo = getTooltip(info);
        const canvasBounds = this.widgetManager?.getCanvasBounds(info.viewport);
        const x = info.x + (canvasBounds?.x || 0);
        const y = info.y + (canvasBounds?.y || 0);
        this.setTooltip(displayInfo, x, y);
    }
    setTooltip(displayInfo, x, y) {
        const el = this.rootElement;
        if (!el) {
            return;
        }
        if (typeof displayInfo === 'string') {
            el.innerText = displayInfo;
        }
        else if (!displayInfo) {
            this.isVisible = false;
            el.style.display = 'none';
            return;
        }
        else {
            if (displayInfo.text) {
                el.innerText = displayInfo.text;
            }
            if (displayInfo.html) {
                el.innerHTML = displayInfo.html;
            }
            if (displayInfo.className) {
                el.className = displayInfo.className;
            }
        }
        this.isVisible = true;
        el.style.display = 'block';
        el.style.transform = `translate(${x}px, ${y}px)`;
        if (displayInfo && typeof displayInfo === 'object' && 'style' in displayInfo) {
            Object.assign(el.style, displayInfo.style);
        }
    }
}
TooltipWidget.defaultProps = {
    ...Widget.defaultProps
};
//# sourceMappingURL=tooltip-widget.js.map