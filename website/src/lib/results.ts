import fs from "node:fs";
import path from "node:path";

import { csvParse } from "d3-dsv";

type RawRecord = Record<string, string>;

export type SyntheticSummary = {
  dataset: "synthetic";
  networkType: string;
  degree: number;
  absoluteGain: {
    claps: number;
    clapg: number;
    rsu: number;
    ilp: number;
  };
  relativeGain: number;
  runtime: {
    claps: number;
    clapg: number;
    rsu: number;
    ilp: number;
  };
  avgPathLength: number;
};

export type RealSummary = {
  dataset: "real";
  id: string;
  networkName: string;
  label: string;
  domain: string;
  nodes: number;
  initialUnion: number;
  clapsUnion: number;
  rsuUnion: number;
  clapgUnion: number;
  ilpUnion: number | null;
  absoluteGain: {
    claps: number;
    clapg: number;
    rsu: number;
    ilp: number | null;
  };
  relativeGain: number;
  runtime: {
    claps: number;
    clapg: number;
    rsu: number;
    ilp: number | null;
  };
  memoryMiB: {
    claps: number;
    clapg: number;
    rsu: number;
    ilp: number | null;
  };
  avgPathLength: number;
};

const root = process.cwd();

function readCsv(csvPath: string): RawRecord[] {
  const absolutePath = path.join(root, csvPath);
  const content = fs.readFileSync(absolutePath, "utf8");
  return csvParse(content) as unknown as RawRecord[];
}

function num(value: string | undefined) {
  if (value === undefined || value === "" || value === "-") return NaN;
  return Number(value);
}

function mean(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (filtered.length === 0) return NaN;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function toMiB(bytes: number) {
  return bytes / (1024 * 1024);
}

function domainForNetwork(networkName: string) {
  const biological = new Set([
    "Arabidopsis",
    "Celegans",
    "Drosophila",
    "HumanHIV1",
    "SacchPomb",
    "Rattus",
    "CelegansConnectome",
    "YeastLandscape"
  ]);
  const human = new Set([
    "KrackhardtHighTech",
    "LazegaLawFirm",
    "PhysiciansInnovation",
    "KapfererTailorShop",
    "VickersChan7thGraders"
  ]);

  if (biological.has(networkName)) return "Biological & neuronal";
  if (human.has(networkName)) return "Human relationship";
  return "Social & information";
}

export function loadSyntheticResults() {
  const rows = readCsv("data/results/optimization_amount.csv");
  const grouped = new Map<string, RawRecord[]>();

  rows.forEach((row) => {
    const key = `${row.network_type}-${row["<k>"]}`;
    const current = grouped.get(key) ?? [];
    current.push(row);
    grouped.set(key, current);
  });

  const summaries: SyntheticSummary[] = Array.from(grouped.entries()).map(([key, group]) => {
    const [networkType, degreeString] = key.split("-");
    const initial = group.map((row) => num(row.UDS_0));
    const claps = group.map((row) => num(row.UDS_CLAPS));
    const clapg = group.map((row) => num(row.UDS_CLAPG));
    const rsu = group.map((row) => num(row.UDS_RSU));
    const ilp = group.map((row) => num(row.UDS_ILP));

    return {
      dataset: "synthetic",
      networkType,
      degree: Number(degreeString),
      absoluteGain: {
        claps: mean(initial.map((value, index) => value - claps[index])),
        clapg: mean(initial.map((value, index) => value - clapg[index])),
        rsu: mean(initial.map((value, index) => value - rsu[index])),
        ilp: mean(initial.map((value, index) => value - ilp[index]))
      },
      relativeGain: mean(
        group.map((row) => ((num(row.UDS_RSU) - num(row.UDS_CLAPS)) / num(row.UDS_RSU)) * 100)
      ),
      runtime: {
        claps: mean(group.map((row) => num(row.time_CLAPS))),
        clapg: mean(group.map((row) => num(row.time_CLAPG))),
        rsu: mean(group.map((row) => num(row.time_RSU))),
        ilp: mean(group.map((row) => num(row.time_ILP)))
      },
      avgPathLength: mean(group.map((row) => num(row.clap_average_length)))
    };
  });

  return summaries.sort((a, b) => {
    if (a.networkType === b.networkType) return a.degree - b.degree;
    return a.networkType.localeCompare(b.networkType);
  });
}

export function loadRealResults() {
  const rows = readCsv("data/results/real_networks.csv");

  const summaries: RealSummary[] = rows.map((row, index) => {
    const networkName = row.network_name;
    const label = `${networkName} · ${row.layer_name_1} vs ${row.layer_name_2}`;
    const ilpUnion = num(row.UDS_ILP);
    const ilpValue = Number.isFinite(ilpUnion) && ilpUnion >= 0 ? ilpUnion : null;
    const ilpTime = num(row.time_ILP);
    const ilpMem = num(row.mem_ILP);
    const initialUnion = num(row.UDS_0);
    const clapsUnion = num(row.UDS_CLAPS);
    const clapgUnion = num(row.UDS_CLAPG);
    const rsuUnion = num(row.UDS_RSU);

    return {
      dataset: "real",
      id: `${networkName}-${index}`,
      networkName,
      label,
      domain: domainForNetwork(networkName),
      nodes: num(row.N),
      initialUnion,
      clapsUnion,
      rsuUnion,
      clapgUnion,
      ilpUnion: ilpValue,
      absoluteGain: {
        claps: initialUnion - clapsUnion,
        clapg: initialUnion - clapgUnion,
        rsu: initialUnion - rsuUnion,
        ilp: ilpValue === null ? null : initialUnion - ilpValue
      },
      relativeGain: ((rsuUnion - clapsUnion) / rsuUnion) * 100,
      runtime: {
        claps: num(row.time_CLAPS),
        clapg: num(row.time_CLAPG),
        rsu: num(row.time_RSU),
        ilp: Number.isFinite(ilpTime) && ilpTime >= 0 ? ilpTime : null
      },
      memoryMiB: {
        claps: toMiB(num(row.mem_CLAPS)),
        clapg: toMiB(num(row.mem_CLAPG)),
        rsu: toMiB(num(row.mem_RSU)),
        ilp: Number.isFinite(ilpMem) && ilpMem >= 0 ? toMiB(ilpMem) : null
      },
      avgPathLength: num(row.clap_average_length)
    };
  });

  return summaries.sort((a, b) => b.absoluteGain.claps - a.absoluteGain.claps);
}

export function loadResultHighlights() {
  const synthetic = readCsv("data/results/optimization_proportion.csv");
  const lowOverlapAtFour = synthetic.filter(
    (row) => row.network_type === "ER+ER" && row.overlap === "0.1" && row["<k>"] === "4.0"
  );

  const real = loadRealResults();
  const avgPath = mean(real.map((row) => row.avgPathLength).filter((value) => value > 0));

  return {
    lowOverlapMeanGain: mean(
      lowOverlapAtFour.map((row) => num(row.UDS_0) - num(row.UDS_CLAPS))
    ),
    avgRealPathLength: avgPath
  };
}
