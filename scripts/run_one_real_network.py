#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_one_real_network.py

Run CLAP-S / RSU / CLAPG / ILP_exact on ONE real duplex network (one layer pair),
and record time + peak RSS memory.

Designed to be called either:
  (A) directly: python run_one_real_network.py --net Arabidopsis --layer1 direct_interaction --layer2 physical_association
  (B) wrapped by /usr/bin/time -v for system-level peak RSS:
      /usr/bin/time -v python run_one_real_network.py ...

Notes:
- This script assumes your project modules exist:
    - config (with REAL_NET_PATH, TEST_NET_PATH, etc.)
    - utils.utils: save_network, setup_logger, create_output_file
    - matching: Matching, MultiMatching
- Peak memory here is estimated via psutil RSS sampling. For the most "reviewer-proof"
  peak RSS, prefer '/usr/bin/time -v' and parse its 'Maximum resident set size'.
"""

import argparse
import copy
import glob
import os
import signal
import time
from typing import Dict, List, Set, Tuple, Optional

import networkx as nx
import pandas as pd
import tracemalloc

# import sys
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import config
from utils.utils import save_network, setup_logger, create_output_file
from matching import Matching, MultiMatching

logger = setup_logger(__name__)

# Networks that should be treated as undirected in the original dataset
UNDIRECTED_NETWORKS = {
    "EUAirMultiplexTransport",
    "LondonTransport",
}

DEFAULT_TIMEOUT_S = 5000

# Column schema compatible with your current CSV outputs
DEFAULT_COLUMNS = [
    "network_name", "layer_name_1", "layer_name_2",
    "N", "N_1", "N_2", "E_1", "E_2", "<k>", "<k_1>", "<k_2>",
    "MDS_1", "MDS_2",
    "Diff_MDS_1", "Diff_MDS_2", "UDS_0",
    "UDS_CLAPS", "UDS_RSU", "UDS_CLAPG", "UDS_ILP",
    "clap_average_length",
    "time_CLAPS", "time_RSU", "time_CLAPG", "time_ILP",
    "mem_CLAPS", "mem_RSU", "mem_CLAPG", "mem_ILP",
]

# -----------------------------
# IO helpers
# -----------------------------

def read_layers_info(network_dir: str) -> Dict[str, str]:
    """Read layer id -> layer name mapping from '*_layers.txt'."""
    layers_files = glob.glob(os.path.join(network_dir, "Dataset", "*_layers.txt"))
    if not layers_files:
        raise FileNotFoundError(f"No *_layers.txt found under {network_dir}/Dataset/")
    layers_file = layers_files[0]
    layers: Dict[str, str] = {}
    with open(layers_file, "r", encoding="utf-8") as f:
        next(f)  # skip header
        for line in f:
            parts = line.strip().split()
            if len(parts) < 2:
                continue
            layer_id, layer_name = parts[0], parts[1]
            layers[layer_id] = layer_name
    return layers


def get_layer_nodes(network_dir: str, layer_ids: List[str]) -> Tuple[Set[int], Set[int], Set[int]]:
    """Collect all nodes appearing in two specified layers (ids). Node ids shifted by +1."""
    edges_files = glob.glob(os.path.join(network_dir, "Dataset", "*_multiplex.edges"))
    if not edges_files:
        raise FileNotFoundError(f"No *_multiplex.edges found under {network_dir}/Dataset/")
    edges_file = edges_files[0]

    nodes: Set[int] = set()
    node_1: Set[int] = set()
    node_2: Set[int] = set()

    with open(edges_file, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) != 4:
                continue
            lid, node1, node2, _ = parts
            if lid in layer_ids:
                u = int(node1) + 1
                v = int(node2) + 1
                nodes.add(u); nodes.add(v)
                if lid == layer_ids[0]:
                    node_1.add(u); node_1.add(v)
                else:
                    node_2.add(u); node_2.add(v)

    return nodes, node_1, node_2


def create_layer_graph(network_dir: str, layer_id: str, all_nodes: Set[int], is_undirected: bool) -> nx.DiGraph:
    """Create a directed graph for one layer. If undirected, add both directions."""
    edges_files = glob.glob(os.path.join(network_dir, "Dataset", "*_multiplex.edges"))
    if not edges_files:
        raise FileNotFoundError(f"No *_multiplex.edges found under {network_dir}/Dataset/")
    edges_file = edges_files[0]

    g = nx.DiGraph()
    g.add_nodes_from(all_nodes)

    with open(edges_file, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            parts = line.strip().split()
            if len(parts) != 4:
                continue
            lid, node1, node2, _ = parts
            if lid != layer_id:
                continue
            try:
                u = int(node1) + 1
                v = int(node2) + 1
                g.add_edge(u, v)
                if is_undirected and u != v:
                    g.add_edge(v, u)
            except Exception as e:
                logger.warning(f"[{os.path.basename(network_dir)}] add_edge failed at line {line_num}: {e}")

    return g


def save_graph_to_file(graph: nx.DiGraph, net_name: str, layer_name: str) -> str:
    """Save graph as edge list text into config.TEST_NET_PATH."""
    os.makedirs(config.TEST_NET_PATH, exist_ok=True)
    filename = os.path.join(config.TEST_NET_PATH, f"{net_name}_{layer_name}.txt")
    save_network(graph, filename)
    return filename


def ensure_csv_header(path: str, columns: List[str]) -> None:
    """Create CSV with header if it doesn't exist or is empty."""
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(",".join(columns) + "\n")


