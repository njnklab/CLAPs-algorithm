"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BlockMath, InlineMath } from "react-katex";

import { ClapTraceDemo } from "@/features/animations/clap-trace-demo";
import { ComputedClapExample } from "@/features/results-viewer/computed-clap-example";
import { ResultsExplorer } from "@/features/results-viewer/results-explorer";
import { SectionShell } from "@/components/ui/section-shell";
import { StructuralPrimer } from "@/features/animations/structural-primer";
import ExchangeTheorem from "@/features/animations/exchange-theorem";
import { UnionContractionDemo } from "@/features/animations/union-contraction-demo";
import {
  applications,
  bibtex,
  faqItems,
  glossaryItems,
  heroOptions,
  navItems,
  paperAbstract,
  sectionCopy,
  theoryModules,
  whyNew
} from "@/data/content/site-content";
import type { RealSummary, SyntheticSummary } from "@/lib/results";
import { formatNumber } from "@/lib/utils";

import { Card, EquationCard, FadeIn, FormulaPill, StatCard, FormatMathText } from "@/components/ui/core";

type PaperWebsiteProps = {
  synthetic: SyntheticSummary[];
  real: RealSummary[];
  highlights: {
    lowOverlapMeanGain: number;
    avgRealPathLength: number;
  };
};

function byId(id: string) {
  return sectionCopy.find((item) => item.id === id)!;
}

