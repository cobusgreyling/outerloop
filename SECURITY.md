# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| < 0.3   | :x:                |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report security issues privately to **cobus@greyling.me** with:

- A description of the vulnerability
- Steps to reproduce
- Impact assessment (data exposure, privilege escalation, etc.)
- Suggested fix, if you have one

You should receive an acknowledgment within **48 hours**. We will work with you
on a fix and coordinated disclosure timeline.

## Scope

In scope:

- `@cobusgreyling/outerloop` CLI and published packages
- Evidence, verdict, and ledger artifact handling
- Integration adapters (loop-engineering, Cursor, GitHub)

Out of scope:

- Third-party agent runtimes (Cursor, GitHub Actions runners, etc.)
- User-managed `.outerloop/` data on local disks (protect file permissions in
  your environment)

## Security Practices

outerloop stores governance artifacts locally under `.outerloop/`. Treat this
directory like source code: review changes, restrict write access in CI, and do
not commit secrets into evidence or verdict files.