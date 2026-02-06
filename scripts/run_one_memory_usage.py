#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_one_memory_usage.py

Run ONE synthetic-network memory/time measurement for CLAP-S on a given
(network_type, n, k, seq).

This replaces the Jupyter loop with a CLI-friendly single-run script that can be
called repeatedly from a shell script.

Assumptions (same as your notebook):
- Synthetic networks already generated under:
    config.SYNTHETIC_NET_PATH/<network_type>/<dir>/
  where dir = f"{network_type}_n={n}_k={round(k,2)}"
- In that dir, you have at least two layer files whose filenames contain "base"
  or "-1" (same rule as your original code).
- You have:
    - config
    - utils.utils.read_network (or adjust import below)
    - matching.Matching and matching.MultiMatching

Output:
- Prints one-line JSON to stdout
- Optionally appends to a CSV with a fixed header (same columns as your notebook)
"""

import argparse
import json
import os
import signal
import time
from pathlib import Path
from typing import Dict, List, Tuple

import tracemalloc

# ---- make imports work when executed from scripts/ ----
ROOT_DIR = Path(__file__).resolve().parents[1]
import sys
sys.path.insert(0, str(ROOT_DIR))

import config
from utils.utils import setup_logger

try:
    # your notebook used read_network; adjust if it lives elsewhere
    from utils.utils import read_network
except Exception:
    read_network = None  # will error later with a clear message

from matching import Matching, MultiMatching

logger = setup_logger(__name__)

DEFAULT_COLUMNS = [
    "network_type", "N", "<k>", "seq",
    "MDS_1", "MDS_2",
    "Diff_MDS_1", "Diff_MDS_2", "UDS_0",
    "UDS_CLAPS",
    "clap_average_length",
    "time_CLAPS",
    "mem_CLAPS_bytes",
]

DEFAULT_TIMEOUT_S = 5000
DEFAULT_SAMPLE_INTERVAL = 0.02  # 20ms


class TimeoutException(Exception):
    pass


def _timeout_handler(signum, frame):
    raise TimeoutException()


def ensure_csv_header(path: str, columns: List[str]) -> None:
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(",".join(columns) + "\n")


def append_csv_row(path: str, columns: List[str], row: Dict[str, object]) -> None:
    ensure_csv_header(path, columns)
    with open(path, "a", encoding="utf-8") as f:
        f.write(",".join(str(row.get(c, "")) for c in columns) + "\n")


def run_with_memory_tracking(func, timeout_s=5000):
    """
    使用 tracemalloc 精确追踪内存峰值增量。
    替代原来的 psutil 轮询方案，解决小规模网络运行太快抓不到内存的问题。
    
    Return: (result, elapsed_seconds, peak_memory_bytes)
    """
    
    # 1. 设置超时 (Unix only)
    signal.signal(signal.SIGALRM, _timeout_handler)
    signal.alarm(timeout_s)
    
    result = None
    elapsed = -1
    peak_memory = 0
    ok = False
    
    try:
        # 2. 启动内存追踪
        # 强制进行垃圾回收，净化环境（可选，但推荐）
        import gc
        gc.collect()
        
        tracemalloc.start()
        # 获取当前的内存快照作为基准（尽管 start() 后通常是 0，但为了保险）
        current_base, _ = tracemalloc.get_traced_memory()
        
        t0 = time.time()
        
        # 3. 执行算法
        result = func()
        
        elapsed = time.time() - t0
        
        # 4. 获取追踪期间的峰值
        # current: 当前已分配内存, peak: 追踪期间的最大分配内存
        _, peak = tracemalloc.get_traced_memory()
        
        # 计算增量：峰值 - 起始值
        # 通常 start() 时是 0，所以 peak_memory ≈ peak
        peak_memory = max(0, peak - current_base)
        
        ok = True
        
    except (TimeoutException, ValueError):
        ok = False
        result = None
        elapsed = -1
        peak_memory = -1
    except Exception as e:
        print(f"Error during execution: {e}")
        ok = False
        peak_memory = -1
    finally:
        # 5. 停止追踪并清理
        tracemalloc.stop()
        signal.alarm(0)
    
    if not ok:
        return None, -1, -1
        
    return result, elapsed, peak_memory


def build_matchings(network_type: str, n: int, k: float) -> Tuple[List[Matching], str]:
    """
    Load layer graphs from disk and build per-layer Matching objects (HK_algorithm).
    Returns: (matchings, dir_path)
    """
    if read_network is None:
        raise ImportError(
            "Cannot import read_network. Ensure utils.utils.read_network exists, "
            "or adjust import in run_one_memory_usage.py."
        )

    dir_name = f"{network_type}_n={n}_k={round(k, 2)}"
    dir_path = os.path.join(config.SYNTHETIC_NET_PATH, network_type, dir_name)
    if not os.path.isdir(dir_path):
        raise FileNotFoundError(f"Synthetic dir not found: {dir_path}")

    files = sorted(os.listdir(dir_path))
    layer_files = [fn for fn in files if ("base" in fn) or ("-1" in fn)]
    if len(layer_files) < 2:
        raise RuntimeError(f"Need >=2 layer files containing 'base' or '-1' under {dir_path}, got {layer_files[:10]}")

    matchings: List[Matching] = []
    for fn in layer_files:
        g = read_network(os.path.join(dir_path, fn), n)
        m = Matching(g)
        m.HK_algorithm()
        matchings.append(m)

    if len(matchings) < 2:
        raise RuntimeError(f"Loaded <2 matchings from {dir_path}; check your data generation.")
    return matchings, dir_path


def run_one(network_type: str, n: int, k: float, seq: int, timeout_s: int) -> Dict[str, object]:
    matchings, _ = build_matchings(network_type, n, k)
    multi = MultiMatching(matchings)

    mds_1 = len(matchings[0].driver_nodes)
    mds_2 = len(matchings[1].driver_nodes)

    res, t_claps, mem_peak = run_with_memory_tracking(lambda: multi.CLAPS(), timeout_s=timeout_s)

    if res is None:
        pre_diff_1 = pre_diff_2 = uds0 = uds_claps = avg_depth = -1
    else:
        pre_diff_1, pre_diff_2, uds0, uds_claps, avg_depth = res

    return {
        "network_type": network_type,
        "N": n,
        "<k>": k,
        "seq": seq,
        "MDS_1": mds_1,
        "MDS_2": mds_2,
        "Diff_MDS_1": pre_diff_1,
        "Diff_MDS_2": pre_diff_2,
        "UDS_0": uds0,
        "UDS_CLAPS": uds_claps,
        "clap_average_length": avg_depth,
        "time_CLAPS": t_claps,
        "mem_CLAPS_bytes": mem_peak,
    }


def build_argparser():
    p = argparse.ArgumentParser(description="Run one synthetic memory/time measurement for CLAP-S.")
    p.add_argument("--type", required=True, choices=["ER", "BA"], help="Network type")
    p.add_argument("--n", required=True, type=int, help="Number of nodes N")
    p.add_argument("--k", default=4.0, type=float, help="Average degree k used in dir naming (default 4.0)")
    p.add_argument("--seq", default=0, type=int, help="Sequence index (for bookkeeping)")
    p.add_argument("--timeout", default=DEFAULT_TIMEOUT_S, type=int, help=f"Timeout seconds for CLAP-S (default {DEFAULT_TIMEOUT_S})")
    p.add_argument("--out-csv", default=None, help="Append result row to this CSV (creates with header if missing)")
    p.add_argument("--quiet", action="store_true", help="Reduce logging verbosity")
    return p


def main():
    args = build_argparser().parse_args()
    if args.quiet:
        import logging
        logging.getLogger().setLevel(logging.WARNING)

    row = run_one(args.type, args.n, args.k, args.seq, args.timeout)
    print(json.dumps(row, ensure_ascii=False))

    if args.out_csv:
        ensure_csv_header(args.out_csv, DEFAULT_COLUMNS)
        append_csv_row(args.out_csv, DEFAULT_COLUMNS, row)
        print(f"[saved] {args.out_csv}")


if __name__ == "__main__":
    main()
