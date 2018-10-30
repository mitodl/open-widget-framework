#!/usr/bin/env bash

cd open_widget_framework

py.test

./scripts/test/codecov_python.sh
./scripts/test/detect_missing_migrations.sh
