"use client";

import { useMemo, useState } from "react";

import { toyBaseEdges, toyNodePositions, traceSteps } from "@/features/animations/data/demoData";

import { APP_CONFIG } from "@/lib/config";
import { Card, FormatMathText, KeyNode, StatCard, Stepper, SurfaceTitle } from "@/components/ui/core";

function partitionColor(step: (typeof traceSteps)[number], node: number) {
  if (step.dd1.includes(node)) return APP_CONFIG.colors.duplex.dd1;
  if (step.dd2.includes(node)) return APP_CONFIG.colors.duplex.dd2;
  if (step.cds.includes(node)) return APP_CONFIG.colors.duplex.cds;
  return APP_CONFIG.colors.duplex.cms;
}

function activeNodeType(step: (typeof traceSteps)[number], node: number) {
  if (!step.activePath.length) return null;
  if (step.activePath[0].nodes[0] === node) return "source";
  if (step.activePath[step.activePath.length - 1].nodes.at(-1) === node) return "target";
  if (step.activePath.some((segment) => segment.nodes.includes(node))) return "relay";
  return null;
}

export function ClapTraceDemo() {
  const [index, setIndex] = useState(0);
  const step = traceSteps[index];

  const unionSize = new Set([...step.d1, ...step.d2]).size;
  const deltaChange = index === 0 ? null : traceSteps[index - 1].delta - step.delta;

  const activeSegments = useMemo(
    () =>
      step.activePath.flatMap((segment) =>
        segment.nodes.slice(0, -1).map((node, i) => ({
          layer: segment.layer,
          from: node,
          to: segment.nodes[i + 1]
        }))
      ),
    [step]
  );

  const duplexNodeBgOpacity = Math.round(APP_CONFIG.opacity.duplex_node_bg * 255).toString(16).padStart(2, '0');

  return (
    <Card>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SurfaceTitle
            title="Animation D · CLAP execution trace on the paper's toy duplex"
            body="Step through the three shortest CLAPs reported in the case study and watch DD1, DD2, CDS, and CMS evolve."
          />
          <div className="grid gap-5 xl:grid-cols-2">
            {[1, 2].map((layer) => (
              <div
                key={layer}
                className="rounded-[24px] border border-ink/8 bg-gradient-to-br from-white to-mist/75 p-4"
              >
                <div className="mb-3 text-sm font-medium text-ink">Layer {layer}</div>
                <svg viewBox="0 0 100 100" className="w-full">
                  {(toyBaseEdges[layer as 1 | 2] as readonly (readonly [number, number])[]).map(
                    ([from, to]) => {
                      const a = toyNodePositions.find((node) => node.id === from)!;
                      const b = toyNodePositions.find((node) => node.id === to)!;
                      const active = activeSegments.some(
                        (segment) =>
                          segment.layer === layer &&
                          ((segment.from === from && segment.to === to) ||
                            (segment.from === to && segment.to === from))
                      );

                      return (
                        <line
                          key={`${layer}-${from}-${to}`}
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke={active ? (layer === 1 ? APP_CONFIG.colors.layer1.matching_edge : APP_CONFIG.colors.layer2.matching_edge) : APP_CONFIG.colors.single_layer.non_matching_edge}
                          strokeWidth={active ? 3 : 1.6}
                          strokeLinecap="round"
                        />
                      );
                    }
                  )}

                  {toyNodePositions.map((node) => {
                    const role = activeNodeType(step, node.id);
                    const color = partitionColor(step, node.id);
                    return (
                      <g key={`${layer}-node-${node.id}`}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={role ? 5.2 : 4.2}
                          fill={`${color}${duplexNodeBgOpacity}`}
                          stroke={role ? APP_CONFIG.colors.duplex.active_clap : color}
                          strokeWidth={role ? 2.2 : 1.3}
                        />
                        <text
                          x={node.x}
                          y={node.y + 0.6}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-ink text-[4px] font-semibold"
                        >
                          {node.id}
                        </text>
                        {role && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={role ? 6.5 : 5.5}
                            fill="none"
                            stroke={APP_CONFIG.colors.duplex.active_clap}
                            strokeWidth={0.8}
                            opacity={0.6}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-5 border-t border-ink/5">
            <div className="mb-3 text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em]">
              Node Types Legend
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <KeyNode color={APP_CONFIG.colors.duplex.dd1} label="$DD_1$" />
              <KeyNode color={APP_CONFIG.colors.duplex.dd2} label="$DD_2$" />
              <KeyNode color={APP_CONFIG.colors.duplex.cds} label="$CDS$" />
              <KeyNode color={APP_CONFIG.colors.duplex.cms} label="$CMS$" />
              <KeyNode color={APP_CONFIG.colors.duplex.active_clap} label="Active path" />
            </div>
          </div>
          <div className="mt-6">
            <Stepper
              current={index}
              total={traceSteps.length}
              onNext={() => setIndex((current) => Math.min(current + 1, traceSteps.length - 1))}
              onPrevious={() => setIndex((current) => Math.max(current - 1, 0))}
              onReset={() => setIndex(0)}
            />
          </div>
        </div>
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="$\Delta$" value={step.delta} hint="Difference mass" />
            <StatCard label="$|U|$" value={unionSize} hint="Union driver set size" />
            <StatCard label="$DD_1$" value={step.dd1.length} color={APP_CONFIG.colors.duplex.dd1} />
            <StatCard label="$DD_2$" value={step.dd2.length} color={APP_CONFIG.colors.duplex.dd2} />
          </div>
          <div className="rounded-[24px] border border-ink/8 bg-white/90 p-5">
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
          <div className="rounded-[24px] border border-ink/8 bg-gradient-to-br from-white to-mist/70 p-5">
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
