export type ExchangeNode = {
  id: number;
  x: number;
  y: number;
};

// Based on the paper figure C
export const exchangeNodes: ExchangeNode[] = [
  { id: 1, x: 20, y: 45 },
  { id: 2, x: 35, y: 20 },
  { id: 3, x: 65, y: 20 },
  { id: 4, x: 50, y: 45 },
  { id: 5, x: 35, y: 70 },
  { id: 6, x: 65, y: 70 },
  { id: 7, x: 80, y: 45 }
];

export const exchangeEdges = [
  [2, 1], [2, 3], [3, 6], [4, 2], [4, 3], [4, 5], [6, 4], [6, 5], [6, 7]
] as const;

// Base configuration for dynamic generation
export const initialMatching: [number, number][] = [[2, 1], [3, 6], [4, 5], [6, 7]];
export const initialDrivers = [2, 3, 4];

export type ExchangeStepInfo = {
  title: string;
  body: string;
};

export const exchangeSteps: ExchangeStepInfo[] = [
  {
    title: "Initial Matching",
    body: String.raw`We start with a maximum matching $\mathcal{M}$ of size 4. Initial drivers: $\{${initialDrivers}\}$.`,
  },
  {
    title: "Alternating Path",
    body: String.raw`Identify an $\mathcal{M}$-alternating path $p$ representing the exchange. It starts at unmatched target $s^-=${"{s}"}^-$ and ends at matched target $t^-=${"{t}"}^-$. $p = $ ${"{path}"}`,
  },
  {
    title: "Symmetric Difference",
    body: String.raw`Perform $\mathcal{M} \triangle E(p)$: toggle edge status along the path. One driver is removed, another is added.`,
  },
  {
    title: "Reconfigured Drivers",
    body: String.raw`The driver set has been reconfigured. Node $t=${"{t}"}$ is now a driver, and $s=${"{s}"}$ is not. Driver set: $\{${"${drivers}"}$\}$. `,
  }
];

export type ExchangePath = {
  s: number;
  template: string; // Internal arrow format: <- and ->
  targets: {
    t: number;
    edges: [number, number][];
    // description will be intelligently parsed from template in the UI
  }[];
};

export const exchangePaths: ExchangePath[] = [
  {
    s: 2,
    template: "$2^- <- 4^+ -> 5^- <- 6^+ -> 7^-$",
    targets: [
      {
        t: 5,
        edges: [[4, 2], [4, 5]]
      },
      {
        t: 7,
        edges: [[4, 2], [4, 5], [6, 5], [6, 7]]
      }
    ]
  },
  {
    s: 3,
    template: "$3^- <- 4^+ -> 5^- <- 6^+ -> 7^-$",
    targets: [
      {
        t: 5,
        edges: [[4, 3], [4, 5]]
      },
      {
        t: 7,
        edges: [[4, 3], [4, 5], [6, 5], [6, 7]]
      }
    ]
  },
  {
    s: 3,
    template: "$3^- <- 2^+ -> 1^-$",
    targets: [
      {
        t: 1,
        edges: [[2, 3], [2, 1]]
      }
    ]
  },
  {
    s: 4,
    template: "$4^- <- 6^+ -> 7^-$",
    targets: [
      {
        t: 7,
        edges: [[6, 4], [6, 7]]
      }
    ]
  }
];
