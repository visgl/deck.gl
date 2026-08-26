# PathStyleExtension dash figures

The figures in `docs/images/path-style/` are assembled from the committed render-test goldens.
The comparison figure also needs three renders of the same scenes against the implementation that
predates this dash stack. `capture-before.sh` recreates those panels; they are scratch artifacts in
`.dash-figures/` and are intentionally ignored by Git.

From any working directory, run:

```bash
/path/to/deck.gl/scripts/dash-figures/capture-before.sh
node /path/to/deck.gl/scripts/dash-figures/compose.mjs
```

The capture script defaults to the exact `master` commit used to compose the checked-in figures.
Pass another Git ref as its first argument only when intentionally updating that comparison. The
three implementation sources it temporarily replaces must be clean; they are restored on exit
even when the render command fails or is interrupted.

## Inputs

| Output | Render-test inputs |
| --- | --- |
| `path-style-dash-modes.png` | `path-dash-mode-combinations` |
| `path-style-dash-density.png` | `path-dash-density-default`, `path-dash-density-mode-path` |
| `path-style-dash-units.png` | `path-dash-units-z12`, `path-dash-units-z13`, `path-dash-units-z14` |
| `path-style-dash-fixes.png` | Before and after panels for `path-dash-subpixel-square`, `path-dash-billboard-map-z14`, and `path-dash-3d-flat` |

The rendered dash panels are deterministic under the render-test environment. Captions are rendered
from SVG using the platform's system sans-serif font, so glyph antialiasing may vary slightly across
operating systems without changing the content of a figure.
