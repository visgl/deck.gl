import * as React from 'react';
export default function extractStyles({
  width,
  height,
  style
}: {
  width?: string | number;
  height?: string | number;
  style?: Partial<CSSStyleDeclaration> | null;
}): {
  containerStyle: React.CSSProperties;
  canvasStyle: React.CSSProperties;
};
// # sourceMappingURL=extract-styles.d.ts.map
