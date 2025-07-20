// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapViewState} from '@deck.gl/core';
import {
  GOOGLE_BASEMAPS,
  CARTO_MAP_STYLES,
  applyLayerGroupFilters,
  fetchStyle,
  getStyleUrl,
  someLayerGroupsDisabled
} from '../basemap';
import {Basemap, KeplerMapConfig, MapLibreBasemapProps} from './types';
import {APIErrorContext} from '@carto/api-client';

const CUSTOM_STYLE_ID_PREFIX = 'custom:';
const DEFAULT_CARTO_STYLE = 'positron';

function mapLibreViewpros(config: KeplerMapConfig): Omit<MapLibreBasemapProps, 'style'> {
  const {longitude, latitude, ...rest} = config.mapState as MapViewState;
  return {
    center: [longitude, latitude],
    ...rest
  };
}

/**
 * Get basemap properties for Carto map.
 *
 * For maplibre-based basemaps it returns style or style URL that can be used with  `maplibregl.Map` compatible component.
 *  * style url is returned for non-filtered standard Carto basemaps or if user used style URL directly in configuration
 *  * filtered style object returned for Carto basemaps with layer groups filtered
 *
 * For Google-maps base maps, it returns options that can be used with `google.maps.Map` constructor.
 */
export async function fetchBasemapProps({
  config,
  errorContext,

  applyLayerFilters = true
}: {
  config: KeplerMapConfig;

  /** By default `fetchBasemapProps` applies layers filters to style. Set this to `false` to disable it. */
  applyLayerFilters?: boolean;
  errorContext?: APIErrorContext;
}): Promise<Basemap | null> {
  const {mapStyle} = config;
  const styleType = mapStyle.styleType || DEFAULT_CARTO_STYLE;
  if (styleType.startsWith(CUSTOM_STYLE_ID_PREFIX)) {
    const currentCustomStyle = config.customBaseMaps?.customStyle;
    if (currentCustomStyle) {
      return {
        type: 'maplibre',
        props: {
          style: currentCustomStyle.style || currentCustomStyle.url,
          ...mapLibreViewpros(config)
        },
        attribution: currentCustomStyle.customAttribution
      };
    }
  }

  if (CARTO_MAP_STYLES.includes(styleType)) {
    const {visibleLayerGroups} = mapStyle;
    const styleUrl = getStyleUrl(styleType);
    let style = styleUrl;
    let rawStyle = styleUrl;
    if (applyLayerFilters && visibleLayerGroups && someLayerGroupsDisabled(visibleLayerGroups)) {
      rawStyle = await fetchStyle({styleUrl, errorContext});
      style = applyLayerGroupFilters(rawStyle, visibleLayerGroups);
    }
    return {
      type: 'maplibre',
      props: {
        style,
        ...mapLibreViewpros(config)
      },
      visibleLayerGroups,
      rawStyle
    };
  }
  const googleBasemapDef = GOOGLE_BASEMAPS[styleType];
  if (googleBasemapDef) {
    const {mapState} = config;
    return {
      type: 'google-maps',
      props: {
        ...googleBasemapDef,
        center: {lat: mapState.latitude, lng: mapState.longitude},
        zoom: mapState.zoom + 1,
        tilt: mapState.pitch,
        heading: mapState.bearing
      }
    };
  }
  return {
    type: 'maplibre',
    props: {
      style: getStyleUrl(DEFAULT_CARTO_STYLE),
      ...mapLibreViewpros(config)
    }
  };
}
