var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global requestAnimationFrame, cancelAnimationFrame */
import LinearInterpolator from '../transitions/linear-interpolator';
import { extractViewportFrom } from '../transitions/transition-utils';
import assert from 'assert';

var noop = function noop() {};

export var TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};

var DEFAULT_PROPS = {
  transitionDuration: 0,
  transitionEasing: function transitionEasing(t) {
    return t;
  },
  transitionInterpolator: new LinearInterpolator(),
  transitionInterruption: TRANSITION_EVENTS.BREAK,
  onTransitionStart: noop,
  onTransitionInterrupt: noop,
  onTransitionEnd: noop
};

var DEFAULT_STATE = {
  animation: null,
  propsInTransition: null,
  startProps: null,
  endProps: null
};

var TransitionManager = function () {
  function TransitionManager(props) {
    _classCallCheck(this, TransitionManager);

    this.props = props;
    this.state = DEFAULT_STATE;

    this._onTransitionFrame = this._onTransitionFrame.bind(this);
  }

  // Returns current transitioned viewport.


  _createClass(TransitionManager, [{
    key: 'getViewportInTransition',
    value: function getViewportInTransition() {
      return this.state.propsInTransition;
    }

    // Process the vewiport change, either ignore or trigger a new transiton.
    // Return true if a new transition is triggered, false otherwise.

  }, {
    key: 'processViewportChange',
    value: function processViewportChange(nextProps) {
      var transitionTriggered = false;
      var currentProps = this.props;
      // Set this.props here as '_triggerTransition' calls '_updateViewport' that uses this.props.
      this.props = nextProps;

      // NOTE: Be cautious re-ordering statements in this function.
      if (this._shouldIgnoreViewportChange(currentProps, nextProps)) {
        return transitionTriggered;
      }

      var isTransitionInProgress = this._isTransitionInProgress();

      if (this._isTransitionEnabled(nextProps)) {
        var startProps = Object.assign({}, currentProps, this.state.interruption === TRANSITION_EVENTS.SNAP_TO_END ? this.state.endProps : this.state.propsInTransition || currentProps);

        if (isTransitionInProgress) {
          currentProps.onTransitionInterrupt();
        }
        nextProps.onTransitionStart();

        this._triggerTransition(startProps, nextProps);

        transitionTriggered = true;
      } else if (isTransitionInProgress) {
        currentProps.onTransitionInterrupt();
        this._endTransition();
      }

      return transitionTriggered;
    }

    // Helper methods

  }, {
    key: '_isTransitionInProgress',
    value: function _isTransitionInProgress() {
      return this.state.propsInTransition;
    }
  }, {
    key: '_isTransitionEnabled',
    value: function _isTransitionEnabled(props) {
      return props.transitionDuration > 0 && props.transitionInterpolator;
    }
  }, {
    key: '_isUpdateDueToCurrentTransition',
    value: function _isUpdateDueToCurrentTransition(props) {
      if (this.state.propsInTransition) {
        return this.state.interpolator.arePropsEqual(props, this.state.propsInTransition);
      }
      return false;
    }
  }, {
    key: '_shouldIgnoreViewportChange',
    value: function _shouldIgnoreViewportChange(currentProps, nextProps) {
      if (this._isTransitionInProgress()) {
        // Ignore update if it is requested to be ignored
        return this.state.interruption === TRANSITION_EVENTS.IGNORE ||
        // Ignore update if it is due to current active transition.
        this._isUpdateDueToCurrentTransition(nextProps);
      } else if (this._isTransitionEnabled(nextProps)) {
        // Ignore if none of the viewport props changed.
        return nextProps.transitionInterpolator.arePropsEqual(currentProps, nextProps);
      }
      return true;
    }
  }, {
    key: '_triggerTransition',
    value: function _triggerTransition(startProps, endProps) {
      assert(this._isTransitionEnabled(endProps), 'Transition is not enabled');

      cancelAnimationFrame(this.state.animation);

      var initialProps = endProps.transitionInterpolator.initializeProps(startProps, endProps);

      this.state = {
        // Save current transition props
        duration: endProps.transitionDuration,
        easing: endProps.transitionEasing,
        interpolator: endProps.transitionInterpolator,
        interruption: endProps.transitionInterruption,

        startTime: Date.now(),
        startProps: initialProps.start,
        endProps: initialProps.end,
        animation: null,
        propsInTransition: {}
      };

      this._onTransitionFrame();
    }
  }, {
    key: '_onTransitionFrame',
    value: function _onTransitionFrame() {
      // _updateViewport() may cancel the animation
      this.state.animation = requestAnimationFrame(this._onTransitionFrame);
      this._updateViewport();
    }
  }, {
    key: '_endTransition',
    value: function _endTransition() {
      cancelAnimationFrame(this.state.animation);
      this.state = DEFAULT_STATE;
    }
  }, {
    key: '_updateViewport',
    value: function _updateViewport() {
      // NOTE: Be cautious re-ordering statements in this function.
      var currentTime = Date.now();
      var _state = this.state,
          startTime = _state.startTime,
          duration = _state.duration,
          easing = _state.easing,
          interpolator = _state.interpolator,
          startProps = _state.startProps,
          endProps = _state.endProps;


      var shouldEnd = false;
      var t = (currentTime - startTime) / duration;
      if (t >= 1) {
        t = 1;
        shouldEnd = true;
      }
      t = easing(t);

      var viewport = interpolator.interpolateProps(startProps, endProps, t);

      // This extractViewportFrom gurantees angle props (bearing, longitude) are normalized
      // So when viewports are compared they are in same range.
      this.state.propsInTransition = extractViewportFrom(Object.assign({}, this.props, viewport));

      if (this.props.onViewportChange) {
        this.props.onViewportChange(this.state.propsInTransition, { inTransition: true });
      }

      if (shouldEnd) {
        this._endTransition();
        this.props.onTransitionEnd();
      }
    }
  }]);

  return TransitionManager;
}();

