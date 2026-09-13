import {Color} from '@deck.gl/core';
import {colorCategories} from '@deck.gl/carto';

export function getColorRange(paletteName: string): Color[] {
  const n = 6;
  const domain = Array(n)
    .fill(0)
    .map((_, i) => i); // [0, 1, ...n]
  const getColor = colorCategories({attr: (c: any) => c.value, domain, colors: paletteName});
  let palette: number[][] = domain.map(c => ({value: c})).map(getColor as any);

  return palette.map(c => new Uint8Array(c));
}
