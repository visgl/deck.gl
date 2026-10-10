// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, type DeckProps, type View} from '@deck.gl/core';
import type {Device} from '@luma.gl/core';
import {installLegacyDeckShaderAssemblerCompatibility} from './deck-example-device';

/** Construction options for the minimal Deck extensions exercised by the Arrow examples. */
export type ArrowDeckProps<ViewsT extends View | View[]> = {
  onLoad?: (context: {deck: ArrowDeck<ViewsT>; device: Device}) => void;
  onBeforeRender?: (
    context: Parameters<NonNullable<DeckProps<ViewsT>['onBeforeRender']>>[0] & {
      deck: ArrowDeck<ViewsT>;
    }
  ) => void;
  onFinalize?: () => void;
} & Omit<DeckProps<ViewsT>, 'onLoad' | 'onBeforeRender'>;

/** Minimal Deck extensions used by the Arrow examples and suitable for upstreaming. */
export class ArrowDeck<ViewsT extends View | View[]> extends Deck<ViewsT> {
  private readonly finalizeCallback: (() => void) | undefined;
  private isArrowDeckFinalized = false;

  constructor({
    onLoad,
    onBeforeRender,
    onFinalize,
    onDeviceInitialized,
    ...deckProps
  }: ArrowDeckProps<ViewsT>) {
    let runOnLoad: (() => void) | null = null;
    let runBeforeRender: NonNullable<DeckProps<ViewsT>['onBeforeRender']> | null = null;
    let restoreShaderAssembler: (() => void) | null = null;
    let didLoad = false;
    super({
      ...deckProps,
      onDeviceInitialized: initializedDevice => {
        restoreShaderAssembler?.();
        onDeviceInitialized?.(initializedDevice);
        restoreShaderAssembler = installLegacyDeckShaderAssemblerCompatibility(initializedDevice);
      },
      onLoad: () => {
        didLoad = true;
        runOnLoad?.();
      },
      onBeforeRender: context => runBeforeRender?.(context)
    });
    runOnLoad = () => {
      if (this.isArrowDeckFinalized) return;
      if (!this.device) throw new Error('Deck initialized without a device');
      onLoad?.({deck: this, device: this.device});
    };
    runBeforeRender = context => onBeforeRender?.({...context, deck: this});
    this.finalizeCallback = () => {
      restoreShaderAssembler?.();
      restoreShaderAssembler = null;
      onFinalize?.();
    };
    if (didLoad) queueMicrotask(runOnLoad);
  }

  override finalize(): void {
    if (this.isArrowDeckFinalized) return;
    this.isArrowDeckFinalized = true;
    this.finalizeCallback?.();
    super.finalize();
  }
}
