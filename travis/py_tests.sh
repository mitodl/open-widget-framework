#!/usr/bin/env bash

cd open_widget_framework

echo "Running python tests..."
# python runtests.py
coverage run runtests.py; coverage report -m --omit="*/virtualenv/*"

# echo "Running pytest..."
# py.test

#./scripts/test/codecov_python.sh
