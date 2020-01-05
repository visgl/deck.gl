from __future__ import print_function

from distutils.command.install import install
from setuptools import setup, find_packages, Command
from setuptools.command.sdist import sdist
from setuptools.command.build_py import build_py
from setuptools.command.egg_info import egg_info
from setuptools.command.develop import develop

import atexit
from distutils import log
import os
from shutil import copy
from subprocess import check_call
import sys

here = os.path.dirname(os.path.abspath(__file__))


def read(*parts):
    return open(os.path.join(here, *parts), "r").read()


log.info("setup.py entered")
log.info("$PATH=%s" % os.environ["PATH"])

PATH_TO_WIDGET = "../../modules/jupyter-widget"
PATH_TO_REPO_ROOT = "../.."

yarn_root = os.path.join(here, PATH_TO_REPO_ROOT)
widget_dir = os.path.join(here, PATH_TO_WIDGET)

npm_path = os.pathsep.join(
    [
        os.path.join(PATH_TO_REPO_ROOT, "node_modules", ".bin"),
        os.environ.get("PATH", os.defpath),
    ]
)


# build_all is read from the command line and uses `yarn bootstrap`
# for a frontend build instead of using `npm run build` within @deck.gl/jupyter-widget
build_all = False


def update_package_data(distribution):
    """update package_data to catch changes during setup"""
    build_py = distribution.get_command_obj("build_py")
    # distribution.package_data = find_package_data()
    # re-init build_py options which load package_data
    build_py.finalize_options()


class ExitHookDevelop(develop):
    """Registers widget with notebook server after development installation"""

    description = "Register widget with a local Jupyter notebook"

    def run(self):
        def _post_install():
            log.info("Enabling widget locally...")
            # This bash script actually installs the widget into a notebook server
            check_call(["bash", "postBuild"], cwd=here)

        atexit.register(_post_install)
        develop.run(self)


class FrontendBuild(Command):
    description = """Builds the widget frontend and copy result into pydeck's nbextension directory for serving"""

    # Files to copy into the Python side of the widget
    target_files = [
        os.path.join(here, "pydeck", "nbextension", "static", "index.js"),
        os.path.join(here, "pydeck", "nbextension", "static", "index.js.map"),
    ]

    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def clean_frontend_build(self):
        log.info("Removing previous JS nbextension files")
        for filepath in self.target_files:
            try:
                os.remove(filepath)
            except Exception:
                log.info("No file %s, not removing" % filepath)

    def has_build_utilities(self):
        try:
            check_call(["npm", "--version"], stdout=open(os.devnull, "wb"))
            check_call(["yarn", "--version"], stdout=open(os.devnull, "wb"))
            return True
        except Exception:
            return False

    def copy_frontend_build(self):
        """Copy JS bundle from top-level JS module to pydeck widget's `static/` folder.
           Overwrites destination files"""
        js_dist_dir = os.path.join(widget_dir, "dist")
        nbextension_folder = os.path.join(here, "pydeck", "nbextension", "static")
        js_files = [
            {
                "source": os.path.join(js_dist_dir, "index.js"),
                "destination": nbextension_folder,
            },
            {
                "source": os.path.join(js_dist_dir, "index.js.map"),
                "destination": nbextension_folder,
            },
        ]
        for js_file in js_files:
            log.debug("Copying %s to %s" % (js_file["source"], js_file["destination"]))
            copy(js_file["source"], js_file["destination"])

    def run(self):
        has_build_utilities = self.has_build_utilities()
        if not has_build_utilities:
            log.error(
                "`yarn` and/or `npm` are unavailable but are necessary for this build."
            )

        env = os.environ.copy()
        env["PATH"] = npm_path

        if build_all:
            log.info(
                "Installing build dependencies with yarn. This may take a while..."
            )
            check_call(
                ["yarn", "bootstrap"],
                cwd=yarn_root,
                stdout=sys.stdout,
                stderr=sys.stderr,
                env=env,
            )
        else:
            log.info("Installing build dependencies with `npm run build`.")
            check_call(
                ["npm", "run", "build"],
                cwd=widget_dir,
                stdout=sys.stdout,
                stderr=sys.stderr,
                env=env,
            )

        self.clean_frontend_build()
        self.copy_frontend_build()

        for t in self.target_files:
            if not os.path.exists(t):
                msg = "Missing file: %s" % t
                if not has_build_utilities:
                    msg += "\nyarn is required to build a development version of widgetsnbextension"
                raise ValueError(msg)

        # update package data in case this created new files
        update_package_data(self.distribution)


def js_prerelease(command, strict=False):
    """decorator for symlinking notebook with extension in development"""

    class DecoratedCommand(command):
        def run(self):
            jsdeps = self.distribution.get_command_obj("jsdeps")  # noqa
            self.distribution.run_command("jsdeps")
            command.run(self)
            update_package_data(self.distribution)

    return DecoratedCommand


version_ns = {}
with open(os.path.join(here, "pydeck", "_version.py")) as f:
    exec(f.read(), {}, version_ns)


if __name__ == "__main__":
    if "--build_all" in sys.argv:
        build_all = True
        sys.argv.remove("--build_all")

    setup(
        name="pydeck",
        version=version_ns["__version__"],
        description="Widget for deck.gl maps",
        long_description="{}".format(read("README.md")),
        long_description_content_type="text/markdown",
        license="MIT License",
        include_package_data=True,
        packages=find_packages(),
        cmdclass={
            "install": install,
            "develop": js_prerelease(ExitHookDevelop),
            "build_py": build_py,
            "egg_info": egg_info,
            "sdist": js_prerelease(sdist, strict=True),
            "jsdeps": FrontendBuild,
        },
        author="Andrew Duberstein",
        author_email="ajduberstein@gmail.com",
        url="https://github.com/uber/deck.gl/tree/master/bindings/pydeck",
        keywords=["data", "visualization", "graphics", "GIS", "maps"],
        classifiers=[
            "Intended Audience :: Developers",
            "Intended Audience :: Science/Research",
            "Topic :: Multimedia :: Graphics",
            "License :: OSI Approved :: MIT License",
            "Programming Language :: Python :: 2.7",
            "Programming Language :: Python :: 3",
            "Programming Language :: Python :: 3.3",
            "Programming Language :: Python :: 3.4",
            "Programming Language :: Python :: 3.5",
            "Programming Language :: Python :: 3.6",
            "Programming Language :: Python :: 3.7",
            "Framework :: Jupyter",
        ],
        extras_require={"testing": ["pytest"]},
        install_requires=[
            'ipykernel>=5.1.2;python_version>="3.4"',
            'ipython>=5.8.0;python_version<"3.4"',
            "ipywidgets>=7.0.0",
            "traitlets>=4.3.2",
            "jinja2>=2.10.1",
        ],
        setup_requires=["pytest-runner", "Jinja2>=2.10.1"],
        tests_require=["pytest"],
        data_files=[
            (
                "share/jupyter/nbextensions/pydeck",
                [
                    "pydeck/nbextension/static/extensionRequires.js",
                    "pydeck/nbextension/static/index.js",
                    "pydeck/nbextension/static/index.js.map",
                ],
            ),
            ("etc/jupyter/nbconfig/notebook.d", ["pydeck.json"])
        ],
        zip_safe=False,
    )
