// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

export type ExampleMobileMode = 'full' | 'reduced' | 'unsupported';
export type ExampleBackend = 'webgpu' | 'webgl2';
export type ExampleMobileQualityProfile =
  | 'standard'
  | 'effects'
  | 'large-data'
  | 'simulation'
  | 'dense';

export type ExampleRequirements = {
  backends: readonly ExampleBackend[];
  requiredDeviceFeatures?: readonly string[];
  requiredDeviceLimits?: Readonly<{
    maxColorAttachments?: number;
    maxColorAttachmentBytesPerSample?: number;
  }>;
};

export type ExampleSupportDefinition = {
  id: string;
  mobileMode: ExampleMobileMode;
  mobileProfile: ExampleMobileQualityProfile;
  requirements?: ExampleRequirements;
  unsupportedReason?: string;
};

export type ExampleRuntimeEnvironment = {
  compactViewport: boolean;
  handheld: boolean;
  coarsePointer: boolean;
  maxTouchPoints: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
};

export type ExampleMobileQuality = {
  canvasPixelRatio: true | number;
  intermediateTargetScale: number;
  maximumSampleCount: number;
  preferFloatingPointColor: boolean;
  maximumWorkerCount: number;
  maximumConcurrentLoadCount: number;
  maximumResidentRecordCount: number;
  simulationDimensionScale: number;
  simulationIterationScale: number;
};

export type ExampleCapabilities = {
  backends: readonly ExampleBackend[];
  deviceFeatures?: readonly string[];
  deviceLimits?: Readonly<{
    maxColorAttachments?: number;
    maxColorAttachmentBytesPerSample?: number;
  }>;
};

export type ExamplePreflightResult = {supported: true} | {supported: false; reason: string};

export const MOBILE_EXAMPLE_MEDIA_QUERY =
  '(max-width: 700px), (max-height: 500px) and (pointer: coarse)';
export const MAX_HIGH_DENSITY_MOBILE_PIXEL_RATIO = 2;
export const MAX_HIGH_DENSITY_MOBILE_PIXEL_COUNT = 1_500_000;

/** Separates responsive layout from the touchscreen-phone performance policy. */
export function getExampleRuntimeEnvironment(
  currentWindow: Pick<Window, 'devicePixelRatio' | 'innerHeight' | 'innerWidth' | 'matchMedia'>,
  currentNavigator: Pick<Navigator, 'maxTouchPoints'>
): ExampleRuntimeEnvironment {
  const matchMedia =
    typeof currentWindow.matchMedia === 'function'
      ? currentWindow.matchMedia.bind(currentWindow)
      : () => ({matches: false}) as MediaQueryList;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;
  const viewportWidth = currentWindow.innerWidth || 1;
  const viewportHeight = currentWindow.innerHeight || 1;
  return {
    compactViewport: matchMedia(MOBILE_EXAMPLE_MEDIA_QUERY).matches,
    handheld:
      coarsePointer &&
      currentNavigator.maxTouchPoints > 0 &&
      Math.min(viewportWidth, viewportHeight) <= 700,
    coarsePointer,
    maxTouchPoints: currentNavigator.maxTouchPoints || 0,
    viewportWidth,
    viewportHeight,
    devicePixelRatio: currentWindow.devicePixelRatio || 1
  };
}

/** Caps high-density phone canvases while preserving native desktop and ordinary phone resolution. */
export function getMobileExamplePixelRatio({
  devicePixelRatio,
  viewportHeight,
  viewportWidth,
  handheld
}: Pick<
  ExampleRuntimeEnvironment,
  'devicePixelRatio' | 'viewportHeight' | 'viewportWidth' | 'handheld'
>): true | number {
  const canvasPixelCount = Math.max(viewportWidth, 1) * Math.max(viewportHeight, 1);
  if (!handheld) {
    return true;
  }

  const maximumPixelRatio = Math.max(
    1,
    Math.min(
      MAX_HIGH_DENSITY_MOBILE_PIXEL_RATIO,
      Math.sqrt(MAX_HIGH_DENSITY_MOBILE_PIXEL_COUNT / canvasPixelCount)
    )
  );
  return devicePixelRatio <= maximumPixelRatio ? true : maximumPixelRatio;
}

/** Returns the shared starting budget used by reduced mobile examples. */
export function getExampleMobileQuality(
  definition: Pick<ExampleSupportDefinition, 'mobileMode'>,
  environment: ExampleRuntimeEnvironment
): ExampleMobileQuality {
  const reduced = environment.handheld && definition.mobileMode === 'reduced';
  return {
    canvasPixelRatio: getMobileExamplePixelRatio(environment),
    intermediateTargetScale: reduced ? 0.75 : 1,
    maximumSampleCount: reduced ? 2 : 4,
    preferFloatingPointColor: !reduced,
    maximumWorkerCount: reduced ? 1 : 2,
    maximumConcurrentLoadCount: reduced ? 2 : 4,
    maximumResidentRecordCount: reduced ? 250_000 : 1_000_000,
    simulationDimensionScale: reduced ? 0.5 : 1,
    simulationIterationScale: reduced ? 0.5 : 1
  };
}

