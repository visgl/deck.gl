// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Dimensions, ValidationResult, ValidationWarning} from '../types';

/**
 * Validation rule definition.
 */
type ValidationRule = {
  check: (d: Dimensions) => boolean; // Returns true if rule is violated
  warning: (d: Dimensions) => ValidationWarning;
};

/**
 * Validation rules - warnings only, no auto-correction.
 * This allows intentionally testing edge cases.
 */
const VALIDATION_RULES: ValidationRule[] = [
  // Globe requires MapLibre or deck-only (GlobeView)
  {
    check: d => d.globe && d.basemap !== 'maplibre' && d.basemap !== 'deck-only',
    warning: d => ({
      dimension: 'globe',
      message: `Globe projection only works with MapLibre or Deck.gl Only (current: ${d.basemap})`,
      severity: 'warning'
    })
  },

  // Interleaved has no effect with deck-only
  {
    check: d => d.interleaved && d.basemap === 'deck-only',
    warning: () => ({
      dimension: 'interleaved',
      message: 'Interleaved mode has no effect without a basemap',
      severity: 'info'
    })
  },

  // Batched requires interleaved
  {
    check: d => d.batched && !d.interleaved,
    warning: () => ({
      dimension: 'batched',
      message: 'Batched rendering requires interleaved mode',
      severity: 'warning'
    })
  },

  // MultiView not supported with Google Maps
  {
    check: d => d.multiView && d.basemap === 'google-maps',
    warning: () => ({
      dimension: 'multiView',
      message: 'Multi-view is not supported with Google Maps',
      severity: 'warning'
    })
  },

  // Batched not supported with Google Maps
  {
    check: d => d.batched && d.basemap === 'google-maps',
    warning: () => ({
      dimension: 'batched',
      message: 'Batched rendering is not supported with Google Maps',
      severity: 'warning'
    })
  },

  // Google Maps has limited interleaved support (info only)
  {
    check: d => d.interleaved && d.basemap === 'google-maps',
    warning: () => ({
      dimension: 'interleaved',
      message: 'Google Maps cannot render layers under map labels (no slot/beforeId support)',
      severity: 'info'
    })
  }
];

/**
 * Validate dimensions and return warnings.
 * Does NOT auto-correct - lets user test edge cases intentionally.
 */
export function validateDimensions(dimensions: Dimensions): ValidationResult {
  const warnings: ValidationWarning[] = [];

  for (const rule of VALIDATION_RULES) {
    if (rule.check(dimensions)) {
      warnings.push(rule.warning(dimensions));
    }
  }

  return {warnings};
}
