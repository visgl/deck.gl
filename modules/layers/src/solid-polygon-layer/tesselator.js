// Handles tesselation of polygons with holes
// - 2D surfaces
// - 2D outlines
// - 3D surfaces (top and sides only)
// - 3D wireframes (not yet)
import {fillArray} from '../../../lib/utils';
import assert from 'assert';

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export class TypedArrayManager {
  constructor({overAlloc = 1.05} = {}) {
    this.overAlloc = overAlloc;
  }

  allocate(Type, size) {
    // TODO - check if available in pool
    return new Type(size);
  }

  reallocate(typedArray, newSize, copy = false) {
    if (newSize <= typedArray.length) {
      return typedArray;
    }

    // Allocate at least one element to ensure a valid buffer
    const allocSize = clamp(newSize * (this.overAlloc || 1), 1, newSize * 2);
    // TODO - check if available in pool
    const newArray = new typedArray.constructor(allocSize);

    if (copy) {
      // TODO - copy from typedArray to newArray
    }

    this.releaseTypedArray(typedArray);

    // logFunctions.onUpdate({
    //   level: LOG_DETAIL_PRIORITY,
    //   message: `${attributeName} allocated ${allocCount}`,
    //   id: this.id
    // });
    return newArray;
  }

  release(typedArray) {
    // TODO - add to pool

    // logFunctions.onUpdate({
    //   level: LOG_DETAIL_PRIORITY,
    //   message: `${attributeName} allocated ${allocCount}`,
    //   id: this.id
    // });
  }

  reallocateTypedArrays({
    arrays,
    count,
    copy = false,
    getSize = key => 1,
    getActive = key => true
  }) {
    const newArrays = {};
    let change = false;
    for (const key in arrays) {
      if (getActive(key)) {
        const size = getSize(key);
        newArrays[key] = this._reallocateTypedArray(arrays[key], count * size, copy);
        if (arrays[key] !== newArrays[key]) {
          change = true;
        }
      } else {
        newArrays[key] = arrays[key];
      }
    }
    return change ? newArrays : arrays;
  }
}

// const typedArrayManager = new TypedArrayManager();

export default class Tesselator {
  constructor(opts) {
    const {
      isIndexed = false,
      attributes = {},
      getGeometrySize
    } = opts;

    assert(getGeometrySize);

    this.isIndexed = isIndexed;
    this.getGeometrySize = getGeometrySize;
    this.data = [];

    this.allocatedLength = [];
    this.currentLength = [];

    this.attributes = attributes;
    if (isIndexed) {
      this.attributes.indices = {
        // buffer: GL.ELEMENT_BUFFER,
        // type: GL.FLOAT
      };
      // const {indexCount, vertexCount} = this;
      // if (IndexType === Uint16Array && vertexCount > 65535) {
      //   throw new Error('Vertex count exceeds browser index limit');
      // }
      // // Allocate the attributes
      // this.indices = indexCount ? new IndexType(indexCount) : 0;
    }

    this.indexOffsets = [];
    this.vertexOffsets = [];

    Object.seal(this);
  }

  setData(data) {
    this.data = [];
    this._calculateObjectSizes({data});
    this._allocateGeometry();
  }

  buildGeometry(data) {
    this._calculateObjectSizes({data});
    this._allocateGeometry();
    this._buildGeometry({data});
  }

  getAttributes() {
    return {
      indices: this.indices
    };
  }

  /**
   * Visit all objects, providing info about:
   * - vertex array start and end indices
   * - index array start and end indices
   */
  forEach(visitor) {
    const {vertexOffsets, indexOffsets} = this;
    this.data.forEach((object, index) => {
      visitor({
        object,
        index,
        start: vertexOffsets[index],
        end: vertexOffsets[index + 1],
        length: vertexOffsets[index + 1] - vertexOffsets[index],
        indexStart: indexOffsets[index],
        indexEnd: indexOffsets[index + 1],
        indexLength: indexOffsets[index + 1] - indexOffsets[index]
      });
    });
  }

  forEachVertexAsTypedArray({array, visitor}) {
    this.forEach(opts => {
      // Create an object's view into the buffer
      // const {start, end, length} = opts;
      // opts.vertexArrayView = new array.constructor(array.buffer, start, end);
      visitor(opts);
    });
  }

