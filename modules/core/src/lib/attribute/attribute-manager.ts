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

/* eslint-disable guard-for-in */
import Attribute, {AttributeOptions} from './attribute';
import {IShaderAttribute} from './shader-attribute';
import log from '../../utils/log';
import memoize from '../../utils/memoize';
import {mergeBounds} from '../../utils/math-utils';
import debug from '../../debug';
import {NumericArray} from '../../types/types';

import AttributeTransitionManager from './attribute-transition-manager';

import type {Device, BufferLayout} from '@luma.gl/core';
import type {Stats} from '@probe.gl/stats';
import type {Timeline} from '@luma.gl/engine';

const TRACE_INVALIDATE = 'attributeManager.invalidate';
const TRACE_UPDATE_START = 'attributeManager.updateStart';
const TRACE_UPDATE_END = 'attributeManager.updateEnd';
const TRACE_ATTRIBUTE_UPDATE_START = 'attribute.updateStart';
const TRACE_ATTRIBUTE_ALLOCATE = 'attribute.allocate';
const TRACE_ATTRIBUTE_UPDATE_END = 'attribute.updateEnd';

export default class AttributeManager {
  /**
   * @classdesc
   * Automated attribute generation and management. Suitable when a set of
   * vertex shader attributes are generated by iteration over a data array,
   * and updates to these attributes are needed either when the data itself
   * changes, or when other data relevant to the calculations change.
   *
   * - First the application registers descriptions of its dynamic vertex
   *   attributes using AttributeManager.add().
   * - Then, when any change that affects attributes is detected by the
   *   application, the app will call AttributeManager.invalidate().
   * - Finally before it renders, it calls AttributeManager.update() to
   *   ensure that attributes are automatically rebuilt if anything has been
   *   invalidated.
   *
   * The application provided update functions describe how attributes
   * should be updated from a data array and are expected to traverse
   * that data array (or iterable) and fill in the attribute's typed array.
   *
   * Note that the attribute manager intentionally does not do advanced
   * change detection, but instead makes it easy to build such detection
   * by offering the ability to "invalidate" each attribute separately.
   */
  id: string;
  device: Device;
  attributes: Record<string, Attribute>;
  updateTriggers: {[name: string]: string[]};
  needsRedraw: string | boolean;
  userData: any;

  private stats?: Stats;
  private attributeTransitionManager: AttributeTransitionManager;
  private mergeBoundsMemoized: any = memoize(mergeBounds);

  constructor(
    device: Device,
    {
      id = 'attribute-manager',
      stats,
      timeline
    }: {
      id?: string;
      stats?: Stats;
      timeline?: Timeline;
    } = {}
  ) {
    this.id = id;
    this.device = device;

    this.attributes = {};

    this.updateTriggers = {};
    this.needsRedraw = true;

    this.userData = {};
    this.stats = stats;

    this.attributeTransitionManager = new AttributeTransitionManager(device, {
      id: `${id}-transitions`,
      timeline
    });

    // For debugging sanity, prevent uninitialized members
    Object.seal(this);
  }

  finalize() {
    for (const attributeName in this.attributes) {
      this.attributes[attributeName].delete();
    }
    this.attributeTransitionManager.finalize();
  }

  // Returns the redraw flag, optionally clearing it.
  // Redraw flag will be set if any attributes attributes changed since
  // flag was last cleared.
  //
  // @param {String} [clearRedrawFlags=false] - whether to clear the flag
  // @return {false|String} - reason a redraw is needed.
  getNeedsRedraw(opts: {clearRedrawFlags?: boolean} = {clearRedrawFlags: false}): string | false {
    const redraw = this.needsRedraw;
    this.needsRedraw = this.needsRedraw && !opts.clearRedrawFlags;
    return redraw && this.id;
  }

  // Sets the redraw flag.
  // @param {Boolean} redraw=true
  setNeedsRedraw() {
    this.needsRedraw = true;
  }

  // Adds attributes
  add(attributes: {[id: string]: AttributeOptions}) {
    this._add(attributes);
  }

  // Adds attributes
  addInstanced(attributes: {[id: string]: AttributeOptions}) {
    this._add(attributes, {instanced: 1});
  }

