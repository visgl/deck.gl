// Mock Canvas/Context2D calls for node tests
// https://github.com/jsdom/jsdom/issues/1782#issuecomment-337656878
export function mockCanvasApi(JSDOMCanvasElement) {
  JSDOMCanvasElement.prototype.getContext = function () {
    return {
      canvas: this,
      clearRect: function () {},
      getImageData: function (x, y, w, h) {
        return this.createImageData(w, h);
      },
      putImageData: function () {},
      createImageData: function (w, h) {
        return {width: w, height: h, data: new Uint8ClampedArray(w * h)};
      },
      drawImage: function () {},
      measureText: function () {
        return {
          width: 20,
          // Additional text metrics needed by tiny-sdf
          actualBoundingBoxAscent: 24,
          actualBoundingBoxDescent: 0,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxRight: 20
        };
      },
      fillText: function () {}
    };
  };
}
