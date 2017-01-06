// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Portions of the code below originally from:
// https://github.com/mapbox/mapbox-gl-js/blob/master/js/ui/handler/scroll_zoom.js
import React, {PropTypes, Component} from 'react';
import autobind from 'autobind-decorator';
import document from 'global/document';
import window from 'global/window';

function noop() {}

const ua = typeof window.navigator !== 'undefined' ?
  window.navigator.userAgent.toLowerCase() : '';
const firefox = ua.indexOf('firefox') !== -1;

// Extract a position from a mouse event
function getMousePosition(el, event) {
  const rect = el.getBoundingClientRect();
  event = event.touches ? event.touches[0] : event;
  return [
    event.clientX - rect.left - el.clientLeft,
    event.clientY - rect.top - el.clientTop
  ];
}

// Extract an array of touch positions from a touch event
function getTouchPositions(el, event) {
  const points = [];
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < event.touches.length; i++) {
    points.push([
      event.touches[i].clientX - rect.left - el.clientLeft,
      event.touches[i].clientY - rect.top - el.clientTop
    ]);
  }
  return points;
}

// Return the centroid of an array of points
function centroid(positions) {
  const sum = positions.reduce(
    (acc, elt) => [acc[0] + elt[0], acc[1] + elt[1]],
    [0, 0]
  );
  return [sum[0] / positions.length, sum[1] / positions.length];
}

export default class EventManager extends Component {

