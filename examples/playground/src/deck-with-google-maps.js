/* global console, document, window */
import React, {Component} from 'react';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';

const HOST = 'https://maps.googleapis.com/maps/api/js';
const LOADING_GIF = 'https://upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif';

const style = {
  height: 1000,
  width: 1000
};

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', resolve);
    script.addEventListener('error', e => reject(e.error));
    document.head.appendChild(script);
  });
}

function loadGoogleMapApi(apiKey, onComplete) {
  const url = `${HOST}?key=${apiKey}&libraries=places`;
  injectScript(url)
    .then(() => onComplete())
    // eslint-disable-next-line no-console
    .catch(e => console.error(e));
}

export default class DeckWithGoogleMaps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      googleMapsLoaded: window.google && window.google.maps
    };
  }

  componentDidMount() {
    const {googleMapsToken} = this.props;
    if (!window.google || (window.google && !window.google.maps)) {
      loadGoogleMapApi(googleMapsToken, () => {
        this.setState({googleMapsLoaded: true});
      });
    }
  }

  render() {
    const {googleMapsLoaded} = this.state;
    if (!googleMapsLoaded) {
      return <img src={LOADING_GIF} alt="Loading Google Maps overlay..." />;
    }

    return <DeckOverlayWrapper {...this.props} />;
  }
}

class DeckOverlayWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOverlayConfigured: false
    };
    this.DeckOverlay = new GoogleMapsOverlay({layers: []});
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const {initialViewState} = this.props;
    const view = {
      center: {lat: initialViewState.latitude, lng: initialViewState.longitude},
      mapTypeId: this.props.mapTypeId || 'satellite',
      zoom: initialViewState.zoom
    };

    const map = new window.google.maps.Map(this.containerRef.current, view);
    this.DeckOverlay.setMap(map);
    this.DeckOverlay.setProps({layers: this.props.layers});
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({isOverlayConfigured: true});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.DeckOverlay.setProps({layers: this.props.layers});
  }

  componentWillUnmount() {
    delete this.DeckOverlay;
  }

  render() {
    return <div ref={this.containerRef} style={style} />;
  }
}
