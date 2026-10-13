// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export type GridCell = {id: string; value: number};

type GridData = Record<string, unknown>[] | {data: Record<string, unknown>[]};

export function normalizeGridCells(gridData: GridData): GridCell[] {
  const cells = Array.isArray(gridData) ? gridData : gridData.data;

  return cells.map(cell => ({id: String(cell.id), value: Number(cell.value)}));
}

export function filterGridCells(
  cells: readonly GridCell[],
  filterCategories: readonly number[]
): GridCell[] {
  return cells.filter(cell => filterCategories.includes(cell.value));
}
