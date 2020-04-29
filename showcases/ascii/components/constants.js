import React from 'react';

const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/ascii';

/* global window */
function getWebcamStream(callback) {
  window.navigator.mediaDevices
    .getUserMedia({video: true})
    .then(stream => callback(stream))
    .catch(console.error); // eslint-disable-line
}

export const MIN_SIZE_SCALE = 0.125;
export const MAX_SIZE_SCALE = 4;

export const VIDEOS = [
  {
    source: `${DATA_URL}/Sintel_Opening.mp4`,
    name: 'Sintel',
    description: (
      <span>
        {' '}
        © copyright Blender Foundation | <a href="durian.blender.org">durian.blender.org</a>
      </span>
    )
  },
  {
    source: `${DATA_URL}/Felix_BoldKingCole.mp4`,
    name: 'Felix the Cat in Bold King Cole',
    description: (
      <span>
        {' '}
        Van Beuren Studios (1936) |{' '}
        <a href="https://archive.org/details/Felix_BoldKingCole">archive.org</a>
      </span>
    )
  },
  {
    source: getWebcamStream,
    name: 'Webcam'
  }
];

export const FONTS = [
  'Monaco',
  'Helvetica',
  'Courier',
  'Arial',
  'Times',
  'Impact',
  'Georgia',
  'Bookman',
  '"Comic Sans MS"'
];
