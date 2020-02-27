import asyncio
import glob
import os

from pyppeteer import launch

here = os.path.dirname(os.path.abspath(__file__))
os.chdir(here)
example_glob = os.path.join(here, "*_layer.py")


async def main():
    browser = await launch()
    page = await browser.newPage()
    for fname in glob.glob(example_glob):
        print("Converting %s to an image" % fname)
        exec(open(fname).read())
        png_fname = os.path.splitext(fname)[0] + ".png"
        html_fname = os.path.splitext(fname)[0] + ".html"
        await page.setViewport({"width": 768, "height": 700})
        await page.goto("file://%s" % html_fname, waitUntil="networkidle2")
        await page.screenshot({"path": png_fname})
        print("Sucessfully converted %s to a png at %s" % (fname, png_fname))
    await browser.close()


if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
