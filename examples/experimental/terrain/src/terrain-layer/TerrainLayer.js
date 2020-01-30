import GL from '@luma.gl/constants';
// import { Layer } from "@deck.gl/core";
import {Model, Texture2D} from '@luma.gl/core';
import {picking, project32, gouraudLighting} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';
import vs from './terrain-layer-vertex';
import fs from './terrain-layer-fragment';
import SquareGridGeometry from './square-grid-geometry';

const DEFAULT_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

const defaultProps = {
  // ...BitmapLayer.defaultProps,
  images: {type: 'object', value: [], async: true},
  cutoffHeightM: {type: 'number', value: 40.0},
  peakHeightM: {type: 'number', value: 500.0},
  lngResolution: {type: 'number', value: 200.0},
  latResolution: {type: 'number', value: 200.0}
};

/*
 * @class
 * @param {object} props
 * @param {object} props.elevationImage
 * @param {number} props.cutoffHeightM
 * @param {number} props.peakHeightM
 * @param {number} props.lngResolution
 * @param {number} props.latResolution
 */
export class TerrainLayer extends BitmapLayer {
  // Adds a prop called elevationImage, and state called elevationBitmapTexture

  initializeState() {
    this.setState({
      numInstances: 1
    });
  }

  getShaders() {
    return {
      ...super.getShaders(),
      fs,
      vs
      // modules: [...super.getShaders().modules]
    };
  }

  updateState({props, oldProps, changeFlags}) {
    // setup model first
    if (changeFlags.extensionsChanged) {
      const {gl} = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({model: this._getModel(gl)});
      this.getAttributeManager().invalidateAll();
    }

    if (props.images !== oldProps.images) {
      this.loadTextures(props.images);
    }

    const attributeManager = this.getAttributeManager();

    if (props.bounds !== oldProps.bounds) {
      attributeManager.invalidate('positions');
    }
  }

  finalizeState() {
    super.finalizeState();

    if (this.state.bitmapTexture) {
      this.state.bitmapTexture.delete();
    }

    // inject: elevationBitmapTexture
    if (this.state.elevationBitmapTexture) {
      this.state.elevationBitmapTexture.delete();
    }
  }

  draw(opts) {
    // inject: elevationBitmapTexture
    const {uniforms} = opts;
    const {bitmapTexture, elevationBitmapTexture, model} = this.state;
    const {
      images,
      desaturate,
      transparentColor,
      tintColor,
      cutoffHeightM,
      peakHeightM,
      bounds
    } = this.props;

    // Update video frame
    const image = images[0];
    if (
      bitmapTexture &&
      image instanceof HTMLVideoElement &&
      image.readyState > HTMLVideoElement.HAVE_METADATA
    ) {
      const sizeChanged =
        bitmapTexture.width !== image.videoWidth || bitmapTexture.height !== image.videoHeight;
      if (sizeChanged) {
        // note clears image and mipmaps when resizing
        bitmapTexture.resize({
          width: image.videoWidth,
          height: image.videoHeight,
          mipmaps: true
        });
        bitmapTexture.setSubImageData({
          data: image,
          paramters: DEFAULT_TEXTURE_PARAMETERS
        });
      } else {
        bitmapTexture.setSubImageData({
          data: image
        });
      }

      bitmapTexture.generateMipmap();
    }

    // // TODO fix zFighting
    // Render the image
    if (elevationBitmapTexture && bitmapTexture && model) {
      const {gl} = this.context;
      const parameters = {
        depthTest: true,
        depthFunc: gl.LEQUAL,
        blend: true,
        blendFunc: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
        blendEquation: gl.FUNC_ADD
      };

      // [minLng, minLat, maxLng, maxLat]

      // const b = {
      //   minLng: bounds[0],
      //   minLat: bounds[1],
      //   maxLng: bounds[2],
      //   maxLat: bounds[3]
      // };

      model
        .setUniforms(
          Object.assign({}, uniforms, {
            bitmapTexture,
            elevationBitmapTexture,
            cutoffHeightM,
            peakHeightM,
            desaturate,
            bounds,
            transparentColor: transparentColor.map(x => x / 255),
            tintColor: tintColor.slice(0, 3).map(x => x / 255)
          })
        )
        .draw({parameters});
    }
  }

  _getModel(gl) {
    if (!gl) {
      return null;
    }

    const {lngResolution, latResolution, bounds} = this.props;

    const b = {
      minLng: bounds[0],
      minLat: bounds[1],
      maxLng: bounds[2],
      maxLat: bounds[3]
    };
    const geometry = new SquareGridGeometry({
      xResolution: lngResolution,
      yResolution: latResolution,
      boundingBox: b
    });

    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry,
        // FIXME - isIndexed should be set in "SquareGridGeometry"
        isIndexed: true,
        isInstanced: false
      })
    );
  }

  loadTextures(images) {
    // inject: elevationImage and elevationBitmapTexture
    if (images.length !== 2) {
      return;
    }
    // console.log(images, "HI");

    const bitmapTexture = this.state.bitmapTexture;
    const elevationBitmapTexture = this.state.elevationBitmapTexture;
    const image = images[0];
    const elevationImage = images[1];

    const {gl} = this.context;

    if (elevationBitmapTexture) {
      elevationBitmapTexture.delete();
    }

    if (bitmapTexture) {
      bitmapTexture.delete();
    }

    if (elevationImage instanceof Texture2D) {
      this.setState({elevationBitmapTexture: elevationImage});
    } else if (elevationImage) {
      // Browser object: Image, ImageData, HTMLCanvasElement, ImageBitmap
      this.setState({
        elevationBitmapTexture: new Texture2D(gl, {
          data: elevationImage,
          parameters: DEFAULT_TEXTURE_PARAMETERS
        })
      });
    }

    if (image instanceof Texture2D) {
      this.setState({bitmapTexture: image});
    } else if (image instanceof HTMLVideoElement) {
      // Initialize an empty texture while we wait for the video to load
      this.setState({
        bitmapTexture: new Texture2D(gl, {
          width: 1,
          height: 1,
          parameters: DEFAULT_TEXTURE_PARAMETERS,
          mipmaps: false
        })
      });
    } else if (image) {
      // Browser object: Image, ImageData, HTMLCanvasElement, ImageBitmap
      this.setState({
        bitmapTexture: new Texture2D(gl, {
          data: image,
          parameters: DEFAULT_TEXTURE_PARAMETERS
        })
      });
    }
    // console.log(this.state);
  }
}

TerrainLayer.layerName = 'TerrainLayer';
TerrainLayer.defaultProps = defaultProps;