  static displayName = 'EventManager';

  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onMouseDown: PropTypes.func,
    onMouseDrag: PropTypes.func,
    onMouseRotate: PropTypes.func,
    onMouseUp: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseClick: PropTypes.func,
    onTouchStart: PropTypes.func,
    onTouchDrag: PropTypes.func,
    onTouchRotate: PropTypes.func,
    onTouchEnd: PropTypes.func,
    onTouchTap: PropTypes.func,
    onZoom: PropTypes.func,
    onZoomEnd: PropTypes.func
  };

  static defaultProps = {
    onMouseDown: noop,
    onMouseDrag: noop,
    onMouseRotate: noop,
    onMouseUp: noop,
    onMouseMove: noop,
    onMouseClick: noop,
    onTouchStart: noop,
    onTouchDrag: noop,
    onTouchRotate: noop,
    onTouchEnd: noop,
    onTouchTap: noop,
    onZoom: noop,
    onZoomEnd: noop
  };

  constructor(props) {
    super(props);
    this.state = {
      didDrag: false,
      isFunctionKeyPressed: false,
      startPos: null,
      pos: null,
      mouseWheelPos: null
    };
  }

  _getMousePos(event) {
    const el = this.refs.container;
    return getMousePosition(el, event);
  }

  _getTouchPos(event) {
    const el = this.refs.container;
    const positions = getTouchPositions(el, event);
    return centroid(positions);
  }

  _isFunctionKeyPressed(event) {
    return Boolean(event.metaKey || event.altKey ||
      event.ctrlKey || event.shiftKey);
  }

  @autobind
  _onMouseDown(event) {
    const pos = this._getMousePos(event);
    this.setState({
      didDrag: false,
      startPos: pos,
      pos,
      isFunctionKeyPressed: this._isFunctionKeyPressed(event)
    });
    this.props.onMouseDown({pos});
    document.addEventListener('mousemove', this._onMouseDrag, false);
    document.addEventListener('mouseup', this._onMouseUp, false);
  }

  @autobind
  _onTouchStart(event) {
    const pos = this._getTouchPos(event);
    this.setState({
      didDrag: false,
      startPos: pos,
      pos,
      isFunctionKeyPressed: this._isFunctionKeyPressed(event)
    });
    this.props.onTouchStart({pos});
    document.addEventListener('touchmove', this._onTouchDrag, false);
    document.addEventListener('touchend', this._onTouchEnd, false);
  }

  @autobind
  _onMouseDrag(event) {
    const pos = this._getMousePos(event);
    this.setState({pos, didDrag: true});
    const {startPos} = this.state;
    if (this.state.isFunctionKeyPressed) {
      this.props.onMouseRotate({pos, startPos});
    } else {
      this.props.onMouseDrag({pos, startPos});
    }
  }

  @autobind
  _onTouchDrag(event) {
    const pos = this._getTouchPos(event);
    this.setState({pos, didDrag: true});
    if (this.state.isFunctionKeyPressed) {
      const {startPos} = this.state;
      this.props.onTouchRotate({pos, startPos});
    } else {
      this.props.onTouchDrag({pos});
    }
    event.preventDefault();
  }

  @autobind
  _onMouseUp(event) {
    document.removeEventListener('mousemove', this._onMouseDrag, false);
    document.removeEventListener('mouseup', this._onMouseUp, false);
    const pos = this._getMousePos(event);
    this.setState({pos});
    this.props.onMouseUp({pos});
    if (!this.state.didDrag) {
      this.props.onMouseClick({pos});
    }
  }

  @autobind
  _onTouchEnd(event) {
    document.removeEventListener('touchmove', this._onTouchDrag, false);
    document.removeEventListener('touchend', this._onTouchEnd, false);
    const pos = this._getTouchPos(event);
    this.setState({pos});
    this.props.onTouchEnd({pos});
    if (!this.state.didDrag) {
      this.props.onTouchTap({pos});
    }
  }

  @autobind
  _onMouseMove(event) {
    const pos = this._getMousePos(event);
    this.props.onMouseMove({pos});
  }

  /* eslint-disable complexity, max-statements */
  @autobind
  _onWheel(event) {
    event.preventDefault();
    let value = event.deltaY;
    // Firefox doubles the values on retina screens...
    if (firefox && event.deltaMode === window.WheelEvent.DOM_DELTA_PIXEL) {
      value /= window.devicePixelRatio;
    }
    if (event.deltaMode === window.WheelEvent.DOM_DELTA_LINE) {
      value *= 40;
    }

    let type = this.state.mouseWheelType;
    let timeout = this.state.mouseWheelTimeout;
    let lastValue = this.state.mouseWheelLastValue;
    let time = this.state.mouseWheelTime;

    const now = (window.performance || Date).now();
    const timeDelta = now - (time || 0);

    const pos = this._getMousePos(event);
    time = now;

    if (value !== 0 && value % 4.000244140625 === 0) {
      // This one is definitely a mouse wheel event.
      type = 'wheel';
      // Normalize this value to match trackpad.
      value = Math.floor(value / 4);
    } else if (value !== 0 && Math.abs(value) < 4) {
      // This one is definitely a trackpad event because it is so small.
      type = 'trackpad';
    } else if (timeDelta > 400) {
      // This is likely a new scroll action.
      type = null;
      lastValue = value;

      // Start a timeout in case this was a singular event, and delay it by up
      // to 40ms.
      timeout = window.setTimeout(function setTimeout() {
        const _type = 'wheel';
        this._zoom(-this.state.mouseWheelLastValue, this.state.mouseWheelPos);
        this.setState({mouseWheelType: _type});
      }.bind(this), 40);
    } else if (!this._type) {
      // This is a repeating event, but we don't know the type of event just
      // yet.
      // If the delta per time is small, we assume it's a fast trackpad;
      // otherwise we switch into wheel mode.
      type = Math.abs(timeDelta * value) < 200 ? 'trackpad' : 'wheel';

      // Make sure our delayed event isn't fired again, because we accumulate
      // the previous event (which was less than 40ms ago) into this event.
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
        value += lastValue;
      }
    }

    // Slow down zoom if shift key is held for more precise zooming
    if (event.shiftKey && value) {
      value = value / 4;
    }

    // Only fire the callback if we actually know what type of scrolling device
    // the user uses.
    if (type) {
      this._zoom(-value, pos);
    }

    this.setState({
      mouseWheelTime: time,
      mouseWheelPos: pos,
      mouseWheelType: type,
      mouseWheelTimeout: timeout,
      mouseWheelLastValue: lastValue
    });
  }
  /* eslint-enable complexity, max-statements */

  _zoom(delta, pos) {
    // Scale by sigmoid of scroll wheel delta.
    let scale = 2 / (1 + Math.exp(-Math.abs(delta / 100)));
    if (delta < 0 && scale !== 0) {
      scale = 1 / scale;
    }
    this.props.onZoom({pos, delta, scale});
    window.clearTimeout(this._zoomEndTimeout);
    this._zoomEndTimeout = window.setTimeout(function _setTimeout() {
      this.props.onZoomEnd();
    }.bind(this), 200);
  }

  render() {
    return (
      <div
        ref="container"
        onMouseMove={ this._onMouseMove }
        onMouseDown={ this._onMouseDown }
        onTouchStart={ this._onTouchStart }
        onContextMenu={ this._onMouseDown }
        onWheel={ this._onWheel }
        style={ {
          width: this.props.width,
          height: this.props.height,
          position: 'relative'
        } }>

        { this.props.children }

      </div>
    );
  }
}