export default TransitionManager;


TransitionManager.defaultProps = DEFAULT_PROPS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2xpYi90cmFuc2l0aW9uLW1hbmFnZXIuanMiXSwibmFtZXMiOlsiTGluZWFySW50ZXJwb2xhdG9yIiwiZXh0cmFjdFZpZXdwb3J0RnJvbSIsImFzc2VydCIsIm5vb3AiLCJUUkFOU0lUSU9OX0VWRU5UUyIsIkJSRUFLIiwiU05BUF9UT19FTkQiLCJJR05PUkUiLCJERUZBVUxUX1BST1BTIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwidHJhbnNpdGlvbkVhc2luZyIsInQiLCJ0cmFuc2l0aW9uSW50ZXJwb2xhdG9yIiwidHJhbnNpdGlvbkludGVycnVwdGlvbiIsIm9uVHJhbnNpdGlvblN0YXJ0Iiwib25UcmFuc2l0aW9uSW50ZXJydXB0Iiwib25UcmFuc2l0aW9uRW5kIiwiREVGQVVMVF9TVEFURSIsImFuaW1hdGlvbiIsInByb3BzSW5UcmFuc2l0aW9uIiwic3RhcnRQcm9wcyIsImVuZFByb3BzIiwiVHJhbnNpdGlvbk1hbmFnZXIiLCJwcm9wcyIsInN0YXRlIiwiX29uVHJhbnNpdGlvbkZyYW1lIiwiYmluZCIsIm5leHRQcm9wcyIsInRyYW5zaXRpb25UcmlnZ2VyZWQiLCJjdXJyZW50UHJvcHMiLCJfc2hvdWxkSWdub3JlVmlld3BvcnRDaGFuZ2UiLCJpc1RyYW5zaXRpb25JblByb2dyZXNzIiwiX2lzVHJhbnNpdGlvbkluUHJvZ3Jlc3MiLCJfaXNUcmFuc2l0aW9uRW5hYmxlZCIsIk9iamVjdCIsImFzc2lnbiIsImludGVycnVwdGlvbiIsIl90cmlnZ2VyVHJhbnNpdGlvbiIsIl9lbmRUcmFuc2l0aW9uIiwiaW50ZXJwb2xhdG9yIiwiYXJlUHJvcHNFcXVhbCIsIl9pc1VwZGF0ZUR1ZVRvQ3VycmVudFRyYW5zaXRpb24iLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImluaXRpYWxQcm9wcyIsImluaXRpYWxpemVQcm9wcyIsImR1cmF0aW9uIiwiZWFzaW5nIiwic3RhcnRUaW1lIiwiRGF0ZSIsIm5vdyIsInN0YXJ0IiwiZW5kIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiX3VwZGF0ZVZpZXdwb3J0IiwiY3VycmVudFRpbWUiLCJzaG91bGRFbmQiLCJ2aWV3cG9ydCIsImludGVycG9sYXRlUHJvcHMiLCJvblZpZXdwb3J0Q2hhbmdlIiwiaW5UcmFuc2l0aW9uIiwiZGVmYXVsdFByb3BzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQSxPQUFPQSxrQkFBUCxNQUErQixvQ0FBL0I7QUFDQSxTQUFRQyxtQkFBUixRQUFrQyxpQ0FBbEM7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFFBQW5COztBQUVBLElBQU1DLE9BQU8sU0FBUEEsSUFBTyxHQUFNLENBQUUsQ0FBckI7O0FBRUEsT0FBTyxJQUFNQyxvQkFBb0I7QUFDL0JDLFNBQU8sQ0FEd0I7QUFFL0JDLGVBQWEsQ0FGa0I7QUFHL0JDLFVBQVE7QUFIdUIsQ0FBMUI7O0FBTVAsSUFBTUMsZ0JBQWdCO0FBQ3BCQyxzQkFBb0IsQ0FEQTtBQUVwQkMsb0JBQWtCO0FBQUEsV0FBS0MsQ0FBTDtBQUFBLEdBRkU7QUFHcEJDLDBCQUF3QixJQUFJWixrQkFBSixFQUhKO0FBSXBCYSwwQkFBd0JULGtCQUFrQkMsS0FKdEI7QUFLcEJTLHFCQUFtQlgsSUFMQztBQU1wQlkseUJBQXVCWixJQU5IO0FBT3BCYSxtQkFBaUJiO0FBUEcsQ0FBdEI7O0FBVUEsSUFBTWMsZ0JBQWdCO0FBQ3BCQyxhQUFXLElBRFM7QUFFcEJDLHFCQUFtQixJQUZDO0FBR3BCQyxjQUFZLElBSFE7QUFJcEJDLFlBQVU7QUFKVSxDQUF0Qjs7SUFPcUJDLGlCO0FBQ25CLDZCQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQ2pCLFNBQUtBLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLEtBQUwsR0FBYVAsYUFBYjs7QUFFQSxTQUFLUSxrQkFBTCxHQUEwQixLQUFLQSxrQkFBTCxDQUF3QkMsSUFBeEIsQ0FBNkIsSUFBN0IsQ0FBMUI7QUFDRDs7QUFFRDs7Ozs7OENBQzBCO0FBQ3hCLGFBQU8sS0FBS0YsS0FBTCxDQUFXTCxp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S0FBTCxDQUFXTCxpQkFBdkMsRUFBMEQsRUFBQ3dDLGNBQWMsSUFBZixFQUExRDtBQUNEOztBQUVELFVBQUlKLFNBQUosRUFBZTtBQUNiLGFBQUtqQixjQUFMO0FBQ0EsYUFBS2YsS0FBTCxDQUFXUCxlQUFYO0FBQ0Q7QUFDRjs7Ozs7O2VBakprQk0saUI7OztBQW9KckJBLGtCQUFrQnNDLFlBQWxCLEdBQWlDcEQsYUFBakMiLCJmaWxlIjoidHJhbnNpdGlvbi1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIHJlcXVlc3RBbmltYXRpb25GcmFtZSwgY2FuY2VsQW5pbWF0aW9uRnJhbWUgKi9cbmltcG9ydCBMaW5lYXJJbnRlcnBvbGF0b3IgZnJvbSAnLi4vdHJhbnNpdGlvbnMvbGluZWFyLWludGVycG9sYXRvcic7XG5pbXBvcnQge2V4dHJhY3RWaWV3cG9ydEZyb219IGZyb20gJy4uL3RyYW5zaXRpb25zL3RyYW5zaXRpb24tdXRpbHMnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBub29wID0gKCkgPT4ge307XG5cbmV4cG9ydCBjb25zdCBUUkFOU0lUSU9OX0VWRU5UUyA9IHtcbiAgQlJFQUs6IDEsXG4gIFNOQVBfVE9fRU5EOiAyLFxuICBJR05PUkU6IDNcbn07XG5cbmNvbnN0IERFRkFVTFRfUFJPUFMgPSB7XG4gIHRyYW5zaXRpb25EdXJhdGlvbjogMCxcbiAgdHJhbnNpdGlvbkVhc2luZzogdCA9PiB0LFxuICB0cmFuc2l0aW9uSW50ZXJwb2xhdG9yOiBuZXcgTGluZWFySW50ZXJwb2xhdG9yKCksXG4gIHRyYW5zaXRpb25JbnRlcnJ1cHRpb246IFRSQU5TSVRJT05fRVZFTlRTLkJSRUFLLFxuICBvblRyYW5zaXRpb25TdGFydDogbm9vcCxcbiAgb25UcmFuc2l0aW9uSW50ZXJydXB0OiBub29wLFxuICBvblRyYW5zaXRpb25FbmQ6IG5vb3Bcbn07XG5cbmNvbnN0IERFRkFVTFRfU1RBVEUgPSB7XG4gIGFuaW1hdGlvbjogbnVsbCxcbiAgcHJvcHNJblRyYW5zaXRpb246IG51bGwsXG4gIHN0YXJ0UHJvcHM6IG51bGwsXG4gIGVuZFByb3BzOiBudWxsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFuc2l0aW9uTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIHRoaXMuc3RhdGUgPSBERUZBVUxUX1NUQVRFO1xuXG4gICAgdGhpcy5fb25UcmFuc2l0aW9uRnJhbWUgPSB0aGlzLl9vblRyYW5zaXRpb25GcmFtZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLy8gUmV0dXJucyBjdXJyZW50IHRyYW5zaXRpb25lZCB2aWV3cG9ydC5cbiAgZ2V0Vmlld3BvcnRJblRyYW5zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucHJvcHNJblRyYW5zaXRpb247XG4gIH1cblxuICAvLyBQcm9jZXNzIHRoZSB2ZXdpcG9ydCBjaGFuZ2UsIGVpdGhlciBpZ25vcmUgb3IgdHJpZ2dlciBhIG5ldyB0cmFuc2l0b24uXG4gIC8vIFJldHVybiB0cnVlIGlmIGEgbmV3IHRyYW5zaXRpb24gaXMgdHJpZ2dlcmVkLCBmYWxzZSBvdGhlcndpc2UuXG4gIHByb2Nlc3NWaWV3cG9ydENoYW5nZShuZXh0UHJvcHMpIHtcbiAgICBsZXQgdHJhbnNpdGlvblRyaWdnZXJlZCA9IGZhbHNlO1xuICAgIGNvbnN0IGN1cnJlbnRQcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgLy8gU2V0IHRoaXMucHJvcHMgaGVyZSBhcyAnX3RyaWdnZXJUcmFuc2l0aW9uJyBjYWxscyAnX3VwZGF0ZVZpZXdwb3J0JyB0aGF0IHVzZXMgdGhpcy5wcm9wcy5cbiAgICB0aGlzLnByb3BzID0gbmV4dFByb3BzO1xuXG4gICAgLy8gTk9URTogQmUgY2F1dGlvdXMgcmUtb3JkZXJpbmcgc3RhdGVtZW50cyBpbiB0aGlzIGZ1bmN0aW9uLlxuICAgIGlmICh0aGlzLl9zaG91bGRJZ25vcmVWaWV3cG9ydENoYW5nZShjdXJyZW50UHJvcHMsIG5leHRQcm9wcykpIHtcbiAgICAgIHJldHVybiB0cmFuc2l0aW9uVHJpZ2dlcmVkO1xuICAgIH1cblxuICAgIGNvbnN0IGlzVHJhbnNpdGlvbkluUHJvZ3Jlc3MgPSB0aGlzLl9pc1RyYW5zaXRpb25JblByb2dyZXNzKCk7XG5cbiAgICBpZiAodGhpcy5faXNUcmFuc2l0aW9uRW5hYmxlZChuZXh0UHJvcHMpKSB7XG4gICAgICBjb25zdCBzdGFydFByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFByb3BzLFxuICAgICAgICB0aGlzLnN0YXRlLmludGVycnVwdGlvbiA9PT0gVFJBTlNJVElPTl9FVkVOVFMuU05BUF9UT19FTkQgP1xuICAgICAgICB0aGlzLnN0YXRlLmVuZFByb3BzIDogKHRoaXMuc3RhdGUucHJvcHNJblRyYW5zaXRpb24gfHwgY3VycmVudFByb3BzKVxuICAgICAgKTtcblxuICAgICAgaWYgKGlzVHJhbnNpdGlvbkluUHJvZ3Jlc3MpIHtcbiAgICAgICAgY3VycmVudFByb3BzLm9uVHJhbnNpdGlvbkludGVycnVwdCgpO1xuICAgICAgfVxuICAgICAgbmV4dFByb3BzLm9uVHJhbnNpdGlvblN0YXJ0KCk7XG5cbiAgICAgIHRoaXMuX3RyaWdnZXJUcmFuc2l0aW9uKHN0YXJ0UHJvcHMsIG5leHRQcm9wcyk7XG5cbiAgICAgIHRyYW5zaXRpb25UcmlnZ2VyZWQgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoaXNUcmFuc2l0aW9uSW5Qcm9ncmVzcykge1xuICAgICAgY3VycmVudFByb3BzLm9uVHJhbnNpdGlvbkludGVycnVwdCgpO1xuICAgICAgdGhpcy5fZW5kVHJhbnNpdGlvbigpO1xuICAgIH1cblxuICAgIHJldHVybiB0cmFuc2l0aW9uVHJpZ2dlcmVkO1xuICB9XG5cbiAgLy8gSGVscGVyIG1ldGhvZHNcblxuICBfaXNUcmFuc2l0aW9uSW5Qcm9ncmVzcygpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5wcm9wc0luVHJhbnNpdGlvbjtcbiAgfVxuXG4gIF9pc1RyYW5zaXRpb25FbmFibGVkKHByb3BzKSB7XG4gICAgcmV0dXJuIHByb3BzLnRyYW5zaXRpb25EdXJhdGlvbiA+IDAgJiYgcHJvcHMudHJhbnNpdGlvbkludGVycG9sYXRvcjtcbiAgfVxuXG4gIF9pc1VwZGF0ZUR1ZVRvQ3VycmVudFRyYW5zaXRpb24ocHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5wcm9wc0luVHJhbnNpdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuaW50ZXJwb2xhdG9yLmFyZVByb3BzRXF1YWwocHJvcHMsIHRoaXMuc3RhdGUucHJvcHNJblRyYW5zaXRpb24pO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBfc2hvdWxkSWdub3JlVmlld3BvcnRDaGFuZ2UoY3VycmVudFByb3BzLCBuZXh0UHJvcHMpIHtcbiAgICBpZiAodGhpcy5faXNUcmFuc2l0aW9uSW5Qcm9ncmVzcygpKSB7XG4gICAgICAvLyBJZ25vcmUgdXBkYXRlIGlmIGl0IGlzIHJlcXVlc3RlZCB0byBiZSBpZ25vcmVkXG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5pbnRlcnJ1cHRpb24gPT09IFRSQU5TSVRJT05fRVZFTlRTLklHTk9SRSB8fFxuICAgICAgICAvLyBJZ25vcmUgdXBkYXRlIGlmIGl0IGlzIGR1ZSB0byBjdXJyZW50IGFjdGl2ZSB0cmFuc2l0aW9uLlxuICAgICAgICB0aGlzLl9pc1VwZGF0ZUR1ZVRvQ3VycmVudFRyYW5zaXRpb24obmV4dFByb3BzKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2lzVHJhbnNpdGlvbkVuYWJsZWQobmV4dFByb3BzKSkge1xuICAgICAgLy8gSWdub3JlIGlmIG5vbmUgb2YgdGhlIHZpZXdwb3J0IHByb3BzIGNoYW5nZWQuXG4gICAgICByZXR1cm4gbmV4dFByb3BzLnRyYW5zaXRpb25JbnRlcnBvbGF0b3IuYXJlUHJvcHNFcXVhbChjdXJyZW50UHJvcHMsIG5leHRQcm9wcyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgX3RyaWdnZXJUcmFuc2l0aW9uKHN0YXJ0UHJvcHMsIGVuZFByb3BzKSB7XG4gICAgYXNzZXJ0KHRoaXMuX2lzVHJhbnNpdGlvbkVuYWJsZWQoZW5kUHJvcHMpLCAnVHJhbnNpdGlvbiBpcyBub3QgZW5hYmxlZCcpO1xuXG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5zdGF0ZS5hbmltYXRpb24pO1xuXG4gICAgY29uc3QgaW5pdGlhbFByb3BzID0gZW5kUHJvcHMudHJhbnNpdGlvbkludGVycG9sYXRvci5pbml0aWFsaXplUHJvcHMoXG4gICAgICBzdGFydFByb3BzLFxuICAgICAgZW5kUHJvcHNcbiAgICApO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIC8vIFNhdmUgY3VycmVudCB0cmFuc2l0aW9uIHByb3BzXG4gICAgICBkdXJhdGlvbjogZW5kUHJvcHMudHJhbnNpdGlvbkR1cmF0aW9uLFxuICAgICAgZWFzaW5nOiBlbmRQcm9wcy50cmFuc2l0aW9uRWFzaW5nLFxuICAgICAgaW50ZXJwb2xhdG9yOiBlbmRQcm9wcy50cmFuc2l0aW9uSW50ZXJwb2xhdG9yLFxuICAgICAgaW50ZXJydXB0aW9uOiBlbmRQcm9wcy50cmFuc2l0aW9uSW50ZXJydXB0aW9uLFxuXG4gICAgICBzdGFydFRpbWU6IERhdGUubm93KCksXG4gICAgICBzdGFydFByb3BzOiBpbml0aWFsUHJvcHMuc3RhcnQsXG4gICAgICBlbmRQcm9wczogaW5pdGlhbFByb3BzLmVuZCxcbiAgICAgIGFuaW1hdGlvbjogbnVsbCxcbiAgICAgIHByb3BzSW5UcmFuc2l0aW9uOiB7fVxuICAgIH07XG5cbiAgICB0aGlzLl9vblRyYW5zaXRpb25GcmFtZSgpO1xuICB9XG5cbiAgX29uVHJhbnNpdGlvbkZyYW1lKCkge1xuICAgIC8vIF91cGRhdGVWaWV3cG9ydCgpIG1heSBjYW5jZWwgdGhlIGFuaW1hdGlvblxuICAgIHRoaXMuc3RhdGUuYW5pbWF0aW9uID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX29uVHJhbnNpdGlvbkZyYW1lKTtcbiAgICB0aGlzLl91cGRhdGVWaWV3cG9ydCgpO1xuICB9XG5cbiAgX2VuZFRyYW5zaXRpb24oKSB7XG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5zdGF0ZS5hbmltYXRpb24pO1xuICAgIHRoaXMuc3RhdGUgPSBERUZBVUxUX1NUQVRFO1xuICB9XG5cbiAgX3VwZGF0ZVZpZXdwb3J0KCkge1xuICAgIC8vIE5PVEU6IEJlIGNhdXRpb3VzIHJlLW9yZGVyaW5nIHN0YXRlbWVudHMgaW4gdGhpcyBmdW5jdGlvbi5cbiAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XG4gICAgY29uc3Qge3N0YXJ0VGltZSwgZHVyYXRpb24sIGVhc2luZywgaW50ZXJwb2xhdG9yLCBzdGFydFByb3BzLCBlbmRQcm9wc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgbGV0IHNob3VsZEVuZCA9IGZhbHNlO1xuICAgIGxldCB0ID0gKGN1cnJlbnRUaW1lIC0gc3RhcnRUaW1lKSAvIGR1cmF0aW9uO1xuICAgIGlmICh0ID49IDEpIHtcbiAgICAgIHQgPSAxO1xuICAgICAgc2hvdWxkRW5kID0gdHJ1ZTtcbiAgICB9XG4gICAgdCA9IGVhc2luZyh0KTtcblxuICAgIGNvbnN0IHZpZXdwb3J0ID0gaW50ZXJwb2xhdG9yLmludGVycG9sYXRlUHJvcHMoc3RhcnRQcm9wcywgZW5kUHJvcHMsIHQpO1xuXG4gICAgLy8gVGhpcyBleHRyYWN0Vmlld3BvcnRGcm9tIGd1cmFudGVlcyBhbmdsZSBwcm9wcyAoYmVhcmluZywgbG9uZ2l0dWRlKSBhcmUgbm9ybWFsaXplZFxuICAgIC8vIFNvIHdoZW4gdmlld3BvcnRzIGFyZSBjb21wYXJlZCB0aGV5IGFyZSBpbiBzYW1lIHJhbmdlLlxuICAgIHRoaXMuc3RhdGUucHJvcHNJblRyYW5zaXRpb24gPSBleHRyYWN0Vmlld3BvcnRGcm9tKE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHZpZXdwb3J0KSk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vblZpZXdwb3J0Q2hhbmdlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVmlld3BvcnRDaGFuZ2UodGhpcy5zdGF0ZS5wcm9wc0luVHJhbnNpdGlvbiwge2luVHJhbnNpdGlvbjogdHJ1ZX0pO1xuICAgIH1cblxuICAgIGlmIChzaG91bGRFbmQpIHtcbiAgICAgIHRoaXMuX2VuZFRyYW5zaXRpb24oKTtcbiAgICAgIHRoaXMucHJvcHMub25UcmFuc2l0aW9uRW5kKCk7XG4gICAgfVxuICB9XG59XG5cblRyYW5zaXRpb25NYW5hZ2VyLmRlZmF1bHRQcm9wcyA9IERFRkFVTFRfUFJPUFM7XG4iXX0=