// Jupyter Widget based Transport implementation

import Transport from '../transport';

export default class JupyterTransport extends Transport {
  constructor() {
    super();
    this.model.on('change:json_input', this._onJsonChanged.bind(this), this);
    this.model.on('change:data_buffer', this._onDataBufferChanged.bind(this), this);

    this._initPromise = new Promise((resolve, reject) => {
      this._resolveInitPromise = resolve;
      this._rejectInitPromise = reject;
    });
  }

  // PROTECTED

  async initialize(widget, props) {
    this._initiProps = props;
    return this._initPromise;
  }

  finalize() {
    this._destroyed = true;
  }

  // TODO - implement back-channel messaging for event handling etc
  // sendJsonMessage(json, type) {

  /*
  getSetting(key) {
    this.widget.model.get(key);
  }

  update(update) {
    this._initPromise.then(() => {
      if (!this._destroyed) {
        this.onUpdate(update);
      }
    });
  }
  */

  // PRIVATE

  /**
   * Called by the ipywidget when initialization is done
   * Resolves init promise and calls `onTransportInitialized`
   * @param {any} widget
   */
  _onWidgetInitialized(widget) {
    this._resolveInitPromise(this);
    this.props.onTransportInitialized(this);
  }

  _onDataBufferChanged() {
    if (this.widget.model.get('data_buffer')) {
      const propsWithBinary = processDataBuffer({
        dataBuffer: this.model.get('data_buffer'),
        jsonProps: this.model.get('json_input')
      });

      this.queueUpdate(propsWithBinary);
    }
  }

  _onJsonChanged() {
    const json = JSON.parse(this.model.get('json_input'));
    this.transport.onMessage({type: 'json', data: json});
  }
}

export const jupyterWidgetTransport = new JupyterTransport();

export function processDataBuffer({dataBuffer, convertedJson}) {
  // Takes JSON props and combines them with the binary data buffer
  for (let i = 0; i < convertedJson.layers.length; i++) {
    const layerId = convertedJson.layers[i].id;
    const layer = convertedJson.layers[i];
    // Replace data on every layer prop
    convertedJson.layers[i] = layer.clone({data: dataBuffer[layerId]});
  }
  return convertedJson;
}
