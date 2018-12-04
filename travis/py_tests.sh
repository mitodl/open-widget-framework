#!/usr/bin/env bash

cd open_widget_framework

echo "Installing test requirements..."
pip install -r test_requirements.txt

echo "Running python tests..."
# python runtests.py
coverage run runtests.py; coverage report -m --omit="*/site-packages/*"

echo "Uploading coverage..."
codecov

# echo "Running pytest..."
# py.test

#./scripts/test/codecov_python.sh
