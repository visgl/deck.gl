import os
import logging

import asyncio

from pyppeteer import launch

NOTEBOOK_URL = "http://localhost:8889/notebooks/test.ipynb?token=token"
LAB_URL = "http://127.0.0.1:8888/lab/tree/test.ipynb?token=token"

NB_PLAY_BUTTON_XPATH = "/html/body/div[3]/div[3]/div[2]/div/div/div[5]/button[1]/span"
LAB_PLAY_BUTTON_XPATH = "/html/body/div[1]/div[3]/div[2]/div[3]/div[2]/div[1]/div[6]/button/span"


async def go_to_page_and_screenshot(url, fname, click_path, output_dir="./screenshots"):
    browser = None
    try:
        browser = await launch(headless=False, args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = await browser.newPage()
        await page.goto(url, waitUntil="networkidle2")
        elements = await page.xpath(click_path)
        for element in elements:
            await element.click()
        await page.setViewport({"width": 768, "height": 1300})
        path = os.path.join(str(output_dir), fname)
        logging.info("Writing screenshot to %s" % path)
        # hack: sleep five seconds, wait for visualization to load
        await asyncio.sleep(5)
        await page._screenshotTask("png", {"path": path, "fullPage": True})
        await browser.close()
    except Exception as e:
        browser.process.kill()
        raise e


async def screenshot():
    # Wait for docker containers to start
    await asyncio.sleep(5)
    await go_to_page_and_screenshot(NOTEBOOK_URL, "notebook-screenshot.png", NB_PLAY_BUTTON_XPATH)
    await asyncio.sleep(5)
    await go_to_page_and_screenshot(LAB_URL, "lab-screenshot.png", LAB_PLAY_BUTTON_XPATH)


if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(screenshot())
