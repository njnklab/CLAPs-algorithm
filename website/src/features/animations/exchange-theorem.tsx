"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { exchangeNodes, exchangeEdges, exchangeSteps, exchangePaths, initialMatching, initialDrivers } from "./data/exchangeData";
import { APP_CONFIG } from "@/lib/config";
import { Card, FormatMathText, KeyEdge, KeyNode, Stepper, SurfaceTitle } from "@/components/ui/core";
import { DirectedNetwork } from "./network/directedNetwork";
import { BipartiteNetwork } from "./network/bipartiteNetwork";
import { NetworkNode, ExchangePresentation, ExchangePhase, DEFAULT_STYLE_CONFIG } from "./network/types";
import { cn } from "@/lib/utils";

export default function ExchangeTheorem() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<{ id: number; side: "source" | "target" | "both" } | null>(null);

  // New hierarchical state
  const [activeS, setActiveS] = useState(2);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);
  const [activeTargetIdx, setActiveTargetIdx] = useState(0);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current === 3) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 2000);

    return () => window.clearInterval(timer);
  }, [playing]);

  // Utility to format internal template format (<-/->) to Display LaTeX (\leftarrow/\rightarrow)
  const formatArrowsForDisplay = (str: string) => {
    return str
      .replace(/<-/g, "\\leftarrow ")
      .replace(/->/g, "\\rightarrow ");
  };

  // Utility to parse description from template by truncating at target t
  const parseDescriptionFromTemplate = (template: string, targetT: number) => {
    // Identify truncation point on raw ASCII template
    // Correctly escape ^ for the superscript match
    const targetPattern = new RegExp(`${targetT}(\\^[-+])?`);
    const match = template.match(targetPattern);

    let part = (match && match.index !== undefined)
      ? template.substring(0, match.index + match[0].length)
      : template;

    // Ensure the truncated LaTeX string is closed
    if (template.startsWith("$") && part !== template && !part.endsWith("$")) {
      part += "$";
    }

    return formatArrowsForDisplay(part);
  };

  // Derive the currently selected path details
  const availableTemplates = useMemo(() => {
    return exchangePaths.map((p, idx) => ({ ...p, originalIdx: idx })).filter(p => p.s === activeS);
  }, [activeS]);

  const safeTemplateIdx = Math.min(activeTemplateIdx, availableTemplates.length - 1);
  const currentTemplate = availableTemplates[safeTemplateIdx] || availableTemplates[0];

  const safeTargetIdx = Math.min(activeTargetIdx, (currentTemplate?.targets.length || 1) - 1);
  const currentTarget = currentTemplate?.targets[safeTargetIdx] || currentTemplate?.targets[0];

  const selectedS = activeS;
  const selectedT = currentTarget?.t || 0;
  const selectedEdges = currentTarget?.edges || [];
  const pathKey = `${selectedS}-${safeTemplateIdx}-${safeTargetIdx}`;

  useEffect(() => {
    const prevStep = prevStepRef.current;

    if (step !== 2) {
      setExchangePhase(null);
      prevStepRef.current = step;
      return;
    }

    // 只有从 1 -> 2 才播放平移动画
    if (prevStep === 1) {
      setExchangePhase("animating");

      const timer = window.setTimeout(() => {
        setExchangePhase("preview");
      }, 850);

      prevStepRef.current = step;
      return () => window.clearTimeout(timer);
    }

    // 例如 3 -> 2，直接进入 preview，不播放平移
    setExchangePhase("preview");
    prevStepRef.current = step;
  }, [step, pathKey]);

  // Dynamic description generation
  const selectedDescription = useMemo(() => {
    if (!currentTemplate || !selectedT) return "";
    return parseDescriptionFromTemplate(currentTemplate.template, selectedT);
  }, [currentTemplate, selectedT]);

  // Helper to hydrate templates from exchangeData.ts
  const hydrateBody = (template: string, vars: { s: number; t: number; drivers: number[]; path: string; initialDrivers: number[] }) => {
    return template
      .replace(/{s}/g, vars.s.toString())
      .replace(/{t}/g, vars.t.toString())
      .replace(/{path}/g, vars.path)
      .replace(/{drivers}/g, vars.drivers.join(", "))
      .replace(/{initialDrivers}/g, vars.initialDrivers.join(", "));
  };

  // Dynamically generate steps based on selected path
  const dynamicSteps = useMemo(() => {
    const toggleMatching = (m: [number, number][], p: [number, number][]) => {
      let result = [...m.map(e => [...e] as [number, number])];
      for (const [pf, pt] of p) {
        const realIdx = result.findIndex(e => (e[0] === pf && e[1] === pt) || (e[1] === pf && e[0] === pt));
        if (realIdx > -1) result.splice(realIdx, 1);
        else result.push([pf, pt]);
      }
      return result;
    };

    const finalMatching = toggleMatching(initialMatching, selectedEdges);
    const finalDrivers = [...initialDrivers.filter(id => id !== selectedS)];
    if (!finalDrivers.includes(selectedT) && selectedT !== 0) {
      finalDrivers.push(selectedT);
    }
    finalDrivers.sort((a, b) => a - b);

    const commonVars = {
      s: selectedS,
      t: selectedT,
      path: selectedDescription,
      initialDrivers: initialDrivers
    };

    return exchangeSteps.map((stepInfo, idx) => {
      // Steps 0 and 1 use initial state.
      // Steps 2 and 3 use final state (post-symmetric difference).
      const isPostSymmetric = idx >= 3;
      const displayDrivers = isPostSymmetric ? finalDrivers : initialDrivers;
      const displayMatching = isPostSymmetric ? finalMatching : initialMatching;

      return {
        ...stepInfo,
        body: hydrateBody(stepInfo.body, { ...commonVars, drivers: displayDrivers }),
        matching: displayMatching,
        highlightEdges: (idx === 1 || idx === 2) ? selectedEdges : [],
        drivers: displayDrivers
      };
    });
  }, [selectedS, selectedT, selectedEdges, selectedDescription]);

  const currentStep = dynamicSteps[step] || dynamicSteps[0];

  const positions: NetworkNode[] = useMemo(() => {
    const sorted = [...exchangeNodes].sort((a, b) => a.id - b.id);
    return exchangeNodes.map(node => {
      const index = sorted.findIndex(n => n.id === node.id);
      const bipartiteX = 15 + (index * 70) / (sorted.length - 1);
      return {
        id: node.id,
        origX: node.x,
        origY: node.y,
        left: { x: bipartiteX, y: 30 },
        right: { x: bipartiteX, y: 70 }
      };
    });
  }, []);

  const [exchangePhase, setExchangePhase] = useState<ExchangePhase | null>(null);
  const prevStepRef = useRef(0);

  const exchangePresentation = useMemo<ExchangePresentation | undefined>(() => {
    if (step !== 2) return undefined;

    const phase: ExchangePhase = exchangePhase ?? "preview";

    return {
      active: true,
      phase,
      pathKey,
      pathEdges: selectedEdges,
      beforeMatching: dynamicSteps[1]?.matching || initialMatching,
      afterMatching: dynamicSteps[3]?.matching || initialMatching,
      beforeDrivers: dynamicSteps[1]?.drivers || initialDrivers,
      afterDrivers: dynamicSteps[3]?.drivers || initialDrivers,
    };
  }, [
    step,
    exchangePhase,
    pathKey,
    selectedEdges,
    dynamicSteps,
    initialMatching,
    initialDrivers,
  ]);

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col">
          <SurfaceTitle
            title="Animation C · Single-layer structural control exchange theorem"
            body="Alternating paths in the bipartite graph allow us to reconfigure maximum matchings."
          />
          <div className="rounded-[26px] border border-ink/8 bg-white p-4 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <BipartiteNetwork
                stage={step}
                nodes={positions}
                hoveredNode={hoveredNode}
                setHoveredNode={setHoveredNode}
                customEdges={exchangeEdges}
                customMatching={currentStep.matching}
                customDrivers={currentStep.drivers}
                customHighlightEdges={currentStep.highlightEdges}
                exchangePresentation={exchangePresentation}
                forceShowMatching={true}
                title="Bipartite View"
                titleFontSize={4.5}
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col space-y-6 overflow-hidden">

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!playing && step === dynamicSteps.length - 1) {
                    setStep(0);
                  }
                  setPlaying((current) => !current);
                }}
                className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink transition hover:bg-ink/5 outline-none"
              >
                {playing ? "Pause" : "Play"}
              </button>
              <Stepper
                current={step}
                total={dynamicSteps.length}
                onNext={() => setStep(s => Math.min(s + 1, dynamicSteps.length - 1))}
                onPrevious={() => setStep(s => Math.max(s - 1, 0))}
                onReset={() => {
                  setPlaying(false);
                  setStep(0);
                }}
              />
            </div>

            <div className="flex flex-col flex-1">
              <div className="rounded-[26px] border border-ink/8 bg-white p-4 relative h-[360px] flex items-center justify-center overflow-hidden">
                <svg viewBox="5 0 94 80" className="w-full h-full">
                  <defs>
                    <marker id="arrowhead" markerWidth="4" markerHeight="3" refX="0.1" refY="1.5" orient="auto">
                      <path d="M 0 0 L 4 1.5 L 0 3 z" fill="#9fb0bb" />
                    </marker>
                    <marker id="arrowhead-matched" markerWidth="4" markerHeight="3" refX="0.1" refY="1.5" orient="auto">
                      <path d="M 0 0 L 4 1.5 L 0 3 z" fill={APP_CONFIG.colors.single_layer.matching_edge} />
                    </marker>
                    <marker id="arrowhead-regular" markerWidth="4" markerHeight="3" refX="0.1" refY="1.5" orient="auto">
                      <path d="M 0 0 L 4 1.5 L 0 3 z" fill={APP_CONFIG.colors.single_layer.non_matching_edge} />
                    </marker>
                    <marker id="arrowhead-hover" markerWidth="4" markerHeight="3" refX="0.1" refY="1.5" orient="auto">
                      <path d="M 0 0 L 4 1.5 L 0 3 z" fill={APP_CONFIG.visual.edge_hover_color} />
                    </marker>
                    <marker id="arrowhead-alternating" markerWidth="4" markerHeight="3" refX="0.1" refY="1.5" orient="auto">
                      <path d="M 0 0 L 4 1.5 L 0 3 z" fill={APP_CONFIG.colors.single_layer.alternating_edge} />
                    </marker>
                  </defs>
                  <DirectedNetwork
                    stage={step}
                    nodes={positions}
                    hoveredNode={hoveredNode}
                    setHoveredNode={setHoveredNode}
                    styleConfig={{
                      ...DEFAULT_STYLE_CONFIG,
                      nodes: {
                        ...DEFAULT_STYLE_CONFIG.nodes,
                        all: {
                          ...DEFAULT_STYLE_CONFIG.nodes.all,
                          textFontSize: 4
                        }
                      }
                    }}
                    customEdges={exchangeEdges}
                    customMatching={currentStep.matching}
                    customDrivers={currentStep.drivers}
                    customHighlightEdges={currentStep.highlightEdges}
                    exchangePresentation={exchangePresentation}
                    forceShowMatching={true}
                    title="Directed View"
                    titleFontSize={6.5}
                  />
                </svg>
              </div>
            </div>

            {step >= 1 && (
              <details
                key={"exchange-theorem-optional-exchanges"}
                className="group rounded-[26px] border border-ink/8 bg-white/90 p-5 transition-all"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  <span><FormatMathText text={"Other optional exchanges with differnet $s$ and $t$"} /></span>
                  <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink/40 transition-transform duration-300 group-open:rotate-180 group-open:bg-ink group-open:text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </span>
                </summary>

                {/* Path Selection Interface */}
                <div className="mt-2 flex flex-col space-y-5">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col space-y-5"
                  >
                    {/* Level 1: Select s (Start Node) */}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-3 ml-1">
                        1. Select start node <FormatMathText text="$s$" />
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {[2, 3, 4].map(sId => (
                          <button
                            key={`s-node-${sId}`}
                            onClick={() => {
                              setActiveS(sId);
                              setActiveTemplateIdx(0);
                              setActiveTargetIdx(0);
                            }}
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border outline-none",
                              activeS === sId
                                ? "bg-ink text-white border-ink shadow-md scale-105"
                                : "bg-white text-ink/70 border-ink/10 hover:border-ink/30"
                            )}
                          >
                            {sId}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Level 2: Select Path Structure */}
                    <div className="flex flex-col">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-3 ml-1">
                        2. Select path structure
                      </div>
                      <div className="flex flex-col gap-2">
                        {availableTemplates.map((template, idx) => (
                          <button
                            key={`temp-${idx}`}
                            onClick={() => {
                              setActiveTemplateIdx(idx);
                              setActiveTargetIdx(0);
                            }}
                            className={cn(
                              "w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 group outline-none",
                              activeTemplateIdx === idx
                                ? "bg-ink/5 border-ink/30 shadow-sm"
                                : "bg-white border-ink/10 text-ink/60 hover:border-ink/25"
                            )}
                          >
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              activeTemplateIdx === idx ? "bg-amber-400" : "bg-ink/10 group-hover:bg-ink/30"
                            )} />
                            <div className={cn(
                              "text-xs font-semibold",
                              activeTemplateIdx === idx ? "text-ink" : "text-ink/60"
                            )}>
                              <FormatMathText text={formatArrowsForDisplay(template.template)} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Level 3: Select t (Target Node) */}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-3 ml-1">
                        3. Select target node <FormatMathText text="$t$" />
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {currentTemplate?.targets.map((target, idx) => (
                          <button
                            key={`target-${idx}`}
                            onClick={() => setActiveTargetIdx(idx)}
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border outline-none",
                              activeTargetIdx === idx
                                ? "bg-ink text-white border-ink shadow-md scale-105"
                                : "bg-white text-ink/70 border-ink/10 hover:border-ink/30"
                            )}
                          >
                            {target.t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </details>
            )}

            <div className="rounded-[26px] border border-ink/8 bg-white/90 p-5 flex flex-col justify-between">
              <div className="flex-shrink-0">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
                  Current step
                </div>
                <div className="mt-2 text-2xl font-semibold text-ink">{currentStep.title}</div>
                <div className="mt-3 text-sm leading-relaxed text-ink/72">
                  <FormatMathText text={currentStep.body} />
                </div>
                <div className="mt-6 pt-5 mx-3 border-t border-ink/5">
                  <div className="flex flex-wrap mb-4 gap-x-8 gap-y-4">
                    <KeyEdge color={APP_CONFIG.colors.single_layer.matching_edge} label="Matched" />
                    <KeyEdge color={APP_CONFIG.colors.single_layer.non_matching_edge} label="Unmatched" />
                    <KeyEdge color={APP_CONFIG.colors.single_layer.alternating_edge} label="Alternating" />
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-4">
                    <KeyNode color={APP_CONFIG.colors.single_layer.driver} label="Driver node" />
                    <KeyNode color={APP_CONFIG.colors.single_layer.matched} label="Matched node" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
