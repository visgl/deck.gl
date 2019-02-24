//VARIABLES
declare var props: {
  latitude: number,
  longitude: number,
  zoom: number,
  pitch: number,
  bearing: number
};

declare const CANVAS_STYLE: {
  position: string,
  left: number,
  top: number,
  width: string,
  height: string
};

//FUNCTIONS
declare function getViewState(props): props;

declare function createCanvas(props): {container, mapCanvas, deckCanvas};

//CLASSES
declare class DECKGL {
  constructor(props): DECKGL;

}