def append_csv_row(path: str, columns: List[str], row: Dict[str, object]) -> None:
    ensure_csv_header(path, columns)
    values = []
    for c in columns:
        v = row.get(c, "")
        values.append(str(v))
    with open(path, "a", encoding="utf-8") as f:
        f.write(",".join(values) + "\n")


# -----------------------------
# Timeout + peak memory
# -----------------------------

class TimeoutException(Exception):
    pass


def _timeout_handler(signum, frame):
    raise TimeoutException()


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


# -----------------------------
# Core pipeline (one network + one layer pair)
# -----------------------------

def resolve_layer_ids(layers_info: Dict[str, str], layer_names: List[str]) -> List[str]:
    """Map layer names to ids."""
    ids = []
    for lid, lname in layers_info.items():
        if lname in layer_names:
            ids.append(lid)
    # keep order as given in layer_names
    ordered = []
    for ln in layer_names:
        for lid, lname in layers_info.items():
            if lname == ln:
                ordered.append(lid)
                break
    return ordered


def process_one(net_name: str, layer1: str, layer2: str,
                timeout_s: int = DEFAULT_TIMEOUT_S,
                save_layer_txt: bool = True,
                algo: str = "all") -> Dict[str, object]:
    """
    Process one duplex (net_name + two layers). Return a dict matching DEFAULT_COLUMNS keys.
    algo: "all" | "claps" | "rsu" | "clapg" | "ilp"
    """
    network_dir = os.path.join(config.REAL_NET_PATH, net_name)
    if not os.path.isdir(network_dir):
        raise FileNotFoundError(f"Network directory not found: {network_dir}")

    is_undirected = os.path.basename(network_dir) in UNDIRECTED_NETWORKS

    layers_info = read_layers_info(network_dir)
    layer_ids = resolve_layer_ids(layers_info, [layer1, layer2])
    if len(layer_ids) != 2:
        raise ValueError(f"Cannot resolve two layer ids for {net_name}: {layer1}, {layer2}. "
                         f"Available layers: {sorted(set(layers_info.values()))[:30]} ...")

    all_nodes, node_1, node_2 = get_layer_nodes(network_dir, layer_ids)

    # build graphs
    g1 = create_layer_graph(network_dir, layer_ids[0], all_nodes, is_undirected)
    g2 = create_layer_graph(network_dir, layer_ids[1], all_nodes, is_undirected)

    if save_layer_txt:
        save_graph_to_file(g1, net_name, layer1)
        save_graph_to_file(g2, net_name, layer2)

    # matching per layer
    m1 = Matching(g1)
    m1.HK_algorithm()
    m1.find_all_alternating_reachable_set()

    m2 = Matching(g2)
    m2.HK_algorithm()
    m2.find_all_alternating_reachable_set()

    multi = MultiMatching([m1, m2])
    multi_rsu = copy.deepcopy(multi)
    multi_glde = copy.deepcopy(multi)
    multi_ilp = copy.deepcopy(multi)

    pre_mds1 = len(multi.matchings[0].driver_nodes)
    pre_mds2 = len(multi.matchings[1].driver_nodes)
    pre_union = len(set(multi.matchings[0].driver_nodes) | set(multi.matchings[1].driver_nodes))

    # init outputs
    out = {c: "" for c in DEFAULT_COLUMNS}
    out.update({
        "network_name": net_name,
        "layer_name_1": layer1,
        "layer_name_2": layer2,
        "N": len(all_nodes),
        "N_1": len(node_1),
        "N_2": len(node_2),
        "E_1": g1.number_of_edges(),
        "E_2": g2.number_of_edges(),
        "<k>": 2 * (g1.number_of_edges() + g2.number_of_edges()) / max(1, len(all_nodes)),
        "<k_1>": 2 * g1.number_of_edges() / max(1, len(node_1)),
        "<k_2>": 2 * g2.number_of_edges() / max(1, len(node_2)),
        "MDS_1": len(m1.driver_nodes),
        "MDS_2": len(m2.driver_nodes),
        "Diff_MDS_1": pre_mds1,
        "Diff_MDS_2": pre_mds2,
        "UDS_0": pre_union,
        "UDS_CLAPS": -1,
        "UDS_RSU": -1,
        "UDS_CLAPG": -1,
        "UDS_ILP": -1,
        "clap_average_length": -1,
        "time_CLAPS": -1,
        "time_RSU": -1,
        "time_CLAPG": -1,
        "time_ILP": -1,
        "mem_CLAPS": -1,
        "mem_RSU": -1,
        "mem_CLAPG": -1,
        "mem_ILP": -1,
    })

    # helpers to decide which to run
    algo = algo.lower()
    run_claps = (algo in ("all", "claps"))
    run_rsu = (algo in ("all", "rsu"))
    run_clapg = (algo in ("all", "clapg"))
    run_ilp = (algo in ("all", "ilp"))

    # CLAPS
    if run_claps:
        res, t_claps, mem_claps = run_with_memory_tracking(lambda: multi.CLAPS(), timeout_s=timeout_s)
        out["time_CLAPS"] = t_claps
        out["mem_CLAPS"] = mem_claps
        if res is not None:
            _, _, _, union_size, avg_depth = res
            out["UDS_CLAPS"] = union_size
            out["clap_average_length"] = avg_depth

    # RSU
    if run_rsu:
        res, t_rsu, mem_rsu = run_with_memory_tracking(lambda: multi_rsu.RSU(), timeout_s=timeout_s)
        out["time_RSU"] = t_rsu
        out["mem_RSU"] = mem_rsu
        if res is not None:
            out["UDS_RSU"] = res

    # CLAPG
    if run_clapg:
        res, t_cg, mem_cg = run_with_memory_tracking(lambda: multi_glde.CLAPG(), timeout_s=timeout_s)
        out["time_CLAPG"] = t_cg
        out["mem_CLAPG"] = mem_cg
        if res is not None:
            out["UDS_CLAPG"] = res

    # ILP
    if run_ilp:
        res, t_ilp, mem_ilp = run_with_memory_tracking(lambda: multi_ilp.ILP_exact(budget_mode="auto"),
                                                           timeout_s=timeout_s)
        out["time_ILP"] = t_ilp
        out["mem_ILP"] = mem_ilp
        if res is not None:
            out["UDS_ILP"] = res

    return out


