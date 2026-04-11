"""Script to generate thumbnails viewable in the pydeck docs

Usage:
    # Install dependencies first:
    #   uv pip install playwright Pillow
    #   playwright install chromium
    #
    # From the docs/ directory:
    #   make html-thumbnails          # all examples
    #   python scripts/snap_thumbnails.py ../examples/widgets.py  # single example
"""

import asyncio
import os
import subprocess
import sys

from const import EXAMPLE_GLOB, HTML_DIR, LOCAL_IMAGE_DIR

try:
    from playwright.async_api import async_playwright
    from PIL import Image
except ImportError:
    print("Please install playwright and Pillow before running this script:")
    print("  uv pip install playwright Pillow")
    print("  playwright install chromium")
    sys.exit(1)


# LARGE_EXAMPLES have longer loading times for their data sets than most
LARGE_EXAMPLES = ("bitmap_layer", "icon_layer", "heatmap_layer", "terrain_layer", "maplibre_globe")

THUMBNAIL_SIZE = (400, 300)


def run_example(fname):
    """Run a pydeck example script to produce its .html output"""
    print(f"[info] Running {fname}")
    result = subprocess.run(
        [sys.executable, fname],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"[error] {fname} exited with {result.returncode}")
        if result.stderr:
            print(f"[stderr] {result.stderr}")
    return result.returncode == 0


async def snap(fname):
    """Take a screenshot of the HTML output of a pydeck example"""
    basename = os.path.splitext(os.path.basename(fname))[0]
    html_fname = os.path.join(HTML_DIR, basename + ".html")
    png_fname = os.path.join(LOCAL_IMAGE_DIR, basename + ".png")
    html_path = os.path.abspath(html_fname)

    if not run_example(fname):
        print(f"[warn] Skipping screenshot for {fname} (example failed)")
        return None

    if not os.path.exists(html_path):
        print(f"[warn] Expected HTML not found: {html_path}")
        return None

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 800, "height": 600})

        url = f"file://{html_path}"
        is_large = basename in LARGE_EXAMPLES

        if is_large:
            await page.goto(url)
            await page.wait_for_timeout(10000)
        else:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            # Give deck.gl a moment to finish rendering
            await page.wait_for_timeout(3000)

        await page.screenshot(path=png_fname)
        await browser.close()

    print(f"[info] Screenshot saved: {png_fname}")
    return png_fname


async def snap_with_retries(fname, retries=3):
    for attempt in range(retries):
        try:
            output_fname = await snap(fname)
            if output_fname:
                return output_fname
            return None
        except Exception as e:
            print(f"[warn] Attempt {attempt + 1}/{retries} failed for {fname}: {e}")
            if attempt == retries - 1:
                print(f"[error] All retries exhausted for {fname}")
    return None


def shrink_image(fname):
    """Resize screenshot to thumbnail dimensions"""
    print(f"[info] Shrinking {fname}")
    try:
        im = Image.open(fname)
        im.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)
        im.save(fname, "PNG")
    except IOError:
        print(f"[error] Cannot create thumbnail for {fname}")


async def main(fname_arg=None):
    os.makedirs(LOCAL_IMAGE_DIR, exist_ok=True)
    fnames = [fname_arg] if fname_arg else EXAMPLE_GLOB
    for fname in fnames:
        png_fname = await snap_with_retries(fname)
        if png_fname:
            try:
                shrink_image(png_fname)
            except Exception as e:
                print(f"[warn] Failed to shrink {png_fname}: {e}")
                continue


if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_fname = sys.argv[1]
        print(f"Snapping .png of {input_fname}")
        asyncio.run(main(input_fname))
    else:
        asyncio.run(main())
