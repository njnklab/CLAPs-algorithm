
const DEFAULT_COLORS = {
  orange: "#FB8500",
  purple: "#BE90D8",
  red: "#E63946",
  blue: "#0077B6",
  yellow: "#FACC15",
  green: "#80ED99",
  gray: "#6C757D"
} as const;

export const APP_CONFIG = {
  colors: {
    default: DEFAULT_COLORS,

    single_layer: {
      driver: DEFAULT_COLORS.red,
      matched: DEFAULT_COLORS.blue,
      matching_edge: DEFAULT_COLORS.red,
      non_matching_edge: DEFAULT_COLORS.gray,
      alternating_edge: DEFAULT_COLORS.blue,
    },

    duplex: {
      dd1: DEFAULT_COLORS.gray,
      dd2: DEFAULT_COLORS.gray,
      cms: DEFAULT_COLORS.blue,
      cds: DEFAULT_COLORS.red,
      active_clap: DEFAULT_COLORS.yellow,
    },

    layer1: {
      driver: DEFAULT_COLORS.orange,
      matching_edge: DEFAULT_COLORS.orange,
    },
    layer2: {
      driver: DEFAULT_COLORS.purple,
      matching_edge: DEFAULT_COLORS.purple,
    },

    charts: {
      claps: "#16212b",
      ilp: "#365486",
      clapg: "#0b7285",
      rsu: "#d97706"
    },
  },
  opacity: {
    duplex_node_bg: 0.15, // 透明度偏低 / Low opacity
  },
  visual: {
    node_hover_color: DEFAULT_COLORS.yellow,
    edge_hover_color: DEFAULT_COLORS.yellow,
  }
} as const;
