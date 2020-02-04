/* global console, document, XMLHttpRequest, window */
import * as deck from './deck-bundle';

// NOTE exported on demonstration only
export default function loadScript({resourceUri, onComplete, onError}) {
  const xhr = new XMLHttpRequest();
  const tag = document.createElement('script');
  xhr.open('GET', resourceUri, true);
  xhr.onload = e => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        tag.text = xhr.response;
        document.head.appendChild(tag);
        onComplete(e);
      } else {
        onError(xhr.response);
      }
    }
  };
  xhr.send();
}

function updateConfiguration(currentConf, newClassName, newClassContents) {
  // Handle JSONConverter and loaders configuration
  currentConf.classes[newClassName] = newClassContents;
}

export function addClassToConverter({converter, className, resourceUri}) {
  const onComplete = () => {
    const configuration = updateConfiguration(
      converter.configuration,
      className,
      window[className]
    );
    converter = new deck.JSONConverter({
      configuration
    });
  };
  loadScript({resourceUri, onComplete, onError: console.error}); // eslint-disable-line no-console
}
