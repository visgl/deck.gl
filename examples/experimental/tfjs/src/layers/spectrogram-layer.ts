// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as tf from '@tensorflow/tfjs';

import {UpdateParameters, Layer, CompositeLayer, LayersList} from '@deck.gl/core';
import {GL} from '@luma.gl/constants';

import {Tensor2DLayer} from './tensor-2d-layer';
import {CustomTFContext} from '../tf-utils/tf-context';
import {tensorToTexture} from '../tf-utils/tensor-data';
import type {Texture2D} from '@luma.gl/webgl';

export type SpectrogramSettings = {
  nfft: number;
  fftWindowSize: number;
  fftHopLength: number;
  minDecibels: number;
  maxDecibels: number;
};

export class SpectrogramLayer extends CompositeLayer<{
  colorScale: string;
  settings: SpectrogramSettings;
  sampleRate: number;
  bounds: [number, number, number, number];
}> {
  state!: {
    spectrogram?: Texture2D;
    tfContext: CustomTFContext;
    uv: number[];
  };

  initializeState({gl}) {
    this.setState({
      tfContext: CustomTFContext.getDefaultContext(gl)
    });
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    if (
      params.changeFlags.dataChanged ||
      this.props.settings !== params.oldProps.settings ||
      this.props.pickable !== params.oldProps.pickable
    ) {
      this._computeSpectrogram();
    }
  }

  getPickingInfo({info}: any) {
    if (info.bitmap) {
      const {uv} = info.bitmap;
      const maxFrequency = this.props.sampleRate / 2;

      info.value = [uv[0] * maxFrequency, info.object || 0];
    }
    return info;
  }

  async _computeSpectrogram() {
    const data = this.props.data as number[];
    const len = data.length;
    if (!len) {
      return;
    }

    const {settings, bounds, pickable} = this.props;

    const spectrogram = computeSpectrogram({
      signal: data,
      settings,
      context: this.state.tfContext,
      readToCPU: pickable
    });

    if (!spectrogram) {
      return;
    }

    const windowSize = settings.fftWindowSize;
    const hopLengths = settings.fftHopLength;
    const left = windowSize / 2 - hopLengths / 2;
    const right = spectrogram.width * hopLengths + left;

    const u0 = -left / (right - left);
    const u1 = (len - right) / (right - left) + 1;

    const uv = [
      [1, u0],
      [0, u0],
      [0, u1],
      [1, u1]
    ];

    this.setState({spectrogram, uv, bounds});
  }

  renderLayers(): Layer<{}> | LayersList {
    const {colorScale, bounds, settings} = this.props;
    const {spectrogram, uv} = this.state;
    return (
      spectrogram &&
      new Tensor2DLayer(this.getSubLayerProps({id: 'bitmap'}), {
        image: spectrogram,
        bounds,
        uv,
        colorScale,
        colorDomain: [settings.minDecibels, settings.maxDecibels]
      })
    );
  }
}

function computeSpectrogram({
  signal,
  settings,
  context,
  readToCPU
}: {
  signal: number[];
  settings: SpectrogramSettings;
  context: CustomTFContext;
  readToCPU?: boolean;
}): Texture2D | null {
  let result: Texture2D | null = null;

  context.tidy(() => {
    const {fftHopLength, nfft, fftWindowSize} = settings;

    const len = Math.max(signal.length, fftWindowSize);
    const paddedLen = 2 ** Math.ceil(Math.log2(len));
    const paddedSignal = new Float32Array(paddedLen);
    paddedSignal.set(signal);

    const input = tf.tensor1d(paddedSignal);
    const stft = tf.signal.stft(input, fftWindowSize, fftHopLength, nfft);

    const [h, w] = stft.shape;
    const amplitudes = stft.abs().square();

    // Convert to decibels
    const decibels = amplitudes.log().mul(10.0 / Math.log(10));

    result = tensorToTexture({
      data: decibels,
      channels: 'RGBA',
      readToCPU,
      width: w,
      height: h,
      parameters: {
        [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
        [GL.TEXTURE_MAG_FILTER]: GL.LINEAR
      }
    });
  });

  return result;
}
