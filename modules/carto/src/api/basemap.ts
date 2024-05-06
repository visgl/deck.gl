import {cartoBasemapsBaseUrl} from '../basemap';
import {KeplerMapConfig} from './types';

const DEFAULT_CARTO_STYLE = 'positron';
const CARTO_MAP_STYLES = ['positron', 'dark-matter', 'voyager'];
const CARTO_MAP_ATRRIBUTION = `© <a href="https://carto.com/about-carto/" target="_blank" rel="noopener noreferrer">CARTO</a>, ©
<a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors`;

export function getBasemapSettings(config: KeplerMapConfig) {
  const {mapStyle} = config;
  const styleType = mapStyle.styleType || DEFAULT_CARTO_STYLE;
  if (styleType.startsWith('custom:')) {
    const currentCustomStyle = config.customBaseMaps?.customStyle;
    if (currentCustomStyle) {
      return {
        style: currentCustomStyle.style || currentCustomStyle.url,
        attribution: currentCustomStyle.customAttribution
      };
    }
  }
  if (CARTO_MAP_STYLES.includes(styleType)) {
    const {label} = mapStyle.visibleLayerGroups;
    const labelSuffix = label ? '' : '-nolabels';
    const styleUrl = `${cartoBasemapsBaseUrl}${styleType}${labelSuffix}-gl-style/style.json`;
    return {
      style: styleUrl,
      attribution: CARTO_MAP_ATRRIBUTION
    };
  }
  return null;
}