export function PaperWebsite({ synthetic, real, highlights }: PaperWebsiteProps) {
  const [heroIndex, setHeroIndex] = useState(0);

  const hero = heroOptions[heroIndex];
  const why = byId("why");
  const primer = byId("primer");
  const problem = byId("problem");
  const algorithm = byId("algorithm");
  const theory = byId("theory");
  const results = byId("results");
  const applicationsCopy = byId("applications");
  const limits = byId("limits");

  const summaryStats = useMemo(() => {
    const avgRelativeGain =
      synthetic.reduce((sum, item) => sum + item.relativeGain, 0) / Math.max(synthetic.length, 1);
    return {
      avgRelativeGain,
      avgPath: highlights.avgRealPathLength,
      lowOverlap: highlights.lowOverlapMeanGain
    };
  }, [highlights, synthetic]);

  return (
    <div className="relative min-h-screen bg-mesh text-ink">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(11,114,133,0.2),transparent_42%)]" />
      <header className="sticky top-0 z-50 border-b border-white/70 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <Link href="#hero" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-sm font-semibold text-white">
              C
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.16em] text-ink">CLAP-S</div>
              <div className="text-xs text-ink/55">Duplex controllability website</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-ink/72 xl:flex">
            {navItems.map((item) => (
              <Link key={item.id} href={`#${item.id}`} className="transition hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm text-ink/70">
            English edition
          </div>
        </div>
      </header>

      <main>
        <section id="hero" className="px-4 pb-12 pt-10 sm:px-6 lg:px-10 lg:pt-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <motion.div
                key={hero.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <div className="inline-flex items-center gap-3 rounded-full border border-white/85 bg-white/85 px-4 py-2 text-sm text-ink/72 shadow-sm">
                  <span className="font-semibold text-layer1">{hero.tone}</span>
                  <span>matching-based structural controllability for duplex networks</span>
                </div>
                <h1 className="mt-6 max-w-4xl text-balance font-serif text-5xl leading-[1.02] text-ink sm:text-6xl">
                  {hero.title}
                </h1>
                <p className="mt-6 max-w-3xl text-pretty text-xl leading-9 text-ink/78">
                  <FormatMathText text={hero.subtitle} />
                </p>
                <p className="mt-5 max-w-2xl text-pretty text-base leading-8 text-ink/72">
                  <FormatMathText text={hero.value} />
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/paper/revision.pdf"
                    className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/92"
                  >
                    {hero.primaryCta}
                  </Link>
                  <Link
                    href="#algorithm"
                    className="rounded-full border border-ink/12 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-ink/5"
                  >
                    {hero.secondaryCta}
                  </Link>
                </div>
                <div className="mt-10 flex flex-wrap gap-3">
                  {heroOptions.map((option, index) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setHeroIndex(index)}
                      className={`rounded-full px-4 py-2 text-sm transition ${heroIndex === index
                        ? "bg-ink text-white"
                        : "border border-ink/10 bg-white text-ink hover:bg-ink/5"
                        }`}
                    >
                      {option.tone}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(11,114,133,0.14),rgba(255,255,255,0.92))]">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                  20 to 30 second takeaway
                </div>
                <p className="mt-4 text-lg leading-8 text-ink/82">
                  Each layer already uses its minimum driver budget. CLAP-S does not lower those
                  budgets. It reconfigures maximum matchings so the two minimum driver sets overlap
                  more, which reduces the number of unique actuated nodes.
                </p>
              </Card>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                <StatCard
                  label="CLAP-S vs ILP"
                  value="Matched"
                  hint="Exact optimum on the paper's tested instances"
                />
                <StatCard
                  label="Average real CLAP length"
                  value={formatNumber(summaryStats.avgPath, 2)}
                  hint="Short, local reconfiguration"
                />
                <StatCard
                  label="Mean relative gain"
                  value={`${formatNumber(summaryStats.avgRelativeGain, 2)}%`}
                  hint="CLAP-S over RSU on synthetic benchmark"
                />
                <StatCard
                  label="Low-overlap ER gain"
                  value={formatNumber(summaryStats.lowOverlap, 0)}
                  hint="Approximate drivers saved at overlap $0.1, <k>=4$"
                />
              </div>
            </div>
          </div>
        </section>

        <SectionShell
          id="faq"
          eyebrow="FAQ and glossary"
          title="Key questions for first-time readers"
          lead="The site closes with the definitions and distinctions that are easiest to confuse on first reading."
        >
          <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  open
                  className="group rounded-[26px] border border-ink/8 bg-white/90 p-5"
                >
                  <summary className="flex cursor-pointer list-none items-baseline justify-between text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    <span><FormatMathText text={item.question} /></span>
                    <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink/40 transition-transform duration-300 group-open:rotate-180 group-open:bg-ink group-open:text-white">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-ink/72"><FormatMathText text={item.answer} /></p>
                </details>
              ))}
            </div>
            <div className="space-y-4">
              {glossaryItems.map((item, index) => (
                <details
                  key={item.term}
                  open={index === 0}
                  className="group rounded-[22px] border border-ink/8 bg-white/90 p-5 px-6"
                >
                  <summary className="flex cursor-pointer list-none items-baseline justify-between text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    <span><FormatMathText text={item.term} /></span>
                    <span className="ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink/40 transition-transform duration-300 group-open:rotate-180 group-open:bg-ink group-open:text-white">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-ink/72"><FormatMathText text={item.meaning} /></p>
                </details>
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="why"
          eyebrow={why.eyebrow}
          title={why.title}
          lead={why.lead}
        >
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4 text-base leading-8 text-ink/75">
              {why.paragraphs.map((paragraph) => (
                <p key={paragraph}><FormatMathText text={paragraph} /></p>
              ))}
              <ul className="space-y-3 rounded-[26px] border border-ink/8 bg-white/90 p-5 text-sm leading-7 text-ink/72">
                {why.bullets?.map((bullet) => <li key={bullet}>• <FormatMathText text={bullet} /></li>)}
              </ul>
            </div>
            <UnionContractionDemo />
          </div>
        </SectionShell>

        <SectionShell
          id="primer"
          eyebrow={primer.eyebrow}
          title={primer.title}
          lead={primer.lead}
        >
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="space-y-4 text-base leading-8 text-ink/75">
                {primer.paragraphs.slice(0, 2).map((paragraph) => (
                  <p key={paragraph}><FormatMathText text={paragraph} /></p>
                ))}
              </Card>
              <Card className="space-y-4 text-base leading-8 text-ink/75">
                {primer.paragraphs.slice(2).map((paragraph) => (
                  <p key={paragraph}><FormatMathText text={paragraph} /></p>
                ))}
              </Card>
            </div>
            <StructuralPrimer />
            <ExchangeTheorem />
          </div>
        </SectionShell>

        <SectionShell
          id="problem"
          eyebrow={problem.eyebrow}
          title={problem.title}
          lead={problem.lead}
        >
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4 text-base leading-8 text-ink/75">
              {problem.paragraphs.map((paragraph) => (
                <p key={paragraph}><FormatMathText text={paragraph} /></p>
              ))}
              <ul className="space-y-3 rounded-[26px] border border-ink/8 bg-white/90 p-5 text-sm leading-7 text-ink/72">
                {problem.bullets?.map((bullet) => <li key={bullet}>• <FormatMathText text={bullet} /></li>)}
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <EquationCard
                title="Fixed budgets"
                formula={String.raw`U = D_1 \cup D_2`}
                body="The deployment cost is the set of unique actuated nodes, not two separate per-layer lists."
              />
              <EquationCard
                title="Difference mass"
                formula={String.raw`\Delta = |DD_1| + |DD_2|`}
                body="Difference nodes are exactly the layer-specific drivers that fail to be reused."
              />
              <EquationCard
                title="Union identity"
                formula={String.raw`|U| = \frac{k_1 + k_2 + \Delta}{2}`}
                body="Once budgets are fixed, shrinking the union is algebraically equivalent to shrinking difference mass."
              />
              <EquationCard
                title="Improvement step"
                formula={String.raw`\Delta \downarrow 2 \Rightarrow |U| \downarrow 1`}
                body="Each successful CLAP update removes one unique actuated node from the cross-layer plan."
              />
            </div>
          </div>

          <FadeIn delay={0.08}>
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
              <Card className="bg-[radial-gradient(circle_at_top_right,rgba(199,119,26,0.14),rgba(255,255,255,0.92))]">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                  Why this is new
                </div>
                <div className="mt-4 space-y-4 text-sm leading-7 text-ink/74">
                  {whyNew.map((item) => (
                    <p key={item}>• <FormatMathText text={item} /></p>
                  ))}
                </div>
              </Card>
              <Card>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                  Small proof intuition
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] border border-ink/8 bg-mist/70 p-5">
                    <div className="text-lg font-semibold text-ink">Why minimizing <InlineMath math="|U|" /> equals minimizing <InlineMath math="\Delta" /></div>
                    <p className="mt-3 text-sm leading-7 text-ink/72">
                      The sum <InlineMath math={"|D_1| + |D_2| = k_1 + k_2"} /> is fixed. The only
                      movable quantity is how much of that driver mass sits in overlap versus in
                      disagreement. <InlineMath math="\Delta" /> measures disagreement exactly, so once budgets are fixed it
                      fully controls the union size.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-ink/8 bg-mist/70 p-5">
                    <div className="text-lg font-semibold text-ink">Why no CLAP means no more improvement</div>
                    <p className="mt-3 text-sm leading-7 text-ink/72">
                      Any better state would need a path-like structure that carries disagreement from
                      a node in <InlineMath math="DD_1" /> to a node in <InlineMath math="DD_2" /> while preserving the budgets. The paper proves
                      that such a structure is exactly a CLAP. So if no CLAP exists, there is no
                      budget-preserving improvement left to take.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </FadeIn>
        </SectionShell>

        <SectionShell
          id="algorithm"
          eyebrow={algorithm.eyebrow}
          title={algorithm.title}
          lead={algorithm.lead}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {algorithm.paragraphs.map((paragraph) => (
              <Card key={paragraph} className="text-base leading-8 text-ink/75">
                <FormatMathText text={paragraph} />
              </Card>
            ))}
          </div>
          <div className="mt-8 space-y-8">
            <ClapTraceDemo />
            <ComputedClapExample />
          </div>
        </SectionShell>

        <SectionShell
          id="theory"
          eyebrow={theory.eyebrow}
          title={theory.title}
          lead={theory.lead}
        >
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              {theory.paragraphs.map((paragraph) => (
                <Card key={paragraph} className="text-base leading-8 text-ink/75">
                  <FormatMathText text={paragraph} />
                </Card>
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              {theoryModules.map((module, index) => (
                <FadeIn key={module.id} delay={0.04 * index}>
                  <Card className="h-full">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                      {module.title}
                    </div>
                    <div className="mt-4 grid gap-5">
                      <div>
                        <div className="text-sm font-semibold text-ink">Intuition</div>
                        <div className="mt-2 space-y-2 text-sm leading-7 text-ink/72">
                          {module.intuition.map((item) => (
                            <p key={item}>• <FormatMathText text={item} /></p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink">Formal statement</div>
                        <div className="mt-2 space-y-2 text-sm leading-7 text-ink/72">
                          {module.formal.map((item) => (
                            <p key={item}>• <FormatMathText text={item} /></p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink">Why it matters</div>
                        <p className="mt-2 text-sm leading-7 text-ink/72"><FormatMathText text={module.why} /></p>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink">Visual aid</div>
                        <p className="mt-2 text-sm leading-7 text-ink/72"><FormatMathText text={module.visualAid} /></p>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="results"
          eyebrow={results.eyebrow}
          title={results.title}
          lead={results.lead}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {results.paragraphs.map((paragraph) => (
              <Card key={paragraph} className="text-base leading-8 text-ink/75">
                <FormatMathText text={paragraph} />
              </Card>
            ))}
          </div>
          <div className="mt-8">
            <ResultsExplorer synthetic={synthetic} real={real} />
          </div>
        </SectionShell>

        <SectionShell
          id="applications"
          eyebrow={applicationsCopy.eyebrow}
          title={applicationsCopy.title}
          lead={applicationsCopy.lead}
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4 text-base leading-8 text-ink/75">
              {applicationsCopy.paragraphs.map((paragraph) => (
                <p key={paragraph}><FormatMathText text={paragraph} /></p>
              ))}
              <div className="grid gap-4">
                {applications.map((item) => (
                  <Card key={item.title} className="bg-white/90">
                    <div className="text-lg font-semibold text-ink"><FormatMathText text={item.title} /></div>
                    <p className="mt-3 text-sm leading-7 text-ink/72"><FormatMathText text={item.body} /></p>
                  </Card>
                ))}
              </div>
            </div>
            <Card className="h-full bg-[radial-gradient(circle_at_top_right,rgba(11,114,133,0.14),rgba(255,255,255,0.92))]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                Distinguish three statements carefully
              </div>
              <div className="mt-4 space-y-5 text-sm leading-7 text-ink/73">
                <p>
                  <span className="font-semibold text-ink">What the paper proves:</span> CLAP-S is
                  globally optimal inside the aligned-node, uncoupled, fixed-minimum-budget duplex
                  setting.
                </p>
                <p>
                  <span className="font-semibold text-ink">What experiments observe:</span> CLAP-S
                  matches ILP on tested instances, beats RSU consistently, and finds very short CLAPs
                  in practice.
                </p>
                <p>
                  <span className="font-semibold text-ink">What future work may extend:</span> relaxed
                  budgets, more than two layers, and explicit inter-layer coupling are natural next
                  questions, but they are not solved in this paper.
                </p>
              </div>
            </Card>
          </div>
        </SectionShell>

        <SectionShell
          id="limits"
          eyebrow={limits.eyebrow}
          title={limits.title}
          lead={limits.lead}
        >
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4 text-base leading-8 text-ink/75">
              {limits.paragraphs.map((paragraph) => (
                <p key={paragraph}><FormatMathText text={paragraph} /></p>
              ))}
              <ul className="space-y-3 rounded-[26px] border border-ink/8 bg-white/90 p-5 text-sm leading-7 text-ink/72">
                {limits.bullets?.map((bullet) => <li key={bullet}>• <FormatMathText text={bullet} /></li>)}
              </ul>
            </div>
            <Card className="bg-[radial-gradient(circle_at_top_right,rgba(199,119,26,0.12),rgba(255,255,255,0.92))]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                Scope note
              </div>
              <div className="mt-4 space-y-4 text-sm leading-7 text-ink/73">
                <p>
                  This is not a universal algorithm for arbitrary coupled multilayer dynamics. The
                  theory depends on the duplex decomposing into two independently controllable layers
                  that share actuator locations.
                </p>
                <p>
                  It is also not a claim about energy-optimal control, nonlinear control, or a general
                  AI optimizer. The paper lives squarely inside the matching-based structural
                  controllability framework.
                </p>
              </div>
            </Card>
          </div>
        </SectionShell>

        <SectionShell
          id="resources"
          eyebrow="Resources"
          title="Paper, code, citation, and contact"
          lead="Everything below is scoped to the current manuscript and its official implementation."
        >
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <Card className="space-y-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                Abstract
              </div>
              <p className="text-sm leading-8 text-ink/74"><FormatMathText text={paperAbstract} /></p>
              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  href="/paper/revision.pdf"
                  className="rounded-[22px] border border-ink/10 bg-mist/55 p-5 transition hover:bg-mist"
                >
                  <div className="text-sm font-semibold text-ink">Paper PDF</div>
                  <div className="mt-2 text-sm text-ink/65">Download the manuscript PDF</div>
                </Link>
                <Link
                  href="https://github.com/njnklab/CLAP-S_Algorithm"
                  className="rounded-[22px] border border-ink/10 bg-mist/55 p-5 transition hover:bg-mist"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="text-sm font-semibold text-ink">Code & data</div>
                  <div className="mt-2 text-sm text-ink/65">Official implementation repository</div>
                </Link>
                <Link
                  href="/paper/supplementary-materials.pdf"
                  className="rounded-[22px] border border-ink/10 bg-mist/55 p-5 transition hover:bg-mist"
                >
                  <div className="text-sm font-semibold text-ink">Supplementary material</div>
                  <div className="mt-2 text-sm text-ink/65">Proof details and additional analysis</div>
                </Link>
                <Link
                  href="mailto:zhangxizhe@njmu.edu.cn"
                  className="rounded-[22px] border border-ink/10 bg-mist/55 p-5 transition hover:bg-mist"
                >
                  <div className="text-sm font-semibold text-ink">Contact</div>
                  <div className="mt-2 text-sm text-ink/65">zhangxizhe@njmu.edu.cn</div>
                </Link>
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                  BibTeX
                </div>
                <pre className="mt-4 overflow-x-auto rounded-[22px] bg-ink px-5 py-4 text-xs leading-6 text-white">
                  {bibtex}
                </pre>
              </Card>
              <Card>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                  Authors
                </div>
                <div className="mt-4 space-y-4 text-sm leading-7 text-ink/72">
                  <div>
                    <div className="font-semibold text-ink">Haoyu Zheng</div>
                    <div>School of Biomedical Engineering and Informatics, Nanjing Medical University</div>
                  </div>
                  <div>
                    <div className="font-semibold text-ink">Xizhe Zhang</div>
                    <div>Early Intervention Unit, Department of Psychiatry, Nanjing Brain Hospital</div>
                    <div>School of Biomedical Engineering and Informatics, Nanjing Medical University</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </SectionShell>


        <section className="px-4 pb-20 pt-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-white/75 bg-white/85 px-6 py-8 text-sm text-ink/62 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <FormatMathText text="Built around the paper's fixed-budget duplex setting. Matching-based structural controllability, not dominating sets, FVS, deep learning, or reinforcement learning." />
              </div>
              <div className="flex items-center gap-3">
                <Link href="#hero" className="rounded-full border border-ink/10 px-4 py-2 text-ink transition hover:bg-ink/5">
                  Back to top
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
