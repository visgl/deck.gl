// Copyright (c) 2015 Uber Technologies, Inc.
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

/* eslint-disable guard-for-in */
import Layer from './layer';
import assert from 'assert';
import {addIterator} from '../util';
import isDeepEqual from 'lodash.isequal';

/*
 * @param {string} props.id - layer name
 * @param {array}  props.data - array of data instances
 * @param {number} props.width - viewport width, synced with MapboxGL
 * @param {number} props.height - viewport width, synced with MapboxGL
 * @param {number} props.layerIndex - for colorPicking scene generation
 * @param {bool} props.isPickable - whether layer response to mouse event
 * @param {bool} props.opacity - opacity of the layer
 */
// const DEFAULT_PROPS = {
//   numInstances: undefined,
//   attributes: {},
//   data: [],
//   isPickable: false,
//   deepCompare: false,
//   getValue: x => x,
//   onObjectHovered: () => {},
//   onObjectClicked: () => {}
// };

// const ATTRIBUTES = {
//   pickingColors: {size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue'}
// };

export default class InstancedLayer extends Layer {

  static get attributes() {
    return ATTRIBUTES;
  }

  /**
   * @classdesc
   * BaseLayer
   *
   * @class
   * @param {object} props - See docs above
   */
  /* eslint-disable max-statements */
  // constructor(props) {
  //   props = {
  //     ...DEFAULT_PROPS,
  //     ...props
  //   };
  //   super(props);

  //   // Add iterator to objects
  //   if (props.data) {
  //     addIterator(props.data);
  //     assert(props.data[Symbol.iterator], 'data prop must have an iterator');
  //   }

  //   this.checkParam(props.data || props.buffers);
  // }
  /* eslint-enable max-statements */

  // initializeState() {
  //   super.initializeState();
  //   const {attributes} = this.state;

  //   this.setState({
  //     instancedAttributes is the subset of attributes that updates with data
  //     instancedAttributes: {},
  //     numInstances: 0,
  //     dataChanged: true
  //   });

  //   // All instanced layers get pickingColors attribute by default
  //   attributes.addInstanced(ATTRIBUTES, {
  //     pickingColors: {update: this.calculatePickingColors, when: 'realloc'}
  //   });
  // }

  // checkProps(oldProps, newProps) {
  //   super.checkProps(oldProps, newProps);

  //   // Figure out data length
  //   const numInstances = this.getNumInstances(newProps);
  //   if (numInstances !== this.state.numInstances) {
  //     this.state.dataChanged = true;
  //   }
  //   this.setState({
  //     numInstances
  //   });

  //   // Setup update flags, used to prevent unnecessary calculations
  //   // TODO non-instanced layer cannot use .data.length for equal check
  //   if (newProps.deepCompare) {
  //     this.state.dataChanged = !isDeepEqual(newProps.data, oldProps.data);
  //   } else {
  //     this.state.dataChanged = newProps.data.length !== oldProps.data.length;
  //   }
  // }

  // updateAttributes() {
  //   const {attributes, numInstances} = this.state;
  //   // Figure out data length
  //   attributes.update({
  //     numInstances,
  //     bufferMap: this.props,
  //     context: this,
  //     // Don't worry about non-attribute props
  //     ignoreUnknownAttributes: true
  //   });
  // }

  // PUBLIC API

  // Use iteration (the only required capability on data) to get first element
  // getFirstObject() {
  //   const {data} = this.props;
  //   for (const object of data) {
  //     return object;
  //   }
  //   return null;
  // }

  // INTERNAL METHODS

  // Deduces numer of instances. Intention is to support:
  // - Explicit setting of numInstances
  // - Auto-deduction for ES6 containers that define a size member
  // - Auto-deduction for Classic Arrays via the built-in length attribute
  // - Auto-deduction via arrays
  // - Auto-deduction via iteration
  // getNumInstances() {
  //   // First check if the layer has set its own value
  //   if (this.state && this.state.numInstances) {
  //     return this.state.numInstances;
  //   }

  //   // Check if app has set an explicit value
  //   if (this.props.numInstances) {
  //     return this.props.numInstances;
  //   }

  //   const {data} = this.props;

  //   // Check if array length attribute is set on data
  //   if (data && data.length !== undefined) {
  //     return data.length;
  //   }

  //   // Check if ES6 collection "size" attribute is set
  //   if (data && data.size !== undefined) {
  //     return data.size;
  //   }

  //   // TODO - slow, we probably should not support this unless
  //   // we limit the number of invocations
  //   //
  //   // Use iteration to count objects
  //   // let count = 0;
  //   // /* eslint-disable no-unused-vars */
  //   // for (const object of data) {
  //   //   count++;
  //   // }
  //   // return count;

  //   throw new Error('Could not deduce numInstances');
  // }

  // calculatePickingColors(attribute, numInstances) {
  //   const {value, size} = attribute;
  //   for (let i = 0; i < numInstances; i++) {
  //     value[i * size + 0] = (i + 1) % 256;
  //     value[i * size + 1] = Math.floor((i + 1) / 256) % 256;
  //     value[i * size + 2] = this.layerIndex;
  //   }
  // }

  _getRenderFunction(gl) {
    // const {primitive} = this.state;
    // const drawType = primitive.drawType ?
    //   gl.get(primitive.drawType) : gl.POINTS;

    // const numIndices = primitive.indices ? primitive.indices.length : 0;
    // const numVertices = primitive.vertices ? primitive.vertices.length : 0;

    // // "Capture" state as it will be set to null when layer is disposed
    // const {state} = this;

    // if (primitive.instanced) {
    //   const extension = gl.getExtension('ANGLE_instanced_arrays');

    //   if (primitive.indices) {
    //     return () => extension.drawElementsInstancedANGLE(
    //       drawType, numIndices, gl.UNSIGNED_SHORT, 0, state.numInstances
    //     );
    //   }
    //   // else if this.primitive does not have indices
    //   return () => extension.drawArraysInstancedANGLE(
    //     drawType, 0, numVertices / 3, state.numInstances
    //   );
    // }

    // // Not instanced
    return super._getRenderFunction(gl);
  }

}
