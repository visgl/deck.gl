/* global fetch */
import {COORDINATE_SYSTEM} from './constants';
import {getDefaultProps} from './props';
import {applyPropOverrides} from './seer-integration';

const EMPTY_ARRAY = [];
const noop = () => {};

const defaultProps = {
  // data: Special handling for null, see below
  dataComparator: null,
  fetch: url => fetch(url).then(response => response.json()),
  updateTriggers: {}, // Update triggers: a core change detection mechanism in deck.gl
  numInstances: undefined,

  visible: true,
  pickable: false,
  opacity: 0.8,

  onHover: noop,
  onClick: noop,

  coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
  coordinateOrigin: [0, 0, 0],

  parameters: {},
  uniforms: {},
  framebuffer: null,

  animation: null, // Passed prop animation functions to evaluate props

  // Offset depth based on layer index to avoid z-fighting.
  // Negative values pull layer towards the camera
  // https://www.opengl.org/archives/resources/faq/technical/polygonoffset.htm
  getPolygonOffset: ({layerIndex}) => [0, -layerIndex * 100],

  // Selection/Highlighting
  highlightedObjectIndex: null,
  autoHighlight: false,
  highlightColor: [0, 0, 128, 128]
};

export default class LayerProps {
  // Helper for constructor, merges props with default props and freezes them
  constructor(props, layer) {
    this._layer = layer;
    props = this.normalize(props);
    Object.assign(this, props);
    // Props are immutable
    Object.freeze(this);
  }

  normalize(props) {
    // If sublayer has static defaultProps member, getDefaultProps will return it
    const mergedDefaultProps = getDefaultProps(this._layer);
    // Merge supplied props with pre-merged default props
    props = Object.assign({}, mergedDefaultProps, props);
    // Accept null as data - otherwise apps and layers need to add ugly checks
    // Use constant fallback so that data change is not triggered
    props.data = props.data || EMPTY_ARRAY;
    // Apply any overrides from the seer debug extension if it is active
    applyPropOverrides(props);
    return props;
  }
}

LayerProps.defaultProps = defaultProps;
