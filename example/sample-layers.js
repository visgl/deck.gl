import {
  HexagonLayer,
  ChoroplethLayer,
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  GridLayer
} from '../src';

export function GridLayerExample(props) {
  const {mapViewState, points} = props;

  return new GridLayer({
    id: 'gridLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: mapViewState.latitude,
    longitude: mapViewState.longitude,
    zoom: mapViewState.zoom,
    isPickable: false,
    opacity: 0.06,
    data: points
  });
}

export function ChoroplethContourLayerExample(props) {
  const {mapViewState, choropleths} = props;
  return new ChoroplethLayer({
    id: 'choroplethContourLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: mapViewState.latitude,
    longitude: mapViewState.longitude,
    zoom: mapViewState.zoom,
    data: choropleths,
    opacity: 0.8,
    drawContour: true
  });
}

export function ChoroplethLayerExample(props) {
  const {mapViewState, choropleths} = props;
  return new ChoroplethLayer({
    id: 'choroplethLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: mapViewState.latitude,
    longitude: mapViewState.longitude,
    zoom: mapViewState.zoom,
    data: choropleths,
    opacity: 0.01,
    isPickable: true,
    onHover: props.onChoroplethHovered,
    lick: props.onChoroplethClicked
  });
}

export function HexagonLayerExample(props) {
  const {mapViewState, hexData} = props;

  return new HexagonLayer({
    id: 'hexagonLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: mapViewState.latitude,
    longitude: mapViewState.longitude,
    zoom: mapViewState.zoom,
    data: hexData,
    opacity: 0.5,
    elevation: 200,
    isPickable: true,
    onHover: props.onHexagonHovered,
    onClick: props.onHexagonClicked
  });
}

export function HexagonSelectionLayerExample(props) {
  const {mapViewState} = props;
  const {selectedHexagons} = props;

  return new HexagonLayer({
    id: 'hexagonSelectionLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: mapViewState.latitude,
    longitude: mapViewState.longitude,
    zoom: mapViewState.zoom,
    data: selectedHexagons,
    opacity: 0.1,
    elevation: 200,
    isPickable: false
  });
}

export function ScatterplotLayerExample(props) {
  const {mapViewState, points} = props;

  return new ScatterplotLayer({
    id: 'scatterplotLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: mapViewState.latitude,
    longitude: mapViewState.longitude,
    zoom: mapViewState.zoom,
    // data: points,
    isPickable: true,
    onHover: props.onScatterplotHovered,
    onClick: props.onScatterplotClicked
  });
}

export function ArcLayerExample(props) {
  const {mapViewState, arcs} = props;

  return new ArcLayer({
    id: 'arcLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: mapViewState.latitude,
    longitude: mapViewState.longitude,
    zoom: mapViewState.zoom,
    data: arcs,
    strokeWidth: props.arcStrokeWidth || 1,
    isPickable: true,
    onHover: props.onArcHovered,
    onClick: props.onArcClicked
  });
}

export function ArcLayer2Example(props) {
  const {mapViewState, arcs2} = props;

  return new ArcLayer({
    id: 'arcLayer2',
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: mapViewState.latitude,
    longitude: mapViewState.longitude,
    zoom: mapViewState.zoom,
    data: arcs2,
    strokeWidth: props.arcStrokeWidth || 1,
    isPickable: true,
    onHover: props.onArcHovered,
    onClick: props.onArcClicked
  });
}

export function LineLayerExample(props) {
  const {mapViewState, lines} = props;

  return new LineLayer({
    id: 'lineLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: mapViewState.latitude,
    longitude: mapViewState.longitude,
    zoom: mapViewState.zoom,
    data: lines,
    strokeWidth: props.lineStrokeWidth || 1,
    isPickable: true,
    onHover: props.onLineHovered,
    onClick: props.onLineClicked
  });
}

export default {
  GridLayer: GridLayerExample,
  ChoroplethContourLayer: ChoroplethContourLayerExample,
  ChoroplethLayer: ChoroplethLayerExample,
  HexagonLayer: HexagonLayerExample,
  HexagonSelectionLayer: HexagonSelectionLayerExample,
  ScatterplotLayer: ScatterplotLayerExample,
  ArcLayer: ArcLayerExample,
  ArcLayer2: ArcLayer2Example,
  LineLayer: LineLayerExample
};
