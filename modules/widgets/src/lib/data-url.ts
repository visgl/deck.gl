export function getCSSMask(imageUrl: string | null | undefined) {
  if (!imageUrl) return undefined;
  const cssUrl = `url("${imageUrl.replace(/"/g, `'`)}")`;
  return {maskImage: cssUrl, WebkitMaskImage: cssUrl};
}
