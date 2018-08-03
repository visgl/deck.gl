import {Deck, MapView, FirstPersonView, OrbitView, OrthographicView} from '@deck.gl/core';
import JSONLayer from '../json-layer/json-layer';
import {shallowEqualObjects} from '../utils/shallow-equal-objects.js';

const DEFAULT_VIEW_CATALOG = {MapView, FirstPersonView, OrbitView, OrthographicView};

export default class JSONDeck {
  constructor(props) {
    this._onViewStateChange = this._onViewStateChange.bind(this);

    props = this._getDeckPropsFromJson(props);
    this.deck = this._createDeck(props);
    this._setProps(props);
  }

  finalize() {
    if (this.deck) {
      this.deck.finalize();
      this.deck = null;
    }
  }

  setProps(props) {
    props = this._getDeckPropsFromJson(props);
    this._setProps(props);
  }

  // PRIVATE

  _createDeck(props) {
    const newProps = props;

    // Set any configuraton props
    newProps.onViewStateChange = this._onViewStateChange;

    // overwrite any critical initialization props. TODO - is this needed?
    if ('canvas' in props) {
      newProps.canvas = props.canvas;
    }

    return new Deck(newProps);
  }

  _setProps(props) {
    if ('layerCatalog' in props) {
      this.layerCatalog = props.layerCatalog;
    }

    this.deck.setProps(props);
  }

  _onViewStateChange({viewState}) {
    this.deck.setProps({viewState});
  }

  // Lightly process `json` props and extract `views` and `layers`
  //
  // NOTE: This is only intended to provide any minimal necessary processing required to support
  // existing deck.gl props via JSON, and not implementation of alternate JSON schemas.
  // Optionally, error checking could be applied, but ideally should leverage non-JSON specific
  // mechanisms like prop types.
  // See: https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md
  _getDeckPropsFromJson(newProps) {
    // Accept JSON strings by parsing them
    const json = typeof newProps.json === 'string' ? JSON.parse(newProps.json) : newProps.json;

    // Props for the top level `Deck` component, with props, views and layers extracted from JSON
    // Merge top-level JSON into props: Top level JSON props take precedence
    const props = Object.assign({}, newProps, json);

    // Get rid of the `json` prop
    delete props.json;

    // Convert "JSON layers" in props.json.layers into class instances
    if (props.layers) {
      props.layers = this._getJSONLayers(props.layers);
    }

    if (props.views) {
      // Convert  "JSON views" in props.json.views into class instances
      props.views = this._getJSONViews(props.views);
    }

    // Handle json.initialViewState
    // If we receive new JSON we need to decide if we should update current view state
    // Current heuristic is to compare with last initialViewState and only update if changed
    if ('initialViewState' in props) {
      const updateViewState =
        !this.initialViewState ||
        !shallowEqualObjects(props.initialViewState, this.initialViewState);

      if (updateViewState) {
        props.viewState = props.initialViewState;
        this.initialViewState = props.initialViewState;
      }

      delete props.initialViewState;
    }

    return props;
  }

  // Use the composite JSONLayer to render any JSON layers
  _getJSONLayers(jsonLayers) {
    return [
      new JSONLayer({
        data: jsonLayers,
        layerCatalog: this.layerCatalog
      })
    ];
  }

  // Instantiates views: `{type: MapView, ...props}` to `MapView(...props)`
  _getJSONViews(jsonViews) {
    if (!jsonViews) {
      return jsonViews;
    }

    jsonViews = Array.isArray(jsonViews) ? jsonViews : [jsonViews];
    return jsonViews
      .map(jsonView => {
        // Try to find a view definition
        let View = null;
        if (this.viewCatalog) {
          View = this.viewCatalog[jsonView.type];
        }
        if (!View) {
          View = DEFAULT_VIEW_CATALOG[jsonView.type];
        }
        // Instantiate it
        return View && new View(jsonView);
      })
      .filter(Boolean);
  }
}
