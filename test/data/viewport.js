import {WebMercatorViewport} from 'deck.gl';
import {Matrix4} from 'math.gl';

export const sampleViewport = new WebMercatorViewport({
  width: 1024,
  height: 768,
  longitude: -122.4,
  latitude: 37.7,
  zoom: 11,
  pitch: 30,
  bearing: 0
});

export const sampleModelMatrix = new Matrix4()
  .rotateX(0.1)
  .rotateY(-0.2)
  .translate([1, 1, 0]);
