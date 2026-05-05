#!/usr/bin/env bash
set -euo pipefail

# One-command bootstrap: marks active run + starts heartbeat runner
# Usage:
#   ./testing/start_reported_run.sh <service_dir> <spec_path> [env_name]

SERVICE_DIR="${1:?service dir required}"
SPEC_PATH="${2:?spec path required}"
ENV_NAME="${3:-dev}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/testing/.runtime"
mkdir -p "$RUNTIME_DIR"

SPEC_BASENAME="$(basename "$SPEC_PATH" .cy.ts)"
STATUS_FILE="$RUNTIME_DIR/${SERVICE_DIR//\//_}__${SPEC_BASENAME}.status"
LOG_FILE="$RUNTIME_DIR/${SERVICE_DIR//\//_}__${SPEC_BASENAME}.log"

cat > "$RUNTIME_DIR/active_run.env" <<EOF
service=$SERVICE_DIR
spec=$SPEC_PATH
env=$ENV_NAME
status_file=$STATUS_FILE
log_file=$LOG_FILE
started_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

exec "$ROOT_DIR/testing/run_cypress_with_heartbeat.sh" "$SERVICE_DIR" "$SPEC_PATH" "$ENV_NAME"
