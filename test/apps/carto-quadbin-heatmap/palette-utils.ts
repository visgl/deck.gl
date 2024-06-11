import {Color} from '@deck.gl/core';
import {colorCategories} from '@deck.gl/carto';

export function getPalette(paletteName?: string, rgb = true): Color[] {
  const [colors, offsetString] = paletteName ? paletteName.split('-') : ['Prism'];
  const n = 6;
  const offset = parseInt(offsetString || '0');
  const domain = Array(n + offset)
    .fill(0)
    .map((_, i) => i); // [0, 1, ...n]
  const getColor = colorCategories({attr: (c: any) => c.value, domain, colors});
  let palette: number[][] = domain.map(c => ({value: c})).map(getColor as any);

  if (rgb) {
    palette = palette.map(c => c.slice(0, 3).map(v => v / 255));
  }

  return palette.slice(offset).map(c => new Uint8Array(c));
}

export function getPaletteGradient(paletteName: string) {
  const colors = getPalette(paletteName, false);
  let gradient = 'linear-gradient(90deg,';
  for (let c = 0; c < colors.length; c++) {
    const color = `rgba(${colors[c].join(',')})`;
    const position = Math.round((c / (colors.length - 1)) * 100);
    gradient += `${color} ${position}%,`;
  }

  return `${gradient.slice(0, -1)})`;
}
