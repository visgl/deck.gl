/* eslint-disable complexity */
import DataColumn, {DataColumnOptions, ShaderAttributeOptions, BufferAccessor} from './data-column';
import {IShaderAttribute} from './shader-attribute';
import assert from '../../utils/assert';
import {createIterable, getAccessorFromBuffer} from '../../utils/iterable-utils';
import {fillArray} from '../../utils/flatten';
import * as range from '../../utils/range';
import {normalizeTransitionSettings, TransitionSettings} from './attribute-transition-utils';
import type {Buffer} from '@luma.gl/webgl';

import type {NumericArray, TypedArray} from '../../types/types';

export type Accessor<DataType, ReturnType> = (
  object: DataType,
  context: {
    data: any;
    index: number;
    target: number[];
  }
) => ReturnType;

export type Updater = (
  attribute: Attribute,
  {
    data,
    startRow,
    endRow,
    props,
    numInstances
  }: {
    data: any;
    startRow: number;
    endRow: number;
    props: any;
    numInstances: number;
  }
) => void;

export type AttributeOptions = DataColumnOptions<{
  transition?: boolean | Partial<TransitionSettings>;
  noAlloc?: boolean;
  update?: Updater;
  accessor?: Accessor<any, any> | string | string[];
  transform?: (value: any) => any;
  shaderAttributes?: Record<string, Partial<ShaderAttributeOptions>>;
}>;

export type BinaryAttribute = Partial<BufferAccessor> & {value?: TypedArray; buffer?: Buffer};

type AttributeInternalState = {
  startIndices: NumericArray | null;
  /** Legacy: external binary supplied via attribute name */
  lastExternalBuffer: TypedArray | Buffer | BinaryAttribute | null;
  /** External binary supplied via accessor name */
  binaryValue: TypedArray | Buffer | BinaryAttribute | null;
  binaryAccessor: Accessor<any, any> | null;
  needsUpdate: string | boolean;
  needsRedraw: string | boolean;
  updateRanges: number[][];
};

export default class Attribute extends DataColumn<AttributeOptions, AttributeInternalState> {
  /** Legacy approach to set attribute value - read `isConstant` instead for attribute state */
  constant: boolean = false;

  constructor(gl: WebGLRenderingContext, opts: AttributeOptions) {
    super(gl, opts, {
      startIndices: null,
      lastExternalBuffer: null,
      binaryValue: null,
      binaryAccessor: null,
      needsUpdate: true,
      needsRedraw: false,
      updateRanges: range.FULL
    });

    // eslint-disable-next-line
    this.settings.update = opts.update || (opts.accessor ? this._autoUpdater : undefined);

    Object.seal(this.settings);
    Object.seal(this.state);

    // Check all fields and generate helpful error messages
    this._validateAttributeUpdaters();
  }

  get startIndices(): NumericArray | null {
    return this.state.startIndices;
  }

  set startIndices(layout: NumericArray | null) {
    this.state.startIndices = layout;
  }

  needsUpdate(): string | boolean {
    return this.state.needsUpdate;
  }

  needsRedraw({clearChangedFlags = false}: {clearChangedFlags?: boolean} = {}): string | boolean {
    const needsRedraw = this.state.needsRedraw;
    this.state.needsRedraw = needsRedraw && !clearChangedFlags;
    return needsRedraw;
  }

  getUpdateTriggers(): string[] {
    const {accessor} = this.settings;

    // Backards compatibility: allow attribute name to be used as update trigger key
    return [this.id].concat((typeof accessor !== 'function' && accessor) || []);
  }

  supportsTransition(): boolean {
    return Boolean(this.settings.transition);
  }

  // Resolve transition settings object if transition is enabled, otherwise `null`
  getTransitionSetting(opts: Record<string, any>): TransitionSettings | null {
    if (!opts || !this.supportsTransition()) {
      return null;
    }
    const {accessor} = this.settings;
    // TODO: have the layer resolve these transition settings itself?
    const layerSettings = this.settings.transition;
    // these are the transition settings passed in by the user
    const userSettings = Array.isArray(accessor)
      ? // @ts-ignore
        opts[accessor.find(a => opts[a])]
      : // @ts-ignore
        opts[accessor];

    // Shorthand: use duration instead of parameter object
    return normalizeTransitionSettings(userSettings, layerSettings);
  }

