init:
	# Build deck.gl at the root of this repository
	cd ../..; yarn bootstrap; cd -; \
	# Set up the pydeck project
	pip install -r requirements.txt
	pip install -r requirements-dev.txt
	pip install -e .
	$(MAKE) prepare-jupyter

prepare-jupyter:
	# Enable the notebook extension
	jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
	jupyter nbextension enable --sys-prefix --py pydeck
	# Build and install the JS module
	cd ../../modules/jupyter-widget/; \
	  jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build; \
	  jupyter labextension install . --no-build; \
	  jupyter labextension link .; \
	  jupyter lab build; \
	  cd ../../bindings/pydeck

test:
	pytest

docs:
	cd docs; \
	$(MAKE) html
	
publish-conda:	
	echo "NOTE pydeck does not yet publish to conda-forge. Awaiting #4202."

bump-version:
	@read -p "Choose a release type {MAJOR, MINOR, PATCH, BETA, ALPHA, RC}:" choice; \
	python bump_version.py "$$choice";

publish-pypi:
	rm -rf ./dist/*
	pip install .
	python setup.py sdist bdist_wheel
	pip install twine
	python -m twine upload dist/*

bump-and-publish:
	$(MAKE) bump-version;
	$(MAKE) test;
	VERSION=$$(python -c "import pydeck; print(pydeck.__version__)");
	git commit -am "Release version $$VERSION";
	$(MAKE) publish-conda;
	$(MAKE) publish-pypi;
