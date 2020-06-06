/* global document */

export default class BaseElement {
  constructor({container, props}) {
    this.document = document;
  }

  remove() {
    throw new Error('Remove method must be implemented');
  }

  static get stringName() {
    throw new Error('static method stringName must be implemented');
  }
}
