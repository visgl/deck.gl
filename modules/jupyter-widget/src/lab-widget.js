import {DeckGLModel, DeckGLView} from './widget';
import createDeckFromDependencies from './initializer';

import * as mapboxgl from 'mapbox-gl';
import * as loaders from '@loaders.gl/csv';
import * as deck from 'deck.gl';

function createDeckWithImport(...args) {
  const dependencies = {deck, loaders, mapboxgl};
  createDeckFromDependencies(dependencies, ...args);
}

DeckGLView.deckInitFunction = createDeckWithImport;
export {DeckGLView, DeckGLModel};
