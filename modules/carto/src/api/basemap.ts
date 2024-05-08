import {getBasemapStyle, getStyleUrl} from '../basemap';
import {APIErrorContext, KeplerMapConfig} from './types';

const CUSTOM_STYLE_ID_PREFIX = 'custom:';
const DEFAULT_CARTO_STYLE = 'positron';
const CARTO_MAP_STYLES = ['positron', 'dark-matter', 'voyager'];

type BasemapProps = {
  style: string | unknown;
  attribution?: string;
};

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
        style: currentCustomStyle.style || currentCustomStyle.url,
        attribution: currentCustomStyle.customAttribution
      };
    }
  }
  if (CARTO_MAP_STYLES.includes(styleType)) {
    const {visibleLayerGroups} = mapStyle;
    return {
      style: await getBasemapStyle({styleType, visibleLayerGroups, errorContext})
    };
  }
  return {
    style: getStyleUrl(DEFAULT_CARTO_STYLE)
  };
}
