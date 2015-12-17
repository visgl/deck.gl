export default class BaseLayer {
  /**
   * @classdesc
   * BaseLayer
   *
   * @class
   * @param {object} opts
   * @param {string} opts.id - layer name
   * @param {array}  opts.data - array of data instances
   * @param {number} opts.width - viewport width, synced with MapboxGL
   * @param {number} opts.height - viewport width, synced with MapboxGL
   * @param {number} opts.layerIndex - for colorPicksing scene generation
   * @param {bool} opts.isPickable - whether layer response to mouse event
   *
   * @param {function} opts.onObjectHovered(index, e) - popup selected index
   * @param {function} opts.onObjectClicked(index, e) - popup selected index
   */
  constructor(opts) {
    this.id = opts.id || this._throwUndefinedError('id');
    this.data = opts.data || this._throwUndefinedError('data');
    this.width = opts.width || this._throwUndefinedError('width');
    this.height = opts.height || this._throwUndefinedError('height');
    this.layerIndex = opts.layerIndex || 0;

    this.opacity = opts.opacity || 0.8;
    this.isPickable = opts.isPickable || false;
    this.numInstances = this.data.length || 1e5;

    this.onObjectHovered = () => {};
    this.onObjectClicked = () => {};

    this._positionNeedUpdate = true;
  }

  getLayerProps() {
    return {
      layerId: this.id,
      program: this._getPrograms(),
      primitive: this._getPrimitive(),
      uniforms: this._getUniforms(),
      attributes: this._getAttributes(),
      options: this._getOptions()
    };
  }

  /* ------------------------------------------------------------------ */
  /* override the following functions and fill in layer specific logics */

  update(deep) {
    this._throwNotImplementedError('update');
  }

  _getPrograms() {
    this._throwNotImplementedError('_getPrograms');
  }

  _getPrimitive() {
    this._throwNotImplementedError('_getPrimitive');
  }

  _getUniforms() {
    this._throwNotImplementedError('_getUniforms');
  }

  _getAttributes() {
    this._throwNotImplementedError('_getAttributes');
  }

  _getOptions() {
    this._throwNotImplementedError('_getOptions');
  }

  /* override the above functions and fill in layer specific logics */
  /* -------------------------------------------------------------- */

  _throwUndefinedError(property) {
    throw new Error(property + ' is undefined in layer: ' + this.id);
  }

  _throwNotImplementedError(funcName) {
    throw new Error(funcName + ' is not implemented in layer: ' + this.id);
  }

}