  forEachIndexAsTypedArray({array, visitor}) {
    // const indices = this.indices;
    this.forEach(opts => {
      // const {start, end, length, indexStart, indexEnd, indexLength} = opts;
      // // Create an object's view into the buffer
      // opts.indexArrayView = new indices.constructor(indices.buffer, start, end);
      // // Create an object's view into the buffer
      // opts.vertexArrayView = new array.constructor(array.buffer, start, end);
      visitor(opts);
    });
  }

  // VIRTUAL METHODS

  getGeometrySize(object) {
    throw new Error('Tesselator.getGeometrySize not implemented');
  }

  addGeometry(object) {
    throw new Error('Tesselator.addGeometry not implemented');
  }

  // Calculate the size of the geometry (vertices and indices)
  // Calulates total numbers, as well as counts and offsets per element
  _calculateObjectSizes(opts) {
    // vertexOffsets will contain offset to first vert in each object
    // Note" Last element in offsets will contain total vertex count
    this.vertexOffsets = new Array(this.data.length + 1);
    this.vertexOffsets.push(0);

    this.indexOffsets = new Array(this.data.length + 1);
    this.indexOffsets.push(0);

    this.vertexCount = 0;
    this.data.forEach((object, index) => {
      const {vertexCount, indexCount} = this.getGeometrySize({object, index});

      this.vertexCount += vertexCount;
      this.indexCount += indexCount;

      this.vertexOffsets.push(this.vertexCount);
      this.indexOffsets.push(this.indexCount);
    });
  }

  _getIndexType({vertexCount}) {
    const needs32bits = vertexCount > 65535;
    return needs32bits ? Uint32Array : Uint16Array;
  }

  // Allocate "combined" geometry arrays
  // These will be sized to hold all verts and indices for all objects
  _allocateGeometry({IndexType = Uint32Array} = {}) {
    const {indexCount, vertexCount} = this;
    if (IndexType === Uint16Array && vertexCount > 65535) {
      throw new Error('Vertex count exceeds browser index limit');
    }
    // Allocate the attributes
    this.indices = indexCount ? new IndexType(indexCount) : 0;
  }

  // Build the actual geometry
  // Calls addGeometry for each object with subarrays set to that
  // object's slice of the total attribute array
  _buildGeometry(opts) {
    const {indexOffsets, vertexOffsets, indices, positions, positions64xy} = this;

    // Call "addGeometryForObject" with sub arrays that contain only
    // the space needed for the elements and vertiees for that object
    this.data.forEach((object, i) => {
      this.addGeometry({
        object,
        index: i,
        firstVertexIndex: vertexOffsets[i],
        indices: indices.subarray(indexOffsets[i], indexOffsets[i + 1]),
        positions: positions.subarray(vertexOffsets[i] * 3, vertexOffsets[i + 1] * 3),
        positions64xy: positions64xy.subarray(vertexOffsets[i] * 2, vertexOffsets[i + 1] * 2)
      });
    });

    return {indices, positions, positions64xy};
  }
}

// Maybe deck.gl or luma.gl needs to export this
function getPickingColorFromIndex(index) {
  return [
    (index + 1) % 256,
    Math.floor((index + 1) / 256) % 256,
    Math.floor((index + 1) / 256 / 256) % 256
  ];
}

function getColorValue(color) {
  color[3] = Number.isFinite(color[3]) ? color[3] : 255;
  return color;
}

export class AttributeTesselator extends Tesselator {

  // Get the positions array
  positions() {
    return this.positions;
  }

  // Get the positions64xy array
  positions64xy() {
    return this.positions64xy;
  }

  // Allocate a normals array
  normals({getNormal = x => [0, 1, 0]}) {
    return this.getAttribute({Type: Float32Array, size: 3, accessor: getNormal});
  }

  // Allocate a colors array
  colors({getColor = [0, 0, 0, 255]} = {}) {
    return this.getAttribute({Type: Uint8ClampedArray, size: 4, accessor: getColor,
      getValue: getColorValue
    });
  }

  // Allocate a picking colors array
  pickingColors({getPickingIndex = (x, i) => i}) {
    const getPickingColor =
      (object, index) => getPickingColorFromIndex(getPickingIndex(object, index));
    return this.getAttribute({Type: Uint8ClampedArray, size: 3, accessor: getPickingColor});
  }

  /**
   * Use to recalculate any other per object attributes
   */
  getAttribute({Type, size, accessor, getValue = x => x, array = null}) {
    const attribute = new Type(size * this.vertexCount);
    this.forEach(({object, start, length, index}) => {
      const value = getValue(accessor(object, index));
      fillArray({target: attribute, source: value, start: index, count: length});
    });
    return attribute;
  }
}
