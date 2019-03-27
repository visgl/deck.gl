"use strict";module.export({experimental:()=>experimental});module.link('@deck.gl/core',{COORDINATE_SYSTEM:"COORDINATE_SYSTEM",Deck:"Deck",Layer:"Layer",CompositeLayer:"CompositeLayer",View:"View",MapView:"MapView",FirstPersonView:"FirstPersonView",ThirdPersonView:"ThirdPersonView",OrbitView:"OrbitView",PerspectiveView:"PerspectiveView",OrthographicView:"OrthographicView",Viewport:"Viewport",WebMercatorViewport:"WebMercatorViewport",Controller:"Controller",MapController:"MapController",AttributeManager:"AttributeManager",project:"project",project64:"project64",LayerManager:"LayerManager",DeckRenderer:"DeckRenderer",log:"log",_OrbitController:"_OrbitController",_FirstPersonController:"_FirstPersonController",TRANSITION_EVENTS:"TRANSITION_EVENTS",LinearInterpolator:"LinearInterpolator",FlyToInterpolator:"FlyToInterpolator",Effect:"Effect",LightingEffect:"LightingEffect"},0);var CoreExperimental;module.link('@deck.gl/core',{experimental(v){CoreExperimental=v}},1);var AggregationExperimental;module.link('@deck.gl/aggregation-layers',{experimental(v){AggregationExperimental=v}},2);module.link('@deck.gl/layers',{ArcLayer:"ArcLayer",BitmapLayer:"BitmapLayer",IconLayer:"IconLayer",LineLayer:"LineLayer",PointCloudLayer:"PointCloudLayer",ScatterplotLayer:"ScatterplotLayer",GridCellLayer:"GridCellLayer",ColumnLayer:"ColumnLayer",PathLayer:"PathLayer",PolygonLayer:"PolygonLayer",SolidPolygonLayer:"SolidPolygonLayer",GeoJsonLayer:"GeoJsonLayer",TextLayer:"TextLayer"},3);module.link('@deck.gl/aggregation-layers',{ScreenGridLayer:"ScreenGridLayer",GridLayer:"GridLayer",HexagonLayer:"HexagonLayer",ContourLayer:"ContourLayer"},4);module.link('@deck.gl/geo-layers',{GreatCircleLayer:"GreatCircleLayer",S2Layer:"S2Layer",H3ClusterLayer:"H3ClusterLayer",H3HexagonLayer:"H3HexagonLayer",TileLayer:"TileLayer",TripsLayer:"TripsLayer"},5);module.link('@deck.gl/mesh-layers',{SimpleMeshLayer:"SimpleMeshLayer",ScenegraphLayer:"ScenegraphLayer"},6);module.link('@deck.gl/react',{default:"default",DeckGL:"DeckGL"},7);module.link('luma.gl',{AmbientLight:"AmbientLight",PointLight:"PointLight",DirectionalLight:"DirectionalLight"},8);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
/* eslint-disable max-len */

const experimental = {};

//
// CORE LIBRARY
//













































// EXPERIMENTAL CORE LIB CLASSES (May change in minor version bumps, use at your own risk)



// Experimental Data Accessor Helpers
// INTERNAL - TODO remove from experimental exports
const {
  // For layers
  count,
  flattenVertices,
  fillArray
} = CoreExperimental;

const {
  BinSorter,
  linearScale,
  getLinearScale,
  quantizeScale,
  getQuantizeScale,
  defaultColorRange
} = AggregationExperimental;

Object.assign(experimental, {
  // For layers
  BinSorter,
  linearScale,
  getLinearScale,
  quantizeScale,
  getQuantizeScale,
  defaultColorRange,
  count,
  flattenVertices,
  fillArray
});

//
// LAYERS PACKAGES
//






























//
// REACT BINDINGS PACKAGE
//





//
// EXPERIMENTAL EXPORTS
//


