import {TileSourceLayer, TileSourceLayerProps} from '../tile-source-layer/TileSourceLayer';
import {PMTilesSource} from '@loaders.gl/pmtiles';

export type PMTLayerProps = Omit<TileSourceLayerProps, 'tileSource'> & {url: string};
export default class PMTLayer extends TileSourceLayer {
  static layerName = 'PMTLayer';

  constructor(props: PMTLayerProps) {
    super({...props, tileSource: new PMTilesSource({url: props.url})});
  }
}
