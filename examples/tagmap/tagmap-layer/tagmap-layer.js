/* eslint-disable max-len */
import {CompositeLayer, WebMercatorViewport, TextLayer} from 'deck.gl';
import {scaleQuantile} from 'd3-scale';
import TagMapWrapper from './tagmap-wrapper';

const DEFAULT_COLOR_SCHEME = [
  [29, 145, 192],
  [65, 182, 196],
  [127, 205, 187],
  [199, 233, 180],
  [237, 248, 177]
];

const defaultProps = {
  getLabel: x => x.label,
  getWeight: x => x.weight || 1,
  getPosition: x => x.coordinates,
  colorScheme: DEFAULT_COLOR_SCHEME,
  minFontSize: 14,
  maxFontSize: 32,
  weightThreshold: 1
};

export default class TagmapLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      // Cached tags per zoom level
      tagsCache: {},
      tags: []
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    let needsUpdate = changeFlags.viewportChanged;

    if (changeFlags.dataChanged) {
      this.updateTagMapData();
      needsUpdate = true;
    } else if (
      props.minFontSize !== oldProps.minFontSize ||
      props.maxFontSize !== oldProps.maxFontSize ||
      props.weightThreshold !== oldProps.weightThreshold
    ) {
      this.setState({tagsCache: {}});
      needsUpdate = true;
    }

    if (needsUpdate) {
      this.updateTagMapVis();
    }

    if (props.colorScheme !== oldProps.colorScheme) {
      // set color scheme
      const colorScale = scaleQuantile()
        .domain([props.minFontSize, props.maxFontSize])
        .range(props.colorScheme);
      this.setState({colorScale});
    }
  }

  updateTagMapData() {
    const {data, getLabel, getPosition, getWeight} = this.props;
    const tagMap = new TagMapWrapper();
    tagMap.setData(data, {getLabel, getPosition, getWeight});
    this.setState({tagMap, tagsCache: {}});
  }

  updateTagMapVis() {
    const {tagMap, tagsCache} = this.state;
    if (!tagMap) {
      return;
    }

    const {viewport} = this.context;
<<<<<<< HEAD
    const discreteZoomLevel = Math.floor(viewport.zoom);

    let tags = tagsCache[discreteZoomLevel];

    if (!tags) {
      const {minFontSize, maxFontSize, weightThreshold} = this.props;
      const transform = new WebMercatorViewport(
        Object.assign({}, viewport, {zoom: discreteZoomLevel})
      );
      tags = tagMap.getTags({transform, minFontSize, maxFontSize, weightThreshold});
      tagsCache[discreteZoomLevel] = tags;
=======
    const z = Math.floor(viewport.zoom);

    let tags = tagsCache[z];

    if (!tags) {
      const {minFontSize, maxFontSize, weightThreshold} = this.props;
      const transform = new WebMercatorViewport(Object.assign({}, viewport, {zoom: z}));
      tagMap.setVisParam({minFontSize, maxFontSize, weightThreshold});
      tags = tagMap.getTags({transform, viewport});
      tagsCache[z] = tags;
>>>>>>> improve tagmap layer example perf
    }

    this.setState({tags});
  }

  renderLayers() {
    const {tags, colorScale} = this.state;

    return [
      new TextLayer({
        id: 'tagmap-layer',
        data: tags,
        getText: d => d.label,
        getPosition: d => d.position,
        getColor: d => colorScale(d.height),
        getSize: d => d.height
      })
    ];
  }
}

TagmapLayer.layerName = 'TagmapLayer';
TagmapLayer.defaultProps = defaultProps;
