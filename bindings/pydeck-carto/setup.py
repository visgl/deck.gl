from os.path import join
from setuptools import find_packages, setup

version_ns = {}
with open(join("pydeck_carto", "_version.py")) as f:
    exec(f.read(), {}, version_ns)

setup(
    name="pydeck-carto",
    version=version_ns["__version__"],
    description="Pydeck wrapper for use with CARTO",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    keywords=["pydeck", "carto", "visualization", "graphics", "GIS", "maps"],
    author="CARTO",
    author_email="jarroyo@carto.com",
    url="https://github.com/visgl/deck.gl/tree/master/bindings/pydeck-carto",
    license="BSD 3-Clause",
    packages=find_packages(exclude=["examples", "tests"]),
    python_requires=">=3.7",
    install_requires=[
        "pydeck>=0.8.0b4",
        "carto-auth>=0.1.0b3",
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Framework :: Jupyter",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: BSD License",
        "Natural Language :: English",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
    ],
    zip_safe=False,
)
