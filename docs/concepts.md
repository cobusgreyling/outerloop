# Core concepts (5-minute read)

outerloop governs the **human side** of agentic software work. Agents run the inner loop; humans own constraints, decisions, and explainability.

## The loop

```
Agent run  →  Evidence  →  Verdict  →  Ledger  →  Answerability
(inner)        (facts)      (decision)   (record)    (explain why)
```

| Concept | One-line definition |
|---------|---------------------|
| **Evidence** | Structured package of what an agent run did — plan, diffs, tests, risk. |
| **Verdict** | Human production decision (`ship`, `block`, `narrow`, …) with **mandatory rationale**. |
| **Ledger** | Append-only provenance chain linking evidence to verdicts and commits. |
| **Answerability** | Guarantee that `ledger why` reconstructs why something shipped. |

## Progressive adoption

### Level 1 — Everyone

Start here. Three commands, no framework lock-in:

```bash
npx @cobusgreyling/outerloop init
outerloop evidence package --run-id latest
outerloop verdict review <evidence-id>
outerloop ledger why <evidence-id>
```

### Level 2 — Teams

Add organizational constraints:

- **Taste** — Versioned qualitative rules (`outerloop taste capture`, `taste apply`).
- **Policy** — Backpressure and sampling (`outerloop policy set`, `policy evaluate`).
- **CI gate** — Reusable [GitHub Action](./github-action.md) packages evidence on every run.

### Level 3 — Factories

Multiple agent loops, dashboards, health scoring:

- **Harness** — Declarative inner/outer boundary.
- **Coordination** — Multi-loop registry and collision checks.
- **Dashboard / audit** — Team visibility and governance health.

## Integrations (pick your harness)

| Harness | Setup |
|---------|-------|
| Any agent | `outerloop init` + manual `evidence package` |
| Cursor | `outerloop init --with-cursor` |
| Claude Code | `outerloop init --with-claude-code` |
| loop-engineering | `outerloop init --with-loop-engineering` |

Evidence `source` field accepts: `custom-harness`, `cursor`, `claude-code`, `loop-engineering`, `manual`.

## Glossary (extended)

| Term | Meaning |
|------|---------|
| **Inner loop** | Agent capability: investigate, implement, verify, repeat. |
| **Outer loop** | Human agency: constraints, sampling, verdict, ownership. |
| **Backpressure** | Policy that throttles agent autonomy so humans can keep up. |
| **Taste** | Qualitative judgment encoded as versioned rules. |
| **Cognitive debt** | Erosion of understanding about what shipped and why. |
| **Harness boundary** | Explicit split of what agents may do vs what humans must decide. |

## Further reading

- [CLI reference](./cli.md)
- [Programmatic API](./api.md)
- [Adopting on your repo](./adopting.md)
- [Full specification](../SPEC.md)