/* global document  */
import DescriptionCard from './description-card';

export function addSupportComponents(parentContainer, props) {
  const uiElementsOverlay = document.createElement('div');
  uiElementsOverlay.className = 'deckgl-ui-elements-overlay';
  uiElementsOverlay.style.zIndex = 1;
  parentContainer.insertAdjacentElement('beforebegin', uiElementsOverlay);

  const components = [];
  for (const key of Object.keys(props)) {
    switch (key) {
      case 'description':
        const el = new DescriptionCard({container: uiElementsOverlay, props});
        components.push(el);
        break;
      default:
        break;
    }
  }
  return components;
}
