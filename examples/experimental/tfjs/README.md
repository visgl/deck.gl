This project demonstrates how WebGL resources can be shared between Tensorflow.js and deck.gl.

### Usage

Copy the content of this folder to your project. 

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with vite
npm start
```

The script src in `index.html` can be changed to one of the following:

- `src/demo-histogram.ts`: Tensorflow performs bin counting on the GPU, and the output is copied to a Buffer that is passed to a GridCellLayer.
- `src/demo-spectrogram.ts`: Tensorflow performs [short-time Fourier transform](https://en.wikipedia.org/wiki/Short-time_Fourier_transform) on the GPU, and the output is displayed as a image by a custom BitmapLayer.

### Data Attribution

The audio in the spectrogram demo is Mozart's Maurerische Trauermusik K.477, performed by Columbia Symphony Orchestra and directed by Bruno Walter.
