export default class ViewState {
  constructor(props, constraints, userData = {}) {
    this.props = props;
    this.constraints = constraints;
    this.userData = userData;
    Object.freeze(this);
  }

  toString(opts) {
    return this._formatString(opts);
  }

  // Returns same object if nothing changes (after clamping)
  getUpdatedState(props) {
    const newViewState = new ViewState(
      Object.assign({}, this.props, props),
      this.constraints,
      this.userData
    );

    const viewStateChanged = Object.keys(props).some(
      key => this.props[key] !== newViewState.props[key]
    );

    return viewStateChanged ? newViewState : this;
  }

  // Private

  // Apply any constraints to map state
  _applyConstraints(props, constraints) {
    return this._checkProps(props);
  }

  // prints as [posx,posy,posz]:bearing:pitch@lng,lat,zoom
  _formatString({precision = 3, geoPrecision = 8} = {}) {
    let lngLatAnchorString = '';
    if (this.isGeospatial()) {
      const {longitude, latitude, zoom} = this.props;
      lngLatAnchorString = `\
${longitude.toPrecision(geoPrecision)},${latitude.toPrecision(geoPrecision)},\
${zoom.toPrecision(precision)}`;
    }
    const {pitch, bearing} = this.props;
    const p = this.props.position;
    return `\
[${p[0].toPrecision(3)},${p[0].toPrecision(3)},${p[0].toPrecision(3)}]\
:${bearing.toPrecision(precision)}:${pitch.toPrecision(precision)}\
@${lngLatAnchorString}`;
  }
}
