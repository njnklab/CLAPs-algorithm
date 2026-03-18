"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";

import { primerEdges, primerMatchingOptions, primerNetworkNodes } from "@/features/animations/data/demoData";
import { cn } from "@/lib/utils";

import { APP_CONFIG } from "@/lib/config";
import { Card, FormatMathText, KeyNode, KeyEdge, Stepper, SurfaceTitle } from "@/components/ui/core";
import { DirectedNetwork } from "./network/directedNetwork";
import { BipartiteNetwork } from "./network/bipartiteNetwork";
import { DEFAULT_STYLE_CONFIG } from "./network/types";

const stages = [
  {
    title: "Directed network",
    body: "Start with a directed layer. Control analysis begins from topology, not from a chosen driver list."
  },
  {
    title: "Bipartite representation",
    body: "Each node is duplicated into a source-side copy and a target-side copy. Every directed edge becomes a bipartite edge."
  },
  {
    title: "Maximum matching",
    body: "A maximum matching covers as many target-side copies as possible without conflict."
  },
  {
    title: "Driver nodes",
    body: "Unmatched target-side copies determine the minimum driver set. Driver nodes are induced by the matching structure."
  },
  {
    title: "Final control result",
    body: String.raw`Projecting the bipartite result back to the original network: $B \to G$. We obtain a minimum set of driver nodes and a maximum matching of edges.`
  }
];

export function StructuralPrimer() {
  const [stage, setStage] = useState(0);
  const [matchingCase, setMatchingCase] = useState<keyof typeof primerMatchingOptions>("A");
  const [hoveredNode, setHoveredNode] = useState<{ id: number; side: "source" | "target" | "both" } | null>(null);
  const [layout, setLayout] = useState<"vertical" | "horizontal">("horizontal");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setStage((current) => {
        if (current === stages.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 3000);

    return () => window.clearInterval(timer);
  }, [playing]);

  const neighbors = useMemo(() => {
    if (!hoveredNode) return [];
    if (hoveredNode.side === "source") {
      // Show targets for this source
      return primerEdges.filter(([f]) => f === hoveredNode.id).map(([_, t]) => `Node ${t}-`);
    }
    if (hoveredNode.side === "target") {
      // Show sources for this target
      return primerEdges.filter(([, t]) => t === hoveredNode.id).map(([f]) => `Node ${f}+`);
    }
    // "both" (directed stage)
    const outs = primerEdges.filter(([f]) => f === hoveredNode.id).map(([_, t]) => `Node ${t} (out)`);
    const ins = primerEdges.filter(([, t]) => t === hoveredNode.id).map(([f]) => `Node ${f} (in)`);
    return [...outs, ...ins];
  }, [hoveredNode]);

  const bipartitePositions = useMemo(() => {
    const sortedNodes = [...primerNetworkNodes].sort((a, b) => a.id - b.id);

    // Circular layout for Directed Network stage
    const centerX = 50;
    const centerY = 50;
    const radius = 35;

    return sortedNodes.map((node, index) => {
      // Distribute nodes evenly on a circle
      const angle = (index * 2 * Math.PI) / sortedNodes.length - Math.PI / 2;
      const origX = centerX + radius * Math.cos(angle);
      const origY = centerY + radius * Math.sin(angle);

      if (layout === "horizontal") {
        // Horizontal layout: Source top row, Target bottom row
        const x = 16 + (index * 70) / (sortedNodes.length - 1);
        return {
          id: node.id,
          origX,
          origY,
          left: { x, y: 30 },
          right: { x, y: 70 }
        };
      } else {
        // Vertical layout: Source left column, Target right column
        const y = 16 + (index * 70) / (sortedNodes.length - 1);
        return {
          id: node.id,
          origX,
          origY,
          left: { x: 20, y },
          right: { x: 80, y }
        };
      }
    });
  }, [layout]);

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SurfaceTitle
            title="Animation B · Single-layer structural controllability primer"
            body="Watch how a directed network maps to its bipartite representation, where matching determines the driver set."
          />
          <div className="rounded-[26px] border border-ink/8 bg-white p-4 relative">
            <svg viewBox="0 0 100 100" className="w-full">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="4"
                  markerHeight="3"
                  refX="0.1"
                  refY="1.5"
                  orient="auto"
                >
                  <path d="M 0 0 L 4 1.5 L 0 3 z" fill="#9fb0bb" />
                </marker>
                <marker
                  id="arrowhead-matched"
                  markerWidth="4"
                  markerHeight="3"
                  refX="0.1"
                  refY="1.5"
                  orient="auto"
                >
                  <path d="M 0 0 L 4 1.5 L 0 3 z" fill={APP_CONFIG.colors.single_layer.matching_edge} />
                </marker>
                <marker
                  id="arrowhead-regular"
                  markerWidth="4"
                  markerHeight="3"
                  refX="0.1"
                  refY="1.5"
                  orient="auto"
                >
                  <path d="M 0 0 L 4 1.5 L 0 3 z" fill={APP_CONFIG.colors.single_layer.non_matching_edge} />
                </marker>
                <marker
                  id="arrowhead-hover"
                  markerWidth="4"
                  markerHeight="3"
                  refX="0.1"
                  refY="1.5"
                  orient="auto"
                >
                  <path d="M 0 0 L 4 1.5 L 0 3 z" fill={APP_CONFIG.visual.edge_hover_color} />
                </marker>
                <marker
                  id="arrowhead-alternating"
                  markerWidth="4"
                  markerHeight="3"
                  refX="0.1"
                  refY="1.5"
                  orient="auto"
                >
                  <path d="M 0 0 L 4 1.5 L 0 3 z" fill={APP_CONFIG.colors.single_layer.alternating_edge} />
                </marker>
              </defs>

              <LayoutGroup id="primer-animation">
                {/* Unified Edges Layer - Always mounted at parent level for smooth transition across component swap */}
                {primerEdges.map(([from, to]) => {
                  const nodeFrom = bipartitePositions.find((n) => n.id === from);
                  const nodeTo = bipartitePositions.find((n) => n.id === to);
                  if (!nodeFrom || !nodeTo) return null;

                  const isDirectedView = stage === 0 || stage === 4;

                  // Calculate coordinates based on concept view
                  const x1 = isDirectedView ? nodeFrom.origX : nodeFrom.left.x;
                  const y1 = isDirectedView ? nodeFrom.origY : nodeFrom.left.y;
                  const x2 = isDirectedView ? nodeTo.origX : nodeTo.right.x;
                  const y2 = isDirectedView ? nodeTo.origY : nodeTo.right.y;

                  const angle = Math.atan2(y2 - y1, x2 - x1);
                  const nodeRadius = DEFAULT_STYLE_CONFIG.nodes.all.radius;
                  const edgeStrokeWidth = DEFAULT_STYLE_CONFIG.edges.all.strokeWidth;

                  const startPadding = nodeRadius + 1.2;
                  const endPadding = isDirectedView
                    ? nodeRadius + 4.5
                    : nodeRadius + 1.2;

                  const targetX1 = x1 + startPadding * Math.cos(angle);
                  const targetY1 = y1 + startPadding * Math.sin(angle);
                  const targetX2 = x2 - endPadding * Math.cos(angle);
                  const targetY2 = y2 - endPadding * Math.sin(angle);

                  // Shared logic for styles in Animation B
                  const matchingToUse = primerMatchingOptions[matchingCase].edges;
                  const isMatched = (stage >= 2) && matchingToUse.some(([mFrom, mTo]) => mFrom === from && mTo === to);
                  const isHovered = hoveredNode && (
                    hoveredNode.side === "both"
                      ? (from === hoveredNode.id || to === hoveredNode.id)
                      : (hoveredNode.side === "source" ? from === hoveredNode.id : to === hoveredNode.id)
                  );

                  let strokeColor = "#9fb0bb";
                  let visualStrokeWidth = edgeStrokeWidth;
                  let markerEnd = isDirectedView ? "url(#arrowhead)" : "none";

                  if (isHovered) {
                    strokeColor = APP_CONFIG.visual.edge_hover_color;
                    visualStrokeWidth = edgeStrokeWidth * 1.5;
                    if (isDirectedView) markerEnd = "url(#arrowhead-hover)";
                  } else if (isMatched) {
                    strokeColor = APP_CONFIG.colors.single_layer.matching_edge;
                    visualStrokeWidth = edgeStrokeWidth * 1.2;
                    if (isDirectedView) markerEnd = "url(#arrowhead-matched)";
                  } else if (stage === 4) {
                    strokeColor = APP_CONFIG.colors.single_layer.non_matching_edge;
                    if (isDirectedView) markerEnd = "url(#arrowhead-regular)";
                  }

                  return (
                    <motion.line
                      key={`shared-edge-${from}-${to}`}
                      layoutId={`edge-${from}-${to}`}
                      initial={false}
                      animate={{
                        x1: targetX1,
                        y1: targetY1,
                        x2: targetX2,
                        y2: targetY2,
                        stroke: strokeColor,
                        strokeWidth: visualStrokeWidth,
                        opacity: 1
                      }}
                      transition={{
                        stroke: { duration: isHovered ? 0 : 0.3 },
                        default: { type: "spring", stiffness: 60, damping: 15 }
                      }}
                      markerEnd={markerEnd}
                    />
                  );
                })}

                {stage === 0 || stage === 4 ? (
                  <DirectedNetwork
                    key="directed-view"
                    stage={stage}
                    nodes={bipartitePositions}
                    matchingCase={matchingCase}
                    hoveredNode={hoveredNode}
                    setHoveredNode={setHoveredNode}
                    renderEdges={false}
                    title="Directed View"
                    titleFontSize={4.5}
                  />
                ) : (
                  <BipartiteNetwork
                    key="bipartite-view"
                    stage={stage}
                    nodes={bipartitePositions}
                    matchingCase={matchingCase}
                    hoveredNode={hoveredNode}
                    setHoveredNode={setHoveredNode}
                    layout={layout}
                    renderEdges={false}
                    title="Bipartite View"
                    titleFontSize={4.5}
                  />
                )}
              </LayoutGroup>
            </svg>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!playing && stage === stages.length - 1) {
                  setStage(0);
                }
                setPlaying((current) => !current);
              }}
              className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink transition hover:bg-ink/5 outline-none"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <Stepper
              current={stage}
              total={stages.length}
              onNext={() => setStage((current) => Math.min(current + 1, stages.length - 1))}
              onPrevious={() => setStage((current) => Math.max(current - 1, 0))}
              onReset={() => {
                setPlaying(false);
                setStage(0);
              }}
            />
          </div>
          <div className="rounded-[26px] border border-ink/8 bg-white/90 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
              Current frame
            </div>
            <div className="mt-3 text-2xl font-semibold text-ink">{stages[stage].title}</div>
            <div className="mt-3 text-sm leading-7 text-ink/72">
              <FormatMathText text={stages[stage].body} />
            </div>
            <div className="mt-6 pt-5 mx-3 border-t border-ink/5">
              <div className="flex flex-wrap mb-4 gap-x-8 gap-y-4">
                <KeyEdge color={APP_CONFIG.colors.single_layer.matching_edge} label="Matched edge" />
                <KeyEdge color={APP_CONFIG.colors.single_layer.non_matching_edge} label="Unmatched edge" />
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                <KeyNode color={APP_CONFIG.colors.single_layer.driver} label="Driver node (Unmatched)" />
                <KeyNode color={APP_CONFIG.colors.single_layer.matched} label="Matched node" />
              </div>
            </div>
          </div>
          <div className="rounded-[26px] border border-ink/8 bg-white/90 p-5">
            {stage >= 2 && (
              <>
                <p className="mt-2 text-[13px] text-ink/75 leading-relaxed bg-white/40 p-3 rounded-xl border border-ink/5">
                  Note: The maximum matching is not unique. In this example, switching the matching path might influence the control trajectory while maintaining the same driver set size.
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-ink/60 uppercase tracking-wider">Alt Matching:</span>
                  <div className="flex bg-mist/40 p-1 rounded-lg border border-ink/5">
                    {(["A", "B"] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setMatchingCase(opt)}
                        className={cn(
                          "px-3 py-1 text-[12px] rounded-md transition-all font-medium",
                          matchingCase === opt
                            ? "bg-white text-ink shadow-sm"
                            : "text-ink/60 hover:text-ink hover:bg-white/30"
                        )}
                      >
                        {primerMatchingOptions[opt].label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <p className="mt-2">
              Driver nodes are not chosen by hand. They are induced by whichever target-side copies
              remain unmatched in a maximum matching.
            </p>

            <p className="mt-2 mb-4 pb-4 border-b border-ink/5 text-[12px] text-ink/65 italic leading-relaxed">
              <strong>Matching Constraints:</strong> In a bipartite matching, each source copy (<FormatMathText text="+" />) can have at most one outgoing matched edge, and each target copy (<FormatMathText text="-" />) can have at most one incoming matched edge.
            </p>

            {hoveredNode ? (
              <div>
                <p className="font-semibold text-ink">
                  Focus: Node {hoveredNode.id}{hoveredNode.side === "source" ? "+" : hoveredNode.side === "target" ? "-" : ""}
                </p>
                <div className="mt-2 text-[13px] text-ink/80 flex flex-wrap gap-2">
                  <span>Connected neighbors:</span>
                  {neighbors.length > 0 ? (
                    neighbors.map((n, i) => (
                      <span key={i} className="px-1.5 bg-white/50 rounded border border-ink/5 text-ink text-[12px]">
                        {n}
                      </span>
                    ))
                  ) : (
                    <span className="italic">No direct neighbors</span>
                  )}
                </div>
              </div>
            ) : (
              <p>Hover over a node to see its structural neighbors.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
