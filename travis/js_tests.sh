#!/usr/bin/env bash

status=0

# Run each of these commands so we have the output for debugging. Record status so we know if any fail.
function run_test {
    "$@"
    local test_status=$?
    if [ $test_status -ne 0 ]; then
        status=$test_status
    fi
    return $status
}


cd open-widget-framework

run_test npm install

echo "Running fmt:check..."
run_test npm run fmt:check

echo "Running lint..."
run_test npm run lint

echo "Running tests..."
run_test npm run codecov

echo "Uploading coverage..."

run_test node ./node_modules/codecov/bin/codecov

exit $status
