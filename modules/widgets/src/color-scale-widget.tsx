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

/** Options for the experimental automatic SQL color legend. */
export type ColorScaleWidgetProps = WidgetProps & {
  /** Widget placement. Defaults to bottom-right. */
  placement?: WidgetPlacement;
  /** Limits the legend to the specified view when supplied. */
  viewId?: string | null;
  /** Accessible heading for the legend. */
  label?: string;
};

/** One resolved scale and the layer accessor that produced it. */
type LegendEntry = {
  /** Identifier of the layer that declares the scale. */
  layerId: string;
  /** Name of the SQL accessor that supplies colors. */
  accessor: string;
  /** Name shown above this scale in the panel. */
  label: string;
  /** Resolved descriptor and sampler used to render the legend. */
  scale: ResolvedScale;
};

/** Short legend labels for each scale classification. */
const SCALE_TYPE_LABELS: Record<ResolvedScale['descriptor']['type'], string> = {
  linear: 'Linear',
  sqrt: 'Square root',
  log: 'Logarithmic',
  symlog: 'Symmetric log',
  sequential: 'Continuous',
  diverging: 'Diverging',
  ordinal: 'Categorical',
  quantize: 'Quantized',
  quantile: 'Quantile',
  threshold: 'Threshold',
  piecewise: 'Piecewise'
};

/** Keeps displayed boundaries readable without changing the underlying scale. */
const SCALE_NUMBER_FORMAT = new Intl.NumberFormat(undefined, {maximumSignificantDigits: 6});

/** Converts an accessor identifier to a readable label for layers with several scales. */
function formatAccessorLabel(accessor: string): string {
  return accessor
    .replace(/^get(?=[A-Z])/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase();
}

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
              {`${SCALE_NUMBER_FORMAT.format(lower)} – ${SCALE_NUMBER_FORMAT.format(upper)}`}
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
        <span>{SCALE_NUMBER_FORMAT.format(minimum)}</span>
        <span>{SCALE_NUMBER_FORMAT.format(maximum)}</span>
      </div>
    </>
  );
}

/**
 * Shows the SQL color scales of currently visible layers.
 *
 * @remarks Experimental widget. Its options and behavior may change.
 */
export class _ColorScaleWidget extends Widget<ColorScaleWidgetProps> {
  /** Default identifier and accessible heading. */
  static defaultProps = {
    ...Widget.defaultProps,
    id: 'color-scale',
    label: 'Legend',
    viewId: null
  };
  /** Root CSS class for the legend. */
  className = 'deck-widget-color-scale';
  /** Available height in CSS pixels. */
  private viewHeight = 0;
  /** Whether the viewer left the legend contents expanded. */
  private expanded = true;
  /** Scales displayed by the most recent redraw. */
  private entries: LegendEntry[] = [];

  /** Attaches the legend to its configured view. */
  constructor(props: ColorScaleWidgetProps = {}) {
    super(props);
    this.viewId = this.props.viewId;
  }

  /** Updates options and the selected view. */
  override setProps(props: Partial<ColorScaleWidgetProps>): void {
    if (props.viewId !== undefined) {
      this.viewId = props.viewId;
    }
    super.setProps(props);
  }

  /** Position of the legend in its view. */
  get placement(): WidgetPlacement {
    return this.props.placement ?? 'bottom-right';
  }

  /** Discovers scales in the screen views associated with the widget. */
  override onRedraw({viewports, renderedLayers}: Parameters<Widget['onRedraw']>[0]): void {
    const layers = new Set<Layer>();
    for (const viewport of viewports) {
      for (const layer of renderedLayers?.get(viewport) ?? []) {
        // A composite may declare a scale that its drawable children inherit.
        for (
          let source: Layer | null = layer;
          source && !layers.has(source);
          source = source.parent
        ) {
          layers.add(source);
        }
      }
    }
    const entries = [...layers].flatMap(layer => {
      const scales = Object.entries(layer._getResolvedColorScales() ?? {});
      return scales.map(([accessor, scale]) => ({
        layerId: layer.id,
        accessor,
        label: scales.length === 1 ? layer.id : `${layer.id} · ${formatAccessorLabel(accessor)}`,
        scale
      }));
    });
    const height = Math.max(
      0,
      ...viewports.map(viewport => viewport.height + (this.viewId ? 0 : viewport.y))
    );
    if (
      this.viewHeight === height &&
      entries.length === this.entries.length &&
      entries.every((entry, index) => {
        const previous = this.entries[index];
        return (
          entry.layerId === previous.layerId &&
          entry.accessor === previous.accessor &&
          entry.label === previous.label &&
          entry.scale === previous.scale
        );
      })
    )
      return;
    this.entries = entries;
    this.viewHeight = height;
    this.updateHTML();
  }

  /** Renders each discovered layer accessor legend. */
  override onRenderHTML(rootElement: HTMLElement): void {
    render(
      this.entries.length ? (
        <section
          aria-label={this.props.label}
          style={{
            maxHeight: `max(0px, calc(${this.viewHeight}px - 2 * var(--widget-margin, 12px)))`
          }}
        >
          <details
            open={this.expanded}
            onToggle={event => {
              this.expanded = event.currentTarget.open;
            }}
          >
            <summary>{this.props.label}</summary>
            {this.entries.map(({layerId, accessor, label, scale}) => (
              <div key={JSON.stringify([layerId, accessor])}>
                <div className="deck-color-scale-heading">
                  <span>{label}</span>
                  <small>{SCALE_TYPE_LABELS[scale.descriptor.type]}</small>
                </div>
                <ColorLegend scale={scale} />
              </div>
            ))}
          </details>
        </section>
      ) : null,
      rootElement
    );
  }
}
