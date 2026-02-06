#!/usr/bin/env bash
set -euo pipefail

# scripts 目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 项目根目录：scripts/.. 
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

export PYTHONPATH="${ROOT_DIR}:${PYTHONPATH:-}"

tail -n +2 "${SCRIPT_DIR}/real_pairs.csv" | while IFS=, read -r net layer1 layer2; do
  echo "==> $net | $layer1 | $layer2"
  python "${SCRIPT_DIR}/run_one_real_network.py" \
    --net "$net" --layer1 "$layer1" --layer2 "$layer2" \
    --make-csv --algo all --timeout 5000
done
