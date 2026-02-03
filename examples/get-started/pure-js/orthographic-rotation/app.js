// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {Deck, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer, PathLayer} from '@deck.gl/layers';

const GRID_SIZE = 10;
const CELL_SIZE = 50;

function generateGridData() {
  const points = [];
  const paths = [];

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const x = (i - GRID_SIZE / 2) * CELL_SIZE;
      const y = (j - GRID_SIZE / 2) * CELL_SIZE;
      points.push({
        position: [x, y],
        color: [
          Math.floor(((i + 1) / GRID_SIZE) * 255),
          Math.floor(((j + 1) / GRID_SIZE) * 255),
          150
        ],
        radius: 8
      });
    }
  }

  for (let i = 0; i <= GRID_SIZE; i++) {
    const offset = (i - GRID_SIZE / 2) * CELL_SIZE;
    const halfSize = (GRID_SIZE / 2) * CELL_SIZE;
    paths.push({
      path: [
        [-halfSize, offset],
        [halfSize, offset]
      ],
      color: [100, 100, 100]
    });
    paths.push({
      path: [
        [offset, -halfSize],
        [offset, halfSize]
      ],
      color: [100, 100, 100]
    });
  }

  return {points, paths};
}

const {points, paths} = generateGridData();

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  zoom: 0,
  rotationOrbit: 0
};

const angleDisplay = document.getElementById('angle-display');

function updateAngleDisplay(angle) {
  angleDisplay.textContent = `${Math.round(angle)}°`;
}

const deck = new Deck({
  views: new OrthographicView({
    controller: {dragRotate: true}
  }),
  initialViewState: INITIAL_VIEW_STATE,
  onViewStateChange: ({viewState}) => {
    updateAngleDisplay(viewState.rotationOrbit ?? 0);
  },
  layers: [
    new PathLayer({
      id: 'grid',
      data: paths,
      getPath: d => d.path,
      getColor: d => d.color,
      getWidth: 1,
      widthMinPixels: 1
    }),
    new ScatterplotLayer({
      id: 'points',
      data: points,
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: d => d.radius,
      radiusMinPixels: 4,
      radiusMaxPixels: 20,
      pickable: true
    })
  ],
  getTooltip: ({object}) => object && `Position: [${object.position[0]}, ${object.position[1]}]`
});

function getController() {
  // Access the controller from deck's viewManager
  const viewManager = deck.viewManager;
  if (viewManager) {
    const controllers = viewManager.controllers;
    return controllers ? Object.values(controllers)[0] : null;
  }
  return null;
}

document.getElementById('rotate-left').addEventListener('click', () => {
  const controller = getController();
  if (controller?.rotateLeft) {
    controller.rotateLeft(90);
  }
});

document.getElementById('rotate-right').addEventListener('click', () => {
  const controller = getController();
  if (controller?.rotateRight) {
    controller.rotateRight(90);
  }
});

document.getElementById('reset').addEventListener('click', () => {
  const controller = getController();
  if (controller?.setRotation) {
    controller.setRotation(0);
  }
});

document.getElementById('set-angle').addEventListener('click', () => {
  const input = document.getElementById('angle-input');
  const angle = parseFloat(input.value);
  if (!isNaN(angle)) {
    const controller = getController();
    if (controller?.setRotation) {
      controller.setRotation(angle);
    }
  }
});
