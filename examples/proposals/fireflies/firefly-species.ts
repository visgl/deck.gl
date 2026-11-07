// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

/** Display approximations of reported emission colors, not monochromatic spectral rendering. */
export const FIREFLY_SPECIES = [
  {id: 'photinus-pyralis', label: 'P. pyralis · yellow-green', color: [0.85, 1, 0.025]},
  {id: 'genji-hotaru', label: 'Hotaru · Genji', color: [0.63, 1, 0.015]},
  {id: 'photuris-versicolor', label: 'P. versicolor · green', color: [0.4, 1, 0.015]},
  {id: 'photinus-scintillans', label: 'P. scintillans · amber', color: [1, 0.8, 0.015]}
] as const;
