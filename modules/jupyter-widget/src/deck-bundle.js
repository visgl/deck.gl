/**
 * Pulls together all deck.gl dependencies used
 * in @deck.gl/jupyter-widget
 */
import deck from '../../core/bundle';
import * as deckglLayers from '@deck.gl/layers';
import * as deckglAggregationLayers from '@deck.gl/aggregation-layers';
import * as deckglGeoLayers from '@deck.gl/geo-layers';
import * as deckglMeshLayers from '@deck.gl/mesh-layers';
import * as GoogleMapsUtils from '@deck.gl/google-maps';
import * as JSONUtils from '@deck.gl/json';

Object.assign(
  deck,
  deckglLayers,
  deckglAggregationLayers,
  deckglGeoLayers,
  deckglMeshLayers,
  GoogleMapsUtils,
  JSONUtils
);

export default deck;
