import Viewport from '../viewports/viewport';
import {parsePosition, getPosition} from '../utils/positions';
import {Matrix4} from 'math.gl';
import {deepEqual} from '../utils/deep-equal';
import assert from '../utils/assert';

const PERSPECTIVE_PROJECTION = props => new Matrix4().perspective(props);

export default class View {
  constructor(props = {}) {
    const {
      id = null,
      type = Viewport, // Viewport Type

      // View extents (relative or absolute)
      x = 0,
      y = 0,
      width = '100%',
      height = '100%',

      // Projection parameters,
      projection = PERSPECTIVE_PROJECTION, // Projection matrix generator
      fovy = 75,
      near = 0.1, // Distance of near clipping plane
      far = 1000, // Distance of far clipping plane

      // DEPRECATED: A View can be a wrapper for a viewport instance
      viewportInstance = null
    } = props;

    assert(!viewportInstance || viewportInstance instanceof Viewport);

    // Id
    this.id = id || this.constructor.displayName || 'view';
    this.viewportInstance = viewportInstance;
    this.type = type;
    this.projection = projection;

    this.props = Object.assign({}, props, {
      fovy,
      near,
      far
    });

    // Parse extent strings
    this._parseDimensions({x, y, width, height});

    // Bind methods
    this.equals = this.equals.bind(this);

    Object.seal(this);
  }

  equals(view) {
    if (this === view) {
      return true;
    }

    // if `viewportInstance` is set, it is the only prop that is used
    // Delegate to `Viewport.equals`
    if (this.viewportInstance) {
      return view.viewportInstance && this.viewportInstance.equals(view.viewportInstance);
    }

    // TODO - implement deep equal on view descriptors
    const viewChanged = deepEqual(this, view);

    return viewChanged;
  }

  // Build a `Viewport` from a view descriptor
  // TODO - add support for autosizing viewports using width and height
  makeViewport({width, height, viewState}) {
    if (this.viewportInstance) {
      return this.viewportInstance;
    }

    // Resolve relative viewport dimensions
    const viewportDimensions = this.getDimensions({width, height});
    const props = Object.assign({viewState}, viewState, this.props, viewportDimensions);
    return this._getViewport(props);
  }

  // Resolve relative viewport dimensions into actual dimensions (y='50%', width=800 => y=400)
  getDimensions({width, height}) {
    return {
      x: getPosition(this._x, width),
      y: getPosition(this._y, height),
      width: getPosition(this._width, width),
      height: getPosition(this._height, height)
    };
  }

  // INTERNAL METHODS

  // Overridable method
  _getViewport(props) {
    // Get the type of the viewport
    const {type: ViewportType} = this;
    return new ViewportType(props);
  }

  _getProjectionMatrix({width, height, distance}) {
    const props = Object.assign({}, this.props, {width, height, aspect: width / height, distance});
    return this.projection(props);
  }

  // Parse relative viewport dimension descriptors (e.g {y: '50%', height: '50%'})
  _parseDimensions({x, y, width, height}) {
    this._x = parsePosition(x);
    this._y = parsePosition(y);
    this._width = parsePosition(width);
    this._height = parsePosition(height);
  }
}
