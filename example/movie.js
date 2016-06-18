import 'babel-core/register';
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import {remote} from 'electron';
import createRecorder from 'electron-recorder';
import {Mat4} from 'luma.gl';
import {ExampleApp, reducer, mapStateToProps, updateMap} from './app';

const win = remote.getCurrentWindow()

const store = createStore(reducer);
const App = connect(mapStateToProps)(ExampleApp);

const container = document.createElement('div');
document.body.appendChild(container);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  container
);

/*
const recorder = createRecorder({
  fps: 60,
  output: 'video.mp4'
})

let frameCount = 1000

function renderFrame () {
  store.dispatch(updateMap({
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    pitch: frameCount * 60.0 / 1000.0,
    projectionMatrix: new Mat4()
  }))

  if (--frameCount > 0) {
    recorder.frame(renderFrame)
  } else {
    recorder.end()
    //win.close()
  }
}

renderFrame()
*/
