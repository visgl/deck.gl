// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Type declarations for custom vitest browser commands.
 * These extend the @vitest/browser BrowserCommands interface.
 */

interface DeckScreenshotDiffOptions {
  goldenImage: string;
  region?: {x: number; y: number; width: number; height: number};
  saveOnFail?: boolean;
  saveAs?: string;
  threshold?: number;
  createDiffImage?: boolean;
  tolerance?: number;
  includeAA?: boolean;
  includeEmpty?: boolean;
  platform?: string;
}

interface DeckScreenshotDiffResult {
  headless: boolean;
  match: number;
  matchPercentage: string;
  success: boolean;
  error: string | null;
}

interface DeckEmulatedInputEvent {
  type: string;
  [key: string]: any;
}

declare module '@vitest/browser/context' {
  interface BrowserCommands {
    captureAndDiffScreen: (options: DeckScreenshotDiffOptions) => Promise<DeckScreenshotDiffResult>;
    emulateInput: (event: DeckEmulatedInputEvent) => Promise<void>;
    isHeadless: () => Promise<boolean>;
  }

  export const commands: BrowserCommands;
}
