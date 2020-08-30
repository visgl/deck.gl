"""Script to generate thumbnails viewable in the pydeck docs"""
import asyncio
import os
from pathlib import Path
import sys

from const import EXAMPLE_GLOB, HTML_DIR, LOCAL_IMAGE_DIR

try:
    from pyppeteer import launch
    from pyppeteer.errors import NetworkError, TimeoutError
    from PIL import Image
except ImportError:
    print("Please install pyppeteer and Pillow before running this script")
    sys.exit(1)


# LARGE_EXAMPLES have longer loading times for their data sets than most
LARGE_EXAMPLES = ("bitmap_layer", "icon_layer", "heatmap_layer", "terrain_layer")


async def run(cmd):
    """Runs a shell command within asyncio"""
    proc = await asyncio.create_subprocess_shell(cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)

    stdout, stderr = await proc.communicate()

    print(f"[info] {cmd!r} exited with {proc.returncode}")
    if stdout:
        print(f"[stdout]\n{stdout.decode()}")
    if stderr:
        print(f"[stderr]\n{stderr.decode()}")


async def snap(fname):
    browser = await launch(
        autoClose=False,
        headless=False,
        args=["--no-sandbox", "--disable-web-security"],
    )
    page = await browser.newPage()
    print("[info] Converting %s to an image" % fname)
    await run(" ".join(["python", fname]))
    html_fname = os.path.join(HTML_DIR, os.path.splitext(os.path.basename(fname))[0] + ".html")
    png_fname = os.path.join(LOCAL_IMAGE_DIR, os.path.splitext(os.path.basename(fname))[0] + ".png")
    fpath = "file://%s" % html_fname
    if html_fname.replace(".html", "") in LARGE_EXAMPLES:
        await page.goto(fpath)
        await asyncio.sleep(10)
    else:
        await page.goto(
            fpath,
            waitUntil=["load", "networkidle2", "networkidle0"],
            timeout=30000,
        )
    await page.screenshot({"path": png_fname})
    print("[info] Sucessfully converted %s to a png at %s" % (fname, png_fname))
    await browser.close()
    return png_fname


async def snap_with_retries(fname, retries=3):
    while retries:
        try:
            output_fname = await snap(fname)
            if output_fname:
                return output_fname
            retries = 0
        # Repeat if failed
        except (NetworkError, TimeoutError):
            retries -= 1


def shrink_image(fname):
    print("[info] Shrinking the image at", fname)
    SIZE = 400, 300
    try:
        im = Image.open(fname)
        im.thumbnail(SIZE, Image.ANTIALIAS)
        im.save(fname, "PNG")
    except IOError:
        print("[error] Cannot create thumbnail for", fname)


async def main(fname_arg=None):
    fnames = [fname_arg] if fname_arg else EXAMPLE_GLOB
    for fname in fnames:
        png_fname = await snap_with_retries(fname)
        try:
            shrink_image(png_fname)
        except Exception:
            continue


if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_fname = sys.argv[1]
        print("Snapping .png of", input_fname)
        asyncio.get_event_loop().run_until_complete(main(input_fname))
    else:
        asyncio.get_event_loop().run_until_complete(main())
