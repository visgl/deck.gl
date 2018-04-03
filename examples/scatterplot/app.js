import {ScatterplotLayer} from 'deck.gl';
import {json as requestJson} from 'd3-request';

const MALE_COLOR = [0, 128, 255];
const FEMALE_COLOR = [255, 0, 128];

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/scatterplot/manhattan.json'; // eslint-disable-line

export default class App {

  constructor({onUpdated = () => {}} = {}) {
    this.data = null;
    requestJson(DATA_URL, (error, response) => {
      if (!error) {
        this.data = response;
        onUpdated();
      }
    });
  }

  getDefaultViewState() {
    return {
      longitude: -74,
      latitude: 40.7,
      zoom: 11,
      maxZoom: 16,
      pitch: 0,
      bearing: 0
    };
  }

  renderLayers(props) {
    const {
      maleColor = MALE_COLOR,
      femaleColor = FEMALE_COLOR,
      radius = 20
    } = props;

    return [
      this.data && new ScatterplotLayer({
        id: 'scatter-plot',
        data: this.data,
        radiusScale: radius,
        radiusMinPixels: 0.25,
        getPosition: d => [d[0], d[1], 0],
        getColor: d => (d[2] === 1 ? maleColor : femaleColor),
        getRadius: d => 1,
        updateTriggers: {
          getColor: [maleColor, femaleColor]
        }
      })
    ];
  }
}
