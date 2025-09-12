import {Widget, WidgetProps, type WidgetPlacement, type Layer} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './lib/components/icon-button';

export type SelectionWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** Tooltip message */
  label?: string;
  /** Type of selection interaction. Defaults to 'rectangle'. */
  selectionType?: 'rectangle' | 'lasso';
  layerIds?: string[];
  /** Called when the selection is completed. */
  onSelect?: (objects: any[], polygon?: number[][]) => void;
  SelectionLayer: Layer;
};

/**
 * Adds a button that lets the user draw a selection region within the view.
 * Once a selection is made the layer is removed and {@link onSelect} is called.
 */
export class SelectionWidget extends Widget<SelectionWidgetProps> {
  static defaultProps: Required<SelectionWidgetProps> = {
    ...Widget.defaultProps,
    id: 'selection',
    placement: 'top-left',
    label: 'Select',
    selectionType: 'rectangle',
    onSelect: undefined!,
    SelectionLayer: undefined!
  };

  className = 'deck-widget-selection';
  placement: WidgetPlacement = 'top-left';
  private active = false;
  private selectionLayer: Layer | null = null;

  constructor(props: SelectionWidgetProps) {
    super(props, SelectionWidget.defaultProps);
    this.placement = props.placement ?? this.placement;
  }

  setProps(props: Partial<SelectionWidgetProps>): void {
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
  }

  onAdd(): void {
    this.updateHTML();
  }

  onRemove(): void {
    this.stopSelection();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    render(
      <IconButton
        className={this.active ? 'deck-widget-selection-active' : 'deck-widget-selection'}
        label={this.props.label}
        onClick={this.handleClick}
      />,
      rootElement
    );
  }

  private handleClick = (): void => {
    if (this.active) {
      this.stopSelection();
    } else {
      this.startSelection();
    }
  };

  private startSelection(): void {
    const deck = this.deck;
    if (!deck || this.active) {
      return;
    }

    this.active = true;
    const layerId = `${this.id}-layer`;

    // @ts-expect-error
    this.selectionLayer = new this.props.SelectionLayer({
      id: layerId,
      selectionType: this.props.selectionType,
      layerIds: this.props.layerIds,
      onSelect: (info: any) => {
        this.props.onSelect?.(info, info.polygon);
        this.stopSelection();
      }
    });

    deck.setProps({
      layers: [...(deck.props.layers || []), this.selectionLayer]
    });

    this.updateHTML();
  }

  private stopSelection(): void {
    const deck = this.deck;
    if (!deck || !this.selectionLayer) {
      this.active = false;
      this.updateHTML();
      return;
    }

    const layers = (deck.props.layers || []).filter(l => l !== this.selectionLayer);
    deck.setProps({layers});
    this.selectionLayer = null;
    this.active = false;
    this.updateHTML();
  }
}
