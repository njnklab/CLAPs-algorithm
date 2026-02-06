#!/usr/bin/env bash
set -euo pipefail

# run_memory_usage.sh
# Batch runner for synthetic memory_usage experiment (ER/BA, n_list, 10 reps).
# Place this script and run_one_memory_usage_v2.py under <project>/scripts/, then run:
#   bash scripts/run_memory_usage.sh
#
# Output: <project>/assets/result/new/memory_usage.csv

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

export PYTHONPATH="${ROOT_DIR}:${PYTHONPATH:-}"

OUT="${ROOT_DIR}/assets/result/new/memory_usage.csv"

K="4"
TIMEOUT="5000"

# Same n_list as your notebook
N_LIST=(100 200 400 600 800 1000 1200 1400 1600 1800 2000 2500 3000 3500 4000 4500 5000 6000 7000 8000 9000 10000)

for n in "${N_LIST[@]}"; do
  echo "==> N=${n}"
  for seq in $(seq 0 9); do
    for typ in ER BA; do
      echo "    - ${typ}, seq=${seq}"
      python "${SCRIPT_DIR}/run_one_memory_usage.py" \
        --type "${typ}" --n "${n}" --k "${K}" --seq "${seq}" \
        --timeout "${TIMEOUT}" \
        --out-csv "${OUT}" \
        --quiet
    done
  done
done

echo "[done] ${OUT}"
