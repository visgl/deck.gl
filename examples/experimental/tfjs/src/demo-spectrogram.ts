import {Deck, OrthographicView} from '@deck.gl/core';
import {SpectrogramLayer, SpectrogramSettings} from './layers/spectrogram-layer';

const SETTINGS: SpectrogramSettings = {
  nfft: 512,
  fftWindowSize: 192,
  fftHopLength: 64,
  minDecibels: -50,
  maxDecibels: 50
};

let isPlaying = false;
let byteBuffer = new Float32Array(2048);

const audioPlayer = document.createElement('audio');
document.getElementById('controls').append(audioPlayer);
audioPlayer.src =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/tfjs/K-477.mp3';
audioPlayer.crossOrigin = 'anonymous';
audioPlayer.preload = 'auto';
audioPlayer.controls = true;
audioPlayer.onplaying = () => (isPlaying = true);
audioPlayer.onpause = () => (isPlaying = false);
audioPlayer.onended = () => (isPlaying = false);

const audioContext = new AudioContext();
const sourceNode = audioContext.createMediaElementSource(audioPlayer);
const analyserNode = audioContext.createAnalyser();
// Chain the nodes together
sourceNode.connect(analyserNode).connect(audioContext.destination);

const sampleRate = audioContext.sampleRate;
const metricsMessage = document.getElementById('metrics') as HTMLDivElement;

const deck = new Deck({
  views: new OrthographicView({
    flipY: true
  }),
  viewState: {
    target: [0, 0, 0],
    zoom: [0, 0]
  },
  getTooltip: info => {
    // @ts-ignore
    if (info.value) {
      // @ts-ignore
      return `${Math.round(info.value[0])} Hz\n ${info.value[1].toPrecision(4)} db`;
    }
    return null;
  },
  onAfterRender: update,
  _onMetrics: ({fps}) => (metricsMessage.innerText = `FPS: ${fps.toFixed(1)}`)
});

function update() {
  if (isPlaying) {
    const nextByteBuffer = new Float32Array(byteBuffer.length);
    analyserNode.getFloatTimeDomainData(nextByteBuffer);
    byteBuffer = nextByteBuffer;
  }

  const spectrogramLayer = new SpectrogramLayer({
    id: 'frequency-domain-data',
    data: byteBuffer,
    sampleRate: sampleRate,
    bounds: [-256, -256, 256, 256],
    pickable: !isPlaying,
    settings: SETTINGS,
    colorScale: './colorscale.png'
  });

  deck.setProps({layers: [spectrogramLayer]});
}
