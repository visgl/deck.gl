var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

import assert from 'assert';
import { Framebuffer, ShaderCache } from 'luma.gl';
import seer from 'seer';
import Layer from './layer';
import { drawLayers as _drawLayers } from './draw-layers';
import { pickObject as _pickObject, pickVisibleObjects } from './pick-layers';
import { LIFECYCLE } from './constants';
import Viewport from '../viewports/viewport';
// TODO - remove, just for dummy initialization
import WebMercatorViewport from '../viewports/web-mercator-viewport';
import log from '../utils/log';
import { flatten } from '../utils/flatten';

import { setPropOverrides, layerEditListener, seerInitListener, initLayerInSeer, updateLayerInSeer } from './seer-integration';

var LOG_PRIORITY_LIFECYCLE = 2;
var LOG_PRIORITY_LIFECYCLE_MINOR = 4;

var initialContext = {
  uniforms: {},
  viewports: [],
  viewport: null,
  layerFilter: null,
  viewportChanged: true,
  pickingFBO: null,
  useDevicePixels: true,
  lastPickedInfo: {
    index: -1,
    layerId: null
  }
};

var layerName = function layerName(layer) {
  return layer instanceof Layer ? '' + layer : !layer ? 'null' : 'invalid';
};

var LayerManager = function () {
  function LayerManager(gl) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        eventManager = _ref.eventManager;

    _classCallCheck(this, LayerManager);

    // eslint-disable-line
    // Currently deck.gl expects the DeckGL.layers array to be different
    // whenever React rerenders. If the same layers array is used, the
    // LayerManager's diffing algorithm will generate a fatal error and
    // break the rendering.

    // `this.lastRenderedLayers` stores the UNFILTERED layers sent
    // down to LayerManager, so that `layers` reference can be compared.
    // If it's the same across two React render calls, the diffing logic
    // will be skipped.
    this.lastRenderedLayers = [];
    this.prevLayers = [];
    this.layers = [];

    this.oldContext = {};
    this.context = Object.assign({}, initialContext, {
      gl: gl,
      // Enabling luma.gl Program caching using private API (_cachePrograms)
      shaderCache: new ShaderCache({ gl: gl, _cachePrograms: true })
    });

    // List of view descriptors, gets re-evaluated when width/height changes
    this.width = 100;
    this.height = 100;
    this.viewDescriptors = [];
    this.viewDescriptorsChanged = true;
    this.viewports = []; // Generated viewports
    this._needsRedraw = 'Initial render';

    // Event handling
    this._pickingRadius = 0;

    this._eventManager = null;
    this._onLayerClick = null;
    this._onLayerHover = null;
    this._onClick = this._onClick.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
    this._pickAndCallback = this._pickAndCallback.bind(this);

    // Seer integration
    this._initSeer = this._initSeer.bind(this);
    this._editSeer = this._editSeer.bind(this);
    seerInitListener(this._initSeer);
    layerEditListener(this._editSeer);

    Object.seal(this);

    if (eventManager) {
      this._initEventHandling(eventManager);
    }

    // Init with dummy viewport
    this.setViewports([new WebMercatorViewport({ width: 1, height: 1, latitude: 0, longitude: 0, zoom: 1 })]);
  }

  /**
   * Method to call when the layer manager is not needed anymore.
   *
   * Currently used in the <DeckGL> componentWillUnmount lifecycle to unbind Seer listeners.
   */


  _createClass(LayerManager, [{
    key: 'finalize',
    value: function finalize() {
      seer.removeListener(this._initSeer);
      seer.removeListener(this._editSeer);
    }
  }, {
    key: 'needsRedraw',
    value: function needsRedraw() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$clearRedrawFlag = _ref2.clearRedrawFlags,
          clearRedrawFlags = _ref2$clearRedrawFlag === undefined ? true : _ref2$clearRedrawFlag;

      return this._checkIfNeedsRedraw(clearRedrawFlags);
    }

    // Normally not called by app

  }, {
    key: 'setNeedsRedraw',
    value: function setNeedsRedraw(reason) {
      this._needsRedraw = this._needsRedraw || reason;
    }

    // Gets an (optionally) filtered list of layers

  }, {
    key: 'getLayers',
    value: function getLayers() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref3$layerIds = _ref3.layerIds,
          layerIds = _ref3$layerIds === undefined ? null : _ref3$layerIds;

      // Filtering by layerId compares beginning of strings, so that sublayers will be included
      // Dependes on the convention of adding suffixes to the parent's layer name
      return layerIds ? this.layers.filter(function (layer) {
        return layerIds.find(function (layerId) {
          return layer.id.indexOf(layerId) === 0;
        });
      }) : this.layers;
    }

    // Get a set of viewports for a given width and height
    // TODO - Intention is for deck.gl to autodeduce width and height and drop the need for props

  }, {
    key: 'getViewports',
    value: function getViewports() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          width = _ref4.width,
          height = _ref4.height;

      if (width !== this.width || height !== this.height || this.viewDescriptorsChanged) {
        this._rebuildViewportsFromViews({ viewDescriptors: this.viewDescriptors, width: width, height: height });
        this.width = width;
        this.height = height;
      }
      return this.viewports;
    }

    /**
     * Set parameters needed for layer rendering and picking.
     * Parameters are to be passed as a single object, with the following values:
     * @param {Boolean} useDevicePixels
     */

  }, {
    key: 'setParameters',
    value: function setParameters(parameters) {
      if ('eventManager' in parameters) {
        this._initEventHandling(parameters.eventManager);
      }

      if ('pickingRadius' in parameters || 'onLayerClick' in parameters || 'onLayerHover' in parameters) {
        this._setEventHandlingParameters(parameters);
      }

      // TODO - For now we set layers before viewports to preservenchangeFlags
      if ('layers' in parameters) {
        this.setLayers(parameters.layers);
      }

      if ('viewports' in parameters) {
        this.setViewports(parameters.viewports);
      }

      if ('layerFilter' in parameters) {
        this.context.layerFilter = parameters.layerFilter;
        if (this.context.layerFilter !== parameters.layerFilter) {
          this.setNeedsRedraw('layerFilter changed');
        }
      }

      if ('drawPickingColors' in parameters) {
        if (this.context.drawPickingColors !== parameters.drawPickingColors) {
          this.setNeedsRedraw('drawPickingColors changed');
        }
      }

      Object.assign(this.context, parameters);
    }

    // Update the view descriptor list and set change flag if needed

  }, {
    key: 'setViewports',
    value: function setViewports(viewports) {
      // Ensure viewports are wrapped in descriptors
      var viewDescriptors = flatten(viewports, { filter: Boolean }).map(function (viewport) {
        return viewport instanceof Viewport ? { viewport: viewport } : viewport;
      });

      this.viewDescriptorsChanged = this.viewDescriptorsChanged || this._diffViews(viewDescriptors, this.viewDescriptors);

      // Try to not actually rebuild the viewports until `getViewports` is called
      if (this.viewDescriptorsChanged) {
        this.viewDescriptors = viewDescriptors;
        this._rebuildViewportsFromViews({ viewDescriptors: this.viewDescriptors });
        this.viewDescriptorsChanged = false;
      }
    }

    // Supply a new layer list, initiating sublayer generation and layer matching

  }, {
    key: 'setLayers',
    value: function setLayers(newLayers) {
      assert(this.context.viewport, 'LayerManager.updateLayers: viewport not set');

      // TODO - something is generating state updates that cause rerender of the same
      if (newLayers === this.lastRenderedLayers) {
        log.log(3, 'Ignoring layer update due to layer array not changed');
        return this;
      }
      this.lastRenderedLayers = newLayers;

      newLayers = flatten(newLayers, { filter: Boolean });

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = newLayers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var layer = _step.value;

          layer.context = this.context;
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

      this.prevLayers = this.layers;

      var _updateLayers2 = this._updateLayers({
        oldLayers: this.prevLayers,
        newLayers: newLayers
      }),
          error = _updateLayers2.error,
          generatedLayers = _updateLayers2.generatedLayers;

      this.layers = generatedLayers;
      // Throw first error found, if any
      if (error) {
        throw error;
      }
      return this;
    }
  }, {
    key: 'drawLayers',
    value: function drawLayers() {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref5$pass = _ref5.pass,
          pass = _ref5$pass === undefined ? 'render to screen' : _ref5$pass,
          _ref5$redrawReason = _ref5.redrawReason,
          redrawReason = _ref5$redrawReason === undefined ? 'unknown reason' : _ref5$redrawReason;

      var _context = this.context,
          gl = _context.gl,
          useDevicePixels = _context.useDevicePixels,
          drawPickingColors = _context.drawPickingColors;

      // render this viewport

      _drawLayers(gl, {
        layers: this.layers,
        viewports: this.getViewports(),
        onViewportActive: this._activateViewport.bind(this),
        useDevicePixels: useDevicePixels,
        drawPickingColors: drawPickingColors,
        pass: pass,
        layerFilter: this.context.layerFilter,
        redrawReason: redrawReason
      });
    }

    // Pick the closest info at given coordinate

  }, {
    key: 'pickObject',
    value: function pickObject(_ref6) {
      var x = _ref6.x,
          y = _ref6.y,
          mode = _ref6.mode,
          _ref6$radius = _ref6.radius,
          radius = _ref6$radius === undefined ? 0 : _ref6$radius,
          layerIds = _ref6.layerIds,
          layerFilter = _ref6.layerFilter;
      var _context2 = this.context,
          gl = _context2.gl,
          useDevicePixels = _context2.useDevicePixels;


      var layers = this.getLayers({ layerIds: layerIds });

      return _pickObject(gl, {
        // User params
        x: x,
        y: y,
        radius: radius,
        layers: layers,
        mode: mode,
        layerFilter: layerFilter,
        // Injected params
        viewports: this.getViewports(),
        onViewportActive: this._activateViewport.bind(this),
        pickingFBO: this._getPickingBuffer(),
        lastPickedInfo: this.context.lastPickedInfo,
        useDevicePixels: useDevicePixels
      });
    }

    // Get all unique infos within a bounding box

  }, {
    key: 'pickObjects',
    value: function pickObjects(_ref7) {
      var x = _ref7.x,
          y = _ref7.y,
          width = _ref7.width,
          height = _ref7.height,
          layerIds = _ref7.layerIds,
          layerFilter = _ref7.layerFilter;
      var _context3 = this.context,
          gl = _context3.gl,
          useDevicePixels = _context3.useDevicePixels;


      var layers = this.getLayers({ layerIds: layerIds });

      return pickVisibleObjects(gl, {
        x: x,
        y: y,
        width: width,
        height: height,
        layers: layers,
        layerFilter: layerFilter,
        mode: 'pickObjects',
        // TODO - how does this interact with multiple viewports?
        viewport: this.context.viewport,
        viewports: this.getViewports(),
        onViewportActive: this._activateViewport.bind(this),
        pickingFBO: this._getPickingBuffer(),
        useDevicePixels: useDevicePixels
      });
    }

    //
    // DEPRECATED METHODS
    //

  }, {
    key: 'updateLayers',
    value: function updateLayers(_ref8) {
      var newLayers = _ref8.newLayers;

      log.deprecated('updateLayers', 'setLayers');
      this.setLayers(newLayers);
    }
  }, {
    key: 'setViewport',
    value: function setViewport(viewport) {
      log.deprecated('setViewport', 'setViewports');
      this.setViewports([viewport]);
      return this;
    }

    //
    // PRIVATE METHODS
    //

  }, {
    key: '_checkIfNeedsRedraw',
    value: function _checkIfNeedsRedraw(clearRedrawFlags) {
      var redraw = this._needsRedraw;
      if (clearRedrawFlags) {
        this._needsRedraw = false;
      }

      // This layers list doesn't include sublayers, relying on composite layers
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.layers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var layer = _step2.value;

          // Call every layer to clear their flags
          var layerNeedsRedraw = layer.getNeedsRedraw({ clearRedrawFlags: clearRedrawFlags });
          redraw = redraw || layerNeedsRedraw;
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

      return redraw;
    }

    // Rebuilds viewports from descriptors towards a certain window size

  }, {
    key: '_rebuildViewportsFromViews',
    value: function _rebuildViewportsFromViews(_ref9) {
      var _this = this;

      var viewDescriptors = _ref9.viewDescriptors,
          width = _ref9.width,
          height = _ref9.height;

      var newViewports = viewDescriptors.map(function (viewDescriptor) {
        return (
          // If a `Viewport` instance was supplied, use it, otherwise build it
          viewDescriptor.viewport instanceof Viewport ? viewDescriptor.viewport : _this._makeViewportFromViewDescriptor({ viewDescriptor: viewDescriptor, width: width, height: height })
        );
      });

      this.setNeedsRedraw('Viewport(s) changed');

      // Ensure one viewport is activated, layers may expect it
      // TODO - handle empty viewport list (using dummy viewport), or assert
      // const oldViewports = this.context.viewports;
      // if (viewportsChanged) {

      var viewport = newViewports[0];
      assert(viewport instanceof Viewport, 'Invalid viewport');

      this.context.viewports = newViewports;
      this._activateViewport(viewport);
      // }

      // We've just rebuilt the viewports to match the descriptors, so clear the flag
      this.viewports = newViewports;
      this.viewDescriptorsChanged = false;
    }

    // Build a `Viewport` from a view descriptor
    // TODO - add support for autosizing viewports using width and height

  }, {
    key: '_makeViewportFromViewDescriptor',
    value: function _makeViewportFromViewDescriptor(_ref10) {
      var viewDescriptor = _ref10.viewDescriptor,
          width = _ref10.width,
          height = _ref10.height;

      // Get the type of the viewport
      // TODO - default to WebMercator?
      var ViewportType = viewDescriptor.type,
          viewState = viewDescriptor.viewState;

      // Resolve relative viewport dimensions
      // TODO - we need to have width and height available

      var viewportDimensions = this._getViewDimensions({ viewDescriptor: viewDescriptor });

      // Create the viewport, giving preference to view state in `viewState`
      return new ViewportType(Object.assign({}, viewDescriptor, viewportDimensions, viewState // Object.assign handles undefined
      ));
    }

    // Check if viewport array has changed, returns true if any change
    // Note that descriptors can be the same

  }, {
    key: '_diffViews',
    value: function _diffViews(newViews, oldViews) {
      var _this2 = this;

      if (newViews.length !== oldViews.length) {
        return true;
      }

      return newViews.some(function (_, i) {
        return _this2._diffView(newViews[i], oldViews[i]);
      });
    }
  }, {
    key: '_diffView',
    value: function _diffView(newView, oldView) {
      // `View` hiearchy supports an `equals` method
      if (newView.viewport) {
        return !oldView.viewport || !newView.viewport.equals(oldView.viewport);
      }
      // TODO - implement deep equal on view descriptors
      return newView !== oldView;
    }

    // Support for relative viewport dimensions (e.g {y: '50%', height: '50%'})

  }, {
    key: '_getViewDimensions',
    value: function _getViewDimensions(_ref11) {
      var viewDescriptor = _ref11.viewDescriptor,
          width = _ref11.width,
          height = _ref11.height;

      var parsePercent = function parsePercent(value, max) {
        return value;
      };
      // TODO - enable to support percent size specifiers
      // const parsePercent = (value, max) => value ?
      //   Math.round(parseFloat(value) / 100 * max) :
      //   (value === null ? max : value);

      return {
        x: parsePercent(viewDescriptor.x, width),
        y: parsePercent(viewDescriptor.y, height),
        width: parsePercent(viewDescriptor.width, width),
        height: parsePercent(viewDescriptor.height, height)
      };
    }

    /**
     * @param {Object} eventManager   A source of DOM input events
     */

  }, {
    key: '_initEventHandling',
    value: function _initEventHandling(eventManager) {
      this._eventManager = eventManager;

      // TODO: add/remove handlers on demand at runtime, not all at once on init.
      // Consider both top-level handlers like onLayerClick/Hover
      // and per-layer handlers attached to individual layers.
      // https://github.com/uber/deck.gl/issues/634
      this._eventManager.on({
        click: this._onClick,
        pointermove: this._onPointerMove,
        pointerleave: this._onPointerLeave
      });
    }

    // Set parameters for input event handling.

  }, {
    key: '_setEventHandlingParameters',
    value: function _setEventHandlingParameters(_ref12) {
      var pickingRadius = _ref12.pickingRadius,
          onLayerClick = _ref12.onLayerClick,
          onLayerHover = _ref12.onLayerHover;

      if (!isNaN(pickingRadius)) {
        this._pickingRadius = pickingRadius;
      }
      if (typeof onLayerClick !== 'undefined') {
        this._onLayerClick = onLayerClick;
      }
      if (typeof onLayerHover !== 'undefined') {
        this._onLayerHover = onLayerHover;
      }
      this._validateEventHandling();
    }

    // Make a viewport "current" in layer context, primed for draw

  }, {
    key: '_activateViewport',
    value: function _activateViewport(viewport) {
      // TODO - viewport change detection breaks METER_OFFSETS mode
      // const oldViewport = this.context.viewport;
      // const viewportChanged = !oldViewport || !viewport.equals(oldViewport);
      var viewportChanged = true;

      if (viewportChanged) {
        Object.assign(this.oldContext, this.context);
        this.context.viewport = viewport;
        this.context.viewportChanged = true;
        this.context.uniforms = {};
        log(4, viewport);

        // Update layers states
        // Let screen space layers update their state based on viewport
        // TODO - reimplement viewport change detection (single viewport optimization)
        // TODO - don't set viewportChanged during setViewports?
        if (this.context.viewportChanged) {
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = this.layers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var layer = _step3.value;

              layer.setChangeFlags({ viewportChanged: 'Viewport changed' });
              this._updateLayer(layer);
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
      }

      assert(this.context.viewport, 'LayerManager: viewport not set');

      return this;
    }
  }, {
    key: '_getPickingBuffer',
    value: function _getPickingBuffer() {
      var gl = this.context.gl;
      // Create a frame buffer if not already available

      this.context.pickingFBO = this.context.pickingFBO || new Framebuffer(gl);
      // Resize it to current canvas size (this is a noop if size hasn't changed)
      this.context.pickingFBO.resize({ width: gl.canvas.width, height: gl.canvas.height });
      return this.context.pickingFBO;
    }

    // Match all layers, checking for caught errors
    // To avoid having an exception in one layer disrupt other layers
    // TODO - mark layers with exceptions as bad and remove from rendering cycle?

  }, {
    key: '_updateLayers',
    value: function _updateLayers(_ref13) {
      var oldLayers = _ref13.oldLayers,
          newLayers = _ref13.newLayers;

      // Create old layer map
      var oldLayerMap = {};
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = oldLayers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var oldLayer = _step4.value;

          if (oldLayerMap[oldLayer.id]) {
            log.warn('Multiple old layers with same id ' + layerName(oldLayer));
          } else {
            oldLayerMap[oldLayer.id] = oldLayer;
          }
        }

        // Allocate array for generated layers
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

      var generatedLayers = [];

      // Match sublayers
      var error = this._updateSublayersRecursively({
        newLayers: newLayers, oldLayerMap: oldLayerMap, generatedLayers: generatedLayers
      });

      // Finalize unmatched layers
      var error2 = this._finalizeOldLayers(oldLayerMap);

      var firstError = error || error2;
      return { error: firstError, generatedLayers: generatedLayers };
    }

    // Note: adds generated layers to `generatedLayers` array parameter

  }, {
    key: '_updateSublayersRecursively',
    value: function _updateSublayersRecursively(_ref14) {
      var newLayers = _ref14.newLayers,
          oldLayerMap = _ref14.oldLayerMap,
          generatedLayers = _ref14.generatedLayers;

      var error = null;

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = newLayers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var newLayer = _step5.value;

          newLayer.context = this.context;

          // Given a new coming layer, find its matching old layer (if any)
          var oldLayer = oldLayerMap[newLayer.id];
          if (oldLayer === null) {
            // null, rather than undefined, means this id was originally there
            log.warn('Multiple new layers with same id ' + layerName(newLayer));
          }
          // Remove the old layer from candidates, as it has been matched with this layer
          oldLayerMap[newLayer.id] = null;

          var sublayers = null;

          // We must not generate exceptions until after layer matching is complete
          try {
            if (!oldLayer) {
              this._initializeLayer(newLayer);
              initLayerInSeer(newLayer); // Initializes layer in seer chrome extension (if connected)
            } else {
              this._transferLayerState(oldLayer, newLayer);
              this._updateLayer(newLayer);
              updateLayerInSeer(newLayer); // Updates layer in seer chrome extension (if connected)
            }
            generatedLayers.push(newLayer);

            // Call layer lifecycle method: render sublayers
            sublayers = newLayer.isComposite && newLayer.getSubLayers();
            // End layer lifecycle method: render sublayers
          } catch (err) {
            log.warn('error during matching of ' + layerName(newLayer), err);
            error = error || err; // Record first exception
          }

          if (sublayers) {
            this._updateSublayersRecursively({
              newLayers: sublayers,
              oldLayerMap: oldLayerMap,
              generatedLayers: generatedLayers
            });
          }
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

      return error;
    }

    // Finalize any old layers that were not matched

  }, {
    key: '_finalizeOldLayers',
    value: function _finalizeOldLayers(oldLayerMap) {
      var error = null;
      for (var layerId in oldLayerMap) {
        var layer = oldLayerMap[layerId];
        if (layer) {
          error = error || this._finalizeLayer(layer);
        }
      }
      return error;
    }

    // Initializes a single layer, calling layer methods

  }, {
    key: '_initializeLayer',
    value: function _initializeLayer(layer) {
      assert(!layer.state);
      log(LOG_PRIORITY_LIFECYCLE, 'initializing ' + layerName(layer));

      var error = null;
      try {
        layer._initialize();
        layer.lifecycle = LIFECYCLE.INITIALIZED;
      } catch (err) {
        log.warn('error while initializing ' + layerName(layer) + '\n', err);
        error = error || err;
        // TODO - what should the lifecycle state be here? LIFECYCLE.INITIALIZATION_FAILED?
      }

      assert(layer.state);

      // Set back pointer (used in picking)
      layer.state.layer = layer;

      // Save layer on model for picking purposes
      // store on model.userData rather than directly on model
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = layer.getModels()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var model = _step6.value;

          model.userData.layer = layer;
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return error;
    }
  }, {
    key: '_transferLayerState',
    value: function _transferLayerState(oldLayer, newLayer) {
      if (newLayer !== oldLayer) {
        log(LOG_PRIORITY_LIFECYCLE_MINOR, 'matched ' + layerName(newLayer), oldLayer, '->', newLayer);
        newLayer.lifecycle = LIFECYCLE.MATCHED;
        oldLayer.lifecycle = LIFECYCLE.AWAITING_GC;
        newLayer._transferState(oldLayer);
      } else {
        log.log(LOG_PRIORITY_LIFECYCLE_MINOR, 'Matching layer is unchanged ' + newLayer.id);
        newLayer.lifecycle = LIFECYCLE.MATCHED;
        newLayer.oldProps = newLayer.props;
      }
    }

    // Updates a single layer, cleaning all flags

  }, {
    key: '_updateLayer',
    value: function _updateLayer(layer) {
      log.log(LOG_PRIORITY_LIFECYCLE_MINOR, 'updating ' + layer + ' because: ' + layer.printChangeFlags());
      var error = null;
      try {
        layer._update();
      } catch (err) {
        log.warn('error during update of ' + layerName(layer), err);
        // Save first error
        error = err;
      }
      return error;
    }

    // Finalizes a single layer

  }, {
    key: '_finalizeLayer',
    value: function _finalizeLayer(layer) {
      assert(layer.state);
      assert(layer.lifecycle !== LIFECYCLE.AWAITING_FINALIZATION);
      layer.lifecycle = LIFECYCLE.AWAITING_FINALIZATION;
      var error = null;
      this.setNeedsRedraw('finalized ' + layerName(layer));
      try {
        layer._finalize();
      } catch (err) {
        log.warn('error during finalization of ' + layerName(layer), err);
        error = err;
      }
      layer.lifecycle = LIFECYCLE.FINALIZED;
      log(LOG_PRIORITY_LIFECYCLE, 'finalizing ' + layerName(layer));
      return error;
    }

    /**
     * Warn if a deck-level mouse event has been specified,
     * but no layers are `pickable`.
     */

  }, {
    key: '_validateEventHandling',
    value: function _validateEventHandling() {
      if (this.onLayerClick || this.onLayerHover) {
        if (this.layers.length && !this.layers.some(function (layer) {
          return layer.props.pickable;
        })) {
          log.warn('You have supplied a top-level input event handler (e.g. `onLayerClick`), ' + 'but none of your layers have set the `pickable` flag.');
        }
      }
    }

    /**
     * Route click events to layers.
     * `pickLayer` will call the `onClick` prop of any picked layer,
     * and `onLayerClick` is called directly from here
     * with any picking info generated by `pickLayer`.
     * @param {Object} event  An object encapsulating an input event,
     *                        with the following shape:
     *                        {Object: {x, y}} offsetCenter: center of the event
     *                        {Object} srcEvent:             native JS Event object
     */

  }, {
    key: '_onClick',
    value: function _onClick(event) {
      if (!event.offsetCenter) {
        // Do not trigger onHover callbacks when click position is invalid.
        return;
      }
      this._pickAndCallback({
        callback: this._onLayerClick,
        event: event,
        mode: 'click'
      });
    }

    /**
     * Route click events to layers.
     * `pickLayer` will call the `onHover` prop of any picked layer,
     * and `onLayerHover` is called directly from here
     * with any picking info generated by `pickLayer`.
     * @param {Object} event  An object encapsulating an input event,
     *                        with the following shape:
     *                        {Object: {x, y}} offsetCenter: center of the event
     *                        {Object} srcEvent:             native JS Event object
     */

  }, {
    key: '_onPointerMove',
    value: function _onPointerMove(event) {
      if (event.isDown) {
        // Do not trigger onHover callbacks if mouse button is down.
        return;
      }
      this._pickAndCallback({
        callback: this._onLayerHover,
        event: event,
        mode: 'hover'
      });
    }
  }, {
    key: '_onPointerLeave',
    value: function _onPointerLeave(event) {
      this.pickObject({
        x: -1,
        y: -1,
        radius: this._pickingRadius,
        mode: 'hover'
      });
    }
  }, {
    key: '_pickAndCallback',
    value: function _pickAndCallback(options) {
      var pos = options.event.offsetCenter;
      var radius = this._pickingRadius;
      var selectedInfos = this.pickObject({ x: pos.x, y: pos.y, radius: radius, mode: options.mode });
      if (options.callback) {
        var firstInfo = selectedInfos.find(function (info) {
          return info.index >= 0;
        }) || null;
        // As per documentation, send null value when no valid object is picked.
        options.callback(firstInfo, selectedInfos, options.event.srcEvent);
      }
    }

    // SEER INTEGRATION

    /**
     * Called upon Seer initialization, manually sends layers data.
     */

  }, {
    key: '_initSeer',
    value: function _initSeer() {
      this.layers.forEach(function (layer) {
        initLayerInSeer(layer);
        updateLayerInSeer(layer);
      });
    }

    /**
     * On Seer property edition, set override and update layers.
     */

  }, {
    key: '_editSeer',
    value: function _editSeer(payload) {
      if (payload.type !== 'edit' || payload.valuePath[0] !== 'props') {
        return;
      }

      setPropOverrides(payload.itemKey, payload.valuePath.slice(1), payload.value);
      var newLayers = this.layers.map(function (layer) {
        return new layer.constructor(layer.props);
      });
      this.updateLayers({ newLayers: newLayers });
    }
  }]);

  return LayerManager;
}();

export default LayerManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2xpYi9sYXllci1tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbImFzc2VydCIsIkZyYW1lYnVmZmVyIiwiU2hhZGVyQ2FjaGUiLCJzZWVyIiwiTGF5ZXIiLCJkcmF3TGF5ZXJzIiwicGlja09iamVjdCIsInBpY2tWaXNpYmxlT2JqZWN0cyIsIkxJRkVDWUNMRSIsIlZpZXdwb3J0IiwiV2ViTWVyY2F0b3JWaWV3cG9ydCIsImxvZyIsImZsYXR0ZW4iLCJzZXRQcm9wT3ZlcnJpZGVzIiwibGF5ZXJFZGl0TGlzdGVuZXIiLCJzZWVySW5pdExpc3RlbmVyIiwiaW5pdExheWVySW5TZWVyIiwidXBkYXRlTGF5ZXJJblNlZXIiLCJMT0dfUFJJT1JJVFlfTElGRUNZQ0xFIiwiTE9HX1BSSU9SSVRZX0xJRkVDWUNMRV9NSU5PUiIsImluaXRpYWxDb250ZXh0IiwidW5pZm9ybXMiLCJ2aWV3cG9ydHMiLCJ2aWV3cG9ydCIsImxheWVyRmlsdGVyIiwidmlld3BvcnRDaGFuZ2VkIiwicGlja2luZ0ZCTyIsInVzZURldmljZVBpeGVscyIsImxhc3RQaWNrZWRJbmZvIiwiaW5kZXgiLCJsYXllcklkIiwibGF5ZXJOYW1lIiwibGF5ZXIiLCJMYXllck1hbmFnZXIiLCJnbCIsImV2ZW50TWFuYWdlciIsImxhc3RSZW5kZXJlZExheWVycyIsInByZXZMYXllcnMiLCJsYXllcnMiLCJvbGRDb250ZXh0IiwiY29udGV4dCIsIk9iamVjdCIsImFzc2lnbiIsInNoYWRlckNhY2hlIiwiX2NhY2hlUHJvZ3JhbXMiLCJ3aWR0aCIsImhlaWdodCIsInZpZXdEZXNjcmlwdG9ycyIsInZpZXdEZXNjcmlwdG9yc0NoYW5nZWQiLCJfbmVlZHNSZWRyYXciLCJfcGlja2luZ1JhZGl1cyIsIl9ldmVudE1hbmFnZXIiLCJfb25MYXllckNsaWNrIiwiX29uTGF5ZXJIb3ZlciIsIl9vbkNsaWNrIiwiYmluZCIsIl9vblBvaW50ZXJNb3ZlIiwiX29uUG9pbnRlckxlYXZlIiwiX3BpY2tBbmRDYWxsYmFjayIsIl9pbml0U2VlciIsIl9lZGl0U2VlciIsInNlYWwiLCJfaW5pdEV2ZW50SGFuZGxpbmciLCJzZXRWaWV3cG9ydHMiLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsInpvb20iLCJyZW1vdmVMaXN0ZW5lciIsImNsZWFyUmVkcmF3RmxhZ3MiLCJfY2hlY2tJZk5lZWRzUmVkcmF3IiwicmVhc29uIiwibGF5ZXJJZHMiLCJmaWx0ZXIiLCJmaW5kIiwiaWQiLCJpbmRleE9mIiwiX3JlYnVpbGRWaWV3cG9ydHNGcm9tVmlld3MiLCJwYXJhbWV0ZXJzIiwiX3NldEV2ZW50SGFuZGxpbmdQYXJhbWV0ZXJzIiwic2V0TGF5ZXJzIiwic2V0TmVlZHNSZWRyYXciLCJkcmF3UGlja2luZ0NvbG9ycyIsIkJvb2xlYW4iLCJtYXAiLCJfZGlmZlZpZXdzIiwibmV3TGF5ZXJzIiwiX3VwZGF0ZUxheWVycyIsIm9sZExheWVycyIsImVycm9yIiwiZ2VuZXJhdGVkTGF5ZXJzIiwicGFzcyIsInJlZHJhd1JlYXNvbiIsImdldFZpZXdwb3J0cyIsIm9uVmlld3BvcnRBY3RpdmUiLCJfYWN0aXZhdGVWaWV3cG9ydCIsIngiLCJ5IiwibW9kZSIsInJhZGl1cyIsImdldExheWVycyIsIl9nZXRQaWNraW5nQnVmZmVyIiwiZGVwcmVjYXRlZCIsInJlZHJhdyIsImxheWVyTmVlZHNSZWRyYXciLCJnZXROZWVkc1JlZHJhdyIsIm5ld1ZpZXdwb3J0cyIsInZpZXdEZXNjcmlwdG9yIiwiX21ha2VWaWV3cG9ydEZyb21WaWV3RGVzY3JpcHRvciIsIlZpZXdwb3J0VHlwZSIsInR5cGUiLCJ2aWV3U3RhdGUiLCJ2aWV3cG9ydERpbWVuc2lvbnMiLCJfZ2V0Vmlld0RpbWVuc2lvbnMiLCJuZXdWaWV3cyIsIm9sZFZpZXdzIiwibGVuZ3RoIiwic29tZSIsIl8iLCJpIiwiX2RpZmZWaWV3IiwibmV3VmlldyIsIm9sZFZpZXciLCJlcXVhbHMiLCJwYXJzZVBlcmNlbnQiLCJ2YWx1ZSIsIm1heCIsIm9uIiwiY2xpY2siLCJwb2ludGVybW92ZSIsInBvaW50ZXJsZWF2ZSIsInBpY2tpbmdSYWRpdXMiLCJvbkxheWVyQ2xpY2siLCJvbkxheWVySG92ZXIiLCJpc05hTiIsIl92YWxpZGF0ZUV2ZW50SGFuZGxpbmciLCJzZXRDaGFuZ2VGbGFncyIsIl91cGRhdGVMYXllciIsInJlc2l6ZSIsImNhbnZhcyIsIm9sZExheWVyTWFwIiwib2xkTGF5ZXIiLCJ3YXJuIiwiX3VwZGF0ZVN1YmxheWVyc1JlY3Vyc2l2ZWx5IiwiZXJyb3IyIiwiX2ZpbmFsaXplT2xkTGF5ZXJzIiwiZmlyc3RFcnJvciIsIm5ld0xheWVyIiwic3VibGF5ZXJzIiwiX2luaXRpYWxpemVMYXllciIsIl90cmFuc2ZlckxheWVyU3RhdGUiLCJwdXNoIiwiaXNDb21wb3NpdGUiLCJnZXRTdWJMYXllcnMiLCJlcnIiLCJfZmluYWxpemVMYXllciIsInN0YXRlIiwiX2luaXRpYWxpemUiLCJsaWZlY3ljbGUiLCJJTklUSUFMSVpFRCIsImdldE1vZGVscyIsIm1vZGVsIiwidXNlckRhdGEiLCJNQVRDSEVEIiwiQVdBSVRJTkdfR0MiLCJfdHJhbnNmZXJTdGF0ZSIsIm9sZFByb3BzIiwicHJvcHMiLCJwcmludENoYW5nZUZsYWdzIiwiX3VwZGF0ZSIsIkFXQUlUSU5HX0ZJTkFMSVpBVElPTiIsIl9maW5hbGl6ZSIsIkZJTkFMSVpFRCIsInBpY2thYmxlIiwiZXZlbnQiLCJvZmZzZXRDZW50ZXIiLCJjYWxsYmFjayIsImlzRG93biIsIm9wdGlvbnMiLCJwb3MiLCJzZWxlY3RlZEluZm9zIiwiZmlyc3RJbmZvIiwiaW5mbyIsInNyY0V2ZW50IiwiZm9yRWFjaCIsInBheWxvYWQiLCJ2YWx1ZVBhdGgiLCJpdGVtS2V5Iiwic2xpY2UiLCJjb25zdHJ1Y3RvciIsInVwZGF0ZUxheWVycyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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RDtBQUNEOztBQUVENUssdUJBQWlCMkssUUFBUUUsT0FBekIsRUFBa0NGLFFBQVFDLFNBQVIsQ0FBa0JFLEtBQWxCLENBQXdCLENBQXhCLENBQWxDLEVBQThESCxRQUFRNUQsS0FBdEU7QUFDQSxVQUFNdkMsWUFBWSxLQUFLL0MsTUFBTCxDQUFZNkMsR0FBWixDQUFnQjtBQUFBLGVBQVMsSUFBSW5ELE1BQU00SixXQUFWLENBQXNCNUosTUFBTXNJLEtBQTVCLENBQVQ7QUFBQSxPQUFoQixDQUFsQjtBQUNBLFdBQUt1QixZQUFMLENBQWtCLEVBQUN4RyxvQkFBRCxFQUFsQjtBQUNEOzs7Ozs7ZUF2c0JrQnBELFkiLCJmaWxlIjoibGF5ZXItbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0ZyYW1lYnVmZmVyLCBTaGFkZXJDYWNoZX0gZnJvbSAnbHVtYS5nbCc7XG5pbXBvcnQgc2VlciBmcm9tICdzZWVyJztcbmltcG9ydCBMYXllciBmcm9tICcuL2xheWVyJztcbmltcG9ydCB7ZHJhd0xheWVyc30gZnJvbSAnLi9kcmF3LWxheWVycyc7XG5pbXBvcnQge3BpY2tPYmplY3QsIHBpY2tWaXNpYmxlT2JqZWN0c30gZnJvbSAnLi9waWNrLWxheWVycyc7XG5pbXBvcnQge0xJRkVDWUNMRX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IFZpZXdwb3J0IGZyb20gJy4uL3ZpZXdwb3J0cy92aWV3cG9ydCc7XG4vLyBUT0RPIC0gcmVtb3ZlLCBqdXN0IGZvciBkdW1teSBpbml0aWFsaXphdGlvblxuaW1wb3J0IFdlYk1lcmNhdG9yVmlld3BvcnQgZnJvbSAnLi4vdmlld3BvcnRzL3dlYi1tZXJjYXRvci12aWV3cG9ydCc7XG5pbXBvcnQgbG9nIGZyb20gJy4uL3V0aWxzL2xvZyc7XG5pbXBvcnQge2ZsYXR0ZW59IGZyb20gJy4uL3V0aWxzL2ZsYXR0ZW4nO1xuXG5pbXBvcnQge1xuICBzZXRQcm9wT3ZlcnJpZGVzLFxuICBsYXllckVkaXRMaXN0ZW5lcixcbiAgc2VlckluaXRMaXN0ZW5lcixcbiAgaW5pdExheWVySW5TZWVyLFxuICB1cGRhdGVMYXllckluU2VlclxufSBmcm9tICcuL3NlZXItaW50ZWdyYXRpb24nO1xuXG5jb25zdCBMT0dfUFJJT1JJVFlfTElGRUNZQ0xFID0gMjtcbmNvbnN0IExPR19QUklPUklUWV9MSUZFQ1lDTEVfTUlOT1IgPSA0O1xuXG5jb25zdCBpbml0aWFsQ29udGV4dCA9IHtcbiAgdW5pZm9ybXM6IHt9LFxuICB2aWV3cG9ydHM6IFtdLFxuICB2aWV3cG9ydDogbnVsbCxcbiAgbGF5ZXJGaWx0ZXI6IG51bGwsXG4gIHZpZXdwb3J0Q2hhbmdlZDogdHJ1ZSxcbiAgcGlja2luZ0ZCTzogbnVsbCxcbiAgdXNlRGV2aWNlUGl4ZWxzOiB0cnVlLFxuICBsYXN0UGlja2VkSW5mbzoge1xuICAgIGluZGV4OiAtMSxcbiAgICBsYXllcklkOiBudWxsXG4gIH1cbn07XG5cbmNvbnN0IGxheWVyTmFtZSA9IGxheWVyID0+IGxheWVyIGluc3RhbmNlb2YgTGF5ZXIgPyBgJHtsYXllcn1gIDogKCFsYXllciA/ICdudWxsJyA6ICdpbnZhbGlkJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExheWVyTWFuYWdlciB7XG5cbiAgY29uc3RydWN0b3IoZ2wsIHtldmVudE1hbmFnZXJ9ID0ge30pIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAvLyBDdXJyZW50bHkgZGVjay5nbCBleHBlY3RzIHRoZSBEZWNrR0wubGF5ZXJzIGFycmF5IHRvIGJlIGRpZmZlcmVudFxuICAgICAvLyB3aGVuZXZlciBSZWFjdCByZXJlbmRlcnMuIElmIHRoZSBzYW1lIGxheWVycyBhcnJheSBpcyB1c2VkLCB0aGVcbiAgICAgLy8gTGF5ZXJNYW5hZ2VyJ3MgZGlmZmluZyBhbGdvcml0aG0gd2lsbCBnZW5lcmF0ZSBhIGZhdGFsIGVycm9yIGFuZFxuICAgICAvLyBicmVhayB0aGUgcmVuZGVyaW5nLlxuXG4gICAgIC8vIGB0aGlzLmxhc3RSZW5kZXJlZExheWVyc2Agc3RvcmVzIHRoZSBVTkZJTFRFUkVEIGxheWVycyBzZW50XG4gICAgIC8vIGRvd24gdG8gTGF5ZXJNYW5hZ2VyLCBzbyB0aGF0IGBsYXllcnNgIHJlZmVyZW5jZSBjYW4gYmUgY29tcGFyZWQuXG4gICAgIC8vIElmIGl0J3MgdGhlIHNhbWUgYWNyb3NzIHR3byBSZWFjdCByZW5kZXIgY2FsbHMsIHRoZSBkaWZmaW5nIGxvZ2ljXG4gICAgIC8vIHdpbGwgYmUgc2tpcHBlZC5cbiAgICB0aGlzLmxhc3RSZW5kZXJlZExheWVycyA9IFtdO1xuICAgIHRoaXMucHJldkxheWVycyA9IFtdO1xuICAgIHRoaXMubGF5ZXJzID0gW107XG5cbiAgICB0aGlzLm9sZENvbnRleHQgPSB7fTtcbiAgICB0aGlzLmNvbnRleHQgPSBPYmplY3QuYXNzaWduKHt9LCBpbml0aWFsQ29udGV4dCwge1xuICAgICAgZ2wsXG4gICAgICAvLyBFbmFibGluZyBsdW1hLmdsIFByb2dyYW0gY2FjaGluZyB1c2luZyBwcml2YXRlIEFQSSAoX2NhY2hlUHJvZ3JhbXMpXG4gICAgICBzaGFkZXJDYWNoZTogbmV3IFNoYWRlckNhY2hlKHtnbCwgX2NhY2hlUHJvZ3JhbXM6IHRydWV9KVxuICAgIH0pO1xuXG4gICAgLy8gTGlzdCBvZiB2aWV3IGRlc2NyaXB0b3JzLCBnZXRzIHJlLWV2YWx1YXRlZCB3aGVuIHdpZHRoL2hlaWdodCBjaGFuZ2VzXG4gICAgdGhpcy53aWR0aCA9IDEwMDtcbiAgICB0aGlzLmhlaWdodCA9IDEwMDtcbiAgICB0aGlzLnZpZXdEZXNjcmlwdG9ycyA9IFtdO1xuICAgIHRoaXMudmlld0Rlc2NyaXB0b3JzQ2hhbmdlZCA9IHRydWU7XG4gICAgdGhpcy52aWV3cG9ydHMgPSBbXTsgLy8gR2VuZXJhdGVkIHZpZXdwb3J0c1xuICAgIHRoaXMuX25lZWRzUmVkcmF3ID0gJ0luaXRpYWwgcmVuZGVyJztcblxuICAgIC8vIEV2ZW50IGhhbmRsaW5nXG4gICAgdGhpcy5fcGlja2luZ1JhZGl1cyA9IDA7XG5cbiAgICB0aGlzLl9ldmVudE1hbmFnZXIgPSBudWxsO1xuICAgIHRoaXMuX29uTGF5ZXJDbGljayA9IG51bGw7XG4gICAgdGhpcy5fb25MYXllckhvdmVyID0gbnVsbDtcbiAgICB0aGlzLl9vbkNsaWNrID0gdGhpcy5fb25DbGljay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uUG9pbnRlck1vdmUgPSB0aGlzLl9vblBvaW50ZXJNb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Qb2ludGVyTGVhdmUgPSB0aGlzLl9vblBvaW50ZXJMZWF2ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3BpY2tBbmRDYWxsYmFjayA9IHRoaXMuX3BpY2tBbmRDYWxsYmFjay5iaW5kKHRoaXMpO1xuXG4gICAgLy8gU2VlciBpbnRlZ3JhdGlvblxuICAgIHRoaXMuX2luaXRTZWVyID0gdGhpcy5faW5pdFNlZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9lZGl0U2VlciA9IHRoaXMuX2VkaXRTZWVyLmJpbmQodGhpcyk7XG4gICAgc2VlckluaXRMaXN0ZW5lcih0aGlzLl9pbml0U2Vlcik7XG4gICAgbGF5ZXJFZGl0TGlzdGVuZXIodGhpcy5fZWRpdFNlZXIpO1xuXG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG5cbiAgICBpZiAoZXZlbnRNYW5hZ2VyKSB7XG4gICAgICB0aGlzLl9pbml0RXZlbnRIYW5kbGluZyhldmVudE1hbmFnZXIpO1xuICAgIH1cblxuICAgIC8vIEluaXQgd2l0aCBkdW1teSB2aWV3cG9ydFxuICAgIHRoaXMuc2V0Vmlld3BvcnRzKFtcbiAgICAgIG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHt3aWR0aDogMSwgaGVpZ2h0OiAxLCBsYXRpdHVkZTogMCwgbG9uZ2l0dWRlOiAwLCB6b29tOiAxfSlcbiAgICBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdG8gY2FsbCB3aGVuIHRoZSBsYXllciBtYW5hZ2VyIGlzIG5vdCBuZWVkZWQgYW55bW9yZS5cbiAgICpcbiAgICogQ3VycmVudGx5IHVzZWQgaW4gdGhlIDxEZWNrR0w+IGNvbXBvbmVudFdpbGxVbm1vdW50IGxpZmVjeWNsZSB0byB1bmJpbmQgU2VlciBsaXN0ZW5lcnMuXG4gICAqL1xuICBmaW5hbGl6ZSgpIHtcbiAgICBzZWVyLnJlbW92ZUxpc3RlbmVyKHRoaXMuX2luaXRTZWVyKTtcbiAgICBzZWVyLnJlbW92ZUxpc3RlbmVyKHRoaXMuX2VkaXRTZWVyKTtcbiAgfVxuXG4gIG5lZWRzUmVkcmF3KHtjbGVhclJlZHJhd0ZsYWdzID0gdHJ1ZX0gPSB7fSkge1xuICAgIHJldHVybiB0aGlzLl9jaGVja0lmTmVlZHNSZWRyYXcoY2xlYXJSZWRyYXdGbGFncyk7XG4gIH1cblxuICAvLyBOb3JtYWxseSBub3QgY2FsbGVkIGJ5IGFwcFxuICBzZXROZWVkc1JlZHJhdyhyZWFzb24pIHtcbiAgICB0aGlzLl9uZWVkc1JlZHJhdyA9IHRoaXMuX25lZWRzUmVkcmF3IHx8IHJlYXNvbjtcbiAgfVxuXG4gIC8vIEdldHMgYW4gKG9wdGlvbmFsbHkpIGZpbHRlcmVkIGxpc3Qgb2YgbGF5ZXJzXG4gIGdldExheWVycyh7bGF5ZXJJZHMgPSBudWxsfSA9IHt9KSB7XG4gICAgLy8gRmlsdGVyaW5nIGJ5IGxheWVySWQgY29tcGFyZXMgYmVnaW5uaW5nIG9mIHN0cmluZ3MsIHNvIHRoYXQgc3VibGF5ZXJzIHdpbGwgYmUgaW5jbHVkZWRcbiAgICAvLyBEZXBlbmRlcyBvbiB0aGUgY29udmVudGlvbiBvZiBhZGRpbmcgc3VmZml4ZXMgdG8gdGhlIHBhcmVudCdzIGxheWVyIG5hbWVcbiAgICByZXR1cm4gbGF5ZXJJZHMgP1xuICAgICAgdGhpcy5sYXllcnMuZmlsdGVyKGxheWVyID0+IGxheWVySWRzLmZpbmQobGF5ZXJJZCA9PiBsYXllci5pZC5pbmRleE9mKGxheWVySWQpID09PSAwKSkgOlxuICAgICAgdGhpcy5sYXllcnM7XG4gIH1cblxuICAvLyBHZXQgYSBzZXQgb2Ygdmlld3BvcnRzIGZvciBhIGdpdmVuIHdpZHRoIGFuZCBoZWlnaHRcbiAgLy8gVE9ETyAtIEludGVudGlvbiBpcyBmb3IgZGVjay5nbCB0byBhdXRvZGVkdWNlIHdpZHRoIGFuZCBoZWlnaHQgYW5kIGRyb3AgdGhlIG5lZWQgZm9yIHByb3BzXG4gIGdldFZpZXdwb3J0cyh7d2lkdGgsIGhlaWdodH0gPSB7fSkge1xuICAgIGlmICh3aWR0aCAhPT0gdGhpcy53aWR0aCB8fCBoZWlnaHQgIT09IHRoaXMuaGVpZ2h0IHx8IHRoaXMudmlld0Rlc2NyaXB0b3JzQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fcmVidWlsZFZpZXdwb3J0c0Zyb21WaWV3cyh7dmlld0Rlc2NyaXB0b3JzOiB0aGlzLnZpZXdEZXNjcmlwdG9ycywgd2lkdGgsIGhlaWdodH0pO1xuICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZpZXdwb3J0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGFyYW1ldGVycyBuZWVkZWQgZm9yIGxheWVyIHJlbmRlcmluZyBhbmQgcGlja2luZy5cbiAgICogUGFyYW1ldGVycyBhcmUgdG8gYmUgcGFzc2VkIGFzIGEgc2luZ2xlIG9iamVjdCwgd2l0aCB0aGUgZm9sbG93aW5nIHZhbHVlczpcbiAgICogQHBhcmFtIHtCb29sZWFufSB1c2VEZXZpY2VQaXhlbHNcbiAgICovXG4gIHNldFBhcmFtZXRlcnMocGFyYW1ldGVycykge1xuICAgIGlmICgnZXZlbnRNYW5hZ2VyJyBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICB0aGlzLl9pbml0RXZlbnRIYW5kbGluZyhwYXJhbWV0ZXJzLmV2ZW50TWFuYWdlcik7XG4gICAgfVxuXG4gICAgaWYgKCdwaWNraW5nUmFkaXVzJyBpbiBwYXJhbWV0ZXJzIHx8XG4gICAgICAnb25MYXllckNsaWNrJyBpbiBwYXJhbWV0ZXJzIHx8XG4gICAgICAnb25MYXllckhvdmVyJyBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICB0aGlzLl9zZXRFdmVudEhhbmRsaW5nUGFyYW1ldGVycyhwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPIC0gRm9yIG5vdyB3ZSBzZXQgbGF5ZXJzIGJlZm9yZSB2aWV3cG9ydHMgdG8gcHJlc2VydmVuY2hhbmdlRmxhZ3NcbiAgICBpZiAoJ2xheWVycycgaW4gcGFyYW1ldGVycykge1xuICAgICAgdGhpcy5zZXRMYXllcnMocGFyYW1ldGVycy5sYXllcnMpO1xuICAgIH1cblxuICAgIGlmICgndmlld3BvcnRzJyBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICB0aGlzLnNldFZpZXdwb3J0cyhwYXJhbWV0ZXJzLnZpZXdwb3J0cyk7XG4gICAgfVxuXG4gICAgaWYgKCdsYXllckZpbHRlcicgaW4gcGFyYW1ldGVycykge1xuICAgICAgdGhpcy5jb250ZXh0LmxheWVyRmlsdGVyID0gcGFyYW1ldGVycy5sYXllckZpbHRlcjtcbiAgICAgIGlmICh0aGlzLmNvbnRleHQubGF5ZXJGaWx0ZXIgIT09IHBhcmFtZXRlcnMubGF5ZXJGaWx0ZXIpIHtcbiAgICAgICAgdGhpcy5zZXROZWVkc1JlZHJhdygnbGF5ZXJGaWx0ZXIgY2hhbmdlZCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICgnZHJhd1BpY2tpbmdDb2xvcnMnIGluIHBhcmFtZXRlcnMpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRleHQuZHJhd1BpY2tpbmdDb2xvcnMgIT09IHBhcmFtZXRlcnMuZHJhd1BpY2tpbmdDb2xvcnMpIHtcbiAgICAgICAgdGhpcy5zZXROZWVkc1JlZHJhdygnZHJhd1BpY2tpbmdDb2xvcnMgY2hhbmdlZCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24odGhpcy5jb250ZXh0LCBwYXJhbWV0ZXJzKTtcbiAgfVxuXG4gIC8vIFVwZGF0ZSB0aGUgdmlldyBkZXNjcmlwdG9yIGxpc3QgYW5kIHNldCBjaGFuZ2UgZmxhZyBpZiBuZWVkZWRcbiAgc2V0Vmlld3BvcnRzKHZpZXdwb3J0cykge1xuICAgIC8vIEVuc3VyZSB2aWV3cG9ydHMgYXJlIHdyYXBwZWQgaW4gZGVzY3JpcHRvcnNcbiAgICBjb25zdCB2aWV3RGVzY3JpcHRvcnMgPSBmbGF0dGVuKHZpZXdwb3J0cywge2ZpbHRlcjogQm9vbGVhbn0pXG4gICAgICAubWFwKHZpZXdwb3J0ID0+IHZpZXdwb3J0IGluc3RhbmNlb2YgVmlld3BvcnQgPyB7dmlld3BvcnR9IDogdmlld3BvcnQpO1xuXG4gICAgdGhpcy52aWV3RGVzY3JpcHRvcnNDaGFuZ2VkID1cbiAgICAgIHRoaXMudmlld0Rlc2NyaXB0b3JzQ2hhbmdlZCB8fFxuICAgICAgdGhpcy5fZGlmZlZpZXdzKHZpZXdEZXNjcmlwdG9ycywgdGhpcy52aWV3RGVzY3JpcHRvcnMpO1xuXG4gICAgLy8gVHJ5IHRvIG5vdCBhY3R1YWxseSByZWJ1aWxkIHRoZSB2aWV3cG9ydHMgdW50aWwgYGdldFZpZXdwb3J0c2AgaXMgY2FsbGVkXG4gICAgaWYgKHRoaXMudmlld0Rlc2NyaXB0b3JzQ2hhbmdlZCkge1xuICAgICAgdGhpcy52aWV3RGVzY3JpcHRvcnMgPSB2aWV3RGVzY3JpcHRvcnM7XG4gICAgICB0aGlzLl9yZWJ1aWxkVmlld3BvcnRzRnJvbVZpZXdzKHt2aWV3RGVzY3JpcHRvcnM6IHRoaXMudmlld0Rlc2NyaXB0b3JzfSk7XG4gICAgICB0aGlzLnZpZXdEZXNjcmlwdG9yc0NoYW5nZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvLyBTdXBwbHkgYSBuZXcgbGF5ZXIgbGlzdCwgaW5pdGlhdGluZyBzdWJsYXllciBnZW5lcmF0aW9uIGFuZCBsYXllciBtYXRjaGluZ1xuICBzZXRMYXllcnMobmV3TGF5ZXJzKSB7XG4gICAgYXNzZXJ0KHRoaXMuY29udGV4dC52aWV3cG9ydCwgJ0xheWVyTWFuYWdlci51cGRhdGVMYXllcnM6IHZpZXdwb3J0IG5vdCBzZXQnKTtcblxuICAgIC8vIFRPRE8gLSBzb21ldGhpbmcgaXMgZ2VuZXJhdGluZyBzdGF0ZSB1cGRhdGVzIHRoYXQgY2F1c2UgcmVyZW5kZXIgb2YgdGhlIHNhbWVcbiAgICBpZiAobmV3TGF5ZXJzID09PSB0aGlzLmxhc3RSZW5kZXJlZExheWVycykge1xuICAgICAgbG9nLmxvZygzLCAnSWdub3JpbmcgbGF5ZXIgdXBkYXRlIGR1ZSB0byBsYXllciBhcnJheSBub3QgY2hhbmdlZCcpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRoaXMubGFzdFJlbmRlcmVkTGF5ZXJzID0gbmV3TGF5ZXJzO1xuXG4gICAgbmV3TGF5ZXJzID0gZmxhdHRlbihuZXdMYXllcnMsIHtmaWx0ZXI6IEJvb2xlYW59KTtcblxuICAgIGZvciAoY29uc3QgbGF5ZXIgb2YgbmV3TGF5ZXJzKSB7XG4gICAgICBsYXllci5jb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuICAgIH1cblxuICAgIHRoaXMucHJldkxheWVycyA9IHRoaXMubGF5ZXJzO1xuICAgIGNvbnN0IHtlcnJvciwgZ2VuZXJhdGVkTGF5ZXJzfSA9IHRoaXMuX3VwZGF0ZUxheWVycyh7XG4gICAgICBvbGRMYXllcnM6IHRoaXMucHJldkxheWVycyxcbiAgICAgIG5ld0xheWVyc1xuICAgIH0pO1xuXG4gICAgdGhpcy5sYXllcnMgPSBnZW5lcmF0ZWRMYXllcnM7XG4gICAgLy8gVGhyb3cgZmlyc3QgZXJyb3IgZm91bmQsIGlmIGFueVxuICAgIGlmIChlcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZHJhd0xheWVycyh7cGFzcyA9ICdyZW5kZXIgdG8gc2NyZWVuJywgcmVkcmF3UmVhc29uID0gJ3Vua25vd24gcmVhc29uJ30gPSB7fSkge1xuICAgIGNvbnN0IHtnbCwgdXNlRGV2aWNlUGl4ZWxzLCBkcmF3UGlja2luZ0NvbG9yc30gPSB0aGlzLmNvbnRleHQ7XG5cbiAgICAvLyByZW5kZXIgdGhpcyB2aWV3cG9ydFxuICAgIGRyYXdMYXllcnMoZ2wsIHtcbiAgICAgIGxheWVyczogdGhpcy5sYXllcnMsXG4gICAgICB2aWV3cG9ydHM6IHRoaXMuZ2V0Vmlld3BvcnRzKCksXG4gICAgICBvblZpZXdwb3J0QWN0aXZlOiB0aGlzLl9hY3RpdmF0ZVZpZXdwb3J0LmJpbmQodGhpcyksXG4gICAgICB1c2VEZXZpY2VQaXhlbHMsXG4gICAgICBkcmF3UGlja2luZ0NvbG9ycyxcbiAgICAgIHBhc3MsXG4gICAgICBsYXllckZpbHRlcjogdGhpcy5jb250ZXh0LmxheWVyRmlsdGVyLFxuICAgICAgcmVkcmF3UmVhc29uXG4gICAgfSk7XG4gIH1cblxuICAvLyBQaWNrIHRoZSBjbG9zZXN0IGluZm8gYXQgZ2l2ZW4gY29vcmRpbmF0ZVxuICBwaWNrT2JqZWN0KHt4LCB5LCBtb2RlLCByYWRpdXMgPSAwLCBsYXllcklkcywgbGF5ZXJGaWx0ZXJ9KSB7XG4gICAgY29uc3Qge2dsLCB1c2VEZXZpY2VQaXhlbHN9ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgY29uc3QgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoe2xheWVySWRzfSk7XG5cbiAgICByZXR1cm4gcGlja09iamVjdChnbCwge1xuICAgICAgLy8gVXNlciBwYXJhbXNcbiAgICAgIHgsXG4gICAgICB5LFxuICAgICAgcmFkaXVzLFxuICAgICAgbGF5ZXJzLFxuICAgICAgbW9kZSxcbiAgICAgIGxheWVyRmlsdGVyLFxuICAgICAgLy8gSW5qZWN0ZWQgcGFyYW1zXG4gICAgICB2aWV3cG9ydHM6IHRoaXMuZ2V0Vmlld3BvcnRzKCksXG4gICAgICBvblZpZXdwb3J0QWN0aXZlOiB0aGlzLl9hY3RpdmF0ZVZpZXdwb3J0LmJpbmQodGhpcyksXG4gICAgICBwaWNraW5nRkJPOiB0aGlzLl9nZXRQaWNraW5nQnVmZmVyKCksXG4gICAgICBsYXN0UGlja2VkSW5mbzogdGhpcy5jb250ZXh0Lmxhc3RQaWNrZWRJbmZvLFxuICAgICAgdXNlRGV2aWNlUGl4ZWxzXG4gICAgfSk7XG4gIH1cblxuICAvLyBHZXQgYWxsIHVuaXF1ZSBpbmZvcyB3aXRoaW4gYSBib3VuZGluZyBib3hcbiAgcGlja09iamVjdHMoe3gsIHksIHdpZHRoLCBoZWlnaHQsIGxheWVySWRzLCBsYXllckZpbHRlcn0pIHtcbiAgICBjb25zdCB7Z2wsIHVzZURldmljZVBpeGVsc30gPSB0aGlzLmNvbnRleHQ7XG5cbiAgICBjb25zdCBsYXllcnMgPSB0aGlzLmdldExheWVycyh7bGF5ZXJJZHN9KTtcblxuICAgIHJldHVybiBwaWNrVmlzaWJsZU9iamVjdHMoZ2wsIHtcbiAgICAgIHgsXG4gICAgICB5LFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBsYXllcnMsXG4gICAgICBsYXllckZpbHRlcixcbiAgICAgIG1vZGU6ICdwaWNrT2JqZWN0cycsXG4gICAgICAvLyBUT0RPIC0gaG93IGRvZXMgdGhpcyBpbnRlcmFjdCB3aXRoIG11bHRpcGxlIHZpZXdwb3J0cz9cbiAgICAgIHZpZXdwb3J0OiB0aGlzLmNvbnRleHQudmlld3BvcnQsXG4gICAgICB2aWV3cG9ydHM6IHRoaXMuZ2V0Vmlld3BvcnRzKCksXG4gICAgICBvblZpZXdwb3J0QWN0aXZlOiB0aGlzLl9hY3RpdmF0ZVZpZXdwb3J0LmJpbmQodGhpcyksXG4gICAgICBwaWNraW5nRkJPOiB0aGlzLl9nZXRQaWNraW5nQnVmZmVyKCksXG4gICAgICB1c2VEZXZpY2VQaXhlbHNcbiAgICB9KTtcbiAgfVxuXG4gIC8vXG4gIC8vIERFUFJFQ0FURUQgTUVUSE9EU1xuICAvL1xuXG4gIHVwZGF0ZUxheWVycyh7bmV3TGF5ZXJzfSkge1xuICAgIGxvZy5kZXByZWNhdGVkKCd1cGRhdGVMYXllcnMnLCAnc2V0TGF5ZXJzJyk7XG4gICAgdGhpcy5zZXRMYXllcnMobmV3TGF5ZXJzKTtcbiAgfVxuXG4gIHNldFZpZXdwb3J0KHZpZXdwb3J0KSB7XG4gICAgbG9nLmRlcHJlY2F0ZWQoJ3NldFZpZXdwb3J0JywgJ3NldFZpZXdwb3J0cycpO1xuICAgIHRoaXMuc2V0Vmlld3BvcnRzKFt2aWV3cG9ydF0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy9cbiAgLy8gUFJJVkFURSBNRVRIT0RTXG4gIC8vXG5cbiAgX2NoZWNrSWZOZWVkc1JlZHJhdyhjbGVhclJlZHJhd0ZsYWdzKSB7XG4gICAgbGV0IHJlZHJhdyA9IHRoaXMuX25lZWRzUmVkcmF3O1xuICAgIGlmIChjbGVhclJlZHJhd0ZsYWdzKSB7XG4gICAgICB0aGlzLl9uZWVkc1JlZHJhdyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbGF5ZXJzIGxpc3QgZG9lc24ndCBpbmNsdWRlIHN1YmxheWVycywgcmVseWluZyBvbiBjb21wb3NpdGUgbGF5ZXJzXG4gICAgZm9yIChjb25zdCBsYXllciBvZiB0aGlzLmxheWVycykge1xuICAgICAgLy8gQ2FsbCBldmVyeSBsYXllciB0byBjbGVhciB0aGVpciBmbGFnc1xuICAgICAgY29uc3QgbGF5ZXJOZWVkc1JlZHJhdyA9IGxheWVyLmdldE5lZWRzUmVkcmF3KHtjbGVhclJlZHJhd0ZsYWdzfSk7XG4gICAgICByZWRyYXcgPSByZWRyYXcgfHwgbGF5ZXJOZWVkc1JlZHJhdztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVkcmF3O1xuICB9XG5cbiAgLy8gUmVidWlsZHMgdmlld3BvcnRzIGZyb20gZGVzY3JpcHRvcnMgdG93YXJkcyBhIGNlcnRhaW4gd2luZG93IHNpemVcbiAgX3JlYnVpbGRWaWV3cG9ydHNGcm9tVmlld3Moe3ZpZXdEZXNjcmlwdG9ycywgd2lkdGgsIGhlaWdodH0pIHtcbiAgICBjb25zdCBuZXdWaWV3cG9ydHMgPSB2aWV3RGVzY3JpcHRvcnMubWFwKHZpZXdEZXNjcmlwdG9yID0+XG4gICAgICAvLyBJZiBhIGBWaWV3cG9ydGAgaW5zdGFuY2Ugd2FzIHN1cHBsaWVkLCB1c2UgaXQsIG90aGVyd2lzZSBidWlsZCBpdFxuICAgICAgdmlld0Rlc2NyaXB0b3Iudmlld3BvcnQgaW5zdGFuY2VvZiBWaWV3cG9ydCA/XG4gICAgICAgIHZpZXdEZXNjcmlwdG9yLnZpZXdwb3J0IDpcbiAgICAgICAgdGhpcy5fbWFrZVZpZXdwb3J0RnJvbVZpZXdEZXNjcmlwdG9yKHt2aWV3RGVzY3JpcHRvciwgd2lkdGgsIGhlaWdodH0pXG4gICAgKTtcblxuICAgIHRoaXMuc2V0TmVlZHNSZWRyYXcoJ1ZpZXdwb3J0KHMpIGNoYW5nZWQnKTtcblxuICAgIC8vIEVuc3VyZSBvbmUgdmlld3BvcnQgaXMgYWN0aXZhdGVkLCBsYXllcnMgbWF5IGV4cGVjdCBpdFxuICAgIC8vIFRPRE8gLSBoYW5kbGUgZW1wdHkgdmlld3BvcnQgbGlzdCAodXNpbmcgZHVtbXkgdmlld3BvcnQpLCBvciBhc3NlcnRcbiAgICAvLyBjb25zdCBvbGRWaWV3cG9ydHMgPSB0aGlzLmNvbnRleHQudmlld3BvcnRzO1xuICAgIC8vIGlmICh2aWV3cG9ydHNDaGFuZ2VkKSB7XG5cbiAgICBjb25zdCB2aWV3cG9ydCA9IG5ld1ZpZXdwb3J0c1swXTtcbiAgICBhc3NlcnQodmlld3BvcnQgaW5zdGFuY2VvZiBWaWV3cG9ydCwgJ0ludmFsaWQgdmlld3BvcnQnKTtcblxuICAgIHRoaXMuY29udGV4dC52aWV3cG9ydHMgPSBuZXdWaWV3cG9ydHM7XG4gICAgdGhpcy5fYWN0aXZhdGVWaWV3cG9ydCh2aWV3cG9ydCk7XG4gICAgLy8gfVxuXG4gICAgLy8gV2UndmUganVzdCByZWJ1aWx0IHRoZSB2aWV3cG9ydHMgdG8gbWF0Y2ggdGhlIGRlc2NyaXB0b3JzLCBzbyBjbGVhciB0aGUgZmxhZ1xuICAgIHRoaXMudmlld3BvcnRzID0gbmV3Vmlld3BvcnRzO1xuICAgIHRoaXMudmlld0Rlc2NyaXB0b3JzQ2hhbmdlZCA9IGZhbHNlO1xuICB9XG5cbiAgLy8gQnVpbGQgYSBgVmlld3BvcnRgIGZyb20gYSB2aWV3IGRlc2NyaXB0b3JcbiAgLy8gVE9ETyAtIGFkZCBzdXBwb3J0IGZvciBhdXRvc2l6aW5nIHZpZXdwb3J0cyB1c2luZyB3aWR0aCBhbmQgaGVpZ2h0XG4gIF9tYWtlVmlld3BvcnRGcm9tVmlld0Rlc2NyaXB0b3Ioe3ZpZXdEZXNjcmlwdG9yLCB3aWR0aCwgaGVpZ2h0fSkge1xuICAgIC8vIEdldCB0aGUgdHlwZSBvZiB0aGUgdmlld3BvcnRcbiAgICAvLyBUT0RPIC0gZGVmYXVsdCB0byBXZWJNZXJjYXRvcj9cbiAgICBjb25zdCB7dHlwZTogVmlld3BvcnRUeXBlLCB2aWV3U3RhdGV9ID0gdmlld0Rlc2NyaXB0b3I7XG5cbiAgICAvLyBSZXNvbHZlIHJlbGF0aXZlIHZpZXdwb3J0IGRpbWVuc2lvbnNcbiAgICAvLyBUT0RPIC0gd2UgbmVlZCB0byBoYXZlIHdpZHRoIGFuZCBoZWlnaHQgYXZhaWxhYmxlXG4gICAgY29uc3Qgdmlld3BvcnREaW1lbnNpb25zID0gdGhpcy5fZ2V0Vmlld0RpbWVuc2lvbnMoe3ZpZXdEZXNjcmlwdG9yfSk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHZpZXdwb3J0LCBnaXZpbmcgcHJlZmVyZW5jZSB0byB2aWV3IHN0YXRlIGluIGB2aWV3U3RhdGVgXG4gICAgcmV0dXJuIG5ldyBWaWV3cG9ydFR5cGUoT2JqZWN0LmFzc2lnbih7fSxcbiAgICAgIHZpZXdEZXNjcmlwdG9yLFxuICAgICAgdmlld3BvcnREaW1lbnNpb25zLFxuICAgICAgdmlld1N0YXRlIC8vIE9iamVjdC5hc3NpZ24gaGFuZGxlcyB1bmRlZmluZWRcbiAgICApKTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHZpZXdwb3J0IGFycmF5IGhhcyBjaGFuZ2VkLCByZXR1cm5zIHRydWUgaWYgYW55IGNoYW5nZVxuICAvLyBOb3RlIHRoYXQgZGVzY3JpcHRvcnMgY2FuIGJlIHRoZSBzYW1lXG4gIF9kaWZmVmlld3MobmV3Vmlld3MsIG9sZFZpZXdzKSB7XG4gICAgaWYgKG5ld1ZpZXdzLmxlbmd0aCAhPT0gb2xkVmlld3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3Vmlld3Muc29tZShcbiAgICAgIChfLCBpKSA9PiB0aGlzLl9kaWZmVmlldyhuZXdWaWV3c1tpXSwgb2xkVmlld3NbaV0pXG4gICAgKTtcbiAgfVxuXG4gIF9kaWZmVmlldyhuZXdWaWV3LCBvbGRWaWV3KSB7XG4gICAgLy8gYFZpZXdgIGhpZWFyY2h5IHN1cHBvcnRzIGFuIGBlcXVhbHNgIG1ldGhvZFxuICAgIGlmIChuZXdWaWV3LnZpZXdwb3J0KSB7XG4gICAgICByZXR1cm4gIW9sZFZpZXcudmlld3BvcnQgfHwgIW5ld1ZpZXcudmlld3BvcnQuZXF1YWxzKG9sZFZpZXcudmlld3BvcnQpO1xuICAgIH1cbiAgICAvLyBUT0RPIC0gaW1wbGVtZW50IGRlZXAgZXF1YWwgb24gdmlldyBkZXNjcmlwdG9yc1xuICAgIHJldHVybiBuZXdWaWV3ICE9PSBvbGRWaWV3O1xuICB9XG5cbiAgLy8gU3VwcG9ydCBmb3IgcmVsYXRpdmUgdmlld3BvcnQgZGltZW5zaW9ucyAoZS5nIHt5OiAnNTAlJywgaGVpZ2h0OiAnNTAlJ30pXG4gIF9nZXRWaWV3RGltZW5zaW9ucyh7dmlld0Rlc2NyaXB0b3IsIHdpZHRoLCBoZWlnaHR9KSB7XG4gICAgY29uc3QgcGFyc2VQZXJjZW50ID0gKHZhbHVlLCBtYXgpID0+IHZhbHVlO1xuICAgIC8vIFRPRE8gLSBlbmFibGUgdG8gc3VwcG9ydCBwZXJjZW50IHNpemUgc3BlY2lmaWVyc1xuICAgIC8vIGNvbnN0IHBhcnNlUGVyY2VudCA9ICh2YWx1ZSwgbWF4KSA9PiB2YWx1ZSA/XG4gICAgLy8gICBNYXRoLnJvdW5kKHBhcnNlRmxvYXQodmFsdWUpIC8gMTAwICogbWF4KSA6XG4gICAgLy8gICAodmFsdWUgPT09IG51bGwgPyBtYXggOiB2YWx1ZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogcGFyc2VQZXJjZW50KHZpZXdEZXNjcmlwdG9yLngsIHdpZHRoKSxcbiAgICAgIHk6IHBhcnNlUGVyY2VudCh2aWV3RGVzY3JpcHRvci55LCBoZWlnaHQpLFxuICAgICAgd2lkdGg6IHBhcnNlUGVyY2VudCh2aWV3RGVzY3JpcHRvci53aWR0aCwgd2lkdGgpLFxuICAgICAgaGVpZ2h0OiBwYXJzZVBlcmNlbnQodmlld0Rlc2NyaXB0b3IuaGVpZ2h0LCBoZWlnaHQpXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRNYW5hZ2VyICAgQSBzb3VyY2Ugb2YgRE9NIGlucHV0IGV2ZW50c1xuICAgKi9cbiAgX2luaXRFdmVudEhhbmRsaW5nKGV2ZW50TWFuYWdlcikge1xuICAgIHRoaXMuX2V2ZW50TWFuYWdlciA9IGV2ZW50TWFuYWdlcjtcblxuICAgIC8vIFRPRE86IGFkZC9yZW1vdmUgaGFuZGxlcnMgb24gZGVtYW5kIGF0IHJ1bnRpbWUsIG5vdCBhbGwgYXQgb25jZSBvbiBpbml0LlxuICAgIC8vIENvbnNpZGVyIGJvdGggdG9wLWxldmVsIGhhbmRsZXJzIGxpa2Ugb25MYXllckNsaWNrL0hvdmVyXG4gICAgLy8gYW5kIHBlci1sYXllciBoYW5kbGVycyBhdHRhY2hlZCB0byBpbmRpdmlkdWFsIGxheWVycy5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdWJlci9kZWNrLmdsL2lzc3Vlcy82MzRcbiAgICB0aGlzLl9ldmVudE1hbmFnZXIub24oe1xuICAgICAgY2xpY2s6IHRoaXMuX29uQ2xpY2ssXG4gICAgICBwb2ludGVybW92ZTogdGhpcy5fb25Qb2ludGVyTW92ZSxcbiAgICAgIHBvaW50ZXJsZWF2ZTogdGhpcy5fb25Qb2ludGVyTGVhdmVcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNldCBwYXJhbWV0ZXJzIGZvciBpbnB1dCBldmVudCBoYW5kbGluZy5cbiAgX3NldEV2ZW50SGFuZGxpbmdQYXJhbWV0ZXJzKHtcbiAgICBwaWNraW5nUmFkaXVzLFxuICAgIG9uTGF5ZXJDbGljayxcbiAgICBvbkxheWVySG92ZXJcbiAgfSkge1xuICAgIGlmICghaXNOYU4ocGlja2luZ1JhZGl1cykpIHtcbiAgICAgIHRoaXMuX3BpY2tpbmdSYWRpdXMgPSBwaWNraW5nUmFkaXVzO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9uTGF5ZXJDbGljayAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuX29uTGF5ZXJDbGljayA9IG9uTGF5ZXJDbGljaztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvbkxheWVySG92ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLl9vbkxheWVySG92ZXIgPSBvbkxheWVySG92ZXI7XG4gICAgfVxuICAgIHRoaXMuX3ZhbGlkYXRlRXZlbnRIYW5kbGluZygpO1xuICB9XG5cbiAgLy8gTWFrZSBhIHZpZXdwb3J0IFwiY3VycmVudFwiIGluIGxheWVyIGNvbnRleHQsIHByaW1lZCBmb3IgZHJhd1xuICBfYWN0aXZhdGVWaWV3cG9ydCh2aWV3cG9ydCkge1xuICAgIC8vIFRPRE8gLSB2aWV3cG9ydCBjaGFuZ2UgZGV0ZWN0aW9uIGJyZWFrcyBNRVRFUl9PRkZTRVRTIG1vZGVcbiAgICAvLyBjb25zdCBvbGRWaWV3cG9ydCA9IHRoaXMuY29udGV4dC52aWV3cG9ydDtcbiAgICAvLyBjb25zdCB2aWV3cG9ydENoYW5nZWQgPSAhb2xkVmlld3BvcnQgfHwgIXZpZXdwb3J0LmVxdWFscyhvbGRWaWV3cG9ydCk7XG4gICAgY29uc3Qgdmlld3BvcnRDaGFuZ2VkID0gdHJ1ZTtcblxuICAgIGlmICh2aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5vbGRDb250ZXh0LCB0aGlzLmNvbnRleHQpO1xuICAgICAgdGhpcy5jb250ZXh0LnZpZXdwb3J0ID0gdmlld3BvcnQ7XG4gICAgICB0aGlzLmNvbnRleHQudmlld3BvcnRDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMuY29udGV4dC51bmlmb3JtcyA9IHt9O1xuICAgICAgbG9nKDQsIHZpZXdwb3J0KTtcblxuICAgICAgLy8gVXBkYXRlIGxheWVycyBzdGF0ZXNcbiAgICAgIC8vIExldCBzY3JlZW4gc3BhY2UgbGF5ZXJzIHVwZGF0ZSB0aGVpciBzdGF0ZSBiYXNlZCBvbiB2aWV3cG9ydFxuICAgICAgLy8gVE9ETyAtIHJlaW1wbGVtZW50IHZpZXdwb3J0IGNoYW5nZSBkZXRlY3Rpb24gKHNpbmdsZSB2aWV3cG9ydCBvcHRpbWl6YXRpb24pXG4gICAgICAvLyBUT0RPIC0gZG9uJ3Qgc2V0IHZpZXdwb3J0Q2hhbmdlZCBkdXJpbmcgc2V0Vmlld3BvcnRzP1xuICAgICAgaWYgKHRoaXMuY29udGV4dC52aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgICAgZm9yIChjb25zdCBsYXllciBvZiB0aGlzLmxheWVycykge1xuICAgICAgICAgIGxheWVyLnNldENoYW5nZUZsYWdzKHt2aWV3cG9ydENoYW5nZWQ6ICdWaWV3cG9ydCBjaGFuZ2VkJ30pO1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZUxheWVyKGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGFzc2VydCh0aGlzLmNvbnRleHQudmlld3BvcnQsICdMYXllck1hbmFnZXI6IHZpZXdwb3J0IG5vdCBzZXQnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2dldFBpY2tpbmdCdWZmZXIoKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICAvLyBDcmVhdGUgYSBmcmFtZSBidWZmZXIgaWYgbm90IGFscmVhZHkgYXZhaWxhYmxlXG4gICAgdGhpcy5jb250ZXh0LnBpY2tpbmdGQk8gPSB0aGlzLmNvbnRleHQucGlja2luZ0ZCTyB8fCBuZXcgRnJhbWVidWZmZXIoZ2wpO1xuICAgIC8vIFJlc2l6ZSBpdCB0byBjdXJyZW50IGNhbnZhcyBzaXplICh0aGlzIGlzIGEgbm9vcCBpZiBzaXplIGhhc24ndCBjaGFuZ2VkKVxuICAgIHRoaXMuY29udGV4dC5waWNraW5nRkJPLnJlc2l6ZSh7d2lkdGg6IGdsLmNhbnZhcy53aWR0aCwgaGVpZ2h0OiBnbC5jYW52YXMuaGVpZ2h0fSk7XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dC5waWNraW5nRkJPO1xuICB9XG5cbiAgLy8gTWF0Y2ggYWxsIGxheWVycywgY2hlY2tpbmcgZm9yIGNhdWdodCBlcnJvcnNcbiAgLy8gVG8gYXZvaWQgaGF2aW5nIGFuIGV4Y2VwdGlvbiBpbiBvbmUgbGF5ZXIgZGlzcnVwdCBvdGhlciBsYXllcnNcbiAgLy8gVE9ETyAtIG1hcmsgbGF5ZXJzIHdpdGggZXhjZXB0aW9ucyBhcyBiYWQgYW5kIHJlbW92ZSBmcm9tIHJlbmRlcmluZyBjeWNsZT9cbiAgX3VwZGF0ZUxheWVycyh7b2xkTGF5ZXJzLCBuZXdMYXllcnN9KSB7XG4gICAgLy8gQ3JlYXRlIG9sZCBsYXllciBtYXBcbiAgICBjb25zdCBvbGRMYXllck1hcCA9IHt9O1xuICAgIGZvciAoY29uc3Qgb2xkTGF5ZXIgb2Ygb2xkTGF5ZXJzKSB7XG4gICAgICBpZiAob2xkTGF5ZXJNYXBbb2xkTGF5ZXIuaWRdKSB7XG4gICAgICAgIGxvZy53YXJuKGBNdWx0aXBsZSBvbGQgbGF5ZXJzIHdpdGggc2FtZSBpZCAke2xheWVyTmFtZShvbGRMYXllcil9YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvbGRMYXllck1hcFtvbGRMYXllci5pZF0gPSBvbGRMYXllcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBbGxvY2F0ZSBhcnJheSBmb3IgZ2VuZXJhdGVkIGxheWVyc1xuICAgIGNvbnN0IGdlbmVyYXRlZExheWVycyA9IFtdO1xuXG4gICAgLy8gTWF0Y2ggc3VibGF5ZXJzXG4gICAgY29uc3QgZXJyb3IgPSB0aGlzLl91cGRhdGVTdWJsYXllcnNSZWN1cnNpdmVseSh7XG4gICAgICBuZXdMYXllcnMsIG9sZExheWVyTWFwLCBnZW5lcmF0ZWRMYXllcnNcbiAgICB9KTtcblxuICAgIC8vIEZpbmFsaXplIHVubWF0Y2hlZCBsYXllcnNcbiAgICBjb25zdCBlcnJvcjIgPSB0aGlzLl9maW5hbGl6ZU9sZExheWVycyhvbGRMYXllck1hcCk7XG5cbiAgICBjb25zdCBmaXJzdEVycm9yID0gZXJyb3IgfHwgZXJyb3IyO1xuICAgIHJldHVybiB7ZXJyb3I6IGZpcnN0RXJyb3IsIGdlbmVyYXRlZExheWVyc307XG4gIH1cblxuICAvLyBOb3RlOiBhZGRzIGdlbmVyYXRlZCBsYXllcnMgdG8gYGdlbmVyYXRlZExheWVyc2AgYXJyYXkgcGFyYW1ldGVyXG4gIF91cGRhdGVTdWJsYXllcnNSZWN1cnNpdmVseSh7bmV3TGF5ZXJzLCBvbGRMYXllck1hcCwgZ2VuZXJhdGVkTGF5ZXJzfSkge1xuICAgIGxldCBlcnJvciA9IG51bGw7XG5cbiAgICBmb3IgKGNvbnN0IG5ld0xheWVyIG9mIG5ld0xheWVycykge1xuICAgICAgbmV3TGF5ZXIuY29udGV4dCA9IHRoaXMuY29udGV4dDtcblxuICAgICAgLy8gR2l2ZW4gYSBuZXcgY29taW5nIGxheWVyLCBmaW5kIGl0cyBtYXRjaGluZyBvbGQgbGF5ZXIgKGlmIGFueSlcbiAgICAgIGNvbnN0IG9sZExheWVyID0gb2xkTGF5ZXJNYXBbbmV3TGF5ZXIuaWRdO1xuICAgICAgaWYgKG9sZExheWVyID09PSBudWxsKSB7IC8vIG51bGwsIHJhdGhlciB0aGFuIHVuZGVmaW5lZCwgbWVhbnMgdGhpcyBpZCB3YXMgb3JpZ2luYWxseSB0aGVyZVxuICAgICAgICBsb2cud2FybihgTXVsdGlwbGUgbmV3IGxheWVycyB3aXRoIHNhbWUgaWQgJHtsYXllck5hbWUobmV3TGF5ZXIpfWApO1xuICAgICAgfVxuICAgICAgLy8gUmVtb3ZlIHRoZSBvbGQgbGF5ZXIgZnJvbSBjYW5kaWRhdGVzLCBhcyBpdCBoYXMgYmVlbiBtYXRjaGVkIHdpdGggdGhpcyBsYXllclxuICAgICAgb2xkTGF5ZXJNYXBbbmV3TGF5ZXIuaWRdID0gbnVsbDtcblxuICAgICAgbGV0IHN1YmxheWVycyA9IG51bGw7XG5cbiAgICAgIC8vIFdlIG11c3Qgbm90IGdlbmVyYXRlIGV4Y2VwdGlvbnMgdW50aWwgYWZ0ZXIgbGF5ZXIgbWF0Y2hpbmcgaXMgY29tcGxldGVcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghb2xkTGF5ZXIpIHtcbiAgICAgICAgICB0aGlzLl9pbml0aWFsaXplTGF5ZXIobmV3TGF5ZXIpO1xuICAgICAgICAgIGluaXRMYXllckluU2VlcihuZXdMYXllcik7IC8vIEluaXRpYWxpemVzIGxheWVyIGluIHNlZXIgY2hyb21lIGV4dGVuc2lvbiAoaWYgY29ubmVjdGVkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3RyYW5zZmVyTGF5ZXJTdGF0ZShvbGRMYXllciwgbmV3TGF5ZXIpO1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZUxheWVyKG5ld0xheWVyKTtcbiAgICAgICAgICB1cGRhdGVMYXllckluU2VlcihuZXdMYXllcik7IC8vIFVwZGF0ZXMgbGF5ZXIgaW4gc2VlciBjaHJvbWUgZXh0ZW5zaW9uIChpZiBjb25uZWN0ZWQpXG4gICAgICAgIH1cbiAgICAgICAgZ2VuZXJhdGVkTGF5ZXJzLnB1c2gobmV3TGF5ZXIpO1xuXG4gICAgICAgIC8vIENhbGwgbGF5ZXIgbGlmZWN5Y2xlIG1ldGhvZDogcmVuZGVyIHN1YmxheWVyc1xuICAgICAgICBzdWJsYXllcnMgPSBuZXdMYXllci5pc0NvbXBvc2l0ZSAmJiBuZXdMYXllci5nZXRTdWJMYXllcnMoKTtcbiAgICAgICAgLy8gRW5kIGxheWVyIGxpZmVjeWNsZSBtZXRob2Q6IHJlbmRlciBzdWJsYXllcnNcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBsb2cud2FybihgZXJyb3IgZHVyaW5nIG1hdGNoaW5nIG9mICR7bGF5ZXJOYW1lKG5ld0xheWVyKX1gLCBlcnIpO1xuICAgICAgICBlcnJvciA9IGVycm9yIHx8IGVycjsgLy8gUmVjb3JkIGZpcnN0IGV4Y2VwdGlvblxuICAgICAgfVxuXG4gICAgICBpZiAoc3VibGF5ZXJzKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN1YmxheWVyc1JlY3Vyc2l2ZWx5KHtcbiAgICAgICAgICBuZXdMYXllcnM6IHN1YmxheWVycyxcbiAgICAgICAgICBvbGRMYXllck1hcCxcbiAgICAgICAgICBnZW5lcmF0ZWRMYXllcnNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG5cbiAgLy8gRmluYWxpemUgYW55IG9sZCBsYXllcnMgdGhhdCB3ZXJlIG5vdCBtYXRjaGVkXG4gIF9maW5hbGl6ZU9sZExheWVycyhvbGRMYXllck1hcCkge1xuICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgZm9yIChjb25zdCBsYXllcklkIGluIG9sZExheWVyTWFwKSB7XG4gICAgICBjb25zdCBsYXllciA9IG9sZExheWVyTWFwW2xheWVySWRdO1xuICAgICAgaWYgKGxheWVyKSB7XG4gICAgICAgIGVycm9yID0gZXJyb3IgfHwgdGhpcy5fZmluYWxpemVMYXllcihsYXllcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIC8vIEluaXRpYWxpemVzIGEgc2luZ2xlIGxheWVyLCBjYWxsaW5nIGxheWVyIG1ldGhvZHNcbiAgX2luaXRpYWxpemVMYXllcihsYXllcikge1xuICAgIGFzc2VydCghbGF5ZXIuc3RhdGUpO1xuICAgIGxvZyhMT0dfUFJJT1JJVFlfTElGRUNZQ0xFLCBgaW5pdGlhbGl6aW5nICR7bGF5ZXJOYW1lKGxheWVyKX1gKTtcblxuICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGxheWVyLl9pbml0aWFsaXplKCk7XG4gICAgICBsYXllci5saWZlY3ljbGUgPSBMSUZFQ1lDTEUuSU5JVElBTElaRUQ7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2cud2FybihgZXJyb3Igd2hpbGUgaW5pdGlhbGl6aW5nICR7bGF5ZXJOYW1lKGxheWVyKX1cXG5gLCBlcnIpO1xuICAgICAgZXJyb3IgPSBlcnJvciB8fCBlcnI7XG4gICAgICAvLyBUT0RPIC0gd2hhdCBzaG91bGQgdGhlIGxpZmVjeWNsZSBzdGF0ZSBiZSBoZXJlPyBMSUZFQ1lDTEUuSU5JVElBTElaQVRJT05fRkFJTEVEP1xuICAgIH1cblxuICAgIGFzc2VydChsYXllci5zdGF0ZSk7XG5cbiAgICAvLyBTZXQgYmFjayBwb2ludGVyICh1c2VkIGluIHBpY2tpbmcpXG4gICAgbGF5ZXIuc3RhdGUubGF5ZXIgPSBsYXllcjtcblxuICAgIC8vIFNhdmUgbGF5ZXIgb24gbW9kZWwgZm9yIHBpY2tpbmcgcHVycG9zZXNcbiAgICAvLyBzdG9yZSBvbiBtb2RlbC51c2VyRGF0YSByYXRoZXIgdGhhbiBkaXJlY3RseSBvbiBtb2RlbFxuICAgIGZvciAoY29uc3QgbW9kZWwgb2YgbGF5ZXIuZ2V0TW9kZWxzKCkpIHtcbiAgICAgIG1vZGVsLnVzZXJEYXRhLmxheWVyID0gbGF5ZXI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG5cbiAgX3RyYW5zZmVyTGF5ZXJTdGF0ZShvbGRMYXllciwgbmV3TGF5ZXIpIHtcbiAgICBpZiAobmV3TGF5ZXIgIT09IG9sZExheWVyKSB7XG4gICAgICBsb2coTE9HX1BSSU9SSVRZX0xJRkVDWUNMRV9NSU5PUiwgYG1hdGNoZWQgJHtsYXllck5hbWUobmV3TGF5ZXIpfWAsIG9sZExheWVyLCAnLT4nLCBuZXdMYXllcik7XG4gICAgICBuZXdMYXllci5saWZlY3ljbGUgPSBMSUZFQ1lDTEUuTUFUQ0hFRDtcbiAgICAgIG9sZExheWVyLmxpZmVjeWNsZSA9IExJRkVDWUNMRS5BV0FJVElOR19HQztcbiAgICAgIG5ld0xheWVyLl90cmFuc2ZlclN0YXRlKG9sZExheWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nLmxvZyhMT0dfUFJJT1JJVFlfTElGRUNZQ0xFX01JTk9SLCBgTWF0Y2hpbmcgbGF5ZXIgaXMgdW5jaGFuZ2VkICR7bmV3TGF5ZXIuaWR9YCk7XG4gICAgICBuZXdMYXllci5saWZlY3ljbGUgPSBMSUZFQ1lDTEUuTUFUQ0hFRDtcbiAgICAgIG5ld0xheWVyLm9sZFByb3BzID0gbmV3TGF5ZXIucHJvcHM7XG4gICAgfVxuICB9XG5cbiAgLy8gVXBkYXRlcyBhIHNpbmdsZSBsYXllciwgY2xlYW5pbmcgYWxsIGZsYWdzXG4gIF91cGRhdGVMYXllcihsYXllcikge1xuICAgIGxvZy5sb2coTE9HX1BSSU9SSVRZX0xJRkVDWUNMRV9NSU5PUiwgYHVwZGF0aW5nICR7bGF5ZXJ9IGJlY2F1c2U6ICR7bGF5ZXIucHJpbnRDaGFuZ2VGbGFncygpfWApO1xuICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGxheWVyLl91cGRhdGUoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZy53YXJuKGBlcnJvciBkdXJpbmcgdXBkYXRlIG9mICR7bGF5ZXJOYW1lKGxheWVyKX1gLCBlcnIpO1xuICAgICAgLy8gU2F2ZSBmaXJzdCBlcnJvclxuICAgICAgZXJyb3IgPSBlcnI7XG4gICAgfVxuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIC8vIEZpbmFsaXplcyBhIHNpbmdsZSBsYXllclxuICBfZmluYWxpemVMYXllcihsYXllcikge1xuICAgIGFzc2VydChsYXllci5zdGF0ZSk7XG4gICAgYXNzZXJ0KGxheWVyLmxpZmVjeWNsZSAhPT0gTElGRUNZQ0xFLkFXQUlUSU5HX0ZJTkFMSVpBVElPTik7XG4gICAgbGF5ZXIubGlmZWN5Y2xlID0gTElGRUNZQ0xFLkFXQUlUSU5HX0ZJTkFMSVpBVElPTjtcbiAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgIHRoaXMuc2V0TmVlZHNSZWRyYXcoYGZpbmFsaXplZCAke2xheWVyTmFtZShsYXllcil9YCk7XG4gICAgdHJ5IHtcbiAgICAgIGxheWVyLl9maW5hbGl6ZSgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nLndhcm4oYGVycm9yIGR1cmluZyBmaW5hbGl6YXRpb24gb2YgJHtsYXllck5hbWUobGF5ZXIpfWAsIGVycik7XG4gICAgICBlcnJvciA9IGVycjtcbiAgICB9XG4gICAgbGF5ZXIubGlmZWN5Y2xlID0gTElGRUNZQ0xFLkZJTkFMSVpFRDtcbiAgICBsb2coTE9HX1BSSU9SSVRZX0xJRkVDWUNMRSwgYGZpbmFsaXppbmcgJHtsYXllck5hbWUobGF5ZXIpfWApO1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYXJuIGlmIGEgZGVjay1sZXZlbCBtb3VzZSBldmVudCBoYXMgYmVlbiBzcGVjaWZpZWQsXG4gICAqIGJ1dCBubyBsYXllcnMgYXJlIGBwaWNrYWJsZWAuXG4gICAqL1xuICBfdmFsaWRhdGVFdmVudEhhbmRsaW5nKCkge1xuICAgIGlmICh0aGlzLm9uTGF5ZXJDbGljayB8fCB0aGlzLm9uTGF5ZXJIb3Zlcikge1xuICAgICAgaWYgKHRoaXMubGF5ZXJzLmxlbmd0aCAmJiAhdGhpcy5sYXllcnMuc29tZShsYXllciA9PiBsYXllci5wcm9wcy5waWNrYWJsZSkpIHtcbiAgICAgICAgbG9nLndhcm4oXG4gICAgICAgICAgJ1lvdSBoYXZlIHN1cHBsaWVkIGEgdG9wLWxldmVsIGlucHV0IGV2ZW50IGhhbmRsZXIgKGUuZy4gYG9uTGF5ZXJDbGlja2ApLCAnICtcbiAgICAgICAgICAnYnV0IG5vbmUgb2YgeW91ciBsYXllcnMgaGF2ZSBzZXQgdGhlIGBwaWNrYWJsZWAgZmxhZy4nXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJvdXRlIGNsaWNrIGV2ZW50cyB0byBsYXllcnMuXG4gICAqIGBwaWNrTGF5ZXJgIHdpbGwgY2FsbCB0aGUgYG9uQ2xpY2tgIHByb3Agb2YgYW55IHBpY2tlZCBsYXllcixcbiAgICogYW5kIGBvbkxheWVyQ2xpY2tgIGlzIGNhbGxlZCBkaXJlY3RseSBmcm9tIGhlcmVcbiAgICogd2l0aCBhbnkgcGlja2luZyBpbmZvIGdlbmVyYXRlZCBieSBgcGlja0xheWVyYC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50ICBBbiBvYmplY3QgZW5jYXBzdWxhdGluZyBhbiBpbnB1dCBldmVudCxcbiAgICogICAgICAgICAgICAgICAgICAgICAgICB3aXRoIHRoZSBmb2xsb3dpbmcgc2hhcGU6XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAge09iamVjdDoge3gsIHl9fSBvZmZzZXRDZW50ZXI6IGNlbnRlciBvZiB0aGUgZXZlbnRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICB7T2JqZWN0fSBzcmNFdmVudDogICAgICAgICAgICAgbmF0aXZlIEpTIEV2ZW50IG9iamVjdFxuICAgKi9cbiAgX29uQ2xpY2soZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50Lm9mZnNldENlbnRlcikge1xuICAgICAgLy8gRG8gbm90IHRyaWdnZXIgb25Ib3ZlciBjYWxsYmFja3Mgd2hlbiBjbGljayBwb3NpdGlvbiBpcyBpbnZhbGlkLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9waWNrQW5kQ2FsbGJhY2soe1xuICAgICAgY2FsbGJhY2s6IHRoaXMuX29uTGF5ZXJDbGljayxcbiAgICAgIGV2ZW50LFxuICAgICAgbW9kZTogJ2NsaWNrJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdXRlIGNsaWNrIGV2ZW50cyB0byBsYXllcnMuXG4gICAqIGBwaWNrTGF5ZXJgIHdpbGwgY2FsbCB0aGUgYG9uSG92ZXJgIHByb3Agb2YgYW55IHBpY2tlZCBsYXllcixcbiAgICogYW5kIGBvbkxheWVySG92ZXJgIGlzIGNhbGxlZCBkaXJlY3RseSBmcm9tIGhlcmVcbiAgICogd2l0aCBhbnkgcGlja2luZyBpbmZvIGdlbmVyYXRlZCBieSBgcGlja0xheWVyYC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50ICBBbiBvYmplY3QgZW5jYXBzdWxhdGluZyBhbiBpbnB1dCBldmVudCxcbiAgICogICAgICAgICAgICAgICAgICAgICAgICB3aXRoIHRoZSBmb2xsb3dpbmcgc2hhcGU6XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAge09iamVjdDoge3gsIHl9fSBvZmZzZXRDZW50ZXI6IGNlbnRlciBvZiB0aGUgZXZlbnRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICB7T2JqZWN0fSBzcmNFdmVudDogICAgICAgICAgICAgbmF0aXZlIEpTIEV2ZW50IG9iamVjdFxuICAgKi9cbiAgX29uUG9pbnRlck1vdmUoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuaXNEb3duKSB7XG4gICAgICAvLyBEbyBub3QgdHJpZ2dlciBvbkhvdmVyIGNhbGxiYWNrcyBpZiBtb3VzZSBidXR0b24gaXMgZG93bi5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fcGlja0FuZENhbGxiYWNrKHtcbiAgICAgIGNhbGxiYWNrOiB0aGlzLl9vbkxheWVySG92ZXIsXG4gICAgICBldmVudCxcbiAgICAgIG1vZGU6ICdob3ZlcidcbiAgICB9KTtcbiAgfVxuXG4gIF9vblBvaW50ZXJMZWF2ZShldmVudCkge1xuICAgIHRoaXMucGlja09iamVjdCh7XG4gICAgICB4OiAtMSxcbiAgICAgIHk6IC0xLFxuICAgICAgcmFkaXVzOiB0aGlzLl9waWNraW5nUmFkaXVzLFxuICAgICAgbW9kZTogJ2hvdmVyJ1xuICAgIH0pO1xuICB9XG5cbiAgX3BpY2tBbmRDYWxsYmFjayhvcHRpb25zKSB7XG4gICAgY29uc3QgcG9zID0gb3B0aW9ucy5ldmVudC5vZmZzZXRDZW50ZXI7XG4gICAgY29uc3QgcmFkaXVzID0gdGhpcy5fcGlja2luZ1JhZGl1cztcbiAgICBjb25zdCBzZWxlY3RlZEluZm9zID0gdGhpcy5waWNrT2JqZWN0KHt4OiBwb3MueCwgeTogcG9zLnksIHJhZGl1cywgbW9kZTogb3B0aW9ucy5tb2RlfSk7XG4gICAgaWYgKG9wdGlvbnMuY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGZpcnN0SW5mbyA9IHNlbGVjdGVkSW5mb3MuZmluZChpbmZvID0+IGluZm8uaW5kZXggPj0gMCkgfHwgbnVsbDtcbiAgICAgIC8vIEFzIHBlciBkb2N1bWVudGF0aW9uLCBzZW5kIG51bGwgdmFsdWUgd2hlbiBubyB2YWxpZCBvYmplY3QgaXMgcGlja2VkLlxuICAgICAgb3B0aW9ucy5jYWxsYmFjayhmaXJzdEluZm8sIHNlbGVjdGVkSW5mb3MsIG9wdGlvbnMuZXZlbnQuc3JjRXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNFRVIgSU5URUdSQVRJT05cblxuICAvKipcbiAgICogQ2FsbGVkIHVwb24gU2VlciBpbml0aWFsaXphdGlvbiwgbWFudWFsbHkgc2VuZHMgbGF5ZXJzIGRhdGEuXG4gICAqL1xuICBfaW5pdFNlZXIoKSB7XG4gICAgdGhpcy5sYXllcnMuZm9yRWFjaChsYXllciA9PiB7XG4gICAgICBpbml0TGF5ZXJJblNlZXIobGF5ZXIpO1xuICAgICAgdXBkYXRlTGF5ZXJJblNlZXIobGF5ZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9uIFNlZXIgcHJvcGVydHkgZWRpdGlvbiwgc2V0IG92ZXJyaWRlIGFuZCB1cGRhdGUgbGF5ZXJzLlxuICAgKi9cbiAgX2VkaXRTZWVyKHBheWxvYWQpIHtcbiAgICBpZiAocGF5bG9hZC50eXBlICE9PSAnZWRpdCcgfHwgcGF5bG9hZC52YWx1ZVBhdGhbMF0gIT09ICdwcm9wcycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZXRQcm9wT3ZlcnJpZGVzKHBheWxvYWQuaXRlbUtleSwgcGF5bG9hZC52YWx1ZVBhdGguc2xpY2UoMSksIHBheWxvYWQudmFsdWUpO1xuICAgIGNvbnN0IG5ld0xheWVycyA9IHRoaXMubGF5ZXJzLm1hcChsYXllciA9PiBuZXcgbGF5ZXIuY29uc3RydWN0b3IobGF5ZXIucHJvcHMpKTtcbiAgICB0aGlzLnVwZGF0ZUxheWVycyh7bmV3TGF5ZXJzfSk7XG4gIH1cbn1cbiJdfQ==