/* global console, document, window */
import React, {Component} from 'react';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';

const HOST = 'https://maps.googleapis.com/maps/api/js';
const LOADING_GIF = 'https://upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif';

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
      gmapsLoaded: false
    };
  }

  componentDidMount() {
    const {googleMapsApiKey} = this.props;
    if (!window.google) {
      loadGoogleMapApi(googleMapsApiKey, () => {
        this.setState({fetchGMapsScript: true});
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Loaded
    if (window.google && this.state.fetchGMapsScript) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({fetchGMapsScript: false, gmapsLoaded: true});
    }
  }

  render() {
    const {gmapsLoaded} = this.state;
    if (!gmapsLoaded) {
      return <img src={LOADING_GIF} alt="Loading Google Maps overlay..." />;
    }

    // const {view = []} = this.props;

    return <DeckOverlayWrapper />;
  }
}

class DeckOverlayWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasBasemap: false
    };
    this.DeckOverlay = new GoogleMapsOverlay();
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const view = {
      center: {lat: 48.868, lng: 2.312},
      zoom: 15
    };

    const map = new window.google.maps.Map(this.containerRef, view);
    this.DeckOverlay.setMap(map);
    // eslint-disable-next-line react/no-did-mount-set-state
    this.DeckOverlay.setProps(this.props.layers);
    this.setState({hasBasemap: true});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      this.DeckOverlay.setProps(this.props);
    }
  }

  render() {
    if (!this.state.hasBasemap) {
      return <div ref={this.containerRef}>No map</div>;
    }
    return <div ref={this.containerRef}>Map</div>;
  }
}