/** Returns a static mobile block reason before expensive example startup begins. */
export function getExampleMobileUnsupportedReason(
  definition: Pick<ExampleSupportDefinition, 'mobileMode' | 'unsupportedReason'>,
  environment: ExampleRuntimeEnvironment
): string | undefined {
  return environment.handheld && definition.mobileMode === 'unsupported'
    ? definition.unsupportedReason || 'This example does not support mobile devices.'
    : undefined;
}

/** Human-readable mobile label shared by cards, headers, and standalone examples. */
export function getExampleMobileLabel(mode: ExampleMobileMode): string {
  switch (mode) {
    case 'full':
      return 'Mobile';
    case 'reduced':
      return 'Mobile quality';
    case 'unsupported':
      return 'Desktop only';
  }
}

/** Evaluates declarative requirements without importing or initializing an example application. */
export function preflightExampleSupport(
  definition: ExampleSupportDefinition,
  environment: ExampleRuntimeEnvironment,
  capabilities: ExampleCapabilities
): ExamplePreflightResult {
  const mobileReason = getExampleMobileUnsupportedReason(definition, environment);
  if (mobileReason) {
    return {supported: false, reason: mobileReason};
  }

  const requirements = definition.requirements;
  if (!requirements) {
    return {supported: true};
  }

  if (!requirements.backends.some(backend => capabilities.backends.includes(backend))) {
    return {
      supported: false,
      reason: `This example requires ${formatExampleBackends(requirements.backends)}, but this browser does not expose a compatible graphics backend. Try a current browser on a capable device or use a desktop browser.`
    };
  }

  const availableFeatures = new Set(capabilities.deviceFeatures);
  const missingFeature = requirements.requiredDeviceFeatures?.find(
    feature => !availableFeatures.has(feature)
  );
  if (missingFeature) {
    return {
      supported: false,
      reason: `This example requires the GPU feature “${missingFeature}”. Try a current browser on a capable device or use a desktop browser.`
    };
  }

  const requiredLimits = requirements.requiredDeviceLimits;
  const availableLimits = capabilities.deviceLimits;
  if (
    requiredLimits?.maxColorAttachments !== undefined &&
    (availableLimits?.maxColorAttachments ?? 0) < requiredLimits.maxColorAttachments
  ) {
    return {
      supported: false,
      reason: `This example requires ${requiredLimits.maxColorAttachments} color attachments, but this GPU exposes only ${availableLimits?.maxColorAttachments ?? 0}. Try a capable device or desktop browser.`
    };
  }
  if (
    requiredLimits?.maxColorAttachmentBytesPerSample !== undefined &&
    (availableLimits?.maxColorAttachmentBytesPerSample ?? 0) <
      requiredLimits.maxColorAttachmentBytesPerSample
  ) {
    return {
      supported: false,
      reason: `This example requires ${requiredLimits.maxColorAttachmentBytesPerSample} color-attachment bytes per sample, but this GPU exposes only ${availableLimits?.maxColorAttachmentBytesPerSample ?? 0}. Try a capable device or desktop browser.`
    };
  }

  return {supported: true};
}

export type StandaloneExampleSupport = {
  supported: boolean;
  reportFailed: (error: unknown) => void;
  reportRunning: () => void;
};

/** Installs the standalone-page support state without importing any example application code. */
export async function installStandaloneExampleSupport(): Promise<StandaloneExampleSupport> {
  const documentElement = document.documentElement;
  const definition = readStandaloneExampleDefinition(document);
  const environment = getExampleRuntimeEnvironment(window, navigator);
  const capabilities: ExampleCapabilities = {
    backends: await getAvailableStandaloneBackends()
  };
  const preflight = preflightExampleSupport(definition, environment, capabilities);
  const quality = getExampleMobileQuality(definition, environment);

  documentElement.dataset['lumaExampleId'] = definition.id;
  documentElement.dataset['lumaExampleMobileMode'] = definition.mobileMode;
  documentElement.dataset['lumaExampleQualityProfile'] = definition.mobileProfile;
  documentElement.dataset['lumaExampleState'] = preflight.supported ? 'loading' : 'unsupported';
  if (environment.handheld && typeof quality.canvasPixelRatio === 'number') {
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: quality.canvasPixelRatio
    });
  }

  const reportFailed = (error: unknown): void => {
    if (documentElement.dataset['lumaExampleState'] === 'unsupported') {
      return;
    }
    documentElement.dataset['lumaExampleState'] = 'failed';
    showStandaloneStatus('failed', getStandaloneErrorMessage(error));
  };
  const reportRunning = (): void => {
    if (documentElement.dataset['lumaExampleState'] === 'loading') {
      documentElement.dataset['lumaExampleState'] = 'running';
    }
  };

  window.addEventListener('error', event => reportFailed(event.error || event.message));
  window.addEventListener('unhandledrejection', event => reportFailed(event.reason));
  installStandaloneMobileStyles();
  if (environment.handheld) {
    showStandaloneMobileBadge(definition.mobileMode);
  }

  if (preflight.supported === false) {
    showStandaloneStatus('unsupported', preflight.reason);
  } else {
    observeStandaloneFirstFrame(reportRunning);
  }

  return {supported: preflight.supported, reportFailed, reportRunning};
}

