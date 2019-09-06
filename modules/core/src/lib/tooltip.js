// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* global document */
const defaultStyle = {
  zIndex: 1001,
  maxHeight: '500px',
  position: 'absolute',
  pointerEvents: 'none',
  fontSize: '11px',
  maxWidth: '500px',
  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  color: 'rgb(160, 167, 180)',
  textOverflow: 'ellipsis',
  backgroundColor: 'rgb(41, 50, 60)',
  padding: '10px',
  top: 0,
  left: 0,
  display: 'none'
};

export default class Tooltip {
  constructor(canvas) {
    const canvasParent = canvas.parentElement;

    if (!this.el && canvasParent) {
      this.el = document.createElement('div');
      this.el.className = 'tooltip';
      Object.assign(this.el.style, defaultStyle);
      canvasParent.appendChild(this.el);
    }
  }

  setTooltip(processTooltip, pickedInfo) {
    const el = this.el;
    if (pickedInfo && pickedInfo.picked) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
      const displayInfo = processTooltip(pickedInfo.object);

      if (typeof displayInfo === 'string') {
        el.innerText = displayInfo;
      } else if (!displayInfo) {
        el.style.display = 'none';
      } else {
        if ('text' in displayInfo) {
          el.innerText = displayInfo.text;
        }
        if ('html' in displayInfo) {
          el.innerHTML = displayInfo.html;
        }
        if ('className' in displayInfo) {
          el.className = displayInfo.className;
        } else {
          el.className = this.el.className;
        }
        Object.assign(el.style, displayInfo.style);
      }
      el.style.display = 'inline-block';
      el.style.transform = `translate(${pickedInfo.x}px, ${pickedInfo.y}px)`;
    } else {
      el.style.display = 'none';
    }
  }

  remove() {
    if (this.el) {
      this.el.remove();
    }
  }
}
