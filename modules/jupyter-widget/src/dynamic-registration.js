/* global document, fetch, window */
function loadScript(resourceUri) {
  const tag = document.createElement('script');
  return fetch(resourceUri)
    .then(r => r.text())
    .then(body => {
      tag.text = body;
      document.head.appendChild(tag);
    });
}

export default function addClassToConverter({jsonConverter, className, resourceUri}) {
  loadScript(resourceUri).then(res => {
    // Opinionated choice, requires that the user load only one layer at a time
    // and that layer must be the sole default export of the library
    // TODO better choice here?
    const classConstructor = window[className].default;
    const newConfiguration = {
      classes: {}
    };
    newConfiguration.classes[className] = classConstructor;
    jsonConverter.mergeConfiguration(newConfiguration);
  });
}
