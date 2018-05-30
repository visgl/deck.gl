import TripsDemo from './trips-demo';
import {DATA_URI} from '../../constants/defaults';

export default class HomeDemo extends TripsDemo {

  static get data() {
    return [
      {...TripsDemo.data[0], url: `${DATA_URI}/trips-data-s.txt`},
      {...TripsDemo.data[1], url: `${DATA_URI}/building-data-s.txt`}
    ];
  }

  static get viewport() {
    return {
      ...TripsDemo.viewport,
      longitude: -74.01,
      latitude: 40.707,
      zoom: 14,
      pitch: 40
    };
  }
}
