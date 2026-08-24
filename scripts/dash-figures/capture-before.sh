#!/bin/bash
#
# Renders the dash figure panels using the pre-9.4 dash implementation, so the docs can show
# honest before/after pairs.
#
# Only the three behavior-carrying sources are reverted. The render spec, the geometry it
# draws and the test harness all stay at the current revision, so both halves of every pair
# render exactly the same scene and differ only in the code under test. Reverting the whole
# tree instead would compare against whatever geometry those cases happened to use back then,
# which for several of them is not the geometry they use now.
#
# The renders are collected from the `-fail.png` files the harness writes on a golden
# mismatch, which is its documented way of surfacing an actual render (see
# scripts/print-golden-image.js). Every reverted case is expected to fail here - that failure
# is the output.
#
# Usage:
#   scripts/dash-figures/capture-before.sh [baseline-ref] [output-dir]
#
# Set DASH_FIGURES_RENDER_CMD to override how the focused render project is invoked.

set -euo pipefail
SCRIPT_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_ROOT="$(cd -- "$SCRIPT_DIRECTORY/../.." && pwd)"
cd "$REPOSITORY_ROOT"

# Pin the implementation used by the committed before/after figures. An explicit argument still
# allows the pipeline to be exercised against another baseline without changing this provenance.
BASELINE_REF="${1:-ddd7eaae7316b4f65b82258dfc5d65b271cac135}"
OUTPUT_DIRECTORY="${2:-.dash-figures/before}"
if [ -n "${DASH_FIGURES_RENDER_CMD:-}" ]; then
  read -r -a RENDER_COMMAND <<< "$DASH_FIGURES_RENDER_CMD"
else
  RENDER_COMMAND=(yarn vitest run --project render)
fi

SOURCE_FILES=(
  modules/extensions/src/path-style/shaders.glsl.ts
  modules/extensions/src/path-style/path-style-extension.ts
  modules/layers/src/path-layer/path-layer-vertex.glsl.ts
)

REQUIRED_PANEL_NAMES=(
  path-dash-subpixel-square
  path-dash-billboard-map-z14
  path-dash-3d-flat
)

GOLDEN_DIRECTORY=test/render/golden-images

restore_sources() {
  git checkout HEAD -- "${SOURCE_FILES[@]}"
}

for source in "${SOURCE_FILES[@]}"; do
  if ! git diff --quiet -- "$source" || ! git diff --cached --quiet -- "$source"; then
    echo "Refusing to overwrite modified source: $source" >&2
    exit 1
  fi
done

# Capture and composition are deliberately separate commands. Invalidate only the three files
# consumed by the compositor before starting, so a failed or interrupted capture cannot leave a
# previous run looking current. Other files in an explicitly supplied output directory are kept.
for panel_name in "${REQUIRED_PANEL_NAMES[@]}"; do
  rm -f "$OUTPUT_DIRECTORY/$panel_name.png"
done

CAPTURE_DIRECTORY="$(mktemp -d "${TMPDIR:-/tmp}/deck-dash-before.XXXXXX")"

cleanup() {
  restore_sources
  rm -f "$GOLDEN_DIRECTORY"/path-dash-*-fail.png "$GOLDEN_DIRECTORY"/path-dash-*-diff.png
  rm -rf "$CAPTURE_DIRECTORY"
}

trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

echo "Reverting dash sources to $BASELINE_REF..."
for source in "${SOURCE_FILES[@]}"; do
  git show "$BASELINE_REF:$source" > "$source"
done

rm -f "$GOLDEN_DIRECTORY"/path-dash-*-fail.png "$GOLDEN_DIRECTORY"/path-dash-*-diff.png

echo "Rendering with the reverted implementation (mismatches are expected)..."
"${RENDER_COMMAND[@]}" test/render/test-cases/path-dash.spec.ts || true

captured_count=0
for failed_image in "$GOLDEN_DIRECTORY"/path-dash-*-fail.png; do
  [ -e "$failed_image" ] || continue
  image_name=$(basename "$failed_image")
  cp "$failed_image" "$CAPTURE_DIRECTORY/${image_name%-fail.png}.png"
  captured_count=$((captured_count + 1))
done

missing_count=0
for panel_name in "${REQUIRED_PANEL_NAMES[@]}"; do
  if [ ! -f "$CAPTURE_DIRECTORY/$panel_name.png" ]; then
    echo "Missing required before panel: $panel_name.png" >&2
    missing_count=$((missing_count + 1))
  fi
done
if [ "$missing_count" -ne 0 ]; then
  echo "Failed to capture $missing_count required before panel(s)." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIRECTORY"
for captured_image in "$CAPTURE_DIRECTORY"/*.png; do
  cp "$captured_image" "$OUTPUT_DIRECTORY/"
done
echo "Captured $captured_count fresh before panels into $OUTPUT_DIRECTORY"
