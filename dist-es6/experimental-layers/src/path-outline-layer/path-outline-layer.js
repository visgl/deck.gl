var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { PathLayer } from 'deck.gl';
import { GL, Framebuffer, Texture2D, registerShaderModules } from 'luma.gl';
import outline from '../shaderlib/outline/outline';

registerShaderModules([outline]);

// TODO - this should be built into assembleShaders
function injectShaderCode(_ref) {
  var source = _ref.source,
      _ref$declarations = _ref.declarations,
      declarations = _ref$declarations === undefined ? '' : _ref$declarations,
      _ref$code = _ref.code,
      code = _ref$code === undefined ? '' : _ref$code;

  var INJECT_DECLARATIONS = /^/;
  var INJECT_CODE = /}[^{}]*$/;

  return source.replace(INJECT_DECLARATIONS, declarations).replace(INJECT_CODE, code.concat('\n}\n'));
}

var VS_DECLARATIONS = '#ifdef MODULE_OUTLINE\n  attribute float instanceZLevel;\n#endif\n';

var VS_CODE = '#ifdef MODULE_OUTLINE\n  outline_setUV(gl_Position);\n  outline_setZLevel(instanceZLevel);\n#endif\n';

var FS_CODE = '#ifdef MODULE_OUTLINE\n  gl_FragColor = outline_filterColor(gl_FragColor);\n#endif\n';

var defaultProps = {
  getZLevel: function getZLevel(object) {
    return object.zLevel | 0;
  }
};

var PathOutlineLayer = function (_PathLayer) {
  _inherits(PathOutlineLayer, _PathLayer);

  function PathOutlineLayer() {
    _classCallCheck(this, PathOutlineLayer);

    return _possibleConstructorReturn(this, (PathOutlineLayer.__proto__ || Object.getPrototypeOf(PathOutlineLayer)).apply(this, arguments));
  }

  _createClass(PathOutlineLayer, [{
    key: 'getShaders',

    // Override getShaders to inject the outline module
    value: function getShaders() {
      var shaders = _get(PathOutlineLayer.prototype.__proto__ || Object.getPrototypeOf(PathOutlineLayer.prototype), 'getShaders', this).call(this);
      return Object.assign({}, shaders, {
        modules: shaders.modules.concat(['outline']),
        vs: injectShaderCode({ source: shaders.vs, declarations: VS_DECLARATIONS, code: VS_CODE }),
        fs: injectShaderCode({ source: shaders.fs, code: FS_CODE })
      });
    }
  }, {
    key: 'initializeState',
    value: function initializeState(context) {
      _get(PathOutlineLayer.prototype.__proto__ || Object.getPrototypeOf(PathOutlineLayer.prototype), 'initializeState', this).call(this, context);

      // Create an outline "shadow" map
      // TODO - we should create a single outlineMap for all layers
      this.setState({
        outlineFramebuffer: new Framebuffer(context.gl),
        dummyTexture: new Texture2D(context.gl)
      });

      // Create an attribute manager
      this.state.attributeManager.addInstanced({
        instanceZLevel: { size: 1, type: GL.UNSIGNED_BYTE,
          update: this.calculateZLevels, accessor: 'getZLevel' }
      });
    }

    // Override draw to add render module

  }, {
    key: 'draw',
    value: function draw(_ref2) {
      var _ref2$moduleParameter = _ref2.moduleParameters,
          moduleParameters = _ref2$moduleParameter === undefined ? {} : _ref2$moduleParameter,
          parameters = _ref2.parameters,
          uniforms = _ref2.uniforms,
          context = _ref2.context;

      // Need to calculate same uniforms as base layer
      var _props = this.props,
          rounded = _props.rounded,
          miterLimit = _props.miterLimit,
          widthScale = _props.widthScale,
          widthMinPixels = _props.widthMinPixels,
          widthMaxPixels = _props.widthMaxPixels,
          dashJustified = _props.dashJustified;


      uniforms = Object.assign({}, uniforms, {
        jointType: Number(rounded),
        alignMode: Number(dashJustified),
        widthScale: widthScale,
        miterLimit: miterLimit,
        widthMinPixels: widthMinPixels,
        widthMaxPixels: widthMaxPixels
      });

      // Render the outline shadowmap (based on segment z orders)
      var _state = this.state,
          outlineFramebuffer = _state.outlineFramebuffer,
          dummyTexture = _state.dummyTexture;

      outlineFramebuffer.resize();
      outlineFramebuffer.clear({ color: true, depth: true });

      this.state.model.updateModuleSettings(Object.assign({}, moduleParameters, {
        outlineEnabled: true,
        outlineRenderShadowmap: true,
        outlineShadowmap: dummyTexture
      }));

      this.state.model.draw({
        uniforms: Object.assign({}, uniforms, {
          jointType: 0,
          widthScale: this.props.widthScale * 1.3
        }),
        parameters: {
          depthTest: false,
          blendEquation: GL.MAX // Biggest value needs to go into buffer
        },
        framebuffer: outlineFramebuffer
      });

      // Now use the outline shadowmap to render the lines (with outlines)
      this.state.model.updateModuleSettings(Object.assign({}, moduleParameters, {
        outlineEnabled: true,
        outlineRenderShadowmap: false,
        outlineShadowmap: outlineFramebuffer
      }));
      this.state.model.draw({
        uniforms: Object.assign({}, uniforms, {
          jointType: Number(rounded),
          widthScale: this.props.widthScale
        }),
        parameters: {
          depthTest: false
        }
      });
    }
  }, {
    key: 'calculateZLevels',
    value: function calculateZLevels(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getZLevel = _props2.getZLevel;
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path, index) {
        var zLevel = getZLevel(data[index], index);
        zLevel = isNaN(zLevel) ? 0 : zLevel;
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          value[i++] = zLevel;
        }
      });
    }
  }]);

  return PathOutlineLayer;
}(PathLayer);

