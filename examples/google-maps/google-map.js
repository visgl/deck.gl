import React, {PropTypes, PureComponent} from 'react';
import autobind from 'react-autobind';
import GoogleMapReact from 'google-map-react';

const DEFAULT_API_KEY = process.env.GoogleMapsKey; // eslint-disable-line

export default class GoogleMap extends PureComponent {

  constructor(props) {
    super(props);
    autobind(this);
  }

  _onChange({center, zoom, bounds, marginBounds}) {
    const {lat: latitude, lng: longitude} = center;
    console.log('Viewport Change', center, longitude, latitude, zoom); // eslint-disable-line
    // this.props.onViewportChanged({longitude, latitude, zoom});
  }

  render() {
    const {longitude, latitude, zoom, width, height, apiKey, children} = this.props;
    const center = [latitude, longitude];
    const key = apiKey || DEFAULT_API_KEY;
    if (!key) {
      throw new Error('Google Maps API Key not set. Use GoogleMapsKey env variable or set in code');
    }
    console.log(key); // eslint-disable-line
    return (
      <div style={{width, height}}>
        <GoogleMapReact
          bootstrapURLKeys={{key}}
          center={center}
          zoom={zoom}
          onChange={this._onChange}>

          {children}

        </GoogleMapReact>
      </div>
    );
  }
}

GoogleMap.propTypes = {
  apiKey: PropTypes.string,
  /** The width of the map */
  width: PropTypes.number.isRequired,
  /** The height of the map */
  height: PropTypes.number.isRequired,
  /** The latitude of the center of the map. */
  latitude: PropTypes.number.isRequired,
  /** The longitude of the center of the map. */
  longitude: PropTypes.number.isRequired,
  /** The tile zoom level of the map. */
  zoom: PropTypes.number.isRequired,
  /** Specify the bearing of the viewport */
  bearing: React.PropTypes.number,
  /** Specify the pitch of the viewport */
  pitch: React.PropTypes.number
};

GoogleMap.defaultProps = {
  onViewportChanged: () => {}
};