  setNeedsUpdate(reason: string = this.id, dataRange?: {startRow?: number; endRow?: number}): void {
    this.state.needsUpdate = this.state.needsUpdate || reason;
    this.setNeedsRedraw(reason);
    if (dataRange) {
      const {startRow = 0, endRow = Infinity} = dataRange;
      this.state.updateRanges = range.add(this.state.updateRanges, [startRow, endRow]);
    } else {
      this.state.updateRanges = range.FULL;
    }
  }

  clearNeedsUpdate(): void {
    this.state.needsUpdate = false;
    this.state.updateRanges = range.EMPTY;
  }

  setNeedsRedraw(reason: string = this.id): void {
    this.state.needsRedraw = this.state.needsRedraw || reason;
  }

  allocate(numInstances: number): boolean {
    const {state, settings} = this;

    if (settings.noAlloc) {
      // Data is provided through a Buffer object.
      return false;
    }

    if (settings.update) {
      super.allocate(numInstances, state.updateRanges !== range.FULL);
      return true;
    }

    return false;
  }

  updateBuffer({
    numInstances,
    data,
    props,
    context
  }: {
    numInstances: number;
    data: any;
    props: any;
    context: any;
  }): boolean {
    if (!this.needsUpdate()) {
      return false;
    }

    const {
      state: {updateRanges},
      settings: {update, noAlloc}
    } = this;

    let updated = true;
    if (update) {
      // Custom updater - typically for non-instanced layers
      for (const [startRow, endRow] of updateRanges) {
        update.call(context, this, {data, startRow, endRow, props, numInstances});
      }
      if (!this.value) {
        // no value was assigned during update
      } else if (
        this.constant ||
        this.buffer.byteLength < (this.value as TypedArray).byteLength + this.byteOffset
      ) {
        this.setData({
          value: this.value,
          constant: this.constant
        });
        // Setting attribute.constant in updater is a legacy approach that interferes with allocation in the next cycle
        // Respect it here but reset after use
        this.constant = false;
      } else {
        for (const [startRow, endRow] of updateRanges) {
          const startOffset = Number.isFinite(startRow) ? this.getVertexOffset(startRow) : 0;
          const endOffset = Number.isFinite(endRow)
            ? this.getVertexOffset(endRow)
            : noAlloc || !Number.isFinite(numInstances)
            ? this.value.length
            : numInstances * this.size;

          super.updateSubBuffer({startOffset, endOffset});
        }
      }
      this._checkAttributeArray();
    } else {
      updated = false;
    }

    this.clearNeedsUpdate();
    this.setNeedsRedraw();

    return updated;
  }

  // Use generic value
  // Returns true if successful
  setConstantValue(value?: NumericArray): boolean {
    if (value === undefined || typeof value === 'function') {
      return false;
    }

    const hasChanged = this.setData({constant: true, value});

    if (hasChanged) {
      this.setNeedsRedraw();
    }
    this.clearNeedsUpdate();
    return true;
  }

  // Use external buffer
  // Returns true if successful
  // eslint-disable-next-line max-statements
  setExternalBuffer(buffer?: TypedArray | Buffer | BinaryAttribute): boolean {
    const {state} = this;

    if (!buffer) {
      state.lastExternalBuffer = null;
      return false;
    }

    this.clearNeedsUpdate();

    if (state.lastExternalBuffer === buffer) {
      return true;
    }
    state.lastExternalBuffer = buffer;
    this.setNeedsRedraw();
    this.setData(buffer);
    return true;
  }

  // Binary value is a typed array packed from mapping the source data with the accessor
  // If the returned value from the accessor is the same as the attribute value, set it directly
  // Otherwise use the auto updater for transform/normalization
  setBinaryValue(
    buffer?: TypedArray | Buffer | BinaryAttribute,
    startIndices: NumericArray | null = null
  ): boolean {
    const {state, settings} = this;

    if (!buffer) {
      state.binaryValue = null;
      state.binaryAccessor = null;
      return false;
    }

    if (settings.noAlloc) {
      // Let the layer handle this
      return false;
    }

    if (state.binaryValue === buffer) {
      this.clearNeedsUpdate();
      return true;
    }
    state.binaryValue = buffer;
    this.setNeedsRedraw();

    const needsUpdate = settings.transform || startIndices !== this.startIndices;

    if (needsUpdate) {
      if (ArrayBuffer.isView(buffer)) {
        buffer = {value: buffer};
      }
      const binaryValue = buffer as BinaryAttribute;
      assert(ArrayBuffer.isView(binaryValue.value), `invalid ${settings.accessor}`);
      const needsNormalize = Boolean(binaryValue.size) && binaryValue.size !== this.size;

      state.binaryAccessor = getAccessorFromBuffer(binaryValue.value, {
        size: binaryValue.size || this.size,
        stride: binaryValue.stride,
        offset: binaryValue.offset,
        startIndices: startIndices as NumericArray,
        nested: needsNormalize
      });
      // Fall through to auto updater
      return false;
    }

    this.clearNeedsUpdate();
    this.setData(buffer);
    return true;
  }

