init:
	cd ../..
	yarn bootstrap
	cd -
	pip install -r requirements.txt
	pip install -r requirements-dev.txt
	pip install -e .
	make prepare-jupyter

prepare-jupyter:
	jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
	jupyter nbextension enable --sys-prefix --py pydeck
	jupyter labextension install @jupyter-widgets/jupyterlab-manager
	cd ../../modules/jupyter-widget/
	jupyter labextension install .

test:
	pytest

docs:
	cd docs
	make html

# e.g. `make RELEASE_TYPE=MAJOR bump-version
bump-version:
	python bump_version.py $RELEASE_TYPE
	export $PYDECK_VERSION=$@
	
publish-conda:	
	echo "NOTE pydeck does not yet publish to conda-forge. Awaiting #4202."

publish-pypi:
	rm -rf ./dist/*
	pip install .
	python setup.py sdist bdist_wheel
	pip install twine
	python -m twine upload dist/*

# e.g. `make RELEASE_TYPE=MAJOR bump-and-publish
bump-and-publish:
	make bump-version $RELEASE_TYPE
	git commit -am "Release version $PYDECK_VERSION"
	make test
	make publish-conda
	make publish-pypi
