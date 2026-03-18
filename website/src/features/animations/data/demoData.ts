export type PrimerNode = {
  id: number;
  x: number;
  y: number;
};

export const primerNetworkNodes: PrimerNode[] = [
  { id: 1, x: 50, y: 20 },
  { id: 2, x: 18, y: 44 },
  { id: 3, x: 42, y: 48 },
  { id: 4, x: 66, y: 46 },
  { id: 5, x: 86, y: 40 },
  { id: 6, x: 58, y: 74 }
];

export const primerEdges = [
  [1, 3],
  [1, 4],
  [2, 3],
  [3, 5],
  [4, 5],
  [5, 6],
  [2, 6]
] as const;

export const primerMatchingOptions = {
  A: {
    edges: [
      [1, 4],
      [2, 3],
      [3, 5],
      [5, 6]
    ] as [number, number][],
    drivers: [1, 2],
    label: "Case A"
  },
  B: {
    edges: [
      [1, 4],
      [2, 3],
      [4, 5],
      [5, 6]
    ] as [number, number][],
    drivers: [1, 2],
    label: "Case B"
  }
} as const;

export type DuplexState = {
  id: string;
  labelKey: string;
  explanationKey: string;
  d1: number[];
  d2: number[];
  clap?: string;
};

export const unionContractionStates: DuplexState[] = [
  {
    id: "initial",
    labelKey: "union.steps.initial.label",
    explanationKey: "union.steps.initial.explanation",
    d1: [1, 2],
    d2: [4, 5],
  },
  {
    id: "reconfigured",
    labelKey: "union.steps.reconfigured.label",
    explanationKey: "union.steps.reconfigured.explanation",
    d1: [3, 4],
    d2: [3, 4],
  }
];

export type TraceStep = {
  id: string;
  activePath: { layer: 1 | 2; nodes: number[] }[];
  d1: number[];
  d2: number[];
  dd1: number[];
  dd2: number[];
  cds: number[];
  cms: number[];
  note: string;
  delta: number;
  unionSize: number;
};

export const toyNodePositions = [
  { id: 1, x: 16, y: 16 },
  { id: 2, x: 36, y: 22 },
  { id: 3, x: 12, y: 46 },
  { id: 4, x: 46, y: 40 },
  { id: 5, x: 62, y: 24 },
  { id: 6, x: 72, y: 50 },
  { id: 7, x: 82, y: 26 },
  { id: 8, x: 92, y: 54 },
  { id: 9, x: 24, y: 78 }
];

export const toyBaseEdges = {
  1: [
    [1, 4],
    [3, 2],
    [4, 5],
    [9, 6],
    [7, 8]
  ] as const,
  2: [
    [2, 4],
    [5, 6],
    [6, 7]
  ] as const
};

