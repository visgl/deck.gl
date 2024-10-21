import {Layer, LayerContext, Color, UpdateParameters} from '@deck.gl/core';

type CPULineLayerProps<DataT = unknown> = {
  data: DataT[];
  getStartPosition: (d: DataT) => number[];
  getEndPosition: (d: DataT) => number[];
  width?: number;
  color?: string;
};

const defaultProps = {
  width: 1,
  color: 'black'
};

export class CPULineLayer<DataT> extends Layer<Required<CPULineLayerProps<DataT>>> {
  static layerName = 'CPULineLayer';
  static defaultProps = defaultProps;

  state!: {
    container: Element;
  };

  initializeState({device}: LayerContext) {
    const canvas = device.canvasContext?.canvas as HTMLCanvasElement;
    if (canvas) {
      const container = appendSVGElement(canvas.parentElement!, 'svg');
      Object.assign((container as HTMLElement).style, {
        position: 'absolute',
        top: 0,
        left: 0
      });
      this.state = {container};
    }
  }

  finalizeState(context: LayerContext): void {
    const {container} = this.state;
    container.remove();
  }

  updateState(params: UpdateParameters<this>) {
    if (params.changeFlags.dataChanged) {
      const {data} = this.props;
      const {container} = this.state;
      container.innerHTML = '';
      const g = appendSVGElement(container, 'g');

      for (let i = 0; i < data.length; i++) {
        appendSVGElement(g, 'path');
      }
    }
    if (params.changeFlags.propsChanged) {
      const {width, color} = this.props;
      const {container} = this.state;
      const g = container.querySelector('g')!;
      setSVGElementAttributes(g, {
        fill: 'none',
        stroke: color,
        strokeWidth: width
      });
    }
  }

  draw() {
    const {data, getStartPosition, getEndPosition} = this.props;
    const {container} = this.state;
    const {viewport} = this.context;
    const lines = container.querySelectorAll('path');

    setSVGElementAttributes(container, {
      width: viewport.width,
      height: viewport.height
    });

    for (let i = 0; i < data.length; i++) {
      const start = viewport.project(getStartPosition(data[i]));
      const end = viewport.project(getEndPosition(data[i]));

      setSVGElementAttributes(lines[i], {
        d: `M${start[0]},${start[1]}L${end[0]},${end[1]}`
      });
    }
  }
}

function appendSVGElement(parent: Element, elementType: string): Element {
  const el = document.createElementNS('http://www.w3.org/2000/svg', elementType);
  parent.append(el);
  return el;
}

function setSVGElementAttributes(element: Element, attributes: Record<string, string | number>) {
  for (const key in attributes) {
    element.setAttribute(key, String(attributes[key]));
  }
}
