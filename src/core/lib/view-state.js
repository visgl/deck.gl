import {experimental} from 'math.gl';
const {SphericalCoordinates} = experimental;
import assert from 'assert';

const defaultProps = {
  position: [0, 0, 0], // typically in meters from anchor point
  bearing: 0, // Rotation around y axis
  pitch: 0, // Rotation around x axis

  // Geospatial anchor
  longitude: null,
  latitude: null,
  zoom: null
};

export default class ViewState {

  constructor(props, constraints, userData = {}) {
    props = this._mergeProps(props, defaultProps);
    props = this._applyConstraints(props, constraints);
    props = this._checkProps(props);
    this.props = props;
    this.userData = userData;
    Object.freeze(this);
  }

  toString(opts) {
    return this._formatString(opts);
  }

  getViewportProps() {
    return this.props;
  }

  isGeospatial() {
    return Number.isFinite(this.props.zoom) &&
      Number.isFinite(this.props.longitude) &&
      Number.isFinite(this.props.latitude);
  }

  get position() {
    return this.props.position;
  }

  get pitch() {
    return this.props.pitch;
  }

  get bearing() {
    return this.props.bearing;
  }

  get longitude() {
    return this.props.longitude;
  }

  get latitude() {
    return this.props.latitude;
  }

  get zoom() {
    return this.props.zoom;
  }

  getPosition() {
    return this.props.position;
  }

  getPitch() {
    return this.props.pitch;
  }

  getBearing() {
    return this.props.bearing;
  }

  getDirection() {
    const spherical = new SphericalCoordinates({
      bearing: this.props.bearing,
      pitch: this.props.pitch
    });
    return spherical.toVector3().normalize();
  }

  getZoom() {
    return this.props.zoom;
  }

  // Returns same object if nothing changes (after clamping)
  getUpdatedState(props, constraints) {
    props = this._mergeProps(props, this.props);
    const newViewState = new ViewState(props, constraints, this.userData);

    const viewStateChanged =
      Object.keys(props).some(key => this.props[key] !== newViewState.props[key]);

    return viewStateChanged ? newViewState : this;
  }

  // Private

  getDirectionFromBearing(bearing) {
    const spherical = new SphericalCoordinates({
      bearing,
      pitch: 90
    });
    const direction = spherical.toVector3().normalize();
    return direction;
  }

  // ensure only supported props are included and merge with existing props
  _mergeProps(props, oldProps) {
    return {
      position: props.position || oldProps.position,
      bearing: props.bearing !== undefined ? props.bearing : oldProps.bearing,
      pitch: props.pitch !== undefined ? props.pitch : oldProps.pitch,

      longitude: props.longitude !== undefined ? props.longitude : oldProps.longitude,
      latitude: props.latitude !== undefined ? props.latitude : oldProps.latitude,
      zoom: props.zoom !== undefined ? props.zoom : oldProps.zoom
    };
  }

  // Apply any constraints to map state
  _applyConstraints(props, constraints) {
    return this._checkProps(props);
  }

  _checkProps(props) {
    assert(
      props.position &&
      props.position.length >= 3 &&
      Number.isFinite(props.position[0]) &&
      Number.isFinite(props.position[1]) &&
      Number.isFinite(props.position[2])
    );
    assert(Number.isFinite(props.bearing));
    assert(Number.isFinite(props.pitch));
    assert(!props.longitude || Number.isFinite(props.longitude));
    assert(!props.latitude || Number.isFinite(props.latitude));
    assert(!props.zoom || Number.isFinite(props.zoom));
    return props;
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
