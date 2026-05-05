#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./testing/run_cypress_with_heartbeat.sh <service_dir> <spec_path> [env_name]
# Example:
#   ./testing/run_cypress_with_heartbeat.sh reports2 cypress/e2e/Reports/Delinquency/TC4.cy.ts dev

SERVICE_DIR="${1:?service dir required}"
SPEC_PATH="${2:?spec path required}"
ENV_NAME="${3:-dev}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$ROOT_DIR/$SERVICE_DIR"
STATE_DIR="$ROOT_DIR/testing/.runtime"
STATE_FILE="$STATE_DIR/${SERVICE_DIR//\//_}__$(basename "$SPEC_PATH" .cy.ts).status"
LOG_FILE="$STATE_DIR/${SERVICE_DIR//\//_}__$(basename "$SPEC_PATH" .cy.ts).log"

mkdir -p "$STATE_DIR"

if [[ ! -d "$WORK_DIR" ]]; then
  echo "[ERROR] service dir not found: $WORK_DIR" | tee -a "$LOG_FILE"
  exit 2
fi

cd "$WORK_DIR"

echo "status=starting" > "$STATE_FILE"
echo "started_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$STATE_FILE"
echo "service=$SERVICE_DIR" >> "$STATE_FILE"
echo "spec=$SPEC_PATH" >> "$STATE_FILE"
echo "pid=$$" >> "$STATE_FILE"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] START service=$SERVICE_DIR spec=$SPEC_PATH env=$ENV_NAME" | tee "$LOG_FILE"

# Run Cypress in background and keep stdout/stderr in log.
(
  npx cypress run --spec "$SPEC_PATH" --env "environment=$ENV_NAME"
) >> "$LOG_FILE" 2>&1 &
RUN_PID=$!

echo "runner_pid=$RUN_PID" >> "$STATE_FILE"

# Heartbeat loop every 60s until run exits.
while kill -0 "$RUN_PID" 2>/dev/null; do
  echo "status=running" > "$STATE_FILE"
  echo "last_heartbeat=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$STATE_FILE"
  echo "service=$SERVICE_DIR" >> "$STATE_FILE"
  echo "spec=$SPEC_PATH" >> "$STATE_FILE"
  echo "runner_pid=$RUN_PID" >> "$STATE_FILE"
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] HEARTBEAT service=$SERVICE_DIR spec=$SPEC_PATH still_running=true" | tee -a "$LOG_FILE"
  sleep 60
done

set +e
wait "$RUN_PID"
EXIT_CODE=$?
set -e

if [[ "$EXIT_CODE" -eq 0 ]]; then
  FINAL_STATUS="passed"
else
  FINAL_STATUS="failed"
fi

echo "status=$FINAL_STATUS" > "$STATE_FILE"
echo "finished_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$STATE_FILE"
echo "service=$SERVICE_DIR" >> "$STATE_FILE"
echo "spec=$SPEC_PATH" >> "$STATE_FILE"
echo "exit_code=$EXIT_CODE" >> "$STATE_FILE"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] FINISH service=$SERVICE_DIR spec=$SPEC_PATH status=$FINAL_STATUS exit_code=$EXIT_CODE" | tee -a "$LOG_FILE"

exit "$EXIT_CODE"