  getVertexOffset(row: number): number {
    const {startIndices} = this;
    const vertexIndex = startIndices
      ? row < startIndices.length
        ? startIndices[row]
        : this.numInstances
      : row;
    return vertexIndex * this.size;
  }

  getShaderAttributes(): Record<string, IShaderAttribute> {
    const shaderAttributeDefs = this.settings.shaderAttributes || {[this.id]: null};
    const shaderAttributes: Record<string, IShaderAttribute> = {};

    for (const shaderAttributeName in shaderAttributeDefs) {
      Object.assign(
        shaderAttributes,
        super.getShaderAttributes(shaderAttributeName, shaderAttributeDefs[shaderAttributeName])
      );
    }

    return shaderAttributes;
  }

  /* eslint-disable max-depth, max-statements */
  private _autoUpdater(
    attribute: Attribute,
    {
      data,
      startRow,
      endRow,
      props,
      numInstances
    }: {
      data: any;
      startRow: number;
      endRow: number;
      props: any;
      numInstances: number;
    }
  ): void {
    if (attribute.constant) {
      return;
    }
    const {settings, state, value, size, startIndices} = attribute;

    const {accessor, transform} = settings;
    const accessorFunc: Accessor<any, any> =
      state.binaryAccessor ||
      // @ts-ignore
      (typeof accessor === 'function' ? accessor : props[accessor]);

    assert(typeof accessorFunc === 'function', `accessor "${accessor}" is not a function`);

    let i = attribute.getVertexOffset(startRow);
    const {iterable, objectInfo} = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;

      let objectValue = accessorFunc(object, objectInfo);
      if (transform) {
        // transform callbacks could be bound to a particular layer instance.
        // always point `this` to the current layer.
        objectValue = transform.call(this, objectValue);
      }

      if (startIndices) {
        const numVertices =
          (objectInfo.index < startIndices.length - 1
            ? startIndices[objectInfo.index + 1]
            : numInstances) - startIndices[objectInfo.index];
        if (objectValue && Array.isArray(objectValue[0])) {
          let startIndex = i;
          for (const item of objectValue) {
            attribute._normalizeValue(item, value as TypedArray, startIndex);
            startIndex += size;
          }
        } else if (objectValue && objectValue.length > size) {
          (value as TypedArray).set(objectValue, i);
        } else {
          attribute._normalizeValue(objectValue, objectInfo.target, 0);
          fillArray({
            target: value,
            source: objectInfo.target,
            start: i,
            count: numVertices
          });
        }
        i += numVertices * size;
      } else {
        attribute._normalizeValue(objectValue, value as TypedArray, i);
        i += size;
      }
    }
  }
  /* eslint-enable max-depth, max-statements */

  // Validate deck.gl level fields
  private _validateAttributeUpdaters() {
    const {settings} = this;

    // Check that 'update' is a valid function
    const hasUpdater = settings.noAlloc || typeof settings.update === 'function';
    if (!hasUpdater) {
      throw new Error(`Attribute ${this.id} missing update or accessor`);
    }
  }

  // check that the first few elements of the attribute are reasonable
  /* eslint-disable no-fallthrough */
  private _checkAttributeArray() {
    const {value} = this;
    const limit = Math.min(4, this.size);
    if (value && value.length >= limit) {
      let valid = true;
      switch (limit) {
        case 4:
          valid = valid && Number.isFinite(value[3]);
        case 3:
          valid = valid && Number.isFinite(value[2]);
        case 2:
          valid = valid && Number.isFinite(value[1]);
        case 1:
          valid = valid && Number.isFinite(value[0]);
          break;
        default:
          valid = false;
      }

      if (!valid) {
        throw new Error(`Illegal attribute generated for ${this.id}`);
      }
    }
  }
  /* eslint-enable no-fallthrough */
}
