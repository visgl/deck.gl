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
import Layer from './layer';
import debug from '../debug';
import {flatten} from '../utils/flatten';

const TRACE_RENDER_LAYERS = 'compositeLayer.renderLayers';

export default class CompositeLayer extends Layer {
  get isComposite() {
    return true;
  }

  get isLoaded() {
    return super.isLoaded && this.getSubLayers().every(layer => layer.isLoaded);
  }

  getSubLayers() {
    return (this.internalState && this.internalState.subLayers) || [];
  }

  // initializeState is usually not needed for composite layers
  // Provide empty definition to disable check for missing definition
  initializeState() {}

  // Updates selected state members and marks the composite layer to need rerender
  setState(updateObject) {
    super.setState(updateObject);
    // Trigger a layer update
    // Although conceptually layer.draw and compositeLayer.renderLayers are equivalent,
    // they are executed during different lifecycles.
    // draw can be called without calling updateState (e.g. most viewport changes),
    // while renderLayers can only be called during a recursive layer update.
    this.setNeedsUpdate();
  }

  // called to augment the info object that is bubbled up from a sublayer
  // override Layer.getPickingInfo() because decoding / setting uniform do
  // not apply to a composite layer.
  // @return null to cancel event
  getPickingInfo({info}) {
    const {object} = info;
    const isDataWrapped =
      object && object.__source && object.__source.parent && object.__source.parent.id === this.id;

    if (!isDataWrapped) {
      return info;
    }

    return Object.assign(info, {
      // override object with picked data
      object: object.__source.object,
      index: object.__source.index
    });
  }

  // Implement to generate subLayers
  renderLayers() {
    return null;
  }

  // Returns true if sub layer needs to be rendered
  shouldRenderSubLayer(id, data) {
    const {_subLayerProps: overridingProps} = this.props;

    return (data && data.length) || (overridingProps && overridingProps[id]);
  }

  // Returns sub layer class for a specific sublayer
  getSubLayerClass(id, DefaultLayerClass) {
    const {_subLayerProps: overridingProps} = this.props;

    return (
      (overridingProps && overridingProps[id] && overridingProps[id].type) || DefaultLayerClass
    );
  }

  // When casting user data into another format to pass to sublayers,
  // add reference to the original object and object index
  getSubLayerRow(row, sourceObject, sourceObjectIndex) {
    row.__source = {
      parent: this,
      object: sourceObject,
      index: sourceObjectIndex
    };
    return row;
  }

  // Some composite layers cast user data into another format before passing to sublayers
  // We need to unwrap them before calling the accessor so that they see the original data
  // objects
  getSubLayerAccessor(accessor) {
    if (typeof accessor === 'function') {
      const objectInfo = {
        data: this.props.data,
        target: []
      };
      return (x, i) => {
        if (x.__source) {
          objectInfo.index = x.__source.index;
          return accessor(x.__source.object, objectInfo);
        }
        return accessor(x, i);
      };
    }
    return accessor;
  }

  // Returns sub layer props for a specific sublayer
  getSubLayerProps(sublayerProps = {}) {
    const {
      opacity,
      pickable,
      visible,
      parameters,
      getPolygonOffset,
      highlightedObjectIndex,
      autoHighlight,
      highlightColor,
      coordinateSystem,
      coordinateOrigin,
      wrapLongitude,
      positionFormat,
      modelMatrix,
      extensions,
      _subLayerProps: overridingProps
    } = this.props;
    const newProps = {
      opacity,
      pickable,
      visible,
      parameters,
      getPolygonOffset,
      highlightedObjectIndex,
      autoHighlight,
      highlightColor,
      coordinateSystem,
      coordinateOrigin,
      wrapLongitude,
      positionFormat,
      modelMatrix,
      extensions
    };

    const overridingSublayerProps = overridingProps && overridingProps[sublayerProps.id];
    const overridingSublayerTriggers =
      overridingSublayerProps && overridingSublayerProps.updateTriggers;
    const sublayerId = sublayerProps.id || 'sublayer';

    if (overridingSublayerProps) {
      const propTypes = this.constructor._propTypes;
      for (const key in overridingSublayerProps) {
        const propType = propTypes[key];
        // eslint-disable-next-line
        if (propType && propType.type === 'accessor') {
          overridingSublayerProps[key] = this.getSubLayerAccessor(overridingSublayerProps[key]);
        }
      }
    }

    Object.assign(
      newProps,
      sublayerProps,
      // experimental feature that allows users to override sublayer props via parent layer prop
      overridingSublayerProps,
      {
        id: `${this.props.id}-${sublayerId}`,
        updateTriggers: Object.assign(
          {
            all: this.props.updateTriggers.all
          },
          sublayerProps.updateTriggers,
          overridingSublayerTriggers
        )
      }
    );

    // Pass through extension props
    for (const extension of extensions) {
      const passThroughProps = extension.getSubLayerProps.call(this, extension);
      if (passThroughProps) {
        Object.assign(newProps, passThroughProps, {
          updateTriggers: Object.assign(newProps.updateTriggers, passThroughProps.updateTriggers)
        });
      }
    }

    return newProps;
  }

  _getAttributeManager() {
    return null;
  }

  // Called by layer manager to render subLayers
  _renderLayers() {
    let {subLayers} = this.internalState;
    const shouldUpdate = !subLayers || this.needsUpdate();
    if (shouldUpdate) {
      subLayers = this.renderLayers();
      // Flatten the returned array, removing any null, undefined or false
      // this allows layers to render sublayers conditionally
      // (see CompositeLayer.renderLayers docs)
      subLayers = flatten(subLayers, Boolean);
      this.internalState.subLayers = subLayers;
    }
    debug(TRACE_RENDER_LAYERS, this, shouldUpdate, subLayers);

    // populate reference to parent layer (this layer)
    // NOTE: needs to be done even when reusing layers as the parent may have changed
    for (const layer of subLayers) {
      layer.parent = this;
    }
  }
}

CompositeLayer.layerName = 'CompositeLayer';
