import {KeplerMapConfig} from './types';

const getRasterJsonMapStyle = (url: string) => ({
  version: 8,
  sources: {
    'basemap-tile-source': {
      type: 'raster',
      tiles: [url],
      tileSize: 256
    }
  },
  layers: [
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'basemap-tile-source',
      minzoom: 0,
      maxzoom: 22
    }
  ]
});

function isRasterBasemap(url: string) {
  return /.*(?=.*\{z\})(?=.*\{x\})(?=.*\{y\}).*/.test(url);
}

function isTileJsonBasemap(url: string) {
  return /.*(.json)/.test(url) && !url.includes('service=WMS');
}

function isWmtsBasemap(url: string) {
  return url.includes('service=WMS');
}

export function getCustomBasemapStyle(url: string): string | any {
  if (isRasterBasemap(url)) {
    return getRasterJsonMapStyle(url);
  } else if (isTileJsonBasemap(url)) {
    return url;
  } else if (isWmtsBasemap(url)) {
    return getRasterJsonMapStyle(url);
  }
  throw new Error('Unknown basemap format');
}

const CARTO_MAP_BASEURL = 'https://basemaps.cartocdn.com/gl/';
const CARTO_MAP_STYLES = ['positron', 'dark-matter', 'voyager'];
const CARTO_MAP_ATRRIBUTION = `© <a href="https://carto.com/about-carto/" target="_blank" rel="noopener noreferrer">CARTO</a>, ©
<a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors`;

export function getCartoMapStyle(config: KeplerMapConfig) {
  const {mapStyle} = config;
  const styleType = mapStyle.styleType || 'positron';
  if (styleType.startsWith('custom:')) {
    const currentCustomBasemap = config.customBaseMaps?.custom;
    if (currentCustomBasemap) {
      return {
        styleUrl: getCustomBasemapStyle(currentCustomBasemap.settings.url),
        attribution: currentCustomBasemap.attribution
      };
    }
  }
  if (CARTO_MAP_STYLES.includes(styleType)) {
    const {label} = mapStyle.visibleLayerGroups;
    const labelSuffix = label ? '' : '-nolabels';
    const styleUrl = `${CARTO_MAP_BASEURL}${mapStyle.styleType}${labelSuffix}-gl-style/style.json`;
    return {
      styleUrl,
      attribution: CARTO_MAP_ATRRIBUTION
    };
  }
  return null;
}
