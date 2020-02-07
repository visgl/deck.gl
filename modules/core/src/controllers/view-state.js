import assert from '../utils/assert';

/* Helpers */

export default class ViewState {
  constructor(opts) {
    assert(Number.isFinite(opts.width), '`width` must be supplied');
    assert(Number.isFinite(opts.height), '`height` must be supplied');

    this._viewportProps = this._applyConstraints(opts);
  }

  getViewportProps() {
    return this._viewportProps;
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