# -----------------------------
# CLI
# -----------------------------

def build_argparser():
    p = argparse.ArgumentParser(description="Run one real duplex network experiment (one layer pair).")
    p.add_argument("--net", required=True, help="Network name directory under config.REAL_NET_PATH, e.g., Arabidopsis")
    p.add_argument("--layer1", required=True, help="Layer name (as in *_layers.txt), e.g., direct_interaction")
    p.add_argument("--layer2", required=True, help="Layer name (as in *_layers.txt), e.g., physical_association")
    p.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT_S, help=f"Timeout seconds per algorithm (default {DEFAULT_TIMEOUT_S})")
    p.add_argument("--algo", default="all", choices=["all", "claps", "rsu", "clapg", "ilp"],
                   help="Which algorithm(s) to run")
    p.add_argument("--no-save-layer-txt", action="store_true",
                   help="Do not save extracted layers to config.TEST_NET_PATH")
    p.add_argument("--out-csv", default=None,
                   help="Append a row to this CSV path. If omitted, prints JSON to stdout only.")
    p.add_argument("--make-csv", action="store_true",
                   help="Use utils.create_output_file to create a CSV under your standard output directory.")
    p.add_argument("--quiet", action="store_true", help="Reduce logging verbosity")
    return p


def main():
    args = build_argparser().parse_args()

    if args.quiet:
        import logging
        logging.getLogger().setLevel(logging.WARNING)

    row = process_one(
        net_name=args.net,
        layer1=args.layer1,
        layer2=args.layer2,
        timeout_s=args.timeout,
        save_layer_txt=(not args.no_save_layer_txt),
        algo=args.algo,
    )

    # Print a compact JSON for easy parsing / debugging
    print(pd.Series(row).to_json())

    # Write CSV if requested
    if args.make_csv and args.out_csv is None:
        # Use your existing helper to create an output file with header
        args.out_csv = create_output_file(DEFAULT_COLUMNS, "real_networks")

    if args.out_csv:
        append_csv_row(args.out_csv, DEFAULT_COLUMNS, row)
        print(f"[saved] {args.out_csv}")

if __name__ == "__main__":
    main()
