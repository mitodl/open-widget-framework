#!/usr/bin/env bash

cd open-widget-framework

npm install

npm run codecov

echo "Uploading coverage..."

node ./node_modules/codecov/bin/codecov
