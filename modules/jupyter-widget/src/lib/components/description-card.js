/* global document */

import {BOX_STYLE} from './component-css';

class DescriptionCard {
  constructor({container, props}) {
    const {description} = props;

    const div = document.createElement('div');
    div.className = 'deck-json-description-box';
    Object.assign(div.style, BOX_STYLE);
    this.el = div;

    const textContainer = document.createElement('div');
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
