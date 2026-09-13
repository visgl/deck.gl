// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Type declarations for browser test driver functions injected by @probe.gl/test-utils

interface BrowserTestDriverDiffOptions {
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

interface BrowserTestDriverDiffResult {
  headless: boolean;
  match: string | number;
  matchPercentage: string;
  success: boolean;
  error: Error | string | null;
}

interface BrowserTestDriverInputEvent {
  type: string;
  [key: string]: any;
}

declare global {
  interface Window {
    browserTestDriver_emulateInput(event: BrowserTestDriverInputEvent): Promise<void>;
    browserTestDriver_captureAndDiffScreen(
      options: BrowserTestDriverDiffOptions
    ): Promise<BrowserTestDriverDiffResult>;
  }
}

export {};
