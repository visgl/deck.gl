/* global window, console */
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '@jupyter-widgets/base';

let numComms = 0;

/**
 * Creates a mock connection to a Jupyter notebook
 */
export class MockComm {
  constructor() {
    this.comm_id = `mock-comm-id-${numComms}`;
    numComms += 1;
  }
  on_close(fn) {
    this._on_close = fn;
  }
  on_msg(fn) {
    this._on_msg = fn;
  }
  _process_msg(msg) {
    if (this._on_msg) {
      return this._on_msg(msg);
    }
    return Promise.resolve();
  }
  close() {
    if (this._on_close) {
      this._on_close();
    }
    return 'dummy';
  }
  send() {
    return 'dummy';
  }

  open() {
    return 'dummy';
  }
}

export class DummyManager extends widgets.ManagerBase {
  constructor() {
    super();
    this.el = window.document.createElement('div');
  }

  display_view(msg, view, options) {
    // TODO: make this a spy
    // TODO: return an html element
    return Promise.resolve(view).then(v => {
      this.el.appendChild(v.el);
      v.on('remove', () => console.log('view removed', v)); //eslint-disable-line
      return v.el;
    });
  }

  loadClass(className, moduleName, moduleVersion) {
    if (moduleName === '@jupyter-widgets/base') {
      if (widgets[className]) {
        return Promise.resolve(widgets[className]);
      }
      return Promise.reject(`Cannot find class ${className}`);
    } else if (moduleName === 'jupyter-datawidgets') {
      if (this.testClasses[className]) {
        return Promise.resolve(this.testClasses[className]);
      }
      return Promise.reject(`Cannot find class ${className}`);
    }
    return Promise.reject(`Cannot find module ${moduleName}`);
  }

  _get_comm_info() {
    return Promise.resolve({});
  }

  _create_comm() {
    return Promise.resolve(new MockComm());
  }
}

export function createTestModel(constructor, attributes) {
  const id = widgets.uuid();
  const widget_manager = new DummyManager();
  const modelOptions = {
    widget_manager,
    model_id: id
  };
  return new constructor(attributes, modelOptions);
}

export function getModule(modulePath, onError) {
  // Require at runtime, after the environment is polyfilled
  try {
    return require(modulePath);
  } catch (error) {
    // Work around: jupyter-widget is built as an AMD module
    // it cannot be imported under Node
    return onError(error);
  }
}
