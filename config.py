import numpy as np
from pathlib import Path
ROOT = Path(__file__).resolve().parent

TEMP_PATH = str(ROOT / "assets" / "temp")
SYNTHETIC_NET_PATH = str(ROOT / "assets" / "net" / "synthetic")
REAL_NET_PATH = str(ROOT / "assets" / "net" / "real")
TEST_NET_PATH = str(ROOT / "assets" / "net" / "test")
RESULT_PATH = str(ROOT / "assets" / "result" / "new")
LOG_PATH = str(ROOT / "assets" / "log")

# NETWORK_NODES_LIST: list[int] = [100, 1000, 10000]
NETWORK_NODES_LIST: list[int] = [1000]
NETWORK_OVERLAP: list[float] = [-1] + [round(x, 3) for x in np.arange(0.1, 0.9 + 0.01, 0.01).tolist()]

LOGGING_LEVEL: str = "INFO"
