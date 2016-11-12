import {default as ScatterplotDemo} from './scatterplot';
import {default as ArcDemo} from './arc';
import {default as GridDemo} from './grid';
import {default as ChoroplethDemo} from './choropleth';
import {default as HeroDemo} from './hero';

class HomeDemo extends HeroDemo {

  static get data() {
    return [
      {
        ...HeroDemo.data[0],
        url: 'data/hero-data-s.txt'
      },
      {
        ...HeroDemo.data[1],
        url: 'data/building-data-s.txt'
      }
    ];
  }

  static get viewport() {
    return {
      ...HeroDemo.viewport,
      longitude: -74.01,
      latitude: 40.707,
      zoom: 14,
      pitch: 40
    };
  }

}

export default {
  ScatterplotDemo,
  ArcDemo,
  GridDemo,
  ChoroplethDemo,
  HeroDemo,
  HomeDemo
};