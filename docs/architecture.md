# Architecture

See [SPEC.md](../SPEC.md) for the full architecture, data models, and CLI design.

## Packages (planned)

| Package | Responsibility |
|---------|----------------|
| `@cobusgreyling/outerloop-core` | Schemas, types, EvidencePackage builder |
| `@cobusgreyling/outerloop` | CLI entrypoint |
| `evidence` | Generators, normalizers, risk scorers |
| `verdict` | Review TUI, decision recorder |
| `ledger` | Storage, query, provenance reconstruction |
| `taste` | Capture, versioning, rule matching |
| `policy` | Backpressure DSL parser and enforcer |
| `harness` | Boundary spec parser and validator |
| `cognitive` | Debt estimators, narrative generators |
| `integrate` | loop-engineering, Cursor, GitHub adapters |

Phase 0 ships `core` and `cli`. Other packages are scaffolded for Phase 1+.