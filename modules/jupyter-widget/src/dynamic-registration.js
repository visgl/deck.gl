/* global document, XMLHttpRequest, window */
function loadScript(resourceUri) {
  const xhr = new XMLHttpRequest();
  const tag = document.createElement('script');
  return new Promise((onComplete, onError) => {
    xhr.open('GET', resourceUri, true);
    xhr.onload = e => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          tag.text = xhr.response;
          document.head.appendChild(tag);
          onComplete();
        } else {
          onError(xhr.response);
        }
      }
    };
    xhr.send();
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
    jsonConverter.merge(newConfiguration);
  });
}
