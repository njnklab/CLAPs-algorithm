"use client";

import { useMemo, useState } from "react";

import type { RealSummary, SyntheticSummary } from "@/lib/results";
import { cn, formatCompact, formatNumber } from "@/lib/utils";

import { APP_CONFIG } from "@/lib/config";
import { Card, FormatMathText, KeyNode, StatCard, SurfaceTitle } from "@/components/ui/core";

type ResultsExplorerProps = {
  synthetic: SyntheticSummary[];
  real: RealSummary[];
};

const seriesColors = APP_CONFIG.colors.charts;

type Metric = "absolute" | "relative" | "runtime" | "memory";

export function ResultsExplorer({ synthetic, real }: ResultsExplorerProps) {
  const [dataset, setDataset] = useState<"synthetic" | "real">("synthetic");
  const [metric, setMetric] = useState<Metric>("absolute");
  const [networkType, setNetworkType] = useState("ER+ER");
  const [domain, setDomain] = useState("All");
  const [hovered, setHovered] = useState<string | null>(null);

  const syntheticTypes = Array.from(new Set(synthetic.map((item) => item.networkType)));
  const domains = ["All", ...Array.from(new Set(real.map((item) => item.domain)))];

  const filteredSynthetic = synthetic.filter((item) => item.networkType === networkType);
  const filteredReal = real.filter((item) => domain === "All" || item.domain === domain);

  const syntheticChart = useMemo(() => {
    if (metric === "memory") return null;

    const valuesBySeries =
      metric === "absolute"
        ? {
          claps: filteredSynthetic.map((item) => item.absoluteGain.claps),
          ilp: filteredSynthetic.map((item) => item.absoluteGain.ilp),
          clapg: filteredSynthetic.map((item) => item.absoluteGain.clapg),
          rsu: filteredSynthetic.map((item) => item.absoluteGain.rsu)
        }
        : metric === "relative"
          ? {
            claps: filteredSynthetic.map((item) => item.relativeGain),
            ilp: [] as number[],
            clapg: [] as number[],
            rsu: [] as number[]
          }
          : {
            claps: filteredSynthetic.map((item) => item.runtime.claps),
            ilp: filteredSynthetic.map((item) => item.runtime.ilp),
            clapg: filteredSynthetic.map((item) => item.runtime.clapg),
            rsu: filteredSynthetic.map((item) => item.runtime.rsu)
          };

    const width = 720;
    const height = 320;
    const left = 56;
    const top = 26;
    const right = 26;
    const bottom = 42;
    const degrees = filteredSynthetic.map((item) => item.degree);
    const maxY = Math.max(
      1,
      ...Object.values(valuesBySeries)
        .flat()
        .filter((value) => Number.isFinite(value))
    );

    const x = (value: number) => {
      const min = Math.min(...degrees);
      const max = Math.max(...degrees);
      if (max === min) return left;
      return left + ((value - min) / (max - min)) * (width - left - right);
    };

    const y = (value: number) => height - bottom - (value / maxY) * (height - top - bottom);

    const legend =
      metric === "relative"
        ? [{ key: "claps", label: "CLAP-S over RSU" as const }]
        : [
          { key: "claps", label: "CLAP-S" as const },
          { key: "ilp", label: "ILP-Exact" as const },
          { key: "clapg", label: "CLAP-G" as const },
          { key: "rsu", label: "RSU" as const }
        ];

    return (
      <div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const axisValue = maxY * fraction;
            const yCoord = y(axisValue);
            return (
              <g key={fraction}>
                <line x1={left} y1={yCoord} x2={width - right} y2={yCoord} stroke="#e2e8f0" />
                <text x={16} y={yCoord + 4} className="fill-ink/55 text-[11px]">
                  {metric === "runtime" ? `${formatNumber(axisValue, 2)}s` : formatNumber(axisValue, 0)}
                </text>
              </g>
            );
          })}

          {legend.map(({ key }) => {
            const series = valuesBySeries[key as keyof typeof valuesBySeries];
            if (!series.length) return null;
            const path = filteredSynthetic
              .map((item, index) => `${index === 0 ? "M" : "L"} ${x(item.degree)} ${y(series[index])}`)
              .join(" ");

            return (
              <g key={key}>
                <path
                  d={path}
                  fill="none"
                  stroke={seriesColors[key as keyof typeof seriesColors]}
                  strokeWidth={key === "claps" ? 3.4 : 2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {filteredSynthetic.map((item, index) => (
                  <circle
                    key={`${key}-${item.degree}`}
                    cx={x(item.degree)}
                    cy={y(series[index])}
                    r={4.2}
                    fill={seriesColors[key as keyof typeof seriesColors]}
                    onMouseEnter={() =>
                      setHovered(
                        String.raw`${key.toUpperCase()} at $\langle k \rangle = ${item.degree}: ${metric === "runtime"
                          ? `${formatNumber(series[index], 3)} s`
                          : formatNumber(series[index], metric === "relative" ? 2 : 1)
                        }${metric === "relative" ? "%" : ""}`
                      )
                    }
                  />
                ))}
              </g>
            );
          })}

          {filteredSynthetic.map((item) => (
            <text
              key={`tick-${item.degree}`}
              x={x(item.degree)}
              y={height - 14}
              textAnchor="middle"
              className="fill-ink/60 text-[11px]"
            >
              {item.degree}
            </text>
          ))}

          <text x={width / 2} y={height - 2} textAnchor="middle" className="fill-ink/65 text-[12px]">
            <FormatMathText as="tspan" text={String.raw`Average degree $\langle k \rangle$`} />
          </text>
        </svg>
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          {legend.map(({ key, label }) => (
            <KeyNode
              key={key}
              color={seriesColors[key as keyof typeof seriesColors]}
              label={label}
            />
          ))}
        </div>
      </div>
    );
  }, [filteredSynthetic, metric]);

  const rankedReal = useMemo(() => {
    const rows = [...filteredReal];
    rows.sort((a, b) => {
      if (metric === "absolute") return b.absoluteGain.claps - a.absoluteGain.claps;
      if (metric === "relative") return b.relativeGain - a.relativeGain;
      if (metric === "runtime") return b.runtime.rsu - a.runtime.rsu;
      return b.memoryMiB.rsu - a.memoryMiB.rsu;
    });
    return rows.slice(0, 10);
  }, [filteredReal, metric]);

  const realSummaryText =
    metric === "absolute"
      ? "CLAP-S reaches the same optimum as ILP where ILP is tractable, while RSU and CLAP-G usually leave a larger union."
      : metric === "relative"
        ? "Positive relative gain means CLAP-S improves beyond RSU. The pattern is stable across biological, social, and human relationship duplexes."
        : metric === "runtime"
          ? "CLAP-G is often fastest, but CLAP-S remains practical while staying exact within the paper's fixed-budget regime."
          : "Memory usage highlights the structural advantage of path-guided updates over storing large sampled candidate pools.";

  return (
    <Card>
      <div className="grid gap-8 lg:grid-cols-[0.93fr_1.07fr]">
        <div className="space-y-5">
          <SurfaceTitle
            title="Animation E · Interactive results explorer"
            body="Switch between synthetic and real-world data, then inspect how solution quality, runtime, and memory change across network families."
          />
          <div className="rounded-[24px] border border-ink/8 bg-gradient-to-br from-surface to-mist/70 p-5">
            <div className="grid gap-4">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                  Dataset
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    ["synthetic", "Synthetic"],
                    ["real", "Real-world"]
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDataset(value as "synthetic" | "real")}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm transition",
                        dataset === value
                          ? "bg-ink text-white dark:text-slate-900"
                          : "border border-ink/10 bg-surface text-ink hover:bg-ink/5"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                  Metric type
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    ["absolute", "Absolute gain"],
                    ["relative", "Relative gain"],
                    ["runtime", "Runtime"],
                    ["memory", "Memory"]
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMetric(value as Metric)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm transition",
                        metric === value
                          ? "bg-ink text-white dark:text-slate-900"
                          : "border border-ink/10 bg-surface text-ink hover:bg-ink/5"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {dataset === "synthetic" ? (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                    Network type
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {syntheticTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNetworkType(type)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm transition",
                          networkType === type
                            ? "bg-ink text-white dark:text-slate-900"
                            : "border border-ink/10 bg-surface text-ink hover:bg-ink/5"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                    Network type
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {domains.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDomain(item)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm transition",
                          domain === item
                            ? "bg-ink text-white dark:text-slate-900"
                            : "border border-ink/10 bg-surface text-ink hover:bg-ink/5"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {dataset === "synthetic" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard
                label="CLAP-S = ILP?"
                value="Yes"
                hint="Main synthetic benchmark curves overlap"
              />
              <StatCard
                label="Average path length"
                value={formatNumber(
                  filteredSynthetic.reduce((sum, item) => sum + item.avgPathLength, 0) /
                  Math.max(filteredSynthetic.length, 1),
                  2
                )}
                hint="Short paths indicate local conflict resolution"
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard
                label="Largest network"
                value={formatCompact(
                  Math.max(...filteredReal.map((item) => item.nodes), 0)
                )}
                hint="Nodes in current filter"
              />
              <StatCard
                label="Mean path length"
                value={formatNumber(
                  filteredReal
                    .filter((item) => item.avgPathLength > 0)
                    .reduce((sum, item) => sum + item.avgPathLength, 0) /
                  Math.max(filteredReal.filter((item) => item.avgPathLength > 0).length, 1),
                  2
                )}
                hint="Across real-world duplexes"
              />
            </div>
          )}
        </div>
        <div className="space-y-5">
          <div className="rounded-[24px] border border-ink/8 bg-surface/92 p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
              What this chart says
            </div>
            <div className="text-sm leading-7 text-ink/74">
              <FormatMathText text={dataset === "synthetic"
                ? metric === "absolute"
                  ? "CLAP-S and ILP overlap, which means the shortest-path construction reaches the exact optimum on the paper's synthetic benchmark."
                  : metric === "relative"
                    ? "Relative gain stays positive in most regimes, so CLAP-S is not just good in absolute terms; it is consistently better than random sampling."
                    : metric === "runtime"
                      ? "CLAP-G trades some quality for speed, while CLAP-S remains much more deliberate than sampling and avoids exact search."
                      : "Per-method memory is not reported in the main synthetic comparison file. Switch to the real-world view to inspect measured memory footprints."
                : realSummaryText} />
            </div>
          </div>
          {dataset === "synthetic" ? (
            metric === "memory" ? (
              <div className="rounded-[24px] border border-dashed border-ink/15 bg-mist/60 p-8 text-center text-sm leading-7 text-ink/70">
                The paper's main synthetic benchmark reports solution quality and runtime, not per-method
                memory. The real-world table includes measured memory for CLAP-S, RSU, CLAP-G, and ILP.
              </div>
            ) : (
              <div
                className="rounded-[24px] border border-ink/8 bg-gradient-to-br from-surface to-mist/70 p-5"
                onMouseLeave={() => setHovered(null)}
              >
                {syntheticChart}
              </div>
            )
          ) : (
            <div className="rounded-[24px] border border-ink/8 bg-gradient-to-br from-surface to-mist/70 p-5">
              <div className="space-y-4">
                {rankedReal.map((item) => {
                  const isLog = metric === "runtime" || metric === "memory";
                  const values =
                    metric === "absolute"
                      ? {
                        claps: item.absoluteGain.claps,
                        clapg: item.absoluteGain.clapg,
                        rsu: item.absoluteGain.rsu,
                        ilp: item.absoluteGain.ilp ?? 0
                      }
                      : metric === "relative"
                        ? {
                          claps: item.relativeGain,
                          clapg: 0,
                          rsu: 0,
                          ilp: 0
                        }
                        : metric === "runtime"
                          ? {
                            claps: item.runtime.claps,
                            clapg: item.runtime.clapg,
                            rsu: item.runtime.rsu,
                            ilp: item.runtime.ilp ?? 0
                          }
                          : {
                            claps: item.memoryMiB.claps,
                            clapg: item.memoryMiB.clapg,
                            rsu: item.memoryMiB.rsu,
                            ilp: item.memoryMiB.ilp ?? 0
                          };

                  const keys =
                    metric === "relative"
                      ? (["claps"] as const)
                      : (["claps", "clapg", "rsu", "ilp"] as const);
                  const maxValue = Math.max(...rankedReal.flatMap((row) => {
                    if (metric === "absolute") {
                      return [
                        row.absoluteGain.claps,
                        row.absoluteGain.clapg,
                        row.absoluteGain.rsu,
                        row.absoluteGain.ilp ?? 0
                      ];
                    }
                    if (metric === "relative") return [row.relativeGain];
                    if (metric === "runtime") {
                      return [row.runtime.claps, row.runtime.clapg, row.runtime.rsu, row.runtime.ilp ?? 0];
                    }
                    return [
                      row.memoryMiB.claps,
                      row.memoryMiB.clapg,
                      row.memoryMiB.rsu,
                      row.memoryMiB.ilp ?? 0
                    ];
                  }));

                  return (
                    <div key={item.id}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-ink">{item.label}</div>
                        <div className="text-xs uppercase tracking-[0.16em] text-ink/55">{item.domain}</div>
                      </div>
                      <div className="space-y-2">
                        {keys.map((key) => {
                          const rawValue = values[key];
                          if (rawValue <= 0 && key === "ilp" && metric !== "absolute") return null;
                          const ratio = isLog
                            ? Math.log10(1 + rawValue) / Math.log10(1 + maxValue)
                            : rawValue / Math.max(maxValue, 1);

                          return (
                            <button
                              key={`${item.id}-${key}`}
                              type="button"
                              onMouseEnter={() =>
                                setHovered(
                                  `${item.label} · ${key.toUpperCase()}: ${formatNumber(
                                    rawValue,
                                    metric === "relative" ? 2 : rawValue < 10 ? 2 : 1
                                  )}${metric === "relative" ? "%" : metric === "runtime" ? " s" : metric === "memory" ? " MiB" : ""}`
                                )
                              }
                              className="flex w-full items-center gap-3"
                            >
                              <div className="w-16 text-left text-xs uppercase tracking-[0.16em] text-ink/58">
                                {key}
                              </div>
                              <div className="h-3 flex-1 rounded-full bg-surface">
                                <div
                                  className="h-3 rounded-full"
                                  style={{
                                    width: `${Math.max(ratio * 100, rawValue > 0 ? 4 : 0)}%`,
                                    backgroundColor: seriesColors[key]
                                  }}
                                />
                              </div>
                              <div className="w-20 text-right text-xs text-ink/66">
                                {formatNumber(rawValue, metric === "relative" ? 2 : rawValue < 10 ? 2 : 1)}
                                {metric === "relative"
                                  ? "%"
                                  : metric === "runtime"
                                    ? " s"
                                    : metric === "memory"
                                      ? " MiB"
                                      : ""}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="rounded-[24px] border border-ink/8 bg-surface/90 p-5 text-sm leading-7 text-ink/72">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
              Hover summary
            </div>
            <div className="mt-3 text-sm leading-7 text-ink/72 min-h-[1.75em]">
              <FormatMathText text={hovered ?? "Hover a point or bar to inspect one measurement."} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
