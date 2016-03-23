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
        state.layer = newLayer;
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
        layer.state.layer = layer;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXllcnMvbGF5ZXItbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQXlCZ0I7UUF1QkE7UUFZQTtRQVdBO1FBWUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTFEVCxTQUFTLFdBQVQsQ0FBcUIsU0FBckIsRUFBZ0MsU0FBaEMsRUFBMkM7Ozs7OztBQUNoRCx5QkFBdUIsbUNBQXZCLG9HQUFrQztVQUF2Qix1QkFBdUI7OztBQUVoQyxVQUFNLFdBQVcsbUJBQW1CLFNBQW5CLEVBQThCLFFBQTlCLENBQVg7Ozs7QUFGMEIsVUFNNUIsUUFBSixFQUFjO1lBQ0wsUUFBZ0IsU0FBaEIsTUFESztZQUNFLFFBQVMsU0FBVCxNQURGOztBQUVaLDhCQUFPLEtBQVAsRUFBYyw2QkFBZCxFQUZZO0FBR1osOEJBQU8sYUFBYSxRQUFiLEVBQXVCLHdCQUE5Qjs7QUFIWSxnQkFLWixDQUFTLEtBQVQsR0FBaUIsS0FBakIsQ0FMWTtBQU1aLGNBQU0sS0FBTixHQUFjLFFBQWQ7O0FBTlksZ0JBUVosQ0FBUyxRQUFULEdBQW9CLEtBQXBCLENBUlk7QUFTWixpQkFBUyxLQUFULEdBQWlCLElBQWpCLENBVFk7QUFVWiwyQkFBSSxDQUFKLHFCQUF3QixTQUFTLEtBQVQsQ0FBZSxFQUFmLFVBQXhCLEVBQWtELFFBQWxELEVBQTRELFFBQTVELEVBVlk7T0FBZDtLQU5GOzs7Ozs7Ozs7Ozs7OztHQURnRDtDQUEzQzs7O0FBdUJBLFNBQVMsbUJBQVQsQ0FBNkIsTUFBN0IsUUFBMkM7TUFBTCxhQUFLOzs7Ozs7QUFDaEQsMEJBQW9CLGlDQUFwQix3R0FBNEI7VUFBakIscUJBQWlCOztBQUMxQixVQUFJLENBQUMsTUFBTSxLQUFOLEVBQWE7O0FBRWhCLDJCQUFJLENBQUosMEJBQTZCLE1BQU0sS0FBTixDQUFZLEVBQVosQ0FBN0IsQ0FGZ0I7QUFHaEIsY0FBTSxlQUFOLENBQXNCLEVBQUMsTUFBRCxFQUF0QixFQUhnQjtBQUloQixjQUFNLEtBQU4sQ0FBWSxLQUFaLEdBQW9CLEtBQXBCLENBSmdCO09BQWxCO0tBREY7Ozs7Ozs7Ozs7Ozs7O0dBRGdEO0NBQTNDOzs7QUFZQSxTQUFTLG1CQUFULENBQTZCLFNBQTdCLEVBQXdDOzs7Ozs7QUFDN0MsMEJBQW9CLG9DQUFwQix3R0FBK0I7VUFBcEIscUJBQW9CO1VBQ3RCLFdBQW1CLE1BQW5CLFNBRHNCO1VBQ1osUUFBUyxNQUFULE1BRFk7O0FBRTdCLFVBQUksUUFBSixFQUFjO0FBQ1osY0FBTSxXQUFOLENBQWtCLFFBQWxCLEVBQTRCLEtBQTVCLEVBRFk7QUFFWiwyQkFBSSxDQUFKLHNCQUF5QixNQUFNLEtBQU4sQ0FBWSxFQUFaLENBQXpCLENBRlk7T0FBZDtLQUZGOzs7Ozs7Ozs7Ozs7OztHQUQ2QztDQUF4Qzs7O0FBV0EsU0FBUyxpQkFBVCxDQUEyQixTQUEzQixFQUFzQzs7Ozs7OztBQUUzQywwQkFBb0Isb0NBQXBCLHdHQUErQjtVQUFwQixxQkFBb0I7VUFDdEIsUUFBUyxNQUFULE1BRHNCOztBQUU3QixVQUFJLEtBQUosRUFBVztBQUNULGNBQU0sYUFBTixHQURTO0FBRVQsY0FBTSxLQUFOLEdBQWMsSUFBZCxDQUZTO0FBR1QsMkJBQUksQ0FBSix3QkFBMkIsTUFBTSxLQUFOLENBQVksRUFBWixDQUEzQixDQUhTO09BQVg7S0FGRjs7Ozs7Ozs7Ozs7Ozs7R0FGMkM7Q0FBdEM7O0FBWUEsU0FBUyxnQkFBVCxDQUEwQixNQUExQixTQUErQztNQUFaLDRCQUFZOztBQUNwRCxNQUFJLGFBQWEsS0FBYixDQURnRDs7Ozs7O0FBRXBELDBCQUFvQixpQ0FBcEIsd0dBQTRCO1VBQWpCLHFCQUFpQjs7QUFDMUIsbUJBQWEsY0FBYyxNQUFNLGNBQU4sQ0FBcUIsRUFBQyxvQkFBRCxFQUFyQixDQUFkLENBRGE7S0FBNUI7Ozs7Ozs7Ozs7Ozs7O0dBRm9EOztBQUtwRCxTQUFPLFVBQVAsQ0FMb0Q7Q0FBL0M7O0FBUVAsU0FBUyxrQkFBVCxDQUE0QixTQUE1QixFQUF1QyxRQUF2QyxFQUFpRDtBQUMvQyxNQUFNLGFBQWEsVUFBVSxNQUFWLENBQWlCO1dBQUssRUFBRSxLQUFGLENBQVEsRUFBUixLQUFlLFNBQVMsS0FBVCxDQUFlLEVBQWY7R0FBcEIsQ0FBOUIsQ0FEeUM7QUFFL0MsTUFBSSxXQUFXLE1BQVgsR0FBb0IsQ0FBcEIsRUFBdUI7QUFDekIsVUFBTSxJQUFJLEtBQUosOENBQXFELFNBQVMsRUFBVCxDQUEzRCxDQUR5QjtHQUEzQjtBQUdBLFNBQU8sV0FBVyxNQUFYLEdBQW9CLENBQXBCLElBQXlCLFdBQVcsQ0FBWCxDQUF6QixDQUx3QztDQUFqRCIsImZpbGUiOiJsYXllci1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBJTUxFTUVOVEFUSU9OIE5PVEVTOiBXaHkgbmV3IGxheWVycyBhcmUgY3JlYXRlZCBvbiBldmVyeSByZW5kZXJcbi8vXG4vLyBUaGUga2V5IGhlcmUgaXMgdG8gdW5kZXJzdGFuZCB0aGUgZGVjbGFyYXRpdmUgLyBmdW5jdGlvbmFsXG4vLyBwcm9ncmFtbWluZyBuYXR1cmUgb2YgUmVhY3QuXG4vL1xuLy8gLSBJbiBSZWFjdCwgdGhlIGEgcmVwcmVzZW50YXRpb24gb2YgdGhlIGVudGlyZSBcIlVJIHRyZWVcIiBpcyByZS1yZW5kZXJlZFxuLy8gICBldmVyeSB0aW1lIHNvbWV0aGluZyBjaGFuZ2VzLlxuLy8gLSBSZWFjdCB0aGVuIGRpZmZzIHRoZSByZW5kZXJlZCB0cmVlIG9mIFwiUmVhY3RFbGVtZW50c1wiIGFnYWluc3QgdGhlXG4vLyBwcmV2aW91cyB0cmVlIGFuZCBtYWtlcyBvcHRpbWl6ZWQgY2hhbmdlcyB0byB0aGUgRE9NLlxuLy9cbi8vIC0gRHVlIHRoZSBkaWZmaWN1bHR5IG9mIG1ha2luZyBub24tRE9NIGVsZW1lbnRzIGluIFJlYWN0IDE0LCBvdXIgTGF5ZXJzXG4vLyBhcmUgYSBcInBzZXVkby1yZWFjdFwiIGNvbnN0cnVjdC4gU28sIHRoZSByZW5kZXIgZnVuY3Rpb24gd2lsbCBpbmRlZWQgY3JlYXRlXG4vLyBuZXcgbGF5ZXJzIGV2ZXJ5IHJlbmRlciBjYWxsLCBob3dldmVyIHRoZSBuZXcgbGF5ZXJzIGFyZSBpbW1lZGlhdGVseVxuLy8gbWF0Y2hlZCBhZ2FpbnN0IGV4aXN0aW5nIGxheWVycyB1c2luZyBsYXllciBpbmRleC9sYXllciBpZC5cbi8vIEEgbmV3IGxheWVycyBvbmx5IGhhcyBhIHByb3BzIGZpZWxkIHBvaW50aW5nIHRvIHRoZSB1bm1vZGlmaWVkIHByb3BzXG4vLyBvYmplY3Qgc3VwcGxpZWQgYnkgdGhlIGFwcCBvbiBjcmVhdGlvbi5cbi8vIEFsbCBjYWxjdWxhdGVkIHN0YXRlIChwcm9ncmFtcywgYXR0cmlidXRlcyBldGMpIGFyZSBzdG9yZWQgaW4gYSBzdGF0ZSBvYmplY3Rcbi8vIGFuZCB0aGlzIHN0YXRlIG9iamVjdCBpcyBtb3ZlZCBmb3J3YXJkIHRvIHRoZSBuZXcgbGF5ZXIgZXZlcnkgcmVuZGVyLlxuLy8gVGhlIG5ldyBsYXllciBlbmRzIHVwIHdpdGggdGhlIHN0YXRlIG9mIHRoZSBvbGQgbGF5ZXIgYnV0IHRoZSBwcm9wcyBvZlxuLy8gdGhlIG5ldyBsYXllciwgd2hpbGUgdGhlIG9sZCBsYXllciBpcyBkaXNjYXJkZWQuXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBsb2cgZnJvbSAnLi4vbG9nJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoTGF5ZXJzKG9sZExheWVycywgbmV3TGF5ZXJzKSB7XG4gIGZvciAoY29uc3QgbmV3TGF5ZXIgb2YgbmV3TGF5ZXJzKSB7XG4gICAgLy8gMS4gZ2l2ZW4gYSBuZXcgY29taW5nIGxheWVyLCBmaW5kIGl0cyBtYXRjaGluZyBsYXllclxuICAgIGNvbnN0IG9sZExheWVyID0gX2ZpbmRNYXRjaGluZ0xheWVyKG9sZExheWVycywgbmV3TGF5ZXIpO1xuXG4gICAgLy8gT25seSB0cmFuc2ZlciBzdGF0ZSBhdCB0aGlzIHN0YWdlLiBXZSBtdXN0IG5vdCBnZW5lcmF0ZSBleGNlcHRpb25zXG4gICAgLy8gdW50aWwgYWxsIGxheWVycycgc3RhdGUgaGF2ZSBiZWVuIHRyYW5zZmVycmVkXG4gICAgaWYgKG9sZExheWVyKSB7XG4gICAgICBjb25zdCB7c3RhdGUsIHByb3BzfSA9IG9sZExheWVyO1xuICAgICAgYXNzZXJ0KHN0YXRlLCAnTWF0Y2hpbmcgbGF5ZXIgaGFzIG5vIHN0YXRlJyk7XG4gICAgICBhc3NlcnQob2xkTGF5ZXIgIT09IG5ld0xheWVyLCAnTWF0Y2hpbmcgbGF5ZXIgaXMgc2FtZScpO1xuICAgICAgLy8gQ29weSBzdGF0ZVxuICAgICAgbmV3TGF5ZXIuc3RhdGUgPSBzdGF0ZTtcbiAgICAgIHN0YXRlLmxheWVyID0gbmV3TGF5ZXI7XG4gICAgICAvLyBLZWVwIGEgdGVtcG9yYXJ5IHJlZiB0byB0aGUgb2xkIHByb3BzLCBmb3IgcHJvcCBjb21wYXJpc29uXG4gICAgICBuZXdMYXllci5vbGRQcm9wcyA9IHByb3BzO1xuICAgICAgb2xkTGF5ZXIuc3RhdGUgPSBudWxsO1xuICAgICAgbG9nKDMsIGBtYXRjaGVkIGxheWVyICR7bmV3TGF5ZXIucHJvcHMuaWR9IG8tPm5gLCBvbGRMYXllciwgbmV3TGF5ZXIpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBOb3RlOiBMYXllcnMgY2FuJ3QgYmUgaW5pdGlhbGl6ZWQgdW50aWwgZ2wgY29udGV4dCBpcyBhdmFpbGFibGVcbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplTmV3TGF5ZXJzKGxheWVycywge2dsfSkge1xuICBmb3IgKGNvbnN0IGxheWVyIG9mIGxheWVycykge1xuICAgIGlmICghbGF5ZXIuc3RhdGUpIHtcbiAgICAgIC8vIE5ldyBsYXllciwgaW5pdGlhbGl6ZSBpdCdzIHN0YXRlXG4gICAgICBsb2coMSwgYGluaXRpYWxpemluZyBsYXllciAke2xheWVyLnByb3BzLmlkfWApO1xuICAgICAgbGF5ZXIuaW5pdGlhbGl6ZUxheWVyKHtnbH0pO1xuICAgICAgbGF5ZXIuc3RhdGUubGF5ZXIgPSBsYXllcjtcbiAgICB9XG4gIH1cbn1cblxuLy8gVXBkYXRlIHRoZSBtYXRjaGVkIGxheWVyc1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZU1hdGNoZWRMYXllcnMobmV3TGF5ZXJzKSB7XG4gIGZvciAoY29uc3QgbGF5ZXIgb2YgbmV3TGF5ZXJzKSB7XG4gICAgY29uc3Qge29sZFByb3BzLCBwcm9wc30gPSBsYXllcjtcbiAgICBpZiAob2xkUHJvcHMpIHtcbiAgICAgIGxheWVyLnVwZGF0ZUxheWVyKG9sZFByb3BzLCBwcm9wcyk7XG4gICAgICBsb2coMiwgYHVwZGF0aW5nIGxheWVyICR7bGF5ZXIucHJvcHMuaWR9YCk7XG4gICAgfVxuICB9XG59XG5cbi8vIFVwZGF0ZSB0aGUgb2xkIGxheWVycyB0aGF0IHdlcmUgbWF0Y2hlZFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmFsaXplT2xkTGF5ZXJzKG9sZExheWVycykge1xuICAvLyBVbm1hdGNoZWQgbGF5ZXJzIHN0aWxsIGhhdmUgc3RhdGUsIGl0IHdpbGwgYmUgZGlzY2FyZGVkXG4gIGZvciAoY29uc3QgbGF5ZXIgb2Ygb2xkTGF5ZXJzKSB7XG4gICAgY29uc3Qge3N0YXRlfSA9IGxheWVyO1xuICAgIGlmIChzdGF0ZSkge1xuICAgICAgbGF5ZXIuZmluYWxpemVMYXllcigpO1xuICAgICAgbGF5ZXIuc3RhdGUgPSBudWxsO1xuICAgICAgbG9nKDEsIGBmaW5hbGl6aW5nIGxheWVyICR7bGF5ZXIucHJvcHMuaWR9YCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXllcnNOZWVkUmVkcmF3KGxheWVycywge2NsZWFyRmxhZ30pIHtcbiAgbGV0IG5lZWRSZWRyYXcgPSBmYWxzZTtcbiAgZm9yIChjb25zdCBsYXllciBvZiBsYXllcnMpIHtcbiAgICBuZWVkUmVkcmF3ID0gbmVlZFJlZHJhdyB8fCBsYXllci5nZXROZWVkc1JlZHJhdyh7Y2xlYXJGbGFnfSk7XG4gIH1cbiAgcmV0dXJuIG5lZWRSZWRyYXc7XG59XG5cbmZ1bmN0aW9uIF9maW5kTWF0Y2hpbmdMYXllcihvbGRMYXllcnMsIG5ld0xheWVyKSB7XG4gIGNvbnN0IGNhbmRpZGF0ZXMgPSBvbGRMYXllcnMuZmlsdGVyKGwgPT4gbC5wcm9wcy5pZCA9PT0gbmV3TGF5ZXIucHJvcHMuaWQpO1xuICBpZiAoY2FuZGlkYXRlcy5sZW5ndGggPiAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBMYXllciBoYXMgbW9yZSB0aGFuIG9uZSBtYXRjaGluZyBsYXllcnMgJHtuZXdMYXllci5pZH1gKTtcbiAgfVxuICByZXR1cm4gY2FuZGlkYXRlcy5sZW5ndGggPiAwICYmIGNhbmRpZGF0ZXNbMF07XG59XG4iXX0=