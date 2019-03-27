"use strict";module.export({sampleViewport:()=>sampleViewport,sampleModelMatrix:()=>sampleModelMatrix},true);var WebMercatorViewport;module.link('deck.gl',{WebMercatorViewport(v){WebMercatorViewport=v}},0);var Matrix4;module.link('math.gl',{Matrix4(v){Matrix4=v}},1);


const sampleViewport = new WebMercatorViewport({
  width: 1024,
  height: 768,
  longitude: -122.4,
  latitude: 37.7,
  zoom: 11,
  pitch: 30,
  bearing: 0
});

const sampleModelMatrix = new Matrix4()
  .rotateX(0.1)
  .rotateY(-0.2)
  .translate([1, 1, 0]);
