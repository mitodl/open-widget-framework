#!/usr/bin/env bash

cd open_widget_framework

echo "Running python tests"
python runtests.py

./scripts/test/codecov_python.sh
