/* global document  */
import getComponentByName from './get-component-by-name';

export function addSupportComponents(container, props) {
  const uiElementsOverlay = document.createElement('div');
  uiElementsOverlay.className = 'deckgl-ui-elements-overlay';
  uiElementsOverlay.style.zIndex = 1;
  container.insertAdjacentElement('beforebegin', uiElementsOverlay);

  const components = [];
  for (const key of Object.keys(props)) {
    const ElementConstructor = getComponentByName(key);
    if (ElementConstructor) {
      const el = new ElementConstructor({container: uiElementsOverlay, props});
      components.push(el);
    }
  }
  return components;
}
