import {DOMWidgetView} from '@jupyter-widgets/base';
import {jupyterKernelTransport} from './jupyter-kernel-transport';

export class TransportWidgetView extends DOMWidgetView {
  initialize() {
    this.listenTo(this.model, 'destroy', this.remove);

    this.transport = jupyterKernelTransport;

    // Expose Jupyter internals to enable work-arounds
    this.transport._jupyterModel = this.model;
    this.transport._initialize();
  }

  remove() {
    if (this.transport) {
      this.transport._finalize();
      this.transport._jupyterModel = null;
      this.transport = null;
    }
  }

  render() {
    super.render();

    // TODO - looks like bind(this) is not needed here, it is already passed as 3rd arg...
    // TODO - remove and test
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
