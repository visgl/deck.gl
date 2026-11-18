// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Widget,
  type Layer,
  type ResolvedScale,
  type WidgetPlacement,
  type WidgetProps
} from '@deck.gl/core';
import {render} from 'preact';

/** Options for the automatic SQL color legend. */
export type ColorScaleWidgetProps = WidgetProps & {
  /** Widget placement. Defaults to bottom-right. */
  placement?: WidgetPlacement;
  /** Accessible heading for the legend. */
  label?: string;
};

/** One resolved scale and the layer accessor that produced it. */
type LegendEntry = {layerId: string; accessor: string; scale: ResolvedScale};

/** Converts a normalized color sample into a CSS color. */
function cssColor(sample: ReturnType<ResolvedScale['sample']>): string {
  if (!Array.isArray(sample)) return 'transparent';
  const [red, green, blue, alpha] = sample;
  return `rgba(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}, ${alpha})`;
}

/** Renders category swatches, discrete intervals, or a sampled continuous ramp. */
function ColorLegend({scale}: {scale: ResolvedScale}) {
  const {domain, thresholds, type} = scale.descriptor;
  if (type === 'ordinal') {
    return (
      <ul>
        {domain.map(value => (
          <li key={String(value)}>
            <span
              className="deck-color-scale-swatch"
              style={{backgroundColor: cssColor(scale.sample(value))}}
            />
            {String(value)}
          </li>
        ))}
      </ul>
    );
  }

  const minimum = Number(domain[0]);
  const maximum = Number(domain[domain.length - 1]);
  if (thresholds?.length) {
    const boundaries = [minimum, ...thresholds, maximum];
    return (
      <ul>
        {boundaries.slice(0, -1).map((lower, index) => {
          const upper = boundaries[index + 1];
          return (
            <li key={index}>
              <span
                className="deck-color-scale-swatch"
                style={{backgroundColor: cssColor(scale.sample(lower / 2 + upper / 2))}}
              />
              {`${lower} – ${upper}`}
            </li>
          );
        })}
      </ul>
    );
  }

  const samples = Array.from({length: 33}, (_, index) => {
    const fraction = index / 32;
    return cssColor(scale.sample(minimum * (1 - fraction) + maximum * fraction));
  });
  return (
    <>
      <div
        className="deck-color-scale-ramp"
        style={{background: `linear-gradient(to right, ${samples.join(', ')})`}}
      />
      <div className="deck-color-scale-domain">
        <span>{minimum}</span>
        <span>{maximum}</span>
      </div>
    </>
  );
}

/** Shows the SQL color scales of currently visible layers. */
export class ColorScaleWidget extends Widget<ColorScaleWidgetProps> {
  static defaultProps = {...Widget.defaultProps, id: 'color-scale', label: 'Color scales'};
  className = 'deck-widget-color-scale';
  /** Scales displayed by the most recent redraw. */
  private entries: LegendEntry[] = [];

  /** Position of the legend in its view. */
  get placement(): WidgetPlacement {
    return this.props.placement ?? 'bottom-right';
  }

  /** Discovers scales from rendered layers, including visible sublayers. */
  override onRedraw({layers}: {layers: Layer[]}): void {
    const entries = layers.flatMap(layer =>
      layer.props.visible
        ? Object.entries(layer.getResolvedColorScales() ?? {}).map(([accessor, scale]) => ({
            layerId: layer.id,
            accessor,
            scale
          }))
        : []
    );
    if (
      entries.length === this.entries.length &&
      entries.every((entry, index) => {
        const previous = this.entries[index];
        return (
          entry.layerId === previous.layerId &&
          entry.accessor === previous.accessor &&
          entry.scale === previous.scale
        );
      })
    )
      return;
    this.entries = entries;
    this.updateHTML();
  }

  /** Renders each discovered layer accessor legend. */
  override onRenderHTML(rootElement: HTMLElement): void {
    render(
      this.entries.length ? (
        <section aria-label={this.props.label}>
          <strong>{this.props.label}</strong>
          {this.entries.map(({layerId, accessor, scale}) => (
            <div key={JSON.stringify([layerId, accessor])}>
              <div>
                {layerId} · {accessor}
              </div>
              <ColorLegend scale={scale} />
            </div>
          ))}
        </section>
      ) : null,
      rootElement
    );
  }
}
