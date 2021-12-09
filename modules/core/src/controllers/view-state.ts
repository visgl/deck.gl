export default class ViewState {
  _viewportProps: Record<string, any>;
  _state: Record<string, any> | undefined;

  constructor(opts) {
    this._viewportProps = this._applyConstraints(opts);
  }

  getViewportProps() {
    return this._viewportProps;
  }

  getState() {
    return this._state;
  }

  shortestPathFrom(viewState) {
    return this._viewportProps;
  }

  // Redefined by subclass
  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    return props;
  }
}
