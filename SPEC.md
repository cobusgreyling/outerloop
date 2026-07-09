# outerloop

**Own the Outer Loop. Evidence → Verdict → Answerability. At industrial scale.**

Practical primitives, tooling, and patterns for rigorously owning the human side of agentic software factories. The missing governance layer that turns high-agency inner loops into accountable, explainable, tasteful outcomes.

Built as the natural evolution and companion to [loop-engineering](https://github.com/cobusgreyling/loop-engineering). Where loop-engineering gives you the patterns and CLIs to *design and run* reliable inner loops, **outerloop** gives you the primitives to *own* what those loops produce.

Inspired directly by Addy Osmani's July 2026 framing of Quality, Verdict, Answerability, back-pressure, cognitive debt, orchestration tax, taste, and the inner/outer loop distinction.

---

## Why This Repo Exists (The Groundbreaking Thesis)

As models (Fable, GPT-5.6 class, etc.) and agent harnesses become dramatically more capable, the scarce resource shifts from *generation* to *control, understanding, and ownership*.

- Agents excel at the **inner loop**: investigate → implement → verify → repeat.
- Humans must own the **outer loop**: constraints, sampling, audit, **Verdict**, and **Answerability**.

Without deliberate outer loop infrastructure, we get:
- Cognitive debt (engineers understand less of what ships)
- Orchestration tax (more agents = more review fatigue, not less)
- Trust-verification gap (42%+ AI-assisted commits but governance still happens *after* risk is accepted)
- Erosion of accountability (who can explain exactly why this change was safe and correct?)

**outerloop** makes the outer loop first-class, cheap to operate, and high-signal. It turns "human in the loop" from a vague aspiration or bottleneck into a precise, instrumented, leverage-amplifying engineering discipline.

This is the practical operating model for scaling agentic engineering while preserving (and actually increasing) human judgment, taste, and signature on the work.

---

## Core Concepts Glossary (Mapped to Addy Osmani)

| Concept              | Definition (from post + extensions)                                                                 | How outerloop Operationalizes It |
|----------------------|-----------------------------------------------------------------------------------------------------|----------------------------------|
| **Inner Loop**      | Investigation, implementation, verification, repeat. Run by the agent + harness.                   | Delegates to / composes with loop-engineering patterns & tools |
| **Outer Loop**      | Constraints, sampling, audit, ownership/verdict. Run by humans (or highly constrained automation). | The entire purpose of this framework |
| **Quality**         | All checks installed before letting the system loose. Produce **Evidence**.                         | Evidence schema, generators, validators, risk scorers |
| **Evidence**        | Structured artifacts that cross the boundary from agent system to human decision-maker.             | First-class `EvidencePackage` with plan, diffs, traces, summaries, risk assessment |
| **Verdict**         | The production decision: ship / block / redirect / narrow / add guardrail / reject. + rationale.   | Interactive `verdict review` CLI/TUI with mandatory rationale capture, impact preview |
| **Answerability**   | The guarantee that if asked, the accountable owner can explain exactly why.                         | Persistent, queryable, git-anchored **Ledger**. `outerloop why <sha>` reconstructs full chain |
| **Harness**         | Model + files, tools, memory, skills, sandboxes, permissions, observability, recovery.              | **Harness Boundary** tools + declarative specs. Explicit inside/outside boundary |
| **Back-pressure**   | Mechanisms that regulate autonomy so humans can keep up and stay in control.                        | Policy DSL, sampling strategies, escalation rules, time/scope budgets, circuit breakers |
| **Taste**           | Earliest sensing of alpha (what's worth doing) or decay. Qualitative judgment where no metric exists yet. | **Taste Profiles** + critique-to-rules pipeline. Versioned, composable constraints |
| **Cognitive Debt**  | Erosion of understanding and memory of how to solve problems.                                       | Cognitive Mitigator: narrative generators, understanding checkpoints, debt estimators, "explain like I'm accountable" |
| **Orchestration Tax**| Human cost of steering, sorting, directing, and verifying many agents.                              | Attention routing, smart summarization, prioritization, batch review, high-signal evidence only |
| **Accountability Contract** | Explicit checklist, evidence, owner, and post-verdict status for every accepted change.        | Auto-generated manifests attached to commits/PRs; stored in Ledger |
| **Software Factory**| The full system: inner loops + outer governance + persistence + feedback.                           | The composition this framework enables at scale |

---

## Vision for the Groundbreaking Repo

A batteries-included but modular toolkit that any engineering team (or solo founder) can adopt to:

1. **Define** clear harness boundaries and back-pressure policies.
2. **Generate & package** high-quality evidence from every significant agent run.
3. **Review & decide** with rich context, low cognitive load, and forced rationale.
4. **Record & retrieve** the full decision provenance for perfect answerability.
5. **Capture & evolve** organizational taste into living constraints.
6. **Mitigate** cognitive debt actively instead of letting it compound silently.
7. **Govern** fleets of loops (multi-loop coordination, priority, cost control).

It should feel like "the missing git + GitHub + observability layer for the age of agentic code".

Self-referential: outerloop is built and maintained using its own primitives + loop-engineering patterns.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              OUTER LOOP (Human Agency)                       │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │  Constraints │   │   Sampling   │   │    Audit     │   │   Verdict &  │ │
│  │    Loop      │   │     Loop     │   │     Loop     │   │  Ownership   │ │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘ │
│         │                  │                  │                  │         │
│         ▼                  ▼                  ▼                  ▼         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    outerloop Governance Layer                         │  │
│  │  Evidence Engine | Verdict Engine | Ledger | Taste Manager | Policy   │  │
│  │  Cognitive Mitigator | Harness Boundary | Attention Router            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │ Evidence Packages + Verdicts
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INNER LOOPS (Agent Capability)                       │
│  (loop-engineering patterns, custom harnesses, Claude Code / Cursor / etc.) │
│         Triage → State → Worktree → Implementer → Verifier → MCP           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │ Commits / PRs / Artifacts
                                      ▼
                              Production + Feedback
```

**Key Data Flows**:
- Inner loop produces raw artifacts → Evidence Engine normalizes into `EvidencePackage`
- `EvidencePackage` → Verdict Engine (human or policy-assisted review)
- Verdict + Rationale → Ledger (immutable record) + Git manifest
- Ledger + Taste Profiles → feed back into Constraints / Policy for future loops
- High-signal summaries + attention routing reduce orchestration tax

---

## Core Abstractions & Data Models (Proposed)

Use Zod for runtime validation + TypeScript inference. All artifacts should be serializable to JSON + human-readable markdown summaries.

### EvidencePackage
```ts
interface EvidencePackage {
  id: string;
  runId: string;
  loopId: string;
  timestamp: string;
  source: 'loop-engineering' | 'custom-harness' | ...;
  plan: { goal: string; steps: string[]; assumptions: string[] };
  implementation: { diffs: Diff[]; filesChanged: string[] };
  verification: { tests: TestResult[]; staticAnalysis: any; manualChecks?: string[] };
  observability: { logs: string[]; traces: Trace[]; cost: TokenUsage };
  riskAssessment: { score: number; factors: string[]; mitigations: string[] };
  summaries: {
    executive: string;           // 1-2 sentence for busy owner
    technical: string;
    decisionRelevant: string;    // what a verdict owner must understand
  };
  rawArtifacts: Record<string, any>; // links or embedded
  harnessBoundary: HarnessSpecRef;
}
```

### Verdict
```ts
interface Verdict {
  id: string;
  evidenceId: string;
  decision: 'ship' | 'block' | 'redirect' | 'narrow' | 'guardrail' | 'reject';
  rationale: string;                    // Mandatory, captured at decision time
  owner: string;                        // Who issued it
  timestamp: string;
  linkedCommits: string[];
  linkedPRs: string[];
  postVerdictStatus: string;
  tasteRulesApplied: string[];          // Which taste constraints influenced
  backpressureApplied: string[];        // Which policies were active
}
```

### LedgerEntry / ProvenanceRecord
```ts
interface LedgerEntry {
  id: string;
  verdictId: string;
  evidenceId: string;
  commitSha?: string;
  fullChain: { step: string; evidence: string; decision: string }[];
  answerabilitySummary: string;         // Reconstructible explanation
  signatures?: string[];                // Optional cryptographic or git note anchors
}
```

### HarnessSpec (Boundary Definition)
```ts
interface HarnessSpec {
  name: string;
  version: string;
  inside: { capabilities: string[]; toolsWhitelist: string[]; memoryScopes: string[] };
  outside: { humanAgency: string[]; vetoConditions: string[]; escalationPaths: string[] };
  observabilityHooks: string[];
  recoveryStrategies: string[];
  backpressureDefaults: PolicyRef;
}
```

### TasteProfile / Constraint
```ts
interface TasteRule {
  id: string;
  name: string;
  description: string;
  rationale: string;                    // Why this rule exists (captured from human)
  when: string;                         // Trigger condition (e.g., "riskScore > 7 or touches auth")
  action: 'escalate' | 'requireExtraEvidence' | 'block' | 'suggestAlternative';
  examples: { good: string[]; bad: string[] };
  version: number;
  provenance: { capturedFrom: string; date: string };
}
```

### Policy / Backpressure Config
Declarative YAML or TS:
```yaml
backpressure:
  maxAutonomyHours: 4
  sampling:
    highRisk: 100%        # always review
    mediumRisk: 30%
    lowRisk: 5%
  escalation:
    - if: riskScore > 8 or touchesPayments
      then: requireSeniorVerdict + extraEvidence
  timebox:
    defaultLoop: 2h
```

---

## CLI Surface (MVP + Future)

```bash
# Core workflow
outerloop evidence package --run-id <id> --from loop-engineering
outerloop verdict review <evidence-id>          # Rich TUI with diffs, summaries, risk, rationale prompt
outerloop verdict issue --decision ship --rationale "..." 
outerloop ledger why <commit-sha or run-id>     # Reconstruct full answerability chain
outerloop ledger query --owner cobus --since 7d

# Governance & Taste
outerloop harness init my-project --boundary strict
outerloop harness validate
outerloop taste capture --from-critique "session-notes.md" --extract-rules
outerloop taste apply --profile team-default
outerloop policy set --file backpressure.yaml

# Cognitive & Attention
outerloop cognitive check --changes HEAD~5     # Generate understanding questions / debt estimate
outerloop attention route --batch              # Smart prioritization of pending verdicts

# Integration
outerloop integrate loop-engineering           # Wire evidence hooks into existing patterns
outerloop cursor setup                         # Install Cursor rules / composer instructions for verdict-aware work

# Meta / Self
outerloop audit                                # Score how well outerloop itself is using outerloop
```

Rich TUI for `verdict review` (using something like Ink or blessed + React, or simpler with ora + inquirer + chalk + markdown rendering) should show:
- Executive summary
- Side-by-side or unified diff (focused)
- Risk score + breakdown
- Key traces / decision points from agent
- "What would go wrong if we ship this?" prompt
- Mandatory rationale textarea
- One-key verdicts + optional guardrail suggestions

---

## Project Structure (Recommended)

```
outerloop/
├── packages/
│   ├── core/                 # Shared types, schemas (Zod), EvidencePackage builder
│   ├── evidence/             # Generators, normalizers, validators, risk scorers
│   ├── verdict/              # Review TUI/CLI, decision recorder, impact simulator
│   ├── ledger/               # Storage, query engine, provenance reconstruction, git anchoring
│   ├── taste/                # Capture, versioning, matching, critique-to-rule pipeline
│   ├── policy/               # Backpressure DSL parser, enforcer, simulator
│   ├── harness/              # Boundary spec parser, validator, visualizer
│   ├── cognitive/            # Debt estimators, narrative generators, checkpoint creators
│   ├── cli/                  # Main oclif/commander entrypoint + all subcommands
│   └── integrate/            # Adapters for loop-engineering, Cursor, Claude Code, GitHub, etc.
├── patterns/                 # Example outerloop-augmented patterns (e.g., outerloop-daily-triage)
├── docs/
│   ├── architecture.md
│   ├── evidence-schema.md
│   ├── verdict-playbook.md
│   ├── taste-operationalization.md
│   ├── brownfield-stewardship.md
│   └── self-application.md
├── examples/
│   └── full-factory/         # Complete brownfield + greenfield example with multiple loops
├── scripts/                  # One-off generators, migration helpers
├── .github/workflows/        # Self-governance loops (using outerloop + loop-engineering)
├── package.json
├── README.md
├── SPEC.md                   # This file (dogfooded)
└── ROADMAP.md
```

Publish as scoped npm packages under `@cobusgreyling/outerloop-*` (or a single umbrella package with subcommands for simplicity, like many modern CLIs).

---

## MVP Scope (What Cursor Should Build First)

**Phase 0 (Foundation)**
- TypeScript monorepo setup with pnpm workspaces or Turborepo
- Core schemas + EvidencePackage builder
- Basic CLI skeleton (`outerloop --help`)

**Phase 1 (Evidence + Verdict Core) – 2-3 weeks of focused work**
- Evidence packaging from loop-engineering run artifacts (parse STATE.md, worktree diffs, test output, etc.)
- `outerloop evidence package`
- Rich `outerloop verdict review` TUI (markdown rendering, diff display, risk viz, rationale capture)
- File-based Ledger (JSON + simple index) with `why` reconstruction
- Git note or commit manifest attachment for verdicts
- One end-to-end example: Take a loop-engineering daily-triage or PR-babysitter run → package evidence → human verdict → ledger entry

**Phase 2 (Taste + Policy + Integration)**
- Taste capture from critique sessions + basic rule application
- Simple YAML policy engine with sampling + escalation
- Deep integration adapter for loop-engineering (auto-evidence hooks, shared state patterns)
- Cursor rules / `.cursorrules` file + composer prompt templates that encourage verdict-aware development

**Phase 3 (Cognitive, Harness, Scale)**
- Cognitive debt tools
- Harness boundary specs + enforcement
- Multi-loop coordination + attention router
- Web dashboard (optional, nice-to-have) or rich terminal dashboard
- Brownfield introspection helpers

**Non-Goals for v1**: Full cryptographic signatures, distributed ledger, heavy ML for taste inference (keep it human-in-the-loop and explicit), replacing existing review tools entirely (complement them).

---

## How This Is Groundbreaking (Differentiation)

1. **Verdict as a first-class, captured artifact** — not an after-the-fact approval checkbox.
2. **Answerability by design** — reconstruction is trivial and cheap, not forensic archaeology.
3. **Taste operationalized** — moves from "I know it when I see it" to versioned, shareable, enforceable rules with provenance.
4. **Active cognitive debt mitigation** — not just hoping engineers read the diffs.
5. **Explicit boundary between capability and agency** — harness specs make the "inside vs outside the system" concrete and auditable.
6. **Composes with existing loop-engineering** — doesn't require throwing away current investment in patterns and tools.
7. **Self-referential & dogfooded** — the repo that teaches outer loop ownership is itself governed by it.
8. **Practical for both greenfield and brownfield** — special attention to legacy scars and implicit knowledge.

---

## Self-Application & Dogfooding Instructions (Critical)

This framework must be built using itself. Include in the repo:

- A `LOOP.md` (or `OUTERLOOP.md`) describing the loops used to maintain outerloop.
- Use loop-engineering patterns for inner implementation work.
- Use outerloop primitives for all significant changes: evidence packaging, mandatory verdicts on merges to main, taste rules for "what good outerloop code looks like", ledger entries.
- Regular `outerloop cognitive check` and `outerloop audit` on the codebase itself.
- Stories/ folder with real usage (successes, failures, debt observations).

This creates a powerful flywheel and credibility.

---

## Tech Stack Recommendations

- **Language**: TypeScript (strict)
- **CLI Framework**: oclif (battle-tested, plugin-friendly) or Commander.js + Inquirer + Chalk + Ink (for TUI)
- **Schemas**: Zod + Zod-to-TS
- **Git Integration**: simple-git or isomorphic-git + custom git notes / manifest files
- **Ledger Storage (MVP)**: JSON files + better-sqlite3 (or just append-only JSONL + index). Later: optional Postgres or hosted option.
- **Diff Rendering**: diff or unified-diff + custom high-signal summarizer
- **Testing**: Vitest + strong property-based tests on schemas and reconstruction logic
- **Publishing**: Changesets or standard-version for monorepo releases to npm
- **Docs**: Mintlify or Nextra, but start with great README + embedded examples

Keep it lightweight and fast to adopt — no heavy dependencies if possible.

---

## Implementation Prompts for Cursor (Copy-Paste Ready)

When working in Cursor, use these as system / composer instructions or project rules:

> You are building outerloop — the definitive toolkit for owning the outer loop of agentic systems. Every significant change must produce an EvidencePackage, go through a Verdict with captured rationale, and be recorded in the Ledger. Prioritize clarity, answerability, and taste. Never hide complexity behind magic; make the boundary between agent capability and human agency explicit. Use loop-engineering patterns where they fit for inner work. Generate high-signal summaries and force rationale capture. Build for the accountable owner, not just the implementer.

Additional per-component prompts can be added later.

---

## Next Steps & How to Use This Spec with Cursor

1. Create a new repo `outerloop` (or `outerloop-engineering`).
2. Paste the entire content of this `SPEC.md` into Cursor's Composer (or a new chat) with the prompt:
   > "Build the outerloop project exactly according to this SPEC.md. Start by creating the recommended directory structure, core package.json, TypeScript config, and the foundational EvidencePackage schema + basic CLI skeleton. Then implement Phase 1 (Evidence + Verdict core) end-to-end with a working example integrated with loop-engineering. Make it beautiful, rigorous, and dogfoodable. Ask clarifying questions only when the spec is genuinely ambiguous."

3. Iterate in small, verdict-gated steps (use the framework on itself as soon as the verdict command exists).

4. Publish early patterns and get feedback from the loop-engineering community and Addy-style thinkers.

---

## References & Further Reading

- Addy Osmani – [Loop Engineering](https://oreillyradar.substack.com/p/loop-engineering) (June 2026) and the July 2026 X thread on outer loop ownership, Quality/Verdict/Answerability, cognitive debt, and taste.
- Boris Cherny & Peter Steinberger – Foundational statements on designing loops instead of prompting.
- Existing `loop-engineering` repo – The inner loop foundation this builds upon.
- Related emerging work: Kybernetes, Lumpcode, Verdikt, etc. (from the X thread).

---

**This is the framework. It is ready to be given to Cursor.**

The goal is not another agent wrapper. The goal is the governance layer that makes high-leverage agentic systems *safe to trust at scale* because the humans who sign the work can always explain why — and because the system actively protects their understanding and taste.

Build the factory. Keep the lights on. Make the work legible, verifiable, and owned.

An agent can write the code.  
But before it reaches users, someone must explain why it should exist, why it is safe enough, and what they will do when it is wrong.

That someone is you.  
outerloop makes it scalable.

---

*Initial SPEC created July 2026 by Grok, based on Addy Osmani's framing + the loop-engineering reference implementation. Evolve it in the open.*