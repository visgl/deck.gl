import 'client-only';
import type {Deck, DeckProps, LayersList, View, Widget} from '@deck.gl/core';
import {useId, useRef} from 'react';
import type {CanvasHTMLAttributes} from 'react';
import {useIsomorphicLayoutEffect} from '../shared/use-isomorphic-layout-effect';
import {type DeckCanvasRegistry, getCanvasRegistry} from './deck-canvas-registry';

/** Props for a presentation canvas attached to an application-owned multi-canvas Deck. */
export type DeckCanvasProps = Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'children'> & {
  /** Shared Deck, initialized with `_canvases: []`. The application owns its lifetime. */
  deck: Deck<any>;
  /** External canvas element or element id. Omit to render a canvas. */
  canvas?: HTMLCanvasElement | string | null;
  /** Local views; missing canvasId values are filled in without mutating the views. */
  views: View | View[];
  /** Layers that render only in this canvas's views. */
  layers?: LayersList;
  /** Local widgets. Require a Deck initialized with a parent and a local viewId. */
  widgets?: Widget[];
  /** Additional filter applied in this canvas's views, after the shared Deck filter. */
  layerFilter?: DeckProps<any>['layerFilter'];
};

/**
 * Contributes one canvas, views, layers and widgets to a shared Deck.
 * Unmount removes this contribution without finalizing the Deck. React children
 * are intentionally unsupported; use the views, layers and widgets props.
 */
export function DeckCanvas({
  deck,
  canvas: externalCanvas,
  views,
  layers,
  widgets,
  layerFilter,
  id,
  ...canvasProps
}: DeckCanvasProps) {
  const generatedId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const token = useRef({});
  const attachment = useRef<{canvas: HTMLCanvasElement; registry: DeckCanvasRegistry} | null>(null);
  const canvasId =
    id ||
    (typeof externalCanvas === 'string' ? externalCanvas : externalCanvas?.id) ||
    `deck-canvas-${generatedId}`;

  useIsomorphicLayoutEffect(() => {
    const canvas =
      typeof externalCanvas === 'string'
        ? document.getElementById(externalCanvas)
        : externalCanvas || canvasRef.current;
    if (!(canvas instanceof HTMLCanvasElement))
      throw new Error('DeckCanvas: external canvas was not found');
    if (canvas.id && canvas.id !== canvasId)
      throw new Error('DeckCanvas: external canvas id conflicts with id');
    const previousId = canvas.id;
    canvas.id = canvasId;
    let registry: DeckCanvasRegistry;
    try {
      registry = getCanvasRegistry(deck);
    } catch (error) {
      if (externalCanvas) canvas.id = previousId;
      throw error;
    }
    attachment.current = {canvas, registry};
    const contributionToken = token.current;
    return () => {
      registry.removeContribution(contributionToken);
      attachment.current = null;
      if (externalCanvas) canvas.id = previousId;
    };
  }, [deck, externalCanvas, canvasId]);

  useIsomorphicLayoutEffect(() => {
    const current = attachment.current;
    if (current) {
      const contributionToken = token.current;
      current.registry.setContribution(contributionToken, {
        canvas: current.canvas,
        views: Array.isArray(views) ? views : [views],
        layers,
        widgets,
        layerFilter
      });
      // React runs layout cleanups for all changed siblings before their setups.
      // Withdraw old props first so a layer/view/widget can move between panels
      // without colliding with its previous owner during the same commit.
      return () => current.registry.removeContribution(contributionToken, true);
    }
  }, [deck, externalCanvas, canvasId, views, layers, widgets, layerFilter]);

  return externalCanvas ? null : <canvas {...canvasProps} id={canvasId} ref={canvasRef} />;
}
