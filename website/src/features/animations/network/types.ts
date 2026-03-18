import { primerMatchingOptions } from "../data/demoData";
import { APP_CONFIG } from "@/lib/config";

export interface NetworkNode {
  id: number;
  origX: number;
  origY: number;
  left: { x: number; y: number };
  right: { x: number; y: number };
}

export type MatchingCase = keyof typeof primerMatchingOptions;

export interface NetworkStyleConfig {
  nodes: {
    all: {
      radius: number;
      strokeWidth: number;
      textFontSize: number;
      textOffset: number;
    };
    matching: {
      strokeColor: string;
      textColor: string;
      fillColor: string;
      fillColorOpacity: number;
    };
    driver: {
      strokeColor: string;
      textColor: string;
      fillColor: string;
      fillColorOpacity: number;
    };
    regular: {
      strokeColor: string;
      textColor: string;
      fillColor: string;
      fillColorOpacity: number;
    };
    hover: {
      strokeColor: string | "no-change";
      textColor: string | "no-change";
      fillColor: string | "no-change";
      fillColorOpacity: number | "no-change";
      scale: number | "no-change";
    };
  };
  edges: {
    all: {
      strokeWidth: number;
    };
    matching: {
      color: string;
      colorOpacity: number;
      dashed: boolean;
      dashArray: string;
    };
    nonMatching: {
      color: string;
      colorOpacity: number;
      dashed: boolean;
      dashArray: string;
    };
    alternativeNonMatching: {
      color: string;
      colorOpacity: number;
      dashed: boolean;
      dashArray: string;
    };
    alternativeMatching: {
      color: string;
      colorOpacity: number;
      dashed: boolean;
      dashArray: string;
    };
    virtual: {
      color: string;
      colorOpacity: number;
      dashed: boolean;
      dashArray: string;
    };
    hover: {
      color: string | "no-change";
      colorOpacity: number | "no-change";
      dashed: boolean | "no-change";
      dashArray: string | "no-change";
      scale: number | "no-change";
    };
  };
}

export interface NetworkProps {
  stage: number;
  nodes: NetworkNode[];
  matchingCase?: MatchingCase;
  hoveredNode: { id: number; side: "source" | "target" | "both" } | null;
  setHoveredNode: (node: { id: number; side: "source" | "target" | "both" } | null) => void;
  layout?: "vertical" | "horizontal";
  styleConfig?: NetworkStyleConfig;
  // Custom data overrides for different animations
  customEdges?: readonly (readonly [number, number])[];
  customMatching?: readonly (readonly [number, number])[];
  customDrivers?: readonly number[];
  customHighlightEdges?: readonly (readonly [number, number])[];
  forceShowMatching?: boolean;
  title?: string;
  titleFontSize?: number;
  renderEdges?: boolean;
  exchangePresentation?: ExchangePresentation;
  stripedNodeIds?: number[];
}

export type EdgeTuple = [number, number];

export type LineGeometry = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type ExchangePhase = "animating" | "preview";

export type ExchangePresentation = {
  active: boolean;
  phase: ExchangePhase;
  pathKey: string;
  pathEdges: EdgeTuple[];
  beforeMatching: EdgeTuple[];
  afterMatching: EdgeTuple[];
  beforeDrivers: number[];
  afterDrivers: number[];
};

export const DEFAULT_STYLE_CONFIG: NetworkStyleConfig = {
  nodes: {
    all: {
      radius: 3.8,
      strokeWidth: 0.6,
      textFontSize: 3.8,
      textOffset: 0.6
    },
    matching: {
      strokeColor: APP_CONFIG.colors.single_layer.matched,
      textColor: APP_CONFIG.colors.single_layer.matched,
      fillColor: APP_CONFIG.colors.single_layer.matched,
      fillColorOpacity: 0.08,
    },
    driver: {
      strokeColor: APP_CONFIG.colors.single_layer.driver,
      textColor: APP_CONFIG.colors.single_layer.driver,
      fillColor: APP_CONFIG.colors.single_layer.driver,
      fillColorOpacity: 0.08,
    },
    regular: {
      strokeColor: "#16212b",
      textColor: "#16212b",
      fillColor: "#ffffff",
      fillColorOpacity: 1,
    },
    hover: {
      strokeColor: APP_CONFIG.visual.node_hover_color,
      textColor: APP_CONFIG.visual.node_hover_color,
      fillColor: "no-change",
      fillColorOpacity: "no-change",
      scale: 1.25,
    }
  },
  edges: {
    all: {
      strokeWidth: 0.6
    },
    matching: {
      color: APP_CONFIG.colors.single_layer.matching_edge,
      colorOpacity: 1,
      dashed: false,
      dashArray: "none",
    },
    nonMatching: {
      color: APP_CONFIG.colors.single_layer.non_matching_edge,
      colorOpacity: 1,
      dashed: false,
      dashArray: "none",
    },
    alternativeNonMatching: {
      color: APP_CONFIG.colors.single_layer.matching_edge,
      colorOpacity: 1,
      dashed: true,
      dashArray: "2 1.5",
    },
    alternativeMatching: {
      color: APP_CONFIG.colors.single_layer.alternating_edge,
      colorOpacity: 1,
      dashed: true,
      dashArray: "2 1.5",
    },
    virtual: {
      color: "rgba(22,33,43,0.05)",
      colorOpacity: 1,
      dashed: true,
      dashArray: "2 3",
    },
    hover: {
      color: APP_CONFIG.visual.edge_hover_color,
      colorOpacity: 1,
      dashed: false,
      dashArray: "none",
      scale: 1.5,
    }
  }
};
