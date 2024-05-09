import {
  applyLayerGroupFilters,
  fetchBasemapStyle,
  getStyleUrl,
  someLayerGroupsDisabled
} from '../basemap';
import {APIErrorContext, KeplerMapConfig} from './types';

const CUSTOM_STYLE_ID_PREFIX = 'custom:';
const DEFAULT_CARTO_STYLE = 'positron';
const CARTO_MAP_STYLES = ['positron', 'dark-matter', 'voyager'];

export type BasemapType = 'maplibre' | 'google-maps';

export type BasemapProps = MaplibreBasemapProps | GoogleBasemapProps;

export type MaplibreBasemapProps = {
  /**
   * Type of basemap.
   */
  type: 'maplibre';

  /**
   * Basemap style URL or style object.
   *
   * Note,  layers in this style may be filtered by `visibleLayerGroups`.
   *
   * Non-filtered pristine version is stored in `rawStyle` property.
   */
  style: string | Record<string, any>;

  /**
   * Layer groups to be displayed in the basemap.
   */
  visibleLayerGroups?: Record<string, boolean>;

  /** If `style` has been filtered by `visibleLayerGroups` then this property contains original style object, so user
   * can use `applyLayerGroupFilters` again with new settings.
   */
  rawStyle?: string | Record<string, any>;

  /**
   * Custom attribution for style data if not provided by style definition.
   */
  attribution?: string;
};

export type GoogleBasemapProps = {
  /**
   * Type of basemap.
   */
  type: 'google-maps';

  /**
   * Google map options.
   */
  options: Record<string, any>;
};

const googleBasemapTypes = [
  {
    id: 'roadmap',
    options: {
      mapTypeId: 'roadmap',
      mapId: '3754c817b510f791'
    }
  },
  {
    id: 'google-positron',
    options: {
      mapTypeId: 'roadmap',
      mapId: 'ea84ae4203ef21cd'
    }
  },
  {
    id: 'google-dark-matter',
    options: {
      mapTypeId: 'roadmap',
      mapId: '2fccc3b36c22a0e2'
    }
  },
  {
    id: 'google-voyager',
    options: {
      mapTypeId: 'roadmap',
      mapId: '885caf1e15bb9ef2'
    }
  },
  {
    id: 'satellite',
    options: {
      mapTypeId: 'satellite'
    }
  },
  {
    id: 'hybrid',
    options: {
      mapTypeId: 'hybrid'
    }
  },
  {
    id: 'terrain',
    options: {
      mapTypeId: 'terrain'
    }
  }
];

export async function fetchBasemapProps({
  config,
  errorContext
}: {
  config: KeplerMapConfig;
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
    let rawStyle;
    if (visibleLayerGroups && someLayerGroupsDisabled(visibleLayerGroups)) {
      rawStyle = await fetchBasemapStyle({styleUrl, errorContext});
      style = applyLayerGroupFilters(rawStyle, visibleLayerGroups);
    }
    return {
      type: 'maplibre',
      visibleLayerGroups,
      style,
      rawStyle
    };
  }
  const googleBasemapDef = googleBasemapTypes.find(b => b.id === styleType);
  if (googleBasemapDef) {
    return {
      type: 'google-maps',
      options: googleBasemapDef.options
    };
  }
  return {
    type: 'maplibre',
    style: getStyleUrl(DEFAULT_CARTO_STYLE)
  };
}
