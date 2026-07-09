<p align="center">
  <img src="docs/architecture.md" alt="Outerloop" width="480" />
</p>

# outerloop

**Own the Outer Loop. Evidence → Verdict → Answerability. At industrial scale.**

Practical primitives, tooling, and patterns for rigorously owning the human side of agentic software factories.

This is the companion and evolution to [loop-engineering](https://github.com/cobusgreyling/loop-engineering). 

**The full project specification, architecture, data models, CLI design, and implementation roadmap lives in [SPEC.md](./SPEC.md).**

## Quick Start (Once Built)

```bash
npx @cobusgreyling/outerloop evidence package --run-id latest
outerloop verdict review <evidence-id>
outerloop ledger why HEAD
```

## The Big Idea

As inner-loop agentic systems (powered by tools like loop-engineering) become more powerful and long-running, the bottleneck and the source of competitive advantage move to the **outer loop**:

- Humans define constraints and taste
- Agents produce evidence
- Humans issue verdicts with captured rationale
- The system guarantees answerability

outerloop makes this outer loop concrete, low-tax, high-signal, and scalable — while actively fighting cognitive debt and orchestration tax.

Read the [full SPEC.md](./SPEC.md) for the complete vision, concepts (directly mapped to Addy Osmani's framing), architecture, and Cursor-ready implementation instructions.

## Status

This is the initial framework specification (July 2026). The implementation is intended to be built iteratively in Cursor using this spec as the source of truth, while dogfooding the outerloop primitives on the development process itself.

## Contributing Philosophy

- Make answerability cheap and reconstruction trivial.
- Treat taste as a versioned, first-class engineering artifact.
- Explicitly separate agent *capability* (inner) from human *agency* (outer).
- Build for the accountable owner, not just the implementer.

An agent can write it.  
But before it reaches users, someone must explain why it should exist, why it's safe enough, and what they will do when it is wrong.

That is the work of the outer loop.

---

*Built on the shoulders of loop-engineering, Addy Osmani’s outer loop thinking, and the broader agentic engineering community.*
