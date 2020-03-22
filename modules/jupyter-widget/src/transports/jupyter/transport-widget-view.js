import {DOMWidgetView} from '@jupyter-widgets/base';
import {jupyterWidgetTransport} from './jupyter-widget-transport';

export class TransportWidgetView extends DOMWidgetView {
  initialize() {
    this.listenTo(this.model, 'destroy', this.remove);

    this.transport = jupyterWidgetTransport;

    this.transport.initialize({
      // TODO - temporary hack, exposes Jupyter internals
      model: this.model
    });
  }

  remove() {
    if (this.transport) {
      this.transport.finalize({model: this.model});
      this.transport = null;
    }
  }

  render() {
    super.render();

    // TODO - looks like bind(this) is not needed here...
    this.model.on('change:json_input', this.onJsonChanged.bind(this), this);
    this.model.on('change:data_buffer', this.onDataBufferChanged.bind(this), this);

    this.dataBufferChanged();
  }

  onJsonChanged() {
    const json = JSON.parse(this.model.get('json_input'));
    this.transport.onMessage({type: 'json', data: json});
  }

  onDataBufferChanged() {
    const json = this.model.get('json_input');
    const dataBuffer = this.model.get('data_buffer');

    if (json && dataBuffer) {
      this.transport.onMessage({
        transport: this.transport,
        type: 'json-with-binary',
        json,
        dataBuffer
      });
    }
  }
}
