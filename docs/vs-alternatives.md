# How outerloop compares

outerloop is not a replacement for code review or CI. It is the **governance layer** that makes agent-assisted work answerable after the fact.

## vs. GitHub PR reviews

| | PR review | outerloop |
|---|-----------|-----------|
| **When** | At merge time | At agent-run completion and again at ship |
| **Artifact** | Comments, approvals | EvidencePackage + Verdict + Ledger chain |
| **Rationale** | Often implicit or scattered | Mandatory, structured rationale |
| **Agent runs** | Usually invisible | First-class evidence from harness output |
| **Retro** | Dig through threads | `ledger why <sha>` reconstructs full chain |

**Use both:** PR review for code quality; outerloop for agent governance and answerability.

## vs. CODEOWNERS / branch protection

Branch protection enforces *who may merge*. outerloop enforces *why a change was accepted* when agents did most of the work.

- CODEOWNERS: static file ownership
- outerloop: dynamic evidence, risk scoring, taste rules, verdict rationale

## vs. conventional CI (tests, lint, SAST)

CI answers "did checks pass?" outerloop answers "what did the agent do, who decided it was safe enough, and can we explain that six months later?"

```bash
# CI gate
pnpm test && pnpm lint

# outerloop gate (composable)
outerloop evidence package --run-id "$RUN_ID"
outerloop policy evaluate "$EVIDENCE_ID"
outerloop verdict issue --evidence-id "$EVIDENCE_ID" --decision ship --rationale "..."
```

## vs. loop-engineering

[loop-engineering](https://github.com/cobusgreyling/loop-engineering) designs and runs **inner loops** (patterns, state, verifiers). outerloop owns the **outer loop** (evidence, verdict, ledger).

They compose: loop-engineering produces runs; outerloop packages evidence and records human verdicts.

## vs. "just document in the PR description"

PR descriptions are free-form and optional. outerloop makes rationale **required**, **typed**, and **queryable** — linked to structured evidence and indexed in a ledger.

## When outerloop is the wrong tool

- One-off scripts with no agent involvement (use normal git + PR).
- Teams that only need test gates (CI is enough).
- Replacing security review for regulated systems (outerloop complements, does not replace specialists).

## When outerloop fits

- Agentic coding workflows (Cursor, Claude Code, custom harnesses).
- High-agency inner loops where humans must stay accountable.
- Teams scaling multiple agent loops and feeling orchestration tax.
- Audits asking "why did this ship?" months later.