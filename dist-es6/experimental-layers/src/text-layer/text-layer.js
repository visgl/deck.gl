var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { CompositeLayer } from 'deck.gl';
import MultiIconLayer from './multi-icon-layer/multi-icon-layer';
import { makeFontAtlas } from './font-atlas';

var DEFAULT_COLOR = [0, 0, 0, 255];
var TEXT_ANCHOR = {
  start: 1,
  middle: 0,
  end: -1
};
var ALIGNMENT_BASELINE = {
  top: 1,
  center: 0,
  bottom: -1
};
// currently the font family is invisible to the user
var FONT_FAMILY = '"Lucida Console", Monaco, monospace';

var defaultProps = {
  getText: function getText(x) {
    return x.text;
  },
  getPosition: function getPosition(x) {
    return x.coordinates;
  },
  getColor: function getColor(x) {
    return x.color || DEFAULT_COLOR;
  },
  getSize: function getSize(x) {
    return x.size || 32;
  },
  getAngle: function getAngle(x) {
    return x.angle || 0;
  },
  getTextAnchor: function getTextAnchor(x) {
    return x.textAnchor || 'middle';
  },
  getAlignmentBaseline: function getAlignmentBaseline(x) {
    return x.alignmentBaseline || 'center';
  },
  getPixelOffset: function getPixelOffset(x) {
    return x.pixelOffset || [0, 0];
  },
  fp64: false
};

var TextLayer = function (_CompositeLayer) {
  _inherits(TextLayer, _CompositeLayer);

  function TextLayer() {
    _classCallCheck(this, TextLayer);

    return _possibleConstructorReturn(this, (TextLayer.__proto__ || Object.getPrototypeOf(TextLayer)).apply(this, arguments));
  }

  _createClass(TextLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      var _makeFontAtlas = makeFontAtlas(gl, FONT_FAMILY),
          mapping = _makeFontAtlas.mapping,
          texture = _makeFontAtlas.texture;

      this.state = {
        iconAtlas: texture,
        iconMapping: mapping
      };
    }
  }, {
    key: 'shouldUpdateState',
    value: function shouldUpdateState(_ref) {
      var changeFlags = _ref.changeFlags;

      return changeFlags.somethingChanged;
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var props = _ref2.props,
          oldProps = _ref2.oldProps,
          changeFlags = _ref2.changeFlags;

      if (changeFlags.dataChanged) {
        this.transformStringToLetters();
      }
    }
  }, {
    key: 'transformStringToLetters',
    value: function transformStringToLetters() {
      var _props = this.props,
          data = _props.data,
          getText = _props.getText,
          getPosition = _props.getPosition;

      if (!data || data.length === 0) {
        return;
      }

      var transformedData = data.map(function (val) {
        var text = getText(val);
        var letters = Array.from(text);
        var position = getPosition(val);
        if (!text) {
          return [];
        }
        return letters.map(function (letter, i) {
          return Object.assign({}, val, { text: letter, position: position, index: i, len: text.length });
        });
      }).reduce(function (prev, curr) {
        return [].concat(_toConsumableArray(prev), _toConsumableArray(curr));
      });

      this.setState({ data: transformedData });
    }
  }, {
    key: 'getAnchorXFromTextAnchor',
    value: function getAnchorXFromTextAnchor(textAnchor) {
      if (!TEXT_ANCHOR.hasOwnProperty(textAnchor)) {
        throw new Error('Invalid text anchor parameter: ' + textAnchor);
      }
      return TEXT_ANCHOR[textAnchor];
    }
  }, {
    key: 'getAnchorYFromAlignmentBaseline',
    value: function getAnchorYFromAlignmentBaseline(alignmentBaseline) {
      if (!ALIGNMENT_BASELINE.hasOwnProperty(alignmentBaseline)) {
        throw new Error('Invalid alignment baseline parameter: ' + alignmentBaseline);
      }
      return ALIGNMENT_BASELINE[alignmentBaseline];
    }
  }, {
    key: 'renderLayers',
    value: function renderLayers() {
      var _this2 = this;

      var _state = this.state,
          data = _state.data,
          iconAtlas = _state.iconAtlas,
          iconMapping = _state.iconMapping;


      if (!iconMapping || !iconAtlas || !data) {
        return null;
      }

      var _props2 = this.props,
          getColor = _props2.getColor,
          getSize = _props2.getSize,
          getAngle = _props2.getAngle,
          getTextAnchor = _props2.getTextAnchor,
          getAlignmentBaseline = _props2.getAlignmentBaseline,
          getPixelOffset = _props2.getPixelOffset,
          fp64 = _props2.fp64;


      return [new MultiIconLayer(Object.assign({}, this.props, {
        id: 'multi-icon-layer-for-text-rendering',
        data: data,
        iconAtlas: iconAtlas,
        iconMapping: iconMapping,
        getIcon: function getIcon(d) {
          return d.text;
        },
        getPosition: function getPosition(d) {
          return d.position;
        },
        getIndexOfIcon: function getIndexOfIcon(d) {
          return d.index;
        },
        getNumOfIcon: function getNumOfIcon(d) {
          return d.len;
        },
        getColor: getColor,
        getSize: getSize,
        getAngle: getAngle,
        getAnchorX: function getAnchorX(d) {
          return _this2.getAnchorXFromTextAnchor(getTextAnchor(d));
        },
        getAnchorY: function getAnchorY(d) {
          return _this2.getAnchorYFromAlignmentBaseline(getAlignmentBaseline(d));
        },
        getPixelOffset: getPixelOffset,
        fp64: fp64,
        updateTriggers: {
          getAngle: getAngle,
          getColor: getColor,
          getSize: getSize
        }
      }))];
    }
  }]);

  return TextLayer;
}(CompositeLayer);

