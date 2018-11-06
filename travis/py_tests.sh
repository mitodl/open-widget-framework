#!/usr/bin/env bash

cd open_widget_framework

echo "Running pytest"
py.test

./scripts/test/codecov_python.sh