export const traceSteps: TraceStep[] = [
  {
    id: "start",
    activePath: [],
    d1: [1, 3, 5, 9],
    d2: [4, 5, 6, 8],
    dd1: [1, 3, 9],
    dd2: [4, 6, 8],
    cds: [5],
    cms: [2, 7],
    note:
      String.raw`Initial state from the paper's toy duplex. The disagreement mass is concentrated in $DD_1 = \{1,3,9\}$ and $DD_2 = \{4,6,8\}$.`,
    delta: 6,
    unionSize: 7
  },
  {
    id: "p1",
    activePath: [{ layer: 1, nodes: [1, 4] }],
    d1: [3, 4, 5, 9],
    d2: [4, 5, 6, 8],
    dd1: [3, 9],
    dd2: [6, 8],
    cds: [4, 5],
    cms: [1, 2, 7],
    note:
      String.raw`First shortest CLAP: $1 \to 4$ in layer 1. Node 1 leaves $DD_1$, node 4 leaves $DD_2$, so $\Delta$ drops by 2 and the union shrinks by 1.`,
    delta: 4,
    unionSize: 6
  },
  {
    id: "p2",
    activePath: [
      { layer: 1, nodes: [3, 2] },
      { layer: 2, nodes: [2, 4] },
      { layer: 1, nodes: [4, 5] },
      { layer: 2, nodes: [5, 6] }
    ],
    d1: [2, 5, 7, 9],
    d2: [2, 5, 7, 8],
    dd1: [9],
    dd2: [8],
    cds: [2, 5, 7],
    cms: [1, 3, 4, 6],
    note:
      String.raw`Second CLAP: $3 \to 2 \to 4 \to 5 \to 6$. Relays reached from layer 1 are in $CMS$, while relays reached from layer 2 are in $CDS$. Again $\Delta$ drops by 2.`,
    delta: 2,
    unionSize: 5
  },
  {
    id: "p3",
    activePath: [
      { layer: 1, nodes: [9, 6] },
      { layer: 2, nodes: [6, 7] },
      { layer: 1, nodes: [7, 8] }
    ],
    d1: [2, 5, 6, 8],
    d2: [2, 5, 6, 8],
    dd1: [],
    dd2: [],
    cds: [2, 5, 6, 8],
    cms: [1, 3, 4, 7, 9],
    note:
      String.raw`Final CLAP: $9 \to 6 \to 7 \to 8$. Both difference sets vanish, $D_1$ and $D_2$ become identical, and the state is CLAP-stable.`,
    delta: 0,
    unionSize: 4
  }
];

export type SearchFrame = {
  id: string;
  modeLabel: string;
  frontier: { node: number; layer: 1 | 2 }[];
  visited: { node: number; layer: 1 | 2 }[];
  relays: number[];
  target?: number;
  queue: string[];
  note: string;
};

export const bfsFrames: SearchFrame[] = [
  {
    id: "f0",
    modeLabel: String.raw`Seed $DD_1$ as sources`,
    frontier: [
      { node: 3, layer: 1 },
      { node: 3, layer: 2 }
    ],
    visited: [
      { node: 3, layer: 1 },
      { node: 3, layer: 2 }
    ],
    relays: [],
    queue: ["(3, L1 next)", "(3, L2 next)"],
    note:
      String.raw`BFS starts from $DD_1$. The layer label means which layer will generate the next admissible segment.`
  },
  {
    id: "f1",
    modeLabel: "Expand in layer 1",
    frontier: [{ node: 2, layer: 2 }],
    visited: [
      { node: 3, layer: 1 },
      { node: 3, layer: 2 },
      { node: 2, layer: 2 }
    ],
    relays: [2],
    queue: ["(3, L2 next)", "(2, L2 next)"],
    note:
      String.raw`From node 3, layer 1 reaches node 2. Because the next segment must leave in layer 2, node 2 is accepted only if it lies in $CMS$.`
  },
  {
    id: "f2",
    modeLabel: "Switch and expand in layer 2",
    frontier: [{ node: 4, layer: 1 }],
    visited: [
      { node: 3, layer: 1 },
      { node: 3, layer: 2 },
      { node: 2, layer: 2 },
      { node: 4, layer: 1 }
    ],
    relays: [2, 4],
    queue: ["(4, L1 next)"],
    note:
      String.raw`Layer 2 pulls disagreement from node 4. Because the next step must leave in layer 1, node 4 is admissible only if it lies in $CDS$.`
  },
  {
    id: "f3",
    modeLabel: "Continue until target",
    frontier: [{ node: 6, layer: 2 }],
    visited: [
      { node: 3, layer: 1 },
      { node: 3, layer: 2 },
      { node: 2, layer: 2 },
      { node: 4, layer: 1 },
      { node: 5, layer: 2 },
      { node: 6, layer: 2 }
    ],
    relays: [2, 4, 5],
    target: 6,
    queue: [],
    note:
      String.raw`Once $DD_2$ is reached, predecessor pointers reconstruct the shortest CLAP: $3 \to 2 \to 4 \to 5 \to 6$.`
  }
];
