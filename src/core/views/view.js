import Viewport from '../viewports/viewport';
import assert from 'assert';

export default class View {
  constructor(props) {
    Object.assign(this, props);
    assert(!this.viewportInstance || this.viewportInstance instanceof Viewport);
    Object.seal();
  }

  equals(newView) {
    if (newView === this) {
      return true;
    }
    // If a viewportInstance is supplied, it is the only thing that is used
    // `View` hiearchy supports an `equals` method
    if (newView.viewportInstance) {
      return this.viewport && this.viewport.equals(newView.viewportInstance);
    }
    // TODO - implement deep equal on view descriptors
    return false;
  }

  // Build a `Viewport` from a view descriptor
  // TODO - add support for autosizing viewports using width and height
  makeViewport({width, height}) {
    if (this.viewportInstance) {
      return this.viewportInstance;
    }

    // Get the type of the viewport
    // TODO - default to WebMercator?
    const {type: ViewportType, viewState} = this;

    // Resolve relative viewport dimensions
    // TODO - we need to have width and height available
    const viewportDimensions = this._getViewDimensions({width, height});

    // Create the viewport, giving preference to view state in `viewState`
    return new ViewportType(
      Object.assign(
        {},
        this,
        viewportDimensions,
        viewState // Object.assign handles undefined
      )
    );
  }

  // Support for relative viewport dimensions (e.g {y: '50%', height: '50%'})
  _getViewDimensions({view, width, height}) {
    const parsePercent = (value, max) =>
      value ? Math.round(parseFloat(value) / 100 * max) : value === null ? max : value;

    return {
      x: parsePercent(view.x, width),
      y: parsePercent(view.y, height),
      width: parsePercent(view.width, width),
      height: parsePercent(view.height, height)
    };
  }
}
