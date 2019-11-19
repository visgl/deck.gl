import {DeckGLModel, DeckGLView} from './widget';
import createDeckFromDependencies from './initializer';

import * as mapboxgl from 'mapbox-gl';

import {CSVLoader} from '@loaders.gl/csv';
import {Tile3DLoader} from '@loaders.gl/3d-tiles';
import {LASWorkerLoader} from '@loaders.gl/las';
import * as loaders from '@loaders.gl/core';

import * as deck from 'deck.gl';

import {JSONConverter} from '@deck.gl/json';

function createDeckWithImport(args) {
  const dependencies = {deck, loaders, mapboxgl};
  Object.assign(loaders, {
    CSVLoader,
    Tile3DLoader,
    LASWorkerLoader
  });
  deck.JSONConverter = JSONConverter;
  createDeckFromDependencies({dependencies, ...args});
}

DeckGLView.deckInitFunction = createDeckWithImport;
export {DeckGLView, DeckGLModel};
