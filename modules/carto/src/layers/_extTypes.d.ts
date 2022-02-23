// TODO: remove once @deck.gl/core has proper typings

declare module '@deck.gl/core' {
  class CompositeLayer {
    props: any;
    state: any;
    setState(newState: any): void;
    getSubLayers(): any[];
    getSubLayerProps(props: any): any;
    get isLoaded(): boolean;
  }

  interface LayerProps {
    id: string;
    data: any;
    updateTriggers: any;
    onDataLoad: (data: any) => void;
    onDataError: (err: any) => void;
  }

  const log: any;
}

declare module '@deck.gl/geo-layers' {
  function _getURLFromTemplate(data, tile);

  class MVTLayer {
    static defaultProps: any;
    props: any;
    state: any;
    setState(newState: any): void;
    getLoadOptions(): any;
  }
}
