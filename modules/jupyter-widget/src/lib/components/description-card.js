import {BOX_STYLE} from './component-css';

import BaseElement from './base-element';

class DescriptionCard extends BaseElement {
  constructor({container, props}) {
    super({container, props});
    const {description} = props;

    const div = this.document.createElement('div');
    div.className = 'deck-json-description-box';
    Object.assign(div.style, BOX_STYLE);
    this.el = div;

    const textContainer = this.document.createElement('div');
    textContainer.innerHTML = description;

    div.appendChild(textContainer);
    container.append(div);
  }

  remove() {
    this.el.remove();
    this.description = null;
  }

  static get stringName() {
    // name within JSON
    return 'description';
  }
}

export default DescriptionCard;
