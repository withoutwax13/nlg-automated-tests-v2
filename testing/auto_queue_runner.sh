#!/usr/bin/env bash
set -euo pipefail

# Auto-advance queue with hard fail-loop cap per spec.
# Usage: ./testing/auto_queue_runner.sh <service> <max_loops> <spec1> [spec2 ...]

SERVICE="${1:?service required}"
MAX_LOOPS="${2:?max loops required}"
shift 2
SPECS=("$@")

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

for SPEC in "${SPECS[@]}"; do
  loops=0
  while true; do
    loops=$((loops+1))
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] QUEUE START spec=$SPEC loop=$loops/$MAX_LOOPS"

    if "$ROOT_DIR/testing/start_reported_run.sh" "$SERVICE" "$SPEC" dev; then
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] QUEUE PASS spec=$SPEC loop=$loops"
      break
    fi

    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] QUEUE FAIL spec=$SPEC loop=$loops"

    if [[ "$loops" -ge "$MAX_LOOPS" ]]; then
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] QUEUE SKIP spec=$SPEC reason=max_loops_reached"
      break
    fi

    # Healing edits are handled by agent between loops when needed.
    # This guard ensures we never stall indefinitely on a single spec.
  done
done

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] QUEUE DONE"