async function getAvailableStandaloneBackends(): Promise<ExampleBackend[]> {
  const backends: ExampleBackend[] = [];
  if ('WebGL2RenderingContext' in window) {
    backends.push('webgl2');
  }
  if ('gpu' in navigator) {
    try {
      const gpu = (navigator as Navigator & {gpu?: GPU}).gpu;
      if (gpu && (await gpu.requestAdapter())) {
        backends.push('webgpu');
      }
    } catch {
      // A present-but-unusable WebGPU API should not pass the standalone preflight.
    }
  }
  return backends;
}

function readStandaloneExampleDefinition(currentDocument: Document): ExampleSupportDefinition {
  const readMeta = (name: string): string | undefined =>
    currentDocument.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content || undefined;
  const mobileMode = readMeta('luma-example-mobile') as ExampleMobileMode | undefined;
  const mobileProfile = readMeta('luma-example-mobile-profile') as
    | ExampleMobileQualityProfile
    | undefined;
  const backends = (readMeta('luma-example-backends') || '')
    .split(',')
    .filter(Boolean) as ExampleBackend[];
  return {
    id: readMeta('luma-example-id') || location.pathname,
    mobileMode: mobileMode || 'reduced',
    mobileProfile: mobileProfile || 'standard',
    unsupportedReason: readMeta('luma-example-mobile-unsupported-reason'),
    requirements: backends.length ? {backends} : undefined
  };
}

function observeStandaloneFirstFrame(reportRunning: () => void): void {
  let hasReportedOutput = false;
  const detectOutput = (): void => {
    if (hasReportedOutput) return;
    const canvas = document.querySelector('canvas');
    const hasCanvasOutput = canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0;
    const hasDomOutput = [...(document.body?.querySelectorAll('*') || [])].some(element => {
      if (
        element instanceof HTMLScriptElement ||
        element instanceof HTMLStyleElement ||
        element.hasAttribute('data-luma-example-mobile-badge') ||
        element.hasAttribute('data-luma-example-status')
      ) {
        return false;
      }
      const bounds = element.getBoundingClientRect();
      return (
        bounds.width > 0 &&
        bounds.height > 0 &&
        (element.textContent?.trim() || element.children.length)
      );
    });
    if (hasCanvasOutput || hasDomOutput) {
      hasReportedOutput = true;
      observer.disconnect();
      requestAnimationFrame(() => requestAnimationFrame(reportRunning));
    }
  };
  const observer = new MutationObserver(detectOutput);
  observer.observe(document.documentElement, {childList: true, subtree: true});
  window.addEventListener('load', detectOutput, {once: true});
}

function showStandaloneMobileBadge(mode: ExampleMobileMode): void {
  const badge = document.createElement('span');
  badge.dataset['lumaExampleMobileBadge'] = '';
  badge.setAttribute('aria-label', `Mobile support: ${getExampleMobileLabel(mode)}`);
  badge.style.cssText =
    'position:fixed;left:calc(8px + env(safe-area-inset-left,0px));bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:2147483646;padding:4px 8px;border:1px solid #7dd3fc57;border-radius:999px;background:#020617dd;color:#bae6fd;font:700 11px/1.4 system-ui;pointer-events:none;';
  badge.textContent = getExampleMobileLabel(mode);
  document.body.append(badge);
}

function showStandaloneStatus(state: 'failed' | 'unsupported', message: string): void {
  document.querySelector('[data-luma-example-status]')?.remove();
  const alert = document.createElement('div');
  alert.dataset['lumaExampleStatus'] = state;
  alert.setAttribute('role', 'alert');
  alert.style.cssText =
    'position:fixed;inset:16px;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;border:1px solid #475569;border-radius:12px;background:#020617ee;color:#e2e8f0;font:16px/1.5 system-ui;text-align:center;';
  const content = document.createElement('div');
  content.style.maxWidth = '620px';
  const heading = document.createElement('strong');
  heading.style.cssText = 'display:block;font-size:20px;margin-bottom:8px;';
  heading.textContent =
    state === 'unsupported'
      ? 'This example is not supported on this device.'
      : 'This example could not start.';
  const explanation = document.createElement('span');
  explanation.textContent = message;
  content.append(heading, explanation);
  alert.append(content);
  document.body.append(alert);
}

function installStandaloneMobileStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    @media (pointer: coarse) {
      button, select, input[type='button'], input[type='range'], [role='button'] { min-height: 44px; }
    }
    @media (pointer: coarse), (max-width: 700px), (max-height: 500px) {
      [data-panel], [class*='panel'], [class*='controls'] {
        max-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
        overflow-y: auto;
        overscroll-behavior: contain;
      }
      body { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }
    }
  `;
  document.head.append(style);
}

function getStandaloneErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : 'An unexpected error stopped the example.';
}

function formatExampleBackends(backends: readonly ExampleBackend[]): string {
  return backends.map(backend => (backend === 'webgpu' ? 'WebGPU' : 'WebGL2')).join(' or ');
}
