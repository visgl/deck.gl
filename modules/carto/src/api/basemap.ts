import {
  GOOGLE_BASEMAPS,
  CARTO_MAP_STYLES,
  applyLayerGroupFilters,
  fetchStyle,
  getStyleUrl,
  someLayerGroupsDisabled
} from '../basemap';
import {APIErrorContext, KeplerMapConfig} from './types';

const CUSTOM_STYLE_ID_PREFIX = 'custom:';
const DEFAULT_CARTO_STYLE = 'positron';

export type BasemapType = 'maplibre' | 'google-maps';

export type BasemapProps = MaplibreBasemapProps | GoogleBasemapProps;

type BasemapPropsBase = {
  /**
   * Type of basemap.
   */
  type: BasemapType;

  /**
   * Custom attribution for style data if not provided by style definition.
   */
  attribution?: string;
};

export type MaplibreBasemapProps = BasemapPropsBase & {
  type: 'maplibre';

  /**
   * Basemap style URL or style object.
   *
   * Note, layers in this style may be filtered by `visibleLayerGroups`.
   *
   * Non-filtered pristine version is stored in `rawStyle` property.
   */
  style: string | Record<string, any>;

  /**
   * Layer groups to be displayed in the basemap.
   */
  visibleLayerGroups?: Record<string, boolean>;

  /**
   * If `style` has been filtered by `visibleLayerGroups` then this property contains original style object, so user
   * can use `applyLayerGroupFilters` again with new settings.
   */
  rawStyle?: string | Record<string, any>;
};

export type GoogleBasemapProps = BasemapPropsBase & {
  type: 'google-maps';

  /**
   * Google map options.
   */
  options: Record<string, any>;
};

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
}): Promise<BasemapProps | null> {
  const {mapStyle} = config;
  const styleType = mapStyle.styleType || DEFAULT_CARTO_STYLE;
  if (styleType.startsWith(CUSTOM_STYLE_ID_PREFIX)) {
    const currentCustomStyle = config.customBaseMaps?.customStyle;
    if (currentCustomStyle) {
      return {
        type: 'maplibre',
        style: currentCustomStyle.style || currentCustomStyle.url,
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
      visibleLayerGroups,
      style,
      rawStyle
    };
  }
  const googleBasemapDef = GOOGLE_BASEMAPS[styleType];
  if (googleBasemapDef) {
    return {
      type: 'google-maps',
      options: googleBasemapDef
    };
  }
  return {
    type: 'maplibre',
    style: getStyleUrl(DEFAULT_CARTO_STYLE)
  };
}