  /**
   * Removes attributes
   * Takes an array of attribute names and delete them from
   * the attribute map if they exists
   *
   * @example
   * attributeManager.remove(['position']);
   *
   * @param {Object} attributeNameArray - attribute name array (see above)
   */
  remove(attributeNameArray: string[]) {
    for (const name of attributeNameArray) {
      if (this.attributes[name] !== undefined) {
        this.attributes[name].delete();
        delete this.attributes[name];
      }
    }
  }

  // Marks an attribute for update
  invalidate(triggerName: string, dataRange?: {startRow?: number; endRow?: number}) {
    const invalidatedAttributes = this._invalidateTrigger(triggerName, dataRange);
    // For performance tuning
    debug(TRACE_INVALIDATE, this, triggerName, invalidatedAttributes);
  }

  invalidateAll(dataRange?: {startRow?: number; endRow?: number}) {
    for (const attributeName in this.attributes) {
      this.attributes[attributeName].setNeedsUpdate(attributeName, dataRange);
    }
    // For performance tuning
    debug(TRACE_INVALIDATE, this, 'all');
  }

  // Ensure all attribute buffers are updated from props or data.
  // eslint-disable-next-line complexity
  update({
    data,
    numInstances,
    startIndices = null,
    transitions,
    props = {},
    buffers = {},
    context = {}
  }: {
    data: any;
    numInstances: number;
    startIndices?: NumericArray | null;
    transitions: any;
    props: any;
    buffers: any;
    context: any;
  }) {
    // keep track of whether some attributes are updated
    let updated = false;

    debug(TRACE_UPDATE_START, this);
    if (this.stats) {
      this.stats.get('Update Attributes').timeStart();
    }

    for (const attributeName in this.attributes) {
      const attribute = this.attributes[attributeName];
      const accessorName = attribute.settings.accessor;
      attribute.startIndices = startIndices;
      attribute.numInstances = numInstances;

      if (props[attributeName]) {
        log.removed(`props.${attributeName}`, `data.attributes.${attributeName}`)();
      }

      if (attribute.setExternalBuffer(buffers[attributeName])) {
        // Step 1: try update attribute directly from external buffers
      } else if (
        attribute.setBinaryValue(
          typeof accessorName === 'string' ? buffers[accessorName] : undefined,
          data.startIndices
        )
      ) {
        // Step 2: try set packed value from external typed array
      } else if (
        typeof accessorName === 'string' &&
        !buffers[accessorName] &&
        attribute.setConstantValue(props[accessorName])
      ) {
        // Step 3: try set constant value from props
        // Note: if buffers[accessorName] is supplied, ignore props[accessorName]
        // This may happen when setBinaryValue falls through to use the auto updater
      } else if (attribute.needsUpdate()) {
        // Step 4: update via updater callback
        updated = true;
        this._updateAttribute({
          attribute,
          numInstances,
          data,
          props,
          context
        });
      }

      this.needsRedraw = this.needsRedraw || attribute.needsRedraw();
    }

    if (updated) {
      // Only initiate alloc/update (and logging) if actually needed
      debug(TRACE_UPDATE_END, this, numInstances);
    }

    if (this.stats) {
      this.stats.get('Update Attributes').timeEnd();
    }

    this.attributeTransitionManager.update({
      attributes: this.attributes,
      numInstances,
      transitions
    });
  }

  // Update attribute transition to the current timestamp
  // Returns `true` if any transition is in progress
  updateTransition() {
    const {attributeTransitionManager} = this;
    const transitionUpdated = attributeTransitionManager.run();
    this.needsRedraw = this.needsRedraw || transitionUpdated;
    return transitionUpdated;
  }

  /**
   * Returns all attribute descriptors
   * Note: Format matches luma.gl Model/Program.setAttributes()
   * @return {Object} attributes - descriptors
   */
  getAttributes(): {[id: string]: Attribute} {
    return this.attributes;
  }

  /**
   * Computes the spatial bounds of a given set of attributes
   */
  getBounds(attributeNames: string[]) {
    const bounds = attributeNames.map(attributeName => this.attributes[attributeName]?.getBounds());
    return this.mergeBoundsMemoized(bounds);
  }

