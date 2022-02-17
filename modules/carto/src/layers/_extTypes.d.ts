// TODO: remove once @deck.gl/core has proper typings

declare module '@deck.gl/core' {
  export class CompositeLayer {
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

  export const log: any;
}
