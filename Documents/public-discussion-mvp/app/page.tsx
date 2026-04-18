import Link from "next/link";

const platformPrinciples = [
  {
    title: "Clinician-centered framing",
    body: "Standard-of-care stays visible at every step so exploratory outputs never masquerade as bedside recommendations.",
  },
  {
    title: "Mechanism plus safety",
    body: "Graph ranking, host-response evidence, and rule-based clinical flags are reviewed in one product surface.",
  },
  {
    title: "Built for structured review",
    body: "Each case produces a coherent summary you can discuss with an ID team, translational collaborator, or protocol group.",
  },
];

const workflowSteps = [
  "Capture the infection scenario and core bedside context.",
  "Run graph ranking with host-mechanistic enrichment.",
  "Downgrade unsafe or infeasible candidates using clinical flags.",
  "Review a case-ready dashboard with exportable interpretation.",
];

const scenarios = [
  {
    id: "sepsis",
    name: "Sepsis",
    href: "/explorer/new/sepsis",
    summary: "Explore adjunctive and host-response-modulating candidates in sepsis.",
  },
  {
    id: "candidemia",
    name: "Candidemia",
    href: "/explorer/new/candidemia",
    summary: "Review exploratory adjunctive candidates and mechanistic evidence in candidemia.",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[color:var(--color-background)] px-6 py-8 text-[color:var(--color-foreground)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="glass-panel rounded-[2rem] px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300/25 via-slate-800 to-slate-950 text-lg font-semibold text-slate-50 shadow-[0_18px_45px_-28px_rgba(56,189,248,0.45)]">
                IR
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-muted)]">
                  Infection Repurposing Explorer
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Safety-aware severe infection review workspace
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2 text-sm font-medium text-slate-200">
              <a href="#scenarios" className="glass-chip rounded-full px-4 py-2 transition hover:border-white/20 hover:bg-white/10">
                Scenarios
              </a>
              <a href="#workflow" className="glass-chip rounded-full px-4 py-2 transition hover:border-white/20 hover:bg-white/10">
                Workflow
              </a>
              <a href="#guardrails" className="glass-chip rounded-full px-4 py-2 transition hover:border-white/20 hover:bg-white/10">
                Guardrails
              </a>
            </nav>
          </div>
        </header>

        <section className="glass-panel-strong relative overflow-hidden rounded-[2.8rem] p-8 text-white md:p-12">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
          <div className="absolute left-[-5rem] top-[-5rem] h-56 w-56 rounded-full bg-sky-400/18 blur-3xl" />
          <div className="absolute right-[-3rem] top-20 h-64 w-64 rounded-full bg-amber-300/12 blur-3xl" />
          <div className="absolute bottom-[-4rem] left-1/3 h-44 w-44 rounded-full bg-white/8 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="glass-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100">
                Product preview
              </p>
              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.065em] md:text-7xl">
                A more formal review surface for infection repurposing.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200/95">
                Explore severe infection cases with a product flow that keeps bedside anchors visible,
                elevates biologically plausible candidates, and pushes unsafe ideas down the list before
                they can distract a clinician.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {scenarios.map((scenario) => (
                  <Link
                    key={scenario.id}
                    href={scenario.href}
                    className="rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-[color:var(--color-accent-ink)] shadow-[0_24px_44px_-28px_rgba(210,162,83,0.75)] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)]"
                  >
                    Start {scenario.name} Case
                  </Link>
                ))}
              </div>
            </div>

            <aside className="glass-panel grid gap-4 rounded-[2.2rem] p-5">
              <div className="glass-chip rounded-[1.6rem] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent-strong)]">Product promise</p>
                <p className="mt-3 text-sm leading-7 text-slate-100/95">
                  Distinguish standard care from exploratory adjunctive hypotheses without flattening the
                  biology, safety, and translational context into one opaque score.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <MetricCard label="Scenarios" value="2" caption="Sepsis and candidemia MVP lanes" />
                <MetricCard label="Evidence lenses" value="3" caption="Graph, host-response, safety" />
                <MetricCard label="Output style" value="Case-ready" caption="Review dashboard with export stub" />
              </div>
            </aside>
          </div>
        </section>

        <section id="scenarios" className="grid gap-4 lg:grid-cols-[1.05fr_1.2fr]">
          <article className="glass-panel rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">Platform framing</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              Formal product direction, not just a demo shell
            </h2>
            <div className="mt-5 grid gap-3">
              {platformPrinciples.map((principle) => (
                <div
                  key={principle.title}
                  className="glass-chip rounded-[1.5rem] p-4"
                >
                  <h3 className="text-lg font-semibold text-white">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{principle.body}</p>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-4">
            {scenarios.map((scenario) => (
              <article
                key={scenario.id}
                className="glass-panel rounded-[2rem] p-6 transition hover:-translate-y-0.5 hover:border-[color:var(--color-line-strong)] hover:shadow-[0_28px_90px_-55px_rgba(2,6,23,0.9)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">Scenario</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                      {scenario.name}
                    </h2>
                  </div>
                  <span className="metal-chip rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                    MVP active
                  </span>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{scenario.summary}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={scenario.href}
                    className="glass-chip rounded-full px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-300/40 hover:text-sky-100"
                  >
                    Open workflow
                  </Link>
                  <span className="glass-chip rounded-full px-4 py-2 text-sm text-slate-300">
                    Structured intake, candidate ranking, mechanism review
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="glass-panel rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">Workflow</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              What the user sees, in product terms
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The MVP now reads like a focused internal clinical product: cleaner navigation, stronger hierarchy,
              fixed guardrails, and a more deliberate transition from case intake to ranked review.
            </p>
          </article>

          <article className="glass-panel rounded-[2rem] p-6">
            <div className="grid gap-4">
              {workflowSteps.map((step, index) => (
                <div key={step} className="glass-chip flex gap-4 rounded-[1.5rem] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300/20 to-slate-950 text-sm font-semibold text-sky-100">
                    0{index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section id="guardrails" className="glass-panel relative overflow-hidden rounded-[2rem] p-6">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[color:var(--color-accent-strong)] via-sky-300 to-transparent" />
          <p className="pl-3 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent-strong)]">Clinical guardrail</p>
          <h2 className="mt-2 pl-3 text-2xl font-semibold text-white">
            Hypothesis prioritization and evidence review only
          </h2>
          <p className="mt-4 max-w-4xl pl-3 text-sm leading-7 text-slate-300">
            This platform does not replace antimicrobial therapy, antifungal therapy, source control,
            hemodynamic stabilization, organ support, guideline-based care, or specialist consultation.
          </p>
        </section>
      </div>
    </main>
  );
}

function MetricCard(props: { label: string; value: string; caption: string }) {
  return (
    <div className="glass-chip rounded-[1.5rem] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">{props.label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{props.value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{props.caption}</p>
    </div>
  );
}
