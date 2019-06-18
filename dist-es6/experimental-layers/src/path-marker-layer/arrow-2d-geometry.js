function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { Geometry } from 'luma.gl';

var Arrow2DGeometry = function (_Geometry) {
  _inherits(Arrow2DGeometry, _Geometry);

  function Arrow2DGeometry() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Arrow2DGeometry);

    return _possibleConstructorReturn(this, (Arrow2DGeometry.__proto__ || Object.getPrototypeOf(Arrow2DGeometry)).call(this, Object.assign({}, opts, {
      attributes: getArrowAttributes(opts)
    })));
  }

  return Arrow2DGeometry;
}(Geometry);

export default Arrow2DGeometry;


function getArrowAttributes(_ref) {
  var _ref$length = _ref.length,
      length = _ref$length === undefined ? 1 : _ref$length,
      _ref$headSize = _ref.headSize,
      headSize = _ref$headSize === undefined ? 0.2 : _ref$headSize,
      _ref$tailWidth = _ref.tailWidth,
      tailWidth = _ref$tailWidth === undefined ? 0.05 : _ref$tailWidth,
      _ref$tailStart = _ref.tailStart,
      tailStart = _ref$tailStart === undefined ? 0.05 : _ref$tailStart;

  var texCoords = [
  // HEAD
  0.5, 1.0, 0, 0.5 - headSize / 2, 1.0 - headSize, 0, 0.5 + headSize / 2, 1.0 - headSize, 0, 0.5 - tailWidth / 2, tailStart, 0, 0.5 + tailWidth / 2, 1.0 - headSize, 0, 0.5 + tailWidth / 2, tailStart, 0, 0.5 - tailWidth / 2, tailStart, 0, 0.5 - tailWidth / 2, 1.0 - headSize, 0, 0.5 + tailWidth / 2, 1.0 - headSize, 0];

  var normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];

  // Center and scale
  var positions = new Array(texCoords.length);
  for (var i = 0; i < texCoords.length / 3; i++) {
    var i3 = i * 3;
    positions[i3 + 0] = (texCoords[i3 + 0] - 0.5) * length;
    positions[i3 + 1] = (texCoords[i3 + 1] - 0.5) * length;
    positions[i3 + 2] = 0;
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    texCoords: new Float32Array(texCoords)
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwtbGF5ZXJzL3NyYy9wYXRoLW1hcmtlci1sYXllci9hcnJvdy0yZC1nZW9tZXRyeS5qcyJdLCJuYW1lcyI6WyJHZW9tZXRyeSIsIkFycm93MkRHZW9tZXRyeSIsIm9wdHMiLCJPYmplY3QiLCJhc3NpZ24iLCJhdHRyaWJ1dGVzIiwiZ2V0QXJyb3dBdHRyaWJ1dGVzIiwibGVuZ3RoIiwiaGVhZFNpemUiLCJ0YWlsV2lkdGgiLCJ0YWlsU3RhcnQiLCJ0ZXhDb29yZHMiLCJub3JtYWxzIiwicG9zaXRpb25zIiwiQXJyYXkiLCJpIiwiaTMiLCJGbG9hdDMyQXJyYXkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLFNBQVFBLFFBQVIsUUFBdUIsU0FBdkI7O0lBRXFCQyxlOzs7QUFDbkIsNkJBQXVCO0FBQUEsUUFBWEMsSUFBVyx1RUFBSixFQUFJOztBQUFBOztBQUFBLDZIQUNmQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQkYsSUFBbEIsRUFBd0I7QUFDNUJHLGtCQUFZQyxtQkFBbUJKLElBQW5CO0FBRGdCLEtBQXhCLENBRGU7QUFJdEI7OztFQUwwQ0YsUTs7ZUFBeEJDLGU7OztBQVFyQixTQUFTSyxrQkFBVCxPQUtHO0FBQUEseUJBSkRDLE1BSUM7QUFBQSxNQUpEQSxNQUlDLCtCQUpRLENBSVI7QUFBQSwyQkFIREMsUUFHQztBQUFBLE1BSERBLFFBR0MsaUNBSFUsR0FHVjtBQUFBLDRCQUZEQyxTQUVDO0FBQUEsTUFGREEsU0FFQyxrQ0FGVyxJQUVYO0FBQUEsNEJBRERDLFNBQ0M7QUFBQSxNQUREQSxTQUNDLGtDQURXLElBQ1g7O0FBQ0QsTUFBTUMsWUFBWTtBQUNoQjtBQUNBLEtBRmdCLEVBRVgsR0FGVyxFQUVOLENBRk0sRUFHaEIsTUFBTUgsV0FBVyxDQUhELEVBR0ksTUFBTUEsUUFIVixFQUdvQixDQUhwQixFQUloQixNQUFNQSxXQUFXLENBSkQsRUFJSSxNQUFNQSxRQUpWLEVBSW9CLENBSnBCLEVBTWhCLE1BQU1DLFlBQVksQ0FORixFQU1LQyxTQU5MLEVBTWdCLENBTmhCLEVBT2hCLE1BQU1ELFlBQVksQ0FQRixFQU9LLE1BQU1ELFFBUFgsRUFPcUIsQ0FQckIsRUFRaEIsTUFBTUMsWUFBWSxDQVJGLEVBUUtDLFNBUkwsRUFRZ0IsQ0FSaEIsRUFVaEIsTUFBTUQsWUFBWSxDQVZGLEVBVUtDLFNBVkwsRUFVZ0IsQ0FWaEIsRUFXaEIsTUFBTUQsWUFBWSxDQVhGLEVBV0ssTUFBTUQsUUFYWCxFQVdxQixDQVhyQixFQVloQixNQUFNQyxZQUFZLENBWkYsRUFZSyxNQUFNRCxRQVpYLEVBWXFCLENBWnJCLENBQWxCOztBQWVBLE1BQU1JLFVBQVUsQ0FDZCxDQURjLEVBQ1gsQ0FEVyxFQUNSLENBRFEsRUFFZCxDQUZjLEVBRVgsQ0FGVyxFQUVSLENBRlEsRUFHZCxDQUhjLEVBR1gsQ0FIVyxFQUdSLENBSFEsRUFLZCxDQUxjLEVBS1gsQ0FMVyxFQUtSLENBTFEsRUFNZCxDQU5jLEVBTVgsQ0FOVyxFQU1SLENBTlEsRUFPZCxDQVBjLEVBT1gsQ0FQVyxFQU9SLENBUFEsRUFTZCxDQVRjLEVBU1gsQ0FUVyxFQVNSLENBVFEsRUFVZCxDQVZjLEVBVVgsQ0FWVyxFQVVSLENBVlEsRUFXZCxDQVhjLEVBV1gsQ0FYVyxFQVdSLENBWFEsQ0FBaEI7O0FBY0E7QUFDQSxNQUFNQyxZQUFZLElBQUlDLEtBQUosQ0FBVUgsVUFBVUosTUFBcEIsQ0FBbEI7QUFDQSxPQUFLLElBQUlRLElBQUksQ0FBYixFQUFnQkEsSUFBSUosVUFBVUosTUFBVixHQUFtQixDQUF2QyxFQUEwQ1EsR0FBMUMsRUFBK0M7QUFDN0MsUUFBTUMsS0FBS0QsSUFBSSxDQUFmO0FBQ0FGLGNBQVVHLEtBQUssQ0FBZixJQUFvQixDQUFDTCxVQUFVSyxLQUFLLENBQWYsSUFBb0IsR0FBckIsSUFBNEJULE1BQWhEO0FBQ0FNLGNBQVVHLEtBQUssQ0FBZixJQUFvQixDQUFDTCxVQUFVSyxLQUFLLENBQWYsSUFBb0IsR0FBckIsSUFBNEJULE1BQWhEO0FBQ0FNLGNBQVVHLEtBQUssQ0FBZixJQUFvQixDQUFwQjtBQUNEO0FBQ0QsU0FBTztBQUNMSCxlQUFXLElBQUlJLFlBQUosQ0FBaUJKLFNBQWpCLENBRE47QUFFTEQsYUFBUyxJQUFJSyxZQUFKLENBQWlCTCxPQUFqQixDQUZKO0FBR0xELGVBQVcsSUFBSU0sWUFBSixDQUFpQk4sU0FBakI7QUFITixHQUFQO0FBS0QiLCJmaWxlIjoiYXJyb3ctMmQtZ2VvbWV0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0dlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJyb3cyREdlb21ldHJ5IGV4dGVuZHMgR2VvbWV0cnkge1xuICBjb25zdHJ1Y3RvcihvcHRzID0ge30pIHtcbiAgICBzdXBlcihPYmplY3QuYXNzaWduKHt9LCBvcHRzLCB7XG4gICAgICBhdHRyaWJ1dGVzOiBnZXRBcnJvd0F0dHJpYnV0ZXMob3B0cylcbiAgICB9KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0QXJyb3dBdHRyaWJ1dGVzKHtcbiAgbGVuZ3RoID0gMSxcbiAgaGVhZFNpemUgPSAwLjIsXG4gIHRhaWxXaWR0aCA9IDAuMDUsXG4gIHRhaWxTdGFydCA9IDAuMDVcbn0pIHtcbiAgY29uc3QgdGV4Q29vcmRzID0gW1xuICAgIC8vIEhFQURcbiAgICAwLjUsIDEuMCwgMCxcbiAgICAwLjUgLSBoZWFkU2l6ZSAvIDIsIDEuMCAtIGhlYWRTaXplLCAwLFxuICAgIDAuNSArIGhlYWRTaXplIC8gMiwgMS4wIC0gaGVhZFNpemUsIDAsXG5cbiAgICAwLjUgLSB0YWlsV2lkdGggLyAyLCB0YWlsU3RhcnQsIDAsXG4gICAgMC41ICsgdGFpbFdpZHRoIC8gMiwgMS4wIC0gaGVhZFNpemUsIDAsXG4gICAgMC41ICsgdGFpbFdpZHRoIC8gMiwgdGFpbFN0YXJ0LCAwLFxuXG4gICAgMC41IC0gdGFpbFdpZHRoIC8gMiwgdGFpbFN0YXJ0LCAwLFxuICAgIDAuNSAtIHRhaWxXaWR0aCAvIDIsIDEuMCAtIGhlYWRTaXplLCAwLFxuICAgIDAuNSArIHRhaWxXaWR0aCAvIDIsIDEuMCAtIGhlYWRTaXplLCAwXG4gIF07XG5cbiAgY29uc3Qgbm9ybWFscyA9IFtcbiAgICAwLCAwLCAxLFxuICAgIDAsIDAsIDEsXG4gICAgMCwgMCwgMSxcblxuICAgIDAsIDAsIDEsXG4gICAgMCwgMCwgMSxcbiAgICAwLCAwLCAxLFxuXG4gICAgMCwgMCwgMSxcbiAgICAwLCAwLCAxLFxuICAgIDAsIDAsIDFcbiAgXTtcblxuICAvLyBDZW50ZXIgYW5kIHNjYWxlXG4gIGNvbnN0IHBvc2l0aW9ucyA9IG5ldyBBcnJheSh0ZXhDb29yZHMubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZXhDb29yZHMubGVuZ3RoIC8gMzsgaSsrKSB7XG4gICAgY29uc3QgaTMgPSBpICogMztcbiAgICBwb3NpdGlvbnNbaTMgKyAwXSA9ICh0ZXhDb29yZHNbaTMgKyAwXSAtIDAuNSkgKiBsZW5ndGg7XG4gICAgcG9zaXRpb25zW2kzICsgMV0gPSAodGV4Q29vcmRzW2kzICsgMV0gLSAwLjUpICogbGVuZ3RoO1xuICAgIHBvc2l0aW9uc1tpMyArIDJdID0gMDtcbiAgfVxuICByZXR1cm4ge1xuICAgIHBvc2l0aW9uczogbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpLFxuICAgIG5vcm1hbHM6IG5ldyBGbG9hdDMyQXJyYXkobm9ybWFscyksXG4gICAgdGV4Q29vcmRzOiBuZXcgRmxvYXQzMkFycmF5KHRleENvb3JkcylcbiAgfTtcbn1cbiJdfQ==