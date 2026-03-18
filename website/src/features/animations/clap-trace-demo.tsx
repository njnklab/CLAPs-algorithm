"use client";

import { useEffect, useMemo, useState } from "react";

import { toyBaseEdges, toyNodePositions, traceSteps, type TraceStep } from "@/features/animations/data/demoData";
import { APP_CONFIG } from "@/lib/config";
import { Card, FormatMathText, KeyNode, StatCard, Stepper, SurfaceTitle } from "@/components/ui/core";
import { BipartiteNetwork } from "./network/bipartiteNetwork";
import { DirectedNetwork } from "./network/directedNetwork";
import type { NetworkNode } from "./network/types";

type ClapPhase =
  | { type: "search"; layer: 1 | 2; from: number; to: number; isTerminal: boolean }
  | { type: "exchange" };

type Segment = { layer: 1 | 2; from: number; to: number };

const TRACE_PHASE_SEQUENCES: ClapPhase[][] = traceSteps.map(buildPhaseSequence);
const DUPLEX_BG_OPACITY_HEX = Math.round(APP_CONFIG.opacity.duplex_node_bg * 255)
  .toString(16)
  .padStart(2, "0");

function partitionColor(step: TraceStep, node: number) {
  if (step.dd1.includes(node)) return APP_CONFIG.colors.duplex.dd1;
  if (step.dd2.includes(node)) return APP_CONFIG.colors.duplex.dd2;
  if (step.cds.includes(node)) return APP_CONFIG.colors.duplex.cds;
  return APP_CONFIG.colors.duplex.cms;
}

function activeNodeType(step: TraceStep, node: number) {
  if (!step.activePath.length) return null;
  const firstSegment = step.activePath[0];
  const lastSegment = step.activePath[step.activePath.length - 1];
  if (firstSegment.nodes[0] === node) return "source";
  if (lastSegment.nodes.at(-1) === node) return "target";
  if (step.activePath.some((segment) => segment.nodes.includes(node))) return "relay";
  return null;
}

function buildPhaseSequence(step: TraceStep): ClapPhase[] {
  if (!step.activePath.length) return [{ type: "exchange" }];
  const phases: ClapPhase[] = [];
  step.activePath.forEach((segment, segmentIdx) => {
    segment.nodes.forEach((node, nodeIdx) => {
      if (nodeIdx === segment.nodes.length - 1) return;
      const nextNode = segment.nodes[nodeIdx + 1];
      const isTerminal =
        segmentIdx === step.activePath.length - 1 && nodeIdx + 1 === segment.nodes.length - 1;
      phases.push({
        type: "search",
        layer: segment.layer,
        from: node,
        to: nextNode,
        isTerminal
      });
    });
  });
  phases.push({ type: "exchange" });
  return phases;
}

function flattenSegments(activePath: TraceStep["activePath"]): Segment[] {
  return activePath.flatMap((segment) =>
    segment.nodes.slice(0, -1).map((node, idx) => ({
      layer: segment.layer,
      from: node,
      to: segment.nodes[idx + 1]
    }))
  );
}

function describePhase(phase: ClapPhase | undefined, index: number, total: number) {
  if (!phase) return "Idle";
  if (phase.type === "exchange") {
    return total > 1 ? "Apply driver exchange" : "Preview alignment";
  }
  const prefix = phase.isTerminal ? "Reach target" : "Follow alternating path";
  return `${prefix} · Layer ${phase.layer} (${phase.from} → ${phase.to})`;
}

export function ClapTraceDemo() {
  const [stepIndex, setStepIndex] = useState(0);
  const [phaseCursor, setPhaseCursor] = useState(0);
  const [detailedPause, setDetailedPause] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<{ id: number; side: "source" | "target" | "both" } | null>(null);

  const step = traceSteps[stepIndex];
  const phaseSequence = TRACE_PHASE_SEQUENCES[stepIndex];
  const phaseCount = phaseSequence.length;
  const effectivePhaseIndex = detailedPause ? phaseCursor : phaseCount - 1;
  const currentPhase = phaseSequence[effectivePhaseIndex];

  const segmentsFull = useMemo(() => flattenSegments(step.activePath), [step]);
  const visibleSegments = useMemo(() => {
    if (!step.activePath.length) return [];
    if (!currentPhase || currentPhase.type === "exchange" || !detailedPause) return segmentsFull;
    return [{ layer: currentPhase.layer, from: currentPhase.from, to: currentPhase.to }];
  }, [currentPhase, segmentsFull, step.activePath.length, detailedPause]);

  const phaseLabel = describePhase(currentPhase, effectivePhaseIndex, phaseCount);
  const unionSize = new Set([...step.d1, ...step.d2]).size;
  const deltaChange = stepIndex === 0 ? null : traceSteps[stepIndex - 1].delta - step.delta;

  const networkNodes = useMemo<NetworkNode[]>(() => {
    const sorted = [...toyNodePositions].sort((a, b) => a.id - b.id);
    const span = sorted.length > 1 ? sorted.length - 1 : 1;
    return sorted.map<NetworkNode>((node, idx) => {
      const x = 8 + (idx / span) * 84;
      return {
        id: node.id,
        origX: node.x,
        origY: node.y,
        left: { x, y: 25 },
        right: { x, y: 75 }
      };
    });
  }, []);

  const segmentsByLayer = useMemo(
    () => ({
      1: visibleSegments.filter((segment) => segment.layer === 1).map((segment) => [segment.from, segment.to] as [number, number]),
      2: visibleSegments.filter((segment) => segment.layer === 2).map((segment) => [segment.from, segment.to] as [number, number])
    }),
    [visibleSegments]
  );

  useEffect(() => {
    setPlaying(false);
    setPhaseCursor(detailedPause ? 0 : phaseSequence.length - 1);
  }, [stepIndex, detailedPause, phaseSequence.length]);

  useEffect(() => {
    if (!detailedPause && phaseCursor !== phaseCount - 1) {
      setPhaseCursor(phaseCount - 1);
    }
  }, [detailedPause, phaseCount, phaseCursor]);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(() => {
      const advanced = advanceTimeline();
      if (!advanced) {
        setPlaying(false);
      }
    }, detailedPause ? 1100 : 1600);
    return () => window.clearTimeout(timer);
  }, [playing, detailedPause, stepIndex, phaseCursor, phaseCount]);

  const advanceTimeline = () => {
    if (detailedPause && phaseCursor < phaseCount - 1) {
      setPhaseCursor((prev) => Math.min(prev + 1, phaseCount - 1));
      return true;
    }
    if (stepIndex < traceSteps.length - 1) {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      const targetSeq = TRACE_PHASE_SEQUENCES[nextIndex];
      setPhaseCursor(detailedPause ? 0 : targetSeq.length - 1);
      return true;
    }
    return false;
  };

  const handleNext = () => {
    if (!advanceTimeline()) {
      setPlaying(false);
    }
  };

  const handlePrevious = () => {
    setPlaying(false);
    if (detailedPause && phaseCursor > 0) {
      setPhaseCursor((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (stepIndex > 0) {
      const prevIndex = stepIndex - 1;
      setStepIndex(prevIndex);
      const targetSeq = TRACE_PHASE_SEQUENCES[prevIndex];
      setPhaseCursor(detailedPause ? targetSeq.length - 1 : targetSeq.length - 1);
    }
  };

  const handleReset = () => {
    setPlaying(false);
    setStepIndex(0);
    const firstSeq = TRACE_PHASE_SEQUENCES[0];
    setPhaseCursor(detailedPause ? 0 : firstSeq.length - 1);
  };

  const toggleDetailedPause = () => {
    setPlaying(false);
    setDetailedPause((prev) => !prev);
  };

  const layerDrivers = (layer: 1 | 2) => (layer === 1 ? step.d1 : step.d2);

  const stepperCurrent = detailedPause ? phaseCursor : stepIndex;
  const stepperTotal = detailedPause ? phaseCount : traceSteps.length;
  const hasMoreTimeline =
    (detailedPause && (phaseCursor < phaseCount - 1 || stepIndex < traceSteps.length - 1)) ||
    (!detailedPause && stepIndex < traceSteps.length - 1);

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr]">
        <div className="space-y-6">
          <SurfaceTitle
            title="Animation D · CLAP execution trace on the paper's toy duplex"
            body="Watch each CLAP unfold as alternating segments hop between the two layers, then observe how $DD_1$, $DD_2$, $CDS$, and $CMS$ adjust."
          />
          <div className="flex flex-wrap items-center gap-3 border border-ink/10 rounded-[24px] p-4 bg-surface/95">
            <button
              type="button"
              onClick={toggleDetailedPause}
              aria-pressed={detailedPause}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                detailedPause ? "border-layer1 text-layer1 bg-layer1/15" : "border-ink/15 text-ink hover:border-ink/35"
              }`}
            >
              {detailedPause ? "Detailed: on" : "Detailed: off"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (playing) {
                  setPlaying(false);
                } else {
                  if (!hasMoreTimeline) {
                    handleReset();
                  }
                  setPlaying(true);
                }
              }}
              className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink transition hover:border-ink/35"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <div className="flex-1 min-w-[220px]">
              <Stepper
                current={stepperCurrent}
                total={stepperTotal}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onReset={handleReset}
              />
            </div>
          </div>

          <div className="rounded-[22px] border border-ink/8 bg-surface/95 p-4 text-xs font-medium uppercase tracking-[0.2em] text-ink/45">
            Phase {effectivePhaseIndex + 1}/{phaseCount}: {phaseLabel}
          </div>

          {[1, 2].map((layer) => (
            <div key={layer} className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                Layer {layer}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] border border-ink/10 bg-gradient-to-b from-surface to-mist/80 p-3">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <BipartiteNetwork
                      stage={3}
                      nodes={networkNodes}
                      hoveredNode={hoveredNode}
                      setHoveredNode={setHoveredNode}
                      layout="horizontal"
                      customEdges={toyBaseEdges[layer as 1 | 2]}
                      customDrivers={layerDrivers(layer as 1 | 2)}
                      customHighlightEdges={segmentsByLayer[layer as 1 | 2]}
                      forceShowMatching
                      title={`Layer ${layer} · Bipartite`}
                      titleFontSize={4}
                    />
                  </svg>
                </div>
                <div className="rounded-[22px] border border-ink/10 bg-gradient-to-b from-surface to-mist/80 p-3">
                  <svg viewBox="0 0 100 90" className="w-full h-full">
                    <DirectedNetwork
                      stage={3}
                      nodes={networkNodes}
                      hoveredNode={hoveredNode}
                      setHoveredNode={setHoveredNode}
                      customEdges={toyBaseEdges[layer as 1 | 2]}
                      customDrivers={layerDrivers(layer as 1 | 2)}
                      customHighlightEdges={segmentsByLayer[layer as 1 | 2]}
                      forceShowMatching
                      title={`Layer ${layer} · Directed`}
                      titleFontSize={4}
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-[24px] border border-ink/8 bg-surface/90 p-5">
            <div className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em]">
              Node types legend
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              <KeyNode color={APP_CONFIG.colors.duplex.dd1} label="$DD_1$" />
              <KeyNode color={APP_CONFIG.colors.duplex.dd2} label="$DD_2$" />
              <KeyNode color={APP_CONFIG.colors.duplex.cds} label="$CDS$" />
              <KeyNode color={APP_CONFIG.colors.duplex.cms} label="$CMS$" />
              <KeyNode color={APP_CONFIG.colors.duplex.active_clap} label="Active path" />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="$\Delta$" value={step.delta} hint="Difference mass" />
            <StatCard label="$|U|$" value={unionSize} hint="Union driver set size" />
            <StatCard label="$DD_1$" value={step.dd1.length} color={APP_CONFIG.colors.duplex.dd1} />
            <StatCard label="$DD_2$" value={step.dd2.length} color={APP_CONFIG.colors.duplex.dd2} />
          </div>
          <div className="rounded-[24px] border border-ink/8 bg-surface/90 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
              This frame explains
            </div>
            <div className="mt-3 text-sm leading-7 text-ink/74">
              <FormatMathText text={step.note} />
            </div>
            {deltaChange ? (
              <div className="mt-4 inline-flex rounded-full bg-layer1/12 px-4 py-2 text-sm font-medium text-layer1">
                <FormatMathText text={String.raw`$\Delta$ decreases by ${deltaChange}, $|U|$ decreases by 1`} />
              </div>
            ) : null}
          </div>
          <div className="rounded-[24px] border border-ink/8 bg-gradient-to-br from-surface to-mist/70 p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
              Current sets
            </div>
            <div className="space-y-2 text-sm text-ink/76">
              <div>
                <span className="font-medium text-ink"><FormatMathText text="$D_1$:" /></span> {step.d1.join(", ")}
              </div>
              <div>
                <span className="font-medium text-ink"><FormatMathText text="$D_2$:" /></span> {step.d2.join(", ")}
              </div>
              <div>
                <span className="font-medium text-ink"><FormatMathText text="$DD_1$:" /></span>{" "}
                {step.dd1.length ? step.dd1.join(", ") : "empty"}
              </div>
              <div>
                <span className="font-medium text-ink"><FormatMathText text="$DD_2$:" /></span>{" "}
                {step.dd2.length ? step.dd2.join(", ") : "empty"}
              </div>
              <div>
                <span className="font-medium text-ink"><FormatMathText text="$CDS$:" /></span>{" "}
                {step.cds.length ? step.cds.join(", ") : "empty"}
              </div>
              <div>
                <span className="font-medium text-ink"><FormatMathText text="$CMS$:" /></span>{" "}
                {step.cms.length ? step.cms.join(", ") : "empty"}
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-ink/8 bg-mist/65 p-5 text-sm leading-7 text-ink/72">
            <FormatMathText text="Relay rule in view: nodes reached by a layer-1 segment must be in $CMS$ before the next layer-2 move, while nodes reached by a layer-2 segment must be in $CDS$ before the next layer-1 move." />
          </div>
        </div>
      </div>
    </Card>
  );

}
