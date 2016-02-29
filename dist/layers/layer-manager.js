'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchLayers = matchLayers;
exports.initializeNewLayers = initializeNewLayers;
exports.updateMatchedLayers = updateMatchedLayers;
exports.finalizeOldLayers = finalizeOldLayers;
exports.layersNeedRedraw = layersNeedRedraw;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// IMLEMENTATION NOTES: Why new layers are created on every render
//
// The key here is to understand the declarative / functional
// programming nature of React.
//
// - In React, the a representation of the entire "UI tree" is re-rendered
//   every time something changes.
// - React then diffs the rendered tree of "ReactElements" against the
// previous tree and makes optimized changes to the DOM.
//
// - Due the difficulty of making non-DOM elements in React 14, our Layers
// are a "pseudo-react" construct. So, the render function will indeed create
// new layers every render call, however the new layers are immediately
// matched against existing layers using layer index/layer id.
// A new layers only has a props field pointing to the unmodified props
// object supplied by the app on creation.
// All calculated state (programs, attributes etc) are stored in a state object
// and this state object is moved forward to the new layer every render.
// The new layer ends up with the state of the old layer but the props of
// the new layer, while the old layer is discarded.

function matchLayers(oldLayers, newLayers) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = newLayers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var newLayer = _step.value;

      // 1. given a new coming layer, find its matching layer
      var oldLayer = _findMatchingLayer(oldLayers, newLayer);

      // Only transfer state at this stage. We must not generate exceptions
      // until all layers' state have been transferred
      if (oldLayer) {
        var state = oldLayer.state;
        var props = oldLayer.props;

        (0, _assert2.default)(state, 'Matching layer has no state');
        (0, _assert2.default)(oldLayer !== newLayer, 'Matching layer is same');
        // Copy state
        newLayer.state = state;
        // Keep a temporary ref to the old props, for prop comparison
        newLayer.oldProps = props;
        oldLayer.state = null;
        (0, _log2.default)(3, 'matched layer ' + newLayer.props.id + ' o->n', oldLayer, newLayer);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

// Note: Layers can't be initialized until gl context is available
function initializeNewLayers(layers, _ref) {
  var gl = _ref.gl;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = layers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var layer = _step2.value;

      if (!layer.state) {
        // New layer, initialize it's state
        (0, _log2.default)(1, 'initializing layer ' + layer.props.id);
        layer.initializeLayer({ gl: gl });
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

// Update the matched layers
function updateMatchedLayers(newLayers) {
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = newLayers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var layer = _step3.value;
      var oldProps = layer.oldProps;
      var props = layer.props;

      if (oldProps) {
        layer.updateLayer(oldProps, props);
        (0, _log2.default)(2, 'updating layer ' + layer.props.id);
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
}

// Update the old layers that were matched
function finalizeOldLayers(oldLayers) {
  // Unmatched layers still have state, it will be discarded
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = oldLayers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var layer = _step4.value;
      var state = layer.state;

      if (state) {
        layer.finalizeLayer();
        layer.state = null;
        (0, _log2.default)(1, 'finalizing layer ' + layer.props.id);
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }
}

function layersNeedRedraw(layers, _ref2) {
  var clearFlag = _ref2.clearFlag;

  var needRedraw = false;
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = layers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var layer = _step5.value;

      needRedraw = needRedraw || layer.getNeedsRedraw({ clearFlag: clearFlag });
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  return needRedraw;
}

function _findMatchingLayer(oldLayers, newLayer) {
  var candidates = oldLayers.filter(function (l) {
    return l.props.id === newLayer.props.id;
  });
  if (candidates.length > 1) {
    throw new Error('Layer has more than one matching layers ' + newLayer.id);
  }
  return candidates.length > 0 && candidates[0];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXllcnMvbGF5ZXItbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQXlCZ0I7UUFzQkE7UUFXQTtRQVdBO1FBWUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXhEVCxTQUFTLFdBQVQsQ0FBcUIsU0FBckIsRUFBZ0MsU0FBaEMsRUFBMkM7Ozs7OztBQUNoRCx5QkFBdUIsbUNBQXZCLG9HQUFrQztVQUF2Qix1QkFBdUI7OztBQUVoQyxVQUFNLFdBQVcsbUJBQW1CLFNBQW5CLEVBQThCLFFBQTlCLENBQVg7Ozs7QUFGMEIsVUFNNUIsUUFBSixFQUFjO1lBQ0wsUUFBZ0IsU0FBaEIsTUFESztZQUNFLFFBQVMsU0FBVCxNQURGOztBQUVaLDhCQUFPLEtBQVAsRUFBYyw2QkFBZCxFQUZZO0FBR1osOEJBQU8sYUFBYSxRQUFiLEVBQXVCLHdCQUE5Qjs7QUFIWSxnQkFLWixDQUFTLEtBQVQsR0FBaUIsS0FBakI7O0FBTFksZ0JBT1osQ0FBUyxRQUFULEdBQW9CLEtBQXBCLENBUFk7QUFRWixpQkFBUyxLQUFULEdBQWlCLElBQWpCLENBUlk7QUFTWiwyQkFBSSxDQUFKLHFCQUF3QixTQUFTLEtBQVQsQ0FBZSxFQUFmLFVBQXhCLEVBQWtELFFBQWxELEVBQTRELFFBQTVELEVBVFk7T0FBZDtLQU5GOzs7Ozs7Ozs7Ozs7OztHQURnRDtDQUEzQzs7O0FBc0JBLFNBQVMsbUJBQVQsQ0FBNkIsTUFBN0IsUUFBMkM7TUFBTCxhQUFLOzs7Ozs7QUFDaEQsMEJBQW9CLGlDQUFwQix3R0FBNEI7VUFBakIscUJBQWlCOztBQUMxQixVQUFJLENBQUMsTUFBTSxLQUFOLEVBQWE7O0FBRWhCLDJCQUFJLENBQUosMEJBQTZCLE1BQU0sS0FBTixDQUFZLEVBQVosQ0FBN0IsQ0FGZ0I7QUFHaEIsY0FBTSxlQUFOLENBQXNCLEVBQUMsTUFBRCxFQUF0QixFQUhnQjtPQUFsQjtLQURGOzs7Ozs7Ozs7Ozs7OztHQURnRDtDQUEzQzs7O0FBV0EsU0FBUyxtQkFBVCxDQUE2QixTQUE3QixFQUF3Qzs7Ozs7O0FBQzdDLDBCQUFvQixvQ0FBcEIsd0dBQStCO1VBQXBCLHFCQUFvQjtVQUN0QixXQUFtQixNQUFuQixTQURzQjtVQUNaLFFBQVMsTUFBVCxNQURZOztBQUU3QixVQUFJLFFBQUosRUFBYztBQUNaLGNBQU0sV0FBTixDQUFrQixRQUFsQixFQUE0QixLQUE1QixFQURZO0FBRVosMkJBQUksQ0FBSixzQkFBeUIsTUFBTSxLQUFOLENBQVksRUFBWixDQUF6QixDQUZZO09BQWQ7S0FGRjs7Ozs7Ozs7Ozs7Ozs7R0FENkM7Q0FBeEM7OztBQVdBLFNBQVMsaUJBQVQsQ0FBMkIsU0FBM0IsRUFBc0M7Ozs7Ozs7QUFFM0MsMEJBQW9CLG9DQUFwQix3R0FBK0I7VUFBcEIscUJBQW9CO1VBQ3RCLFFBQVMsTUFBVCxNQURzQjs7QUFFN0IsVUFBSSxLQUFKLEVBQVc7QUFDVCxjQUFNLGFBQU4sR0FEUztBQUVULGNBQU0sS0FBTixHQUFjLElBQWQsQ0FGUztBQUdULDJCQUFJLENBQUosd0JBQTJCLE1BQU0sS0FBTixDQUFZLEVBQVosQ0FBM0IsQ0FIUztPQUFYO0tBRkY7Ozs7Ozs7Ozs7Ozs7O0dBRjJDO0NBQXRDOztBQVlBLFNBQVMsZ0JBQVQsQ0FBMEIsTUFBMUIsU0FBK0M7TUFBWiw0QkFBWTs7QUFDcEQsTUFBSSxhQUFhLEtBQWIsQ0FEZ0Q7Ozs7OztBQUVwRCwwQkFBb0IsaUNBQXBCLHdHQUE0QjtVQUFqQixxQkFBaUI7O0FBQzFCLG1CQUFhLGNBQWMsTUFBTSxjQUFOLENBQXFCLEVBQUMsb0JBQUQsRUFBckIsQ0FBZCxDQURhO0tBQTVCOzs7Ozs7Ozs7Ozs7OztHQUZvRDs7QUFLcEQsU0FBTyxVQUFQLENBTG9EO0NBQS9DOztBQVFQLFNBQVMsa0JBQVQsQ0FBNEIsU0FBNUIsRUFBdUMsUUFBdkMsRUFBaUQ7QUFDL0MsTUFBTSxhQUFhLFVBQVUsTUFBVixDQUFpQjtXQUFLLEVBQUUsS0FBRixDQUFRLEVBQVIsS0FBZSxTQUFTLEtBQVQsQ0FBZSxFQUFmO0dBQXBCLENBQTlCLENBRHlDO0FBRS9DLE1BQUksV0FBVyxNQUFYLEdBQW9CLENBQXBCLEVBQXVCO0FBQ3pCLFVBQU0sSUFBSSxLQUFKLDhDQUFxRCxTQUFTLEVBQVQsQ0FBM0QsQ0FEeUI7R0FBM0I7QUFHQSxTQUFPLFdBQVcsTUFBWCxHQUFvQixDQUFwQixJQUF5QixXQUFXLENBQVgsQ0FBekIsQ0FMd0M7Q0FBakQiLCJmaWxlIjoibGF5ZXItbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gSU1MRU1FTlRBVElPTiBOT1RFUzogV2h5IG5ldyBsYXllcnMgYXJlIGNyZWF0ZWQgb24gZXZlcnkgcmVuZGVyXG4vL1xuLy8gVGhlIGtleSBoZXJlIGlzIHRvIHVuZGVyc3RhbmQgdGhlIGRlY2xhcmF0aXZlIC8gZnVuY3Rpb25hbFxuLy8gcHJvZ3JhbW1pbmcgbmF0dXJlIG9mIFJlYWN0LlxuLy9cbi8vIC0gSW4gUmVhY3QsIHRoZSBhIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbnRpcmUgXCJVSSB0cmVlXCIgaXMgcmUtcmVuZGVyZWRcbi8vICAgZXZlcnkgdGltZSBzb21ldGhpbmcgY2hhbmdlcy5cbi8vIC0gUmVhY3QgdGhlbiBkaWZmcyB0aGUgcmVuZGVyZWQgdHJlZSBvZiBcIlJlYWN0RWxlbWVudHNcIiBhZ2FpbnN0IHRoZVxuLy8gcHJldmlvdXMgdHJlZSBhbmQgbWFrZXMgb3B0aW1pemVkIGNoYW5nZXMgdG8gdGhlIERPTS5cbi8vXG4vLyAtIER1ZSB0aGUgZGlmZmljdWx0eSBvZiBtYWtpbmcgbm9uLURPTSBlbGVtZW50cyBpbiBSZWFjdCAxNCwgb3VyIExheWVyc1xuLy8gYXJlIGEgXCJwc2V1ZG8tcmVhY3RcIiBjb25zdHJ1Y3QuIFNvLCB0aGUgcmVuZGVyIGZ1bmN0aW9uIHdpbGwgaW5kZWVkIGNyZWF0ZVxuLy8gbmV3IGxheWVycyBldmVyeSByZW5kZXIgY2FsbCwgaG93ZXZlciB0aGUgbmV3IGxheWVycyBhcmUgaW1tZWRpYXRlbHlcbi8vIG1hdGNoZWQgYWdhaW5zdCBleGlzdGluZyBsYXllcnMgdXNpbmcgbGF5ZXIgaW5kZXgvbGF5ZXIgaWQuXG4vLyBBIG5ldyBsYXllcnMgb25seSBoYXMgYSBwcm9wcyBmaWVsZCBwb2ludGluZyB0byB0aGUgdW5tb2RpZmllZCBwcm9wc1xuLy8gb2JqZWN0IHN1cHBsaWVkIGJ5IHRoZSBhcHAgb24gY3JlYXRpb24uXG4vLyBBbGwgY2FsY3VsYXRlZCBzdGF0ZSAocHJvZ3JhbXMsIGF0dHJpYnV0ZXMgZXRjKSBhcmUgc3RvcmVkIGluIGEgc3RhdGUgb2JqZWN0XG4vLyBhbmQgdGhpcyBzdGF0ZSBvYmplY3QgaXMgbW92ZWQgZm9yd2FyZCB0byB0aGUgbmV3IGxheWVyIGV2ZXJ5IHJlbmRlci5cbi8vIFRoZSBuZXcgbGF5ZXIgZW5kcyB1cCB3aXRoIHRoZSBzdGF0ZSBvZiB0aGUgb2xkIGxheWVyIGJ1dCB0aGUgcHJvcHMgb2Zcbi8vIHRoZSBuZXcgbGF5ZXIsIHdoaWxlIHRoZSBvbGQgbGF5ZXIgaXMgZGlzY2FyZGVkLlxuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgbG9nIGZyb20gJy4uL2xvZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXRjaExheWVycyhvbGRMYXllcnMsIG5ld0xheWVycykge1xuICBmb3IgKGNvbnN0IG5ld0xheWVyIG9mIG5ld0xheWVycykge1xuICAgIC8vIDEuIGdpdmVuIGEgbmV3IGNvbWluZyBsYXllciwgZmluZCBpdHMgbWF0Y2hpbmcgbGF5ZXJcbiAgICBjb25zdCBvbGRMYXllciA9IF9maW5kTWF0Y2hpbmdMYXllcihvbGRMYXllcnMsIG5ld0xheWVyKTtcblxuICAgIC8vIE9ubHkgdHJhbnNmZXIgc3RhdGUgYXQgdGhpcyBzdGFnZS4gV2UgbXVzdCBub3QgZ2VuZXJhdGUgZXhjZXB0aW9uc1xuICAgIC8vIHVudGlsIGFsbCBsYXllcnMnIHN0YXRlIGhhdmUgYmVlbiB0cmFuc2ZlcnJlZFxuICAgIGlmIChvbGRMYXllcikge1xuICAgICAgY29uc3Qge3N0YXRlLCBwcm9wc30gPSBvbGRMYXllcjtcbiAgICAgIGFzc2VydChzdGF0ZSwgJ01hdGNoaW5nIGxheWVyIGhhcyBubyBzdGF0ZScpO1xuICAgICAgYXNzZXJ0KG9sZExheWVyICE9PSBuZXdMYXllciwgJ01hdGNoaW5nIGxheWVyIGlzIHNhbWUnKTtcbiAgICAgIC8vIENvcHkgc3RhdGVcbiAgICAgIG5ld0xheWVyLnN0YXRlID0gc3RhdGU7XG4gICAgICAvLyBLZWVwIGEgdGVtcG9yYXJ5IHJlZiB0byB0aGUgb2xkIHByb3BzLCBmb3IgcHJvcCBjb21wYXJpc29uXG4gICAgICBuZXdMYXllci5vbGRQcm9wcyA9IHByb3BzO1xuICAgICAgb2xkTGF5ZXIuc3RhdGUgPSBudWxsO1xuICAgICAgbG9nKDMsIGBtYXRjaGVkIGxheWVyICR7bmV3TGF5ZXIucHJvcHMuaWR9IG8tPm5gLCBvbGRMYXllciwgbmV3TGF5ZXIpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBOb3RlOiBMYXllcnMgY2FuJ3QgYmUgaW5pdGlhbGl6ZWQgdW50aWwgZ2wgY29udGV4dCBpcyBhdmFpbGFibGVcbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplTmV3TGF5ZXJzKGxheWVycywge2dsfSkge1xuICBmb3IgKGNvbnN0IGxheWVyIG9mIGxheWVycykge1xuICAgIGlmICghbGF5ZXIuc3RhdGUpIHtcbiAgICAgIC8vIE5ldyBsYXllciwgaW5pdGlhbGl6ZSBpdCdzIHN0YXRlXG4gICAgICBsb2coMSwgYGluaXRpYWxpemluZyBsYXllciAke2xheWVyLnByb3BzLmlkfWApO1xuICAgICAgbGF5ZXIuaW5pdGlhbGl6ZUxheWVyKHtnbH0pO1xuICAgIH1cbiAgfVxufVxuXG4vLyBVcGRhdGUgdGhlIG1hdGNoZWQgbGF5ZXJzXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlTWF0Y2hlZExheWVycyhuZXdMYXllcnMpIHtcbiAgZm9yIChjb25zdCBsYXllciBvZiBuZXdMYXllcnMpIHtcbiAgICBjb25zdCB7b2xkUHJvcHMsIHByb3BzfSA9IGxheWVyO1xuICAgIGlmIChvbGRQcm9wcykge1xuICAgICAgbGF5ZXIudXBkYXRlTGF5ZXIob2xkUHJvcHMsIHByb3BzKTtcbiAgICAgIGxvZygyLCBgdXBkYXRpbmcgbGF5ZXIgJHtsYXllci5wcm9wcy5pZH1gKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gVXBkYXRlIHRoZSBvbGQgbGF5ZXJzIHRoYXQgd2VyZSBtYXRjaGVkXG5leHBvcnQgZnVuY3Rpb24gZmluYWxpemVPbGRMYXllcnMob2xkTGF5ZXJzKSB7XG4gIC8vIFVubWF0Y2hlZCBsYXllcnMgc3RpbGwgaGF2ZSBzdGF0ZSwgaXQgd2lsbCBiZSBkaXNjYXJkZWRcbiAgZm9yIChjb25zdCBsYXllciBvZiBvbGRMYXllcnMpIHtcbiAgICBjb25zdCB7c3RhdGV9ID0gbGF5ZXI7XG4gICAgaWYgKHN0YXRlKSB7XG4gICAgICBsYXllci5maW5hbGl6ZUxheWVyKCk7XG4gICAgICBsYXllci5zdGF0ZSA9IG51bGw7XG4gICAgICBsb2coMSwgYGZpbmFsaXppbmcgbGF5ZXIgJHtsYXllci5wcm9wcy5pZH1gKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxheWVyc05lZWRSZWRyYXcobGF5ZXJzLCB7Y2xlYXJGbGFnfSkge1xuICBsZXQgbmVlZFJlZHJhdyA9IGZhbHNlO1xuICBmb3IgKGNvbnN0IGxheWVyIG9mIGxheWVycykge1xuICAgIG5lZWRSZWRyYXcgPSBuZWVkUmVkcmF3IHx8IGxheWVyLmdldE5lZWRzUmVkcmF3KHtjbGVhckZsYWd9KTtcbiAgfVxuICByZXR1cm4gbmVlZFJlZHJhdztcbn1cblxuZnVuY3Rpb24gX2ZpbmRNYXRjaGluZ0xheWVyKG9sZExheWVycywgbmV3TGF5ZXIpIHtcbiAgY29uc3QgY2FuZGlkYXRlcyA9IG9sZExheWVycy5maWx0ZXIobCA9PiBsLnByb3BzLmlkID09PSBuZXdMYXllci5wcm9wcy5pZCk7XG4gIGlmIChjYW5kaWRhdGVzLmxlbmd0aCA+IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYExheWVyIGhhcyBtb3JlIHRoYW4gb25lIG1hdGNoaW5nIGxheWVycyAke25ld0xheWVyLmlkfWApO1xuICB9XG4gIHJldHVybiBjYW5kaWRhdGVzLmxlbmd0aCA+IDAgJiYgY2FuZGlkYXRlc1swXTtcbn1cbiJdfQ==