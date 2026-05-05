#!/bin/bash

# if [ "$CI" = "true" ]; then
#   set -e
# fi

foldersToVisit=("forms" "government" "registration" "reports2" "users" "businesses" "filings")
ENVIRONMENT=${CYPRESS_environment:-dev}

total_tests=0
failed_tests=0
failed_services=()

echo "========================================="
echo "Starting Cypress test execution"
echo "Environment: $ENVIRONMENT"
echo "Services to test: ${foldersToVisit[*]}"
echo "========================================="

for folder in "${foldersToVisit[@]}"; do
  echo ""
  echo "📁 Running Cypress tests in folder: $folder"
  echo "-----------------------------------------"

  if [ ! -d "$folder" ]; then
    echo "❌ Folder $folder does not exist, skipping..."
    continue
  fi

  cd "$folder" || { echo "❌ Failed to enter folder: $folder"; continue; }

  if [ ! -f "package.json" ]; then
    echo "⚠️  No package.json found in $folder, skipping..."
    cd ..
    continue
  fi

  # Find all spec files
  spec_files=$(find cypress/e2e -type f -name "*.cy.*" 2>/dev/null)
  if [ -z "$spec_files" ]; then
    echo "⚠️  No spec files found in $folder, skipping..."
    cd ..
    continue
  fi

  echo "🚀 Running all spec files in parallel"
  start_time=$(date +%s)
  declare -a pids
  failed=0

  for spec in $spec_files; do
    npx cypress run --env environment="$ENVIRONMENT" --spec "$spec" &
    pids+=($!)
  done

  # Wait for all background jobs
  for pid in "${pids[@]}"; do
    wait $pid || failed=1
  done

  end_time=$(date +%s)
  duration=$((end_time - start_time))

  if [ $failed -eq 0 ]; then
    echo "✅ All tests passed in folder: $folder (${duration}s)"
  else
    echo "❌ Some tests failed in folder: $folder (${duration}s)"
    failed_tests=$((failed_tests + 1))
    failed_services+=("$folder")
  fi

  total_tests=$((total_tests + 1))
  cd ..
done

echo ""
echo "========================================="
echo "Test execution summary"
echo "========================================="
echo "Total services tested: $total_tests"
echo "Successful: $((total_tests - failed_tests))"
echo "Failed: $failed_tests"

if [ $failed_tests -gt 0 ]; then
  echo "Failed services: ${failed_services[*]}"
  echo "❌ Some tests failed"
  exit 1
else
  echo "✅ All tests passed"
fi

echo "All tests completed."
