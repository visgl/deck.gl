import {CompositeLayer, PolygonLayer} from 'deck.gl';

const defaultStrokeColor = [0x33, 0x33, 0x33, 0xff];
const defaultFillColor = [0xbd, 0xe2, 0x7a, 0xff];

const defaultProps = {
  drawCells: true,
  fillCells: true,

  extrusion: false,
  wireframe: false,

  // Cell geometry
  getPolygon: x => x.polygon,
  getHeight: x => 0,

  // Cell outline accessors
  getStrokeColor: f => f.strokeColor || defaultStrokeColor,
  getStrokeWidth: f => f.strokeWidth || 1,

  // Cell fill accessors
  getFillColor: f => f.fillColor || defaultFillColor
};

export default class OutlinePolygonLayer extends CompositeLayer {
  initializeState() {}

  renderLayers() {
    const {id, getPolygon, getFillColor, getHeight} = this.props;
    const {extruded, wireframe} = this.props;

    // Filled Polygon Layer
    const polygonFillLayer = new PolygonLayer(
      Object.assign({}, this.props, {
        id: `${id}-polygon-fill`,
        getPolygon: x => getPolygon(x),
        getHeight,
        getColor: getFillColor,
        extruded,
        wireframe,
        updateTriggers: Object.assign({}, this.props.updateTriggers, {
          getColor: this.props.updateTriggers.getFillColor
        })
      })
    );

    // // Polygon outline or wireframe
    // let polygonOutlineLayer = null;
    // if (drawPolygons && extruded && wireframe) {

    //   polygonOutlineLayer = new PolygonLayer(Object.assign({}, this.props, {
    //     id: `${id}-polygon-wireframe`,
    //     getPolygon: x => getS2Polygon(getS2Token(x)),
    //     getHeight,
    //     getColor: getStrokeColor,
    //     extruded: true,
    //     wireframe: true,
    //     // Override user's onHover and onClick props
    //     onHover: this._onHoverSublayer.bind(this),
    //     onClick: noop,
    //     updateTriggers: {
    //       getColor: this.props.updateTriggers.getStrokeColor
    //     }
    //   }));

    // } else if (outline) {

    //   polygonOutlineLayer = new PathLayer(Object.assign({}, this.props, {
    //     id: `${id}-polygon-outline`,
    //     data: polygonOutlineFeatures,
    //     getPath: getCoordinates,
    //     getColor: getStrokeColor,
    //     getWidth: getStrokeWidth,
    //     // Override user's onHover and onClick props
    //     onHover: this._onHoverSublayer.bind(this),
    //     onClick: noop,
    //     updateTriggers: {
    //       getColor: this.props.updateTriggers.getStrokeColor,
    //       getWidth: this.props.updateTriggers.getStrokeWidth
    //     }
    //   }));
    // }

    return [
      polygonFillLayer
      // polygonOutlineLayer
    ];
  }
}

OutlinePolygonLayer.layerName = 'OutlinePolygonLayer';
OutlinePolygonLayer.defaultProps = defaultProps;