  /**
   * Returns changed attribute descriptors
   * This indicates which WebGLBuffers need to be updated
   * @return {Object} attributes - descriptors
   */
  getChangedAttributes(opts: {clearChangedFlags?: boolean} = {clearChangedFlags: false}): {
    [id: string]: Attribute;
  } {
    const {attributes, attributeTransitionManager} = this;

    const changedAttributes = {...attributeTransitionManager.getAttributes()};

    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      if (attribute.needsRedraw(opts) && !attributeTransitionManager.hasAttribute(attributeName)) {
        changedAttributes[attributeName] = attribute;
      }
    }

    return changedAttributes;
  }

  getBufferMaps(
    attributes?: {[id: string]: Attribute},
    excludeAttributes: Record<string, boolean> = {}
  ): BufferLayout[] {
    if (!attributes) {
      attributes = this.getAttributes();
    }
    const bufferMaps: BufferLayout[] = [];
    for (const attributeName in attributes) {
      if (!excludeAttributes[attributeName]) {
        bufferMaps.push(attributes[attributeName].getBufferMap());
      }
    }
    return bufferMaps;
  }

  // PRIVATE METHODS

  // Used to register an attribute
  private _add(attributes: {[id: string]: AttributeOptions}, extraProps: any = {}) {
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];

      // Initialize the attribute descriptor, with WebGL and metadata fields
      this.attributes[attributeName] = this._createAttribute(attributeName, attribute, extraProps);
    }

    this._mapUpdateTriggersToAttributes();
  }
  /* eslint-enable max-statements */

  private _createAttribute(name: string, attribute: AttributeOptions, extraProps: any) {
    // For expected default values see:
    // https://github.com/visgl/luma.gl/blob/1affe21352e289eeaccee2a876865138858a765c/modules/webgl/src/classes/accessor.js#L5-L13
    // and https://deck.gl/docs/api-reference/core/attribute-manager#add
    const props: AttributeOptions = {
      ...attribute,
      id: name,
      size: (attribute.isIndexed && 1) || attribute.size || 1,
      divisor: extraProps.instanced ? 1 : attribute.divisor || 0
    };

    return new Attribute(this.device, props);
  }

  // build updateTrigger name to attribute name mapping
  private _mapUpdateTriggersToAttributes() {
    const triggers: {[name: string]: string[]} = {};

    for (const attributeName in this.attributes) {
      const attribute = this.attributes[attributeName];
      attribute.getUpdateTriggers().forEach(triggerName => {
        if (!triggers[triggerName]) {
          triggers[triggerName] = [];
        }
        triggers[triggerName].push(attributeName);
      });
    }

    this.updateTriggers = triggers;
  }

  private _invalidateTrigger(
    triggerName: string,
    dataRange?: {startRow?: number; endRow?: number}
  ): string[] {
    const {attributes, updateTriggers} = this;
    const invalidatedAttributes = updateTriggers[triggerName];

    if (invalidatedAttributes) {
      invalidatedAttributes.forEach(name => {
        const attribute = attributes[name];
        if (attribute) {
          attribute.setNeedsUpdate(attribute.id, dataRange);
        }
      });
    }
    return invalidatedAttributes;
  }

  private _updateAttribute(opts: {
    attribute: Attribute;
    numInstances: number;
    data: any;
    props: any;
    context: any;
  }) {
    const {attribute, numInstances} = opts;
    debug(TRACE_ATTRIBUTE_UPDATE_START, attribute);

    if (attribute.constant) {
      // The attribute is flagged as constant outside of an update cycle
      // Skip allocation and updater call
      attribute.setConstantValue(attribute.value);
      return;
    }

    if (attribute.allocate(numInstances)) {
      debug(TRACE_ATTRIBUTE_ALLOCATE, attribute, numInstances);
    }

    // Calls update on any buffers that need update
    const updated = attribute.updateBuffer(opts);
    if (updated) {
      this.needsRedraw = true;
      debug(TRACE_ATTRIBUTE_UPDATE_END, attribute, numInstances);
    }
  }
}
