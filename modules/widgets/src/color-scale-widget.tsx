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
import {useState} from 'preact/hooks';

/** Options for the experimental automatic SQL color legend. */
export type ColorScaleWidgetProps = WidgetProps & {
  /** Widget placement. Defaults to bottom-right. */
  placement?: WidgetPlacement;
  /** Limits the legend to the specified view when supplied. */
  viewId?: string | null;
  /** Accessible heading for the legend. */
  label?: string;
  /** Starting significant digits for numeric labels (1–21). Defaults to 2. */
  precision?: number;
  /** Layout of categorical swatches. Defaults to a vertical list. */
  categoricalLayout?: 'vertical' | 'wrap';
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
  sequential: 'continuous',
  diverging: 'Diverging',
  ordinal: 'Categorical',
  quantize: 'Quantized',
  quantile: 'quantile',
  threshold: 'Threshold',
  piecewise: 'Piecewise'
};

/** Explains the scale types shown in the compact legend. */
const SCALE_TYPE_DESCRIPTIONS: Partial<Record<ResolvedScale['descriptor']['type'], string>> = {
  sequential: 'Interpolates colors along a continuous ramp.',
  quantile: 'Places breaks so each interval contains roughly the same number of observations.'
};

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

/** Increases precision only when distinct boundaries would receive identical labels. */
function formatScaleNumbers(boundaries: number[], precision: number): (value: number) => string {
  const values = [...new Set(boundaries)];
  let formatter = new Intl.NumberFormat(undefined, {maximumSignificantDigits: precision});
  while (precision < 21 && new Set(values.map(formatter.format)).size < values.length) {
    formatter = new Intl.NumberFormat(undefined, {maximumSignificantDigits: ++precision});
  }
  return formatter.format;
}

/** Displays a formatted value with its sampled color. */
function ColorSample({
  label,
  color,
  type
}: {
  label: string;
  color: string;
  type: ResolvedScale['descriptor']['type'];
}) {
  return (
    <span className="deck-color-scale-sample">
      <span className="deck-color-scale-sample-value">
        <span
          className="deck-color-scale-swatch"
          aria-hidden="true"
          style={{backgroundColor: color}}
        />
        {label}
      </span>
      <small>{SCALE_TYPE_LABELS[type]}</small>
      {SCALE_TYPE_DESCRIPTIONS[type] && (
        <span className="deck-color-scale-description">{SCALE_TYPE_DESCRIPTIONS[type]}</span>
      )}
    </span>
  );
}

/** Shows the sampled input value and its color as the pointer moves across the ramp. */
function ColorRamp({
  scale,
  minimum,
  maximum,
  format
}: {
  scale: ResolvedScale;
  minimum: number;
  maximum: number;
  format: (value: number) => string;
}) {
  const [value, setValue] = useState<number | null>(null);
  const samples = Array.from({length: 33}, (_, index) => {
    const fraction = index / 32;
    return cssColor(scale.sample(minimum * (1 - fraction) + maximum * fraction));
  });
  return (
    <div
      className="deck-color-scale-ramp"
      style={{background: `linear-gradient(to right, ${samples.join(', ')})`}}
      onPointerMove={event => {
        const {left, width} = event.currentTarget.getBoundingClientRect();
        const fraction = Math.max(0, Math.min(1, (event.clientX - left) / width));
        setValue(minimum * (1 - fraction) + maximum * fraction);
      }}
      onPointerLeave={() => setValue(null)}
    >
      {value !== null && (
        <ColorSample
          label={format(value)}
          color={cssColor(scale.sample(value))}
          type={scale.descriptor.type}
        />
      )}
    </div>
  );
}

/** Renders category swatches, discrete intervals, or a sampled continuous ramp. */
function ColorLegend({
  scale,
  precision,
  categoricalLayout
}: {
  scale: ResolvedScale;
  precision: number;
  categoricalLayout: ColorScaleWidgetProps['categoricalLayout'];
}) {
  const [hoveredBin, setHoveredBin] = useState<number | null>(null);
  const {domain, thresholds, type} = scale.descriptor;
  if (type === 'ordinal') {
    return (
      <ul className={categoricalLayout === 'wrap' ? 'deck-color-scale-categories-wrap' : undefined}>
        {domain.map(value => (
          <li key={String(value)}>
            <span
              className="deck-color-scale-swatch"
              title={String(value)}
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
  const boundaries = [minimum, ...(thresholds ?? []), maximum];
  const format = formatScaleNumbers(boundaries, precision);
  if (thresholds?.length) {
    if (type === 'quantile') {
      const labels = boundaries.map(format);
      const binCount = thresholds.length + 1;
      const bins = boundaries.slice(0, -1).map((lower, index) => {
        const upper = boundaries[index + 1];
        const color = cssColor(scale.sample(lower / 2 + upper / 2));
        return {color, description: `${format(lower)} – ${format(upper)}`};
      });
      return (
        <div className="deck-color-scale-quantile-legend">
          {hoveredBin !== null && bins[hoveredBin] && (
            <ColorSample
              label={bins[hoveredBin].description}
              color={bins[hoveredBin].color}
              type={type}
            />
          )}
          <div className="deck-color-scale-quantile" aria-label="Quantile scale">
            <div className="deck-color-scale-bins" onPointerLeave={() => setHoveredBin(null)}>
              {bins.map(({color, description}, index) => (
                <span
                  key={index}
                  aria-label={description}
                  onPointerEnter={() => setHoveredBin(index)}
                  style={{backgroundColor: color}}
                />
              ))}
            </div>
            <div className="deck-color-scale-breaks">
              {labels.map((label, index) => {
                const endpoint = index === 0 || index === binCount;
                return (
                  <span
                    key={index}
                    title={label}
                    style={{
                      left: `${(100 * index) / binCount}%`,
                      maxWidth: `calc(${(endpoint ? 50 : 100) / binCount}% - 1px)`
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
    return (
      <ul>
        {boundaries.slice(0, -1).map((lower, index) => {
          const upper = boundaries[index + 1];
          return (
            <li key={index}>
              <span
                className="deck-color-scale-swatch"
                title={`${format(lower)} – ${format(upper)}`}
                style={{backgroundColor: cssColor(scale.sample(lower / 2 + upper / 2))}}
              />
              {`${format(lower)} – ${format(upper)}`}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      <ColorRamp scale={scale} minimum={minimum} maximum={maximum} format={format} />
      <div className="deck-color-scale-domain">
        <span>{format(minimum)}</span>
        <span>{format(maximum)}</span>
      </div>
    </>
  );
}

/** Experimental widget that shows SQL color scales for currently visible layers. */
export class _ColorScaleWidget extends Widget<ColorScaleWidgetProps> {
  /** Default identifier and accessible heading. */
  static defaultProps = {
    ...Widget.defaultProps,
    id: 'color-scale',
    label: 'Legend',
    viewId: null,
    precision: 2,
    categoricalLayout: 'vertical' as const
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
            <summary>
              {this.props.label}
              <span className="deck-color-scale-caret" aria-hidden="true" />
            </summary>
            {this.entries.map(({layerId, accessor, label, scale}) => (
              <div className="deck-color-scale-entry" key={JSON.stringify([layerId, accessor])}>
                <div className="deck-color-scale-heading">
                  <span>{label}</span>
                </div>
                <div className="deck-color-scale-body">
                  <ColorLegend
                    scale={scale}
                    precision={this.props.precision}
                    categoricalLayout={this.props.categoricalLayout}
                  />
                </div>
              </div>
            ))}
          </details>
        </section>
      ) : null,
      rootElement
    );
  }
}