export default TextLayer;


TextLayer.layerName = 'TextLayer';
TextLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwtbGF5ZXJzL3NyYy90ZXh0LWxheWVyL3RleHQtbGF5ZXIuanMiXSwibmFtZXMiOlsiQ29tcG9zaXRlTGF5ZXIiLCJNdWx0aUljb25MYXllciIsIm1ha2VGb250QXRsYXMiLCJERUZBVUxUX0NPTE9SIiwiVEVYVF9BTkNIT1IiLCJzdGFydCIsIm1pZGRsZSIsImVuZCIsIkFMSUdOTUVOVF9CQVNFTElORSIsInRvcCIsImNlbnRlciIsImJvdHRvbSIsIkZPTlRfRkFNSUxZIiwiZGVmYXVsdFByb3BzIiwiZ2V0VGV4dCIsIngiLCJ0ZXh0IiwiZ2V0UG9zaXRpb24iLCJjb29yZGluYXRlcyIsImdldENvbG9yIiwiY29sb3IiLCJnZXRTaXplIiwic2l6ZSIsImdldEFuZ2xlIiwiYW5nbGUiLCJnZXRUZXh0QW5jaG9yIiwidGV4dEFuY2hvciIsImdldEFsaWdubWVudEJhc2VsaW5lIiwiYWxpZ25tZW50QmFzZWxpbmUiLCJnZXRQaXhlbE9mZnNldCIsInBpeGVsT2Zmc2V0IiwiZnA2NCIsIlRleHRMYXllciIsImdsIiwiY29udGV4dCIsIm1hcHBpbmciLCJ0ZXh0dXJlIiwic3RhdGUiLCJpY29uQXRsYXMiLCJpY29uTWFwcGluZyIsImNoYW5nZUZsYWdzIiwic29tZXRoaW5nQ2hhbmdlZCIsInByb3BzIiwib2xkUHJvcHMiLCJkYXRhQ2hhbmdlZCIsInRyYW5zZm9ybVN0cmluZ1RvTGV0dGVycyIsImRhdGEiLCJsZW5ndGgiLCJ0cmFuc2Zvcm1lZERhdGEiLCJtYXAiLCJ2YWwiLCJsZXR0ZXJzIiwiQXJyYXkiLCJmcm9tIiwicG9zaXRpb24iLCJsZXR0ZXIiLCJpIiwiT2JqZWN0IiwiYXNzaWduIiwiaW5kZXgiLCJsZW4iLCJyZWR1Y2UiLCJwcmV2IiwiY3VyciIsInNldFN0YXRlIiwiaGFzT3duUHJvcGVydHkiLCJFcnJvciIsImlkIiwiZ2V0SWNvbiIsImQiLCJnZXRJbmRleE9mSWNvbiIsImdldE51bU9mSWNvbiIsImdldEFuY2hvclgiLCJnZXRBbmNob3JYRnJvbVRleHRBbmNob3IiLCJnZXRBbmNob3JZIiwiZ2V0QW5jaG9yWUZyb21BbGlnbm1lbnRCYXNlbGluZSIsInVwZGF0ZVRyaWdnZXJzIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUUEsY0FBUixRQUE2QixTQUE3QjtBQUNBLE9BQU9DLGNBQVAsTUFBMkIscUNBQTNCO0FBQ0EsU0FBUUMsYUFBUixRQUE0QixjQUE1Qjs7QUFFQSxJQUFNQyxnQkFBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxHQUFWLENBQXRCO0FBQ0EsSUFBTUMsY0FBYztBQUNsQkMsU0FBTyxDQURXO0FBRWxCQyxVQUFRLENBRlU7QUFHbEJDLE9BQUssQ0FBQztBQUhZLENBQXBCO0FBS0EsSUFBTUMscUJBQXFCO0FBQ3pCQyxPQUFLLENBRG9CO0FBRXpCQyxVQUFRLENBRmlCO0FBR3pCQyxVQUFRLENBQUM7QUFIZ0IsQ0FBM0I7QUFLQTtBQUNBLElBQU1DLGNBQWMscUNBQXBCOztBQUVBLElBQU1DLGVBQWU7QUFDbkJDLFdBQVM7QUFBQSxXQUFLQyxFQUFFQyxJQUFQO0FBQUEsR0FEVTtBQUVuQkMsZUFBYTtBQUFBLFdBQUtGLEVBQUVHLFdBQVA7QUFBQSxHQUZNO0FBR25CQyxZQUFVO0FBQUEsV0FBS0osRUFBRUssS0FBRixJQUFXakIsYUFBaEI7QUFBQSxHQUhTO0FBSW5Ca0IsV0FBUztBQUFBLFdBQUtOLEVBQUVPLElBQUYsSUFBVSxFQUFmO0FBQUEsR0FKVTtBQUtuQkMsWUFBVTtBQUFBLFdBQUtSLEVBQUVTLEtBQUYsSUFBVyxDQUFoQjtBQUFBLEdBTFM7QUFNbkJDLGlCQUFlO0FBQUEsV0FBS1YsRUFBRVcsVUFBRixJQUFnQixRQUFyQjtBQUFB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Qyx3QkFBZ0I7QUFDZHJELDRCQURjO0FBRWRKLDRCQUZjO0FBR2RFO0FBSGM7QUFoQlksT0FBOUIsQ0FERixDQURLLENBQVA7QUEwQkQ7Ozs7RUFwR29DckIsYzs7ZUFBbEJnQyxTOzs7QUF1R3JCQSxVQUFVNkMsU0FBVixHQUFzQixXQUF0QjtBQUNBN0MsVUFBVW5CLFlBQVYsR0FBeUJBLFlBQXpCIiwiZmlsZSI6InRleHQtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtDb21wb3NpdGVMYXllcn0gZnJvbSAnZGVjay5nbCc7XG5pbXBvcnQgTXVsdGlJY29uTGF5ZXIgZnJvbSAnLi9tdWx0aS1pY29uLWxheWVyL211bHRpLWljb24tbGF5ZXInO1xuaW1wb3J0IHttYWtlRm9udEF0bGFzfSBmcm9tICcuL2ZvbnQtYXRsYXMnO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzAsIDAsIDAsIDI1NV07XG5jb25zdCBURVhUX0FOQ0hPUiA9IHtcbiAgc3RhcnQ6IDEsXG4gIG1pZGRsZTogMCxcbiAgZW5kOiAtMVxufTtcbmNvbnN0IEFMSUdOTUVOVF9CQVNFTElORSA9IHtcbiAgdG9wOiAxLFxuICBjZW50ZXI6IDAsXG4gIGJvdHRvbTogLTFcbn07XG4vLyBjdXJyZW50bHkgdGhlIGZvbnQgZmFtaWx5IGlzIGludmlzaWJsZSB0byB0aGUgdXNlclxuY29uc3QgRk9OVF9GQU1JTFkgPSAnXCJMdWNpZGEgQ29uc29sZVwiLCBNb25hY28sIG1vbm9zcGFjZSc7XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgZ2V0VGV4dDogeCA9PiB4LnRleHQsXG4gIGdldFBvc2l0aW9uOiB4ID0+IHguY29vcmRpbmF0ZXMsXG4gIGdldENvbG9yOiB4ID0+IHguY29sb3IgfHwgREVGQVVMVF9DT0xPUixcbiAgZ2V0U2l6ZTogeCA9PiB4LnNpemUgfHwgMzIsXG4gIGdldEFuZ2xlOiB4ID0+IHguYW5nbGUgfHwgMCxcbiAgZ2V0VGV4dEFuY2hvcjogeCA9PiB4LnRleHRBbmNob3IgfHwgJ21pZGRsZScsXG4gIGdldEFsaWdubWVudEJhc2VsaW5lOiB4ID0+IHguYWxpZ25tZW50QmFzZWxpbmUgfHwgJ2NlbnRlcicsXG4gIGdldFBpeGVsT2Zmc2V0OiB4ID0+IHgucGl4ZWxPZmZzZXQgfHwgWzAsIDBdLFxuICBmcDY0OiBmYWxzZVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dExheWVyIGV4dGVuZHMgQ29tcG9zaXRlTGF5ZXIge1xuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7bWFwcGluZywgdGV4dHVyZX0gPSBtYWtlRm9udEF0bGFzKGdsLCBGT05UX0ZBTUlMWSk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGljb25BdGxhczogdGV4dHVyZSxcbiAgICAgIGljb25NYXBwaW5nOiBtYXBwaW5nXG4gICAgfTtcbiAgfVxuXG4gIHNob3VsZFVwZGF0ZVN0YXRlKHtjaGFuZ2VGbGFnc30pIHtcbiAgICByZXR1cm4gY2hhbmdlRmxhZ3Muc29tZXRoaW5nQ2hhbmdlZDtcbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIGlmIChjaGFuZ2VGbGFncy5kYXRhQ2hhbmdlZCkge1xuICAgICAgdGhpcy50cmFuc2Zvcm1TdHJpbmdUb0xldHRlcnMoKTtcbiAgICB9XG4gIH1cblxuICB0cmFuc2Zvcm1TdHJpbmdUb0xldHRlcnMoKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFRleHQsIGdldFBvc2l0aW9ufSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKCFkYXRhIHx8IGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdHJhbnNmb3JtZWREYXRhID0gZGF0YVxuICAgICAgLm1hcCh2YWwgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gZ2V0VGV4dCh2YWwpO1xuICAgICAgICBjb25zdCBsZXR0ZXJzID0gQXJyYXkuZnJvbSh0ZXh0KTtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBnZXRQb3NpdGlvbih2YWwpO1xuICAgICAgICBpZiAoIXRleHQpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxldHRlcnMubWFwKChsZXR0ZXIsIGkpID0+XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgdmFsLCB7dGV4dDogbGV0dGVyLCBwb3NpdGlvbiwgaW5kZXg6IGksIGxlbjogdGV4dC5sZW5ndGh9KVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IFsuLi5wcmV2LCAuLi5jdXJyXSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtkYXRhOiB0cmFuc2Zvcm1lZERhdGF9KTtcbiAgfVxuXG4gIGdldEFuY2hvclhGcm9tVGV4dEFuY2hvcih0ZXh0QW5jaG9yKSB7XG4gICAgaWYgKCFURVhUX0FOQ0hPUi5oYXNPd25Qcm9wZXJ0eSh0ZXh0QW5jaG9yKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRleHQgYW5jaG9yIHBhcmFtZXRlcjogJHt0ZXh0QW5jaG9yfWApO1xuICAgIH1cbiAgICByZXR1cm4gVEVYVF9BTkNIT1JbdGV4dEFuY2hvcl07XG4gIH1cblxuICBnZXRBbmNob3JZRnJvbUFsaWdubWVudEJhc2VsaW5lKGFsaWdubWVudEJhc2VsaW5lKSB7XG4gICAgaWYgKCFBTElHTk1FTlRfQkFTRUxJTkUuaGFzT3duUHJvcGVydHkoYWxpZ25tZW50QmFzZWxpbmUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgYWxpZ25tZW50IGJhc2VsaW5lIHBhcmFtZXRlcjogJHthbGlnbm1lbnRCYXNlbGluZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIEFMSUdOTUVOVF9CQVNFTElORVthbGlnbm1lbnRCYXNlbGluZV07XG4gIH1cblxuICByZW5kZXJMYXllcnMoKSB7XG4gICAgY29uc3Qge2RhdGEsIGljb25BdGxhcywgaWNvbk1hcHBpbmd9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGlmICghaWNvbk1hcHBpbmcgfHwgIWljb25BdGxhcyB8fCAhZGF0YSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgZ2V0Q29sb3IsXG4gICAgICBnZXRTaXplLFxuICAgICAgZ2V0QW5nbGUsXG4gICAgICBnZXRUZXh0QW5jaG9yLFxuICAgICAgZ2V0QWxpZ25tZW50QmFzZWxpbmUsXG4gICAgICBnZXRQaXhlbE9mZnNldCxcbiAgICAgIGZwNjRcbiAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgIHJldHVybiBbXG4gICAgICBuZXcgTXVsdGlJY29uTGF5ZXIoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHtcbiAgICAgICAgICBpZDogJ211bHRpLWljb24tbGF5ZXItZm9yLXRleHQtcmVuZGVyaW5nJyxcbiAgICAgICAgICBkYXRhLFxuICAgICAgICAgIGljb25BdGxhcyxcbiAgICAgICAgICBpY29uTWFwcGluZyxcbiAgICAgICAgICBnZXRJY29uOiBkID0+IGQudGV4dCxcbiAgICAgICAgICBnZXRQb3NpdGlvbjogZCA9PiBkLnBvc2l0aW9uLFxuICAgICAgICAgIGdldEluZGV4T2ZJY29uOiBkID0+IGQuaW5kZXgsXG4gICAgICAgICAgZ2V0TnVtT2ZJY29uOiBkID0+IGQubGVuLFxuICAgICAgICAgIGdldENvbG9yLFxuICAgICAgICAgIGdldFNpemUsXG4gICAgICAgICAgZ2V0QW5nbGUsXG4gICAgICAgICAgZ2V0QW5jaG9yWDogZCA9PiB0aGlzLmdldEFuY2hvclhGcm9tVGV4dEFuY2hvcihnZXRUZXh0QW5jaG9yKGQpKSxcbiAgICAgICAgICBnZXRBbmNob3JZOiBkID0+IHRoaXMuZ2V0QW5jaG9yWUZyb21BbGlnbm1lbnRCYXNlbGluZShnZXRBbGlnbm1lbnRCYXNlbGluZShkKSksXG4gICAgICAgICAgZ2V0UGl4ZWxPZmZzZXQsXG4gICAgICAgICAgZnA2NCxcbiAgICAgICAgICB1cGRhdGVUcmlnZ2Vyczoge1xuICAgICAgICAgICAgZ2V0QW5nbGUsXG4gICAgICAgICAgICBnZXRDb2xvcixcbiAgICAgICAgICAgIGdldFNpemVcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgXTtcbiAgfVxufVxuXG5UZXh0TGF5ZXIubGF5ZXJOYW1lID0gJ1RleHRMYXllcic7XG5UZXh0TGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19