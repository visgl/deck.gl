import pytest

import glob
import logging
import os
import subprocess
import time
import uuid
import urllib

import asyncio


here = os.path.dirname(os.path.abspath(__file__))
notebook_directory = os.path.join(here, "../../examples/")
jupyter_execution_directory = os.path.join(notebook_directory, "./..")
token = str(uuid.uuid4())


def make_nb_url(ipynb, token):
    return "http://127.0.0.1:9876/notebooks/examples/" + urllib.parse.quote(ipynb) + "?token=" + token


async def start_notebook():
    my_env = os.environ.copy()
    my_env["PYTHONPATH"] = "{}".format(jupyter_execution_directory)
    my_env["JUPYTER_TOKEN"] = token
    return subprocess.Popen(
        "jupyter notebook --no-browser --port 9876 --ip 0.0.0.0 --allow-root",
        shell=True,
        cwd=jupyter_execution_directory,
        env=my_env,
    )


async def stop_notebook(nb_process):
    nb_process.kill()


def list_notebooks():
    """Get list of all example notebooks for execution"""
    notebook_path = os.path.join(notebook_directory, "*.ipynb")
    return sorted([os.path.basename(fn) for fn in glob.glob(notebook_path)])


async def run_notebooks(output_dir="."):
    """Run and screenshot all notebooks. Starts a notebook server."""
    from .screenshot_utils import go_to_page_and_screenshot  # noqa

    nb_process = await start_notebook()
    try:
        file_names = list_notebooks()
        for file_name in file_names:
            logging.info("Running for %s" % file_name)
            url = make_nb_url(file_name, token)
            await go_to_page_and_screenshot(url, file_name, output_dir=output_dir)
    except Exception as e:
        logging.error("Caught exception %s" % str(e))
        raise e
    finally:
        await stop_notebook(nb_process)


@pytest.mark.skip(reason="No golden images yet generated")
@pytest.mark.asyncio
async def test_notebooks(tmp_path):
    await run_notebooks(tmp_path)


def main():
    logging.info("Running script version")
    asyncio.get_event_loop().run_until_complete(run_notebooks())


if __name__ == "__main__":
    main()
