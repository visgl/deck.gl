// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/* eslint-disable guard-for-in */
import Attribute from "./attribute.js";
import AttributeBufferGroups from "./attribute-buffer-groups.js";
import log from "../../utils/log.js";
import memoize from "../../utils/memoize.js";
import { mergeBounds } from "../../utils/math-utils.js";
import debug from "../../debug/index.js";
import AttributeTransitionManager from "./attribute-transition-manager.js";
const TRACE_INVALIDATE = 'attributeManager.invalidate';
const TRACE_UPDATE_START = 'attributeManager.updateStart';
const TRACE_UPDATE_END = 'attributeManager.updateEnd';
const TRACE_ATTRIBUTE_UPDATE_START = 'attribute.updateStart';
const TRACE_ATTRIBUTE_ALLOCATE = 'attribute.allocate';
const TRACE_ATTRIBUTE_UPDATE_END = 'attribute.updateEnd';
export default class AttributeManager {
    constructor(device, { id = 'attribute-manager', stats, timeline } = {}) {
        this.mergeBoundsMemoized = memoize(mergeBounds);
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
        this.attributeBufferGroups =
            null;
        // For debugging sanity, prevent uninitialized members
        Object.seal(this);
    }
    finalize() {
        this.attributeBufferGroups?.finalize();
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
    getNeedsRedraw(opts = { clearRedrawFlags: false }) {
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
    add(attributes) {
        this._add(attributes);
    }
    // Adds attributes
    addInstanced(attributes) {
        this._add(attributes, { stepMode: 'instance' });
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
    remove(attributeNameArray) {
        for (const name of attributeNameArray) {
            if (this.attributes[name] !== undefined) {
                this.attributes[name].delete();
                delete this.attributes[name];
            }
        }
    }
    // Marks an attribute for update
    invalidate(triggerName, dataRange) {
        const invalidatedAttributes = this._invalidateTrigger(triggerName, dataRange);
        // For performance tuning
        debug(TRACE_INVALIDATE, this, triggerName, invalidatedAttributes);
    }
    invalidateAll(dataRange) {
        for (const attributeName in this.attributes) {
            this.attributes[attributeName].setNeedsUpdate(attributeName, dataRange);
        }
        // For performance tuning
        debug(TRACE_INVALIDATE, this, 'all');
    }
    // Ensure all attribute buffers are updated from props or data.
    // eslint-disable-next-line complexity
    update({ data, numInstances, startIndices = null, transitions, props = {}, buffers = {}, context = {} }) {
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
            }
            else if (attribute.setBinaryValue(typeof accessorName === 'string' ? buffers[accessorName] : undefined, data.startIndices)) {
                // Step 2: try set packed value from external typed array
            }
            else if (typeof accessorName === 'string' &&
                !buffers[accessorName] &&
                attribute.setConstantValue(context, props[accessorName])) {
                // Step 3: try set constant value from props
                // Note: if buffers[accessorName] is supplied, ignore props[accessorName]
                // This may happen when setBinaryValue falls through to use the auto updater
            }
            else if (attribute.needsUpdate()) {
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
            if (updated)
                this.stats.get('Attributes updated').incrementCount();
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
        const { attributeTransitionManager } = this;
        const transitionUpdated = attributeTransitionManager.run();
        this.needsRedraw = this.needsRedraw || transitionUpdated;
        return transitionUpdated;
    }
    /**
     * Returns all attribute descriptors
     * Note: Format matches luma.gl Model/Program.setAttributes()
     * @return {Object} attributes - descriptors
     */
    getAttributes() {
        return { ...this.attributes, ...this.attributeTransitionManager.getAttributes() };
    }
    /**
     * Computes the spatial bounds of a given set of attributes
     */
    getBounds(attributeNames) {
        const bounds = attributeNames.map(attributeName => this.attributes[attributeName]?.getBounds());
        return this.mergeBoundsMemoized(bounds);
    }
    /**
     * Returns changed attribute descriptors
     * This indicates which WebGLBuffers need to be updated
     * @return {Object} attributes - descriptors
     */
    getChangedAttributes(opts = { clearChangedFlags: false }) {
        const { attributes, attributeTransitionManager } = this;
        const changedAttributes = { ...attributeTransitionManager.getAttributes() };
        for (const attributeName in attributes) {
            const attribute = attributes[attributeName];
            if (attribute.needsRedraw(opts) && !attributeTransitionManager.hasAttribute(attributeName)) {
                changedAttributes[attributeName] = attribute;
            }
        }
        return changedAttributes;
    }
    /** Generate WebGPU-style buffer layout descriptors from all attributes */
    getBufferLayouts(
    /** A luma.gl Model-shaped object that supplies additional hint to attribute resolution */
    modelInfo) {
        if (this.hasBufferGroups()) {
            return this.attributeBufferGroups.getBufferLayouts(this.getAttributes(), modelInfo);
        }
        return Object.values(this.getAttributes()).map(attribute => attribute.getBufferLayout(modelInfo));
    }
    /** @internal Returns whether this WebGPU manager has explicitly grouped attributes. */
    hasBufferGroups() {
        return Boolean(this.attributeBufferGroups?.hasGroups(this.attributes));
    }
    /**
     * @internal Resolves runtime layouts and additional shared buffers for a grouped WebGPU model.
     */
    getBufferGroupBindings(changedAttributes, modelInfo, excludeAttributes = {}) {
        if (!this.attributeBufferGroups) {
            return {
                bufferLayouts: this.getBufferLayouts(modelInfo),
                buffers: {},
                groupedAttributeIds: new Set()
            };
        }
        return this.attributeBufferGroups.getBindings(this.getAttributes(), changedAttributes, modelInfo, excludeAttributes);
    }
    // PRIVATE METHODS
    /** Register new attributes */
    _add(
    /** A map from attribute name to attribute descriptors */
    attributes, 
    /** Additional attribute settings to pass to all attributes */
    overrideOptions) {
        for (const attributeName in attributes) {
            const attribute = attributes[attributeName];
            const props = {
                ...attribute,
                id: attributeName,
                size: (attribute.isIndexed && 1) || attribute.size || 1,
                ...overrideOptions
            };
            // Initialize the attribute descriptor, with WebGL and metadata fields
            this.attributes[attributeName] = new Attribute(this.device, props);
        }
        this._mapUpdateTriggersToAttributes();
    }
    // build updateTrigger name to attribute name mapping
    _mapUpdateTriggersToAttributes() {
        const triggers = {};
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
    _invalidateTrigger(triggerName, dataRange) {
        const { attributes, updateTriggers } = this;
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
    _updateAttribute(opts) {
        const { attribute, numInstances } = opts;
        debug(TRACE_ATTRIBUTE_UPDATE_START, attribute);
        if (attribute.constant) {
            // The attribute is flagged as constant outside of an update cycle
            // Skip allocation and updater call
            // @ts-ignore value can be set to an array by user but always cast to typed array during attribute update
            attribute.setConstantValue(opts.context, attribute.value);
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
//# sourceMappingURL=attribute-manager.js.map