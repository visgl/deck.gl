import asyncio
import glob
import os
import sys

try:
    from pyppeteer import launch
except ImportError:
    print("Please install pyppeteer before running this script")
    sys.exit(1)


here = os.path.dirname(os.path.abspath(__file__))
EXAMPLE_GLOB = "../examples/*_layer.py"


async def run(cmd):
    """Runs a shell command within asyncio"""
    proc = await asyncio.create_subprocess_shell(
        cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )

    stdout, stderr = await proc.communicate()

    print(f"[info] {cmd!r} exited with {proc.returncode}")
    if stdout:
        print(f"[stdout]\n{stdout.decode()}")
    if stderr:
        print(f"[stderr]\n{stderr.decode()}")


async def main():
    for fname in glob.glob(EXAMPLE_GLOB):
        browser = await launch(
            autoClose=False,
            headless=False,
            args=["--no-sandbox", "--disable-web-security"],
        )
        page = await browser.newPage()
        print("[info] Converting %s to an image" % fname)
        await run(" ".join(["python", fname]))
        png_fname = os.path.splitext(fname)[0] + ".png"
        html_fname = os.path.join(
            here, os.path.splitext(os.path.basename(fname))[0] + ".html"
        )
        fpath = "file://%s" % html_fname
        if "bitmap_layer" in html_fname or "icon_layer" in html_fname:
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


if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