export default PathOutlineLayer;


PathOutlineLayer.layerName = 'PathOutlineLayer';
PathOutlineLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwtbGF5ZXJzL3NyYy9wYXRoLW91dGxpbmUtbGF5ZXIvcGF0aC1vdXRsaW5lLWxheWVyLmpzIl0sIm5hbWVzIjpbIlBhdGhMYXllciIsIkdMIiwiRnJhbWVidWZmZXIiLCJUZXh0dXJlMkQiLCJyZWdpc3RlclNoYWRlck1vZHVsZXMiLCJvdXRsaW5lIiwiaW5qZWN0U2hhZGVyQ29kZSIsInNvdXJjZSIsImRlY2xhcmF0aW9ucyIsImNvZGUiLCJJTkpFQ1RfREVDTEFSQVRJT05TIiwiSU5KRUNUX0NPREUiLCJyZXBsYWNlIiwiY29uY2F0IiwiVlNfREVDTEFSQVRJT05TIiwiVlNfQ09ERSIsIkZTX0NPREUiLCJkZWZhdWx0UHJvcHMiLCJnZXRaTGV2ZWwiLCJvYmplY3QiLCJ6TGV2ZWwiLCJQYXRoT3V0bGluZUxheWVyIiwic2hhZGVycyIsIk9iamVjdCIsImFzc2lnbiIsIm1vZHVsZXMiLCJ2cyIsImZzIiwiY29udGV4dCIsInNldFN0YXRlIiwib3V0bGluZUZyYW1lYnVmZmVyIiwiZ2wiLCJkdW1teVRleHR1cmUiLCJzdGF0ZSIsImF0dHJpYnV0ZU1hbmFnZXIiLCJhZGRJbnN0YW5jZWQiLCJpbnN0YW5jZVpMZXZlbCIsInNpemUiLCJ0eXBlIiwiVU5TSUdORURfQllURSIsInVwZGF0ZSIsImNhbGN1bGF0ZVpMZXZlbHMiLCJhY2Nlc3NvciIsIm1vZHVsZVBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidW5pZm9ybXMiLCJwcm9wcyIsInJvdW5kZWQiLCJtaXRlckxpbWl0Iiwid2lkdGhTY2FsZSIsIndpZHRoTWluUGl4ZWxzIiwid2lkdGhNYXhQaXhlbHMiLCJkYXNoSnVzdGlmaWVkIiwiam9pbnRUeXBlIiwiTnVtYmVyIiwiYWxpZ25Nb2RlIiwicmVzaXplIiwiY2xlYXIiLCJjb2xvciIsImRlcHRoIiwibW9kZWwiLCJ1cGRhdGVNb2R1bGVTZXR0aW5ncyIsIm91dGxpbmVFbmFibGVkIiwib3V0bGluZVJlbmRlclNoYWRvd21hcCIsIm91dGxpbmVTaGFkb3dtYXAiLCJkcmF3IiwiZGVwdGhUZXN0IiwiYmxlbmRFcXVhdGlvbiIsIk1BWCIsImZyYW1lYnVmZmVyIiwiYXR0cmlidXRlIiwiZGF0YSIsInBhdGhzIiwidmFsdWUiLCJpIiwiZm9yRWFjaCIsInBhdGgiLCJpbmRleCIsImlzTmFOIiwicHRJbmRleCIsImxlbmd0aCIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLFNBQVFBLFNBQVIsUUFBd0IsU0FBeEI7QUFDQSxTQUFRQyxFQUFSLEVBQVlDLFdBQVosRUFBeUJDLFNBQXpCLEVBQW9DQyxxQkFBcEMsUUFBZ0UsU0FBaEU7QUFDQSxPQUFPQyxPQUFQLE1BQW9CLDhCQUFwQjs7QUFFQUQsc0JBQXNCLENBQUNDLE9BQUQsQ0FBdEI7O0FBRUE7QUFDQSxTQUFTQyxnQkFBVCxPQUFrRTtBQUFBLE1BQXZDQyxNQUF1QyxRQUF2Q0EsTUFBdUM7QUFBQSwrQkFBL0JDLFlBQStCO0FBQUEsTUFBL0JBLFlBQStCLHFDQUFoQixFQUFnQjtBQUFBLHVCQUFaQyxJQUFZO0FBQUEsTUFBWkEsSUFBWSw2QkFBTCxFQUFLOztBQUNoRSxNQUFNQyxzQkFBc0IsR0FBNUI7QUFDQSxNQUFNQyxjQUFjLFVBQXBCOztBQUVBLFNBQU9KLE9BQ0pLLE9BREksQ0FDSUYsbUJBREosRUFDeUJGLFlBRHpCLEVBRUpJLE9BRkksQ0FFSUQsV0FGSixFQUVpQkYsS0FBS0ksTUFBTCxDQUFZLE9BQVosQ0FGakIsQ0FBUDtBQUdEOztBQUVELElBQU1DLHNGQUFOOztBQU1BLElBQU1DLGdIQUFOOztBQU9BLElBQU1DLGdHQUFOOztBQU1BLElBQU1DLGVBQWU7QUFDbkJDLGFBQVc7QUFBQSxXQUFVQyxPQUFPQyxNQUFQLEdBQWdCLENBQTFCO0FBQUE7QUFEUSxDQUFyQjs7SUFJcUJDLGdCOzs7Ozs7Ozs7Ozs7QUFDbkI7aUNBQ2E7QUFDWCxVQUFNQyx3SUFBTjtBQUNBLGFBQU9DLE9BQU9DLE1BQVAsQ0FBYyxFQUFk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QUFiO0FBQ0Q7QUFDRixPQU5EO0FBT0Q7Ozs7RUF0RzJDcEIsUzs7ZUFBekJxQixnQjs7O0FBeUdyQkEsaUJBQWlCNEQsU0FBakIsR0FBNkIsa0JBQTdCO0FBQ0E1RCxpQkFBaUJKLFlBQWpCLEdBQWdDQSxZQUFoQyIsImZpbGUiOiJwYXRoLW91dGxpbmUtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1BhdGhMYXllcn0gZnJvbSAnZGVjay5nbCc7XG5pbXBvcnQge0dMLCBGcmFtZWJ1ZmZlciwgVGV4dHVyZTJELCByZWdpc3RlclNoYWRlck1vZHVsZXN9IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IG91dGxpbmUgZnJvbSAnLi4vc2hhZGVybGliL291dGxpbmUvb3V0bGluZSc7XG5cbnJlZ2lzdGVyU2hhZGVyTW9kdWxlcyhbb3V0bGluZV0pO1xuXG4vLyBUT0RPIC0gdGhpcyBzaG91bGQgYmUgYnVpbHQgaW50byBhc3NlbWJsZVNoYWRlcnNcbmZ1bmN0aW9uIGluamVjdFNoYWRlckNvZGUoe3NvdXJjZSwgZGVjbGFyYXRpb25zID0gJycsIGNvZGUgPSAnJ30pIHtcbiAgY29uc3QgSU5KRUNUX0RFQ0xBUkFUSU9OUyA9IC9eLztcbiAgY29uc3QgSU5KRUNUX0NPREUgPSAvfVtee31dKiQvO1xuXG4gIHJldHVybiBzb3VyY2VcbiAgICAucmVwbGFjZShJTkpFQ1RfREVDTEFSQVRJT05TLCBkZWNsYXJhdGlvbnMpXG4gICAgLnJlcGxhY2UoSU5KRUNUX0NPREUsIGNvZGUuY29uY2F0KCdcXG59XFxuJykpO1xufVxuXG5jb25zdCBWU19ERUNMQVJBVElPTlMgPSBgXFxcbiNpZmRlZiBNT0RVTEVfT1VUTElORVxuICBhdHRyaWJ1dGUgZmxvYXQgaW5zdGFuY2VaTGV2ZWw7XG4jZW5kaWZcbmA7XG5cbmNvbnN0IFZTX0NPREUgPSBgXFxcbiNpZmRlZiBNT0RVTEVfT1VUTElORVxuICBvdXRsaW5lX3NldFVWKGdsX1Bvc2l0aW9uKTtcbiAgb3V0bGluZV9zZXRaTGV2ZWwoaW5zdGFuY2VaTGV2ZWwpO1xuI2VuZGlmXG5gO1xuXG5jb25zdCBGU19DT0RFID0gYFxcXG4jaWZkZWYgTU9EVUxFX09VVExJTkVcbiAgZ2xfRnJhZ0NvbG9yID0gb3V0bGluZV9maWx0ZXJDb2xvcihnbF9GcmFnQ29sb3IpO1xuI2VuZGlmXG5gO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGdldFpMZXZlbDogb2JqZWN0ID0+IG9iamVjdC56TGV2ZWwgfCAwXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRoT3V0bGluZUxheWVyIGV4dGVuZHMgUGF0aExheWVyIHtcbiAgLy8gT3ZlcnJpZGUgZ2V0U2hhZGVycyB0byBpbmplY3QgdGhlIG91dGxpbmUgbW9kdWxlXG4gIGdldFNoYWRlcnMoKSB7XG4gICAgY29uc3Qgc2hhZGVycyA9IHN1cGVyLmdldFNoYWRlcnMoKTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgc2hhZGVycywge1xuICAgICAgbW9kdWxlczogc2hhZGVycy5tb2R1bGVzLmNvbmNhdChbJ291dGxpbmUnXSksXG4gICAgICB2czogaW5qZWN0U2hhZGVyQ29kZSh7c291cmNlOiBzaGFkZXJzLnZzLCBkZWNsYXJhdGlvbnM6IFZTX0RFQ0xBUkFUSU9OUywgY29kZTogVlNfQ09ERX0pLFxuICAgICAgZnM6IGluamVjdFNoYWRlckNvZGUoe3NvdXJjZTogc2hhZGVycy5mcywgY29kZTogRlNfQ09ERX0pXG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoY29udGV4dCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVTdGF0ZShjb250ZXh0KTtcblxuICAgIC8vIENyZWF0ZSBhbiBvdXRsaW5lIFwic2hhZG93XCIgbWFwXG4gICAgLy8gVE9ETyAtIHdlIHNob3VsZCBjcmVhdGUgYSBzaW5nbGUgb3V0bGluZU1hcCBmb3IgYWxsIGxheWVyc1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3V0bGluZUZyYW1lYnVmZmVyOiBuZXcgRnJhbWVidWZmZXIoY29udGV4dC5nbCksXG4gICAgICBkdW1teVRleHR1cmU6IG5ldyBUZXh0dXJlMkQoY29udGV4dC5nbClcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhbiBhdHRyaWJ1dGUgbWFuYWdlclxuICAgIHRoaXMuc3RhdGUuYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgaW5zdGFuY2VaTGV2ZWw6IHtzaXplOiAxLCB0eXBlOiBHTC5VTlNJR05FRF9CWVRFLFxuICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlWkxldmVscywgYWNjZXNzb3I6ICdnZXRaTGV2ZWwnfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgZHJhdyB0byBhZGQgcmVuZGVyIG1vZHVsZVxuICBkcmF3KHttb2R1bGVQYXJhbWV0ZXJzID0ge30sIHBhcmFtZXRlcnMsIHVuaWZvcm1zLCBjb250ZXh0fSkge1xuICAgIC8vIE5lZWQgdG8gY2FsY3VsYXRlIHNhbWUgdW5pZm9ybXMgYXMgYmFzZSBsYXllclxuICAgIGNvbnN0IHtcbiAgICAgIHJvdW5kZWQsXG4gICAgICBtaXRlckxpbWl0LFxuICAgICAgd2lkdGhTY2FsZSxcbiAgICAgIHdpZHRoTWluUGl4ZWxzLFxuICAgICAgd2lkdGhNYXhQaXhlbHMsXG4gICAgICBkYXNoSnVzdGlmaWVkXG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICB1bmlmb3JtcyA9IE9iamVjdC5hc3NpZ24oe30sIHVuaWZvcm1zLCB7XG4gICAgICBqb2ludFR5cGU6IE51bWJlcihyb3VuZGVkKSxcbiAgICAgIGFsaWduTW9kZTogTnVtYmVyKGRhc2hKdXN0aWZpZWQpLFxuICAgICAgd2lkdGhTY2FsZSxcbiAgICAgIG1pdGVyTGltaXQsXG4gICAgICB3aWR0aE1pblBpeGVscyxcbiAgICAgIHdpZHRoTWF4UGl4ZWxzXG4gICAgfSk7XG5cbiAgICAvLyBSZW5kZXIgdGhlIG91dGxpbmUgc2hhZG93bWFwIChiYXNlZCBvbiBzZWdtZW50IHogb3JkZXJzKVxuICAgIGNvbnN0IHtvdXRsaW5lRnJhbWVidWZmZXIsIGR1bW15VGV4dHVyZX0gPSB0aGlzLnN0YXRlO1xuICAgIG91dGxpbmVGcmFtZWJ1ZmZlci5yZXNpemUoKTtcbiAgICBvdXRsaW5lRnJhbWVidWZmZXIuY2xlYXIoe2NvbG9yOiB0cnVlLCBkZXB0aDogdHJ1ZX0pO1xuXG4gICAgdGhpcy5zdGF0ZS5tb2RlbC51cGRhdGVNb2R1bGVTZXR0aW5ncyhPYmplY3QuYXNzaWduKHt9LCBtb2R1bGVQYXJhbWV0ZXJzLCB7XG4gICAgICBvdXRsaW5lRW5hYmxlZDogdHJ1ZSxcbiAgICAgIG91dGxpbmVSZW5kZXJTaGFkb3dtYXA6IHRydWUsXG4gICAgICBvdXRsaW5lU2hhZG93bWFwOiBkdW1teVRleHR1cmVcbiAgICB9KSk7XG5cbiAgICB0aGlzLnN0YXRlLm1vZGVsLmRyYXcoe1xuICAgICAgdW5pZm9ybXM6IE9iamVjdC5hc3NpZ24oe30sIHVuaWZvcm1zLCB7XG4gICAgICAgIGpvaW50VHlwZTogMCxcbiAgICAgICAgd2lkdGhTY2FsZTogdGhpcy5wcm9wcy53aWR0aFNjYWxlICogMS4zXG4gICAgICB9KSxcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgZGVwdGhUZXN0OiBmYWxzZSxcbiAgICAgICAgYmxlbmRFcXVhdGlvbjogR0wuTUFYIC8vIEJpZ2dlc3QgdmFsdWUgbmVlZHMgdG8gZ28gaW50byBidWZmZXJcbiAgICAgIH0sXG4gICAgICBmcmFtZWJ1ZmZlcjogb3V0bGluZUZyYW1lYnVmZmVyXG4gICAgfSk7XG5cbiAgICAvLyBOb3cgdXNlIHRoZSBvdXRsaW5lIHNoYWRvd21hcCB0byByZW5kZXIgdGhlIGxpbmVzICh3aXRoIG91dGxpbmVzKVxuICAgIHRoaXMuc3RhdGUubW9kZWwudXBkYXRlTW9kdWxlU2V0dGluZ3MoT2JqZWN0LmFzc2lnbih7fSwgbW9kdWxlUGFyYW1ldGVycywge1xuICAgICAgb3V0bGluZUVuYWJsZWQ6IHRydWUsXG4gICAgICBvdXRsaW5lUmVuZGVyU2hhZG93bWFwOiBmYWxzZSxcbiAgICAgIG91dGxpbmVTaGFkb3dtYXA6IG91dGxpbmVGcmFtZWJ1ZmZlclxuICAgIH0pKTtcbiAgICB0aGlzLnN0YXRlLm1vZGVsLmRyYXcoe1xuICAgICAgdW5pZm9ybXM6IE9iamVjdC5hc3NpZ24oe30sIHVuaWZvcm1zLCB7XG4gICAgICAgIGpvaW50VHlwZTogTnVtYmVyKHJvdW5kZWQpLFxuICAgICAgICB3aWR0aFNjYWxlOiB0aGlzLnByb3BzLndpZHRoU2NhbGVcbiAgICAgIH0pLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICBkZXB0aFRlc3Q6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVaTGV2ZWxzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRaTGV2ZWx9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7cGF0aHN9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuXG4gICAgbGV0IGkgPSAwO1xuICAgIHBhdGhzLmZvckVhY2goKHBhdGgsIGluZGV4KSA9PiB7XG4gICAgICBsZXQgekxldmVsID0gZ2V0WkxldmVsKGRhdGFbaW5kZXhdLCBpbmRleCk7XG4gICAgICB6TGV2ZWwgPSBpc05hTih6TGV2ZWwpID8gMCA6IHpMZXZlbDtcbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAxOyBwdEluZGV4IDwgcGF0aC5sZW5ndGg7IHB0SW5kZXgrKykge1xuICAgICAgICB2YWx1ZVtpKytdID0gekxldmVsO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cblBhdGhPdXRsaW5lTGF5ZXIubGF5ZXJOYW1lID0gJ1BhdGhPdXRsaW5lTGF5ZXInO1xuUGF0aE91dGxpbmVMYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=