/* eslint-disable */
import React, {useState} from 'react';
import {render} from 'react-dom';
import DeckGL, {GeoJsonLayer, ArcLayer, MVTLayer} from 'deck.gl';
import {debounce} from 'debounce';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 28.380565,
  longitude: -82.969324,

  // latitude: 40.416729,
  // longitude: -3.703339,
  zoom: 7,
  bearing: 0,
  pitch: 30
};

const onViewportChange = e => {
  const features = e.getRenderedFeatures();
  console.log(features);
};

function Root() {
  const onClick = info => {
    if (info.object) {
      alert(info.object.geometry.coordinates);
      // eslint-disable-next-line
      // alert(`${info.object.properties.name} (${info.object.properties.abbrev})`);
    }
  };

  return (
    <DeckGL controller={true} initialViewState={INITIAL_VIEW_STATE}>
      {/* <GeoJsonLayer
        id="base-map"
        data={COUNTRIES}
        stroked={true}
        filled={true}
        lineWidthMinPixels={2}
        opacity={0.4}
        getLineColor={[60, 60, 60]}
        getFillColor={[200, 200, 200]}
      /> */}
      <MVTLayer
        id="test"
        data={
          // 'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/ne_50m_rivers_lake_centerlines'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/carto/table?source=ne_50m_admin_1_states&format=tilejson'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/multipolygon'
          //'https://maps-api-v2.us.carto.com/user/aasuero/tilejson/sql/postgres/natural_earth_geography_glo_ports_410'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/carto/table?source=carto_geography_usa_zcta5_2015&format=tilejson'
          // 'https://maps-api-v2.us.carto.com/user/aasuero/carto/table?source=carto_geography_usa_blockgroup_2015&format=tilejson'
          'https://maps-api-v2.us.carto.com/user/aasuero/bigquery/tileset?source=cartodb-gcp-backend-data-team.alasarr.usa_zcta_2015_tileset&format=tilejson'
        }
        filled={true}
        pointRadiusMinPixels={5}
        pointRadiusScale={2000}
        getRadius={20}
        getFillColor={[0, 0, 255]}
        getLineColor={[0, 0, 0, 0]}
        lineWidthUnits={'pixels'}
        lineWidthMinPixels={1}
        pickable={true}
        autoHighlight={false}
        binary={false}
        onHover={onClick}
        // onViewportChange={debounce(onViewportChange, 400)}
        //  maxFeatures={1000}
        uniqueIdProperty={'cartodb_id'}
      />
    </DeckGL>
  );
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
