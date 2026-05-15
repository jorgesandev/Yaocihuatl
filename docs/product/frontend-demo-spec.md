# Frontend Demo Specification

This document defines the scope and boundaries for the initial Yaocihuatl frontend demo.

## Purpose

Build a navigable product experience for hackathon demonstration. The demo shows how Yaocihuatl supports institutional monitoring, local evidence sealing, guided orientation, review, and public aggregate transparency using a real deployable stack with synthetic data.

## Scope

- A Next.js App Router demo application under `frontend/apps/demo`.
- Real backend/API connectivity where a module is implemented.
- Seeded synthetic data in PostgreSQL for roles, cases, alerts, evidence metadata, audit logs and public metrics.
- Visual flows for Tlachia, Machiyotl, Chimalli, institutional review, public verification, privacy settings, and safe exit.
- Reusable UI components aligned to `DESIGN.md`.
- Static/client-side simulated interactions for modules whose real APIs are not implemented yet.

## Explicit Non-Goals

- No real personal data or real evidence.
- No production authentication policy.
- No real AI, RAG, entity extraction, classification, scraping, or surveillance.
- No legal determination, jurisdictional decision, or official routing.
- No real file upload, hash generation, PDF generation, or evidence submission.
- No real data from protected women, personal accounts, public figures, or case files.

## Assumptions

- Product roles, module boundaries, and conceptual flow are based on existing repository documentation.
- All names, platforms, hashes, timestamps, municipalities, accounts, alerts, and cases are fictitious and anonymized.
- UI labels prefer Spanish because the demo is user-facing and institution-facing.
- AI content is always framed as assistive and pending human review.

## Inputs

- Demo role login using public seeded credentials.
- Synthetic evidence metadata.
- Synthetic alerts and cases.
- Backend chat replies when Chimalli is available; controlled local replies for non-case UI interactions.
- Mock public aggregate metrics.

## Outputs

- Visual navigation states.
- Evidence cards, hash blocks, timelines, charts, and review panels backed by synthetic data as APIs are connected.
- Simulated export, send, copy, and verification states.

## Demo Meaning

“Demo” means a real app deployed with synthetic data, public credentials and safe non-final actions. It does not mean every screen is mock-only. The label must remain visible because no screen should be confused with a production complaint, legal decision, or evidence submission system.

## Risks and Mitigations

- Risk: The demo could be misunderstood as a real complaint or legal determination system.
  Mitigation: The UI repeatedly labels actions as demo, simulated, assistive, and requiring human review.

- Risk: Sensitive evidence could appear exposed in a demo.
  Mitigation: Evidence thumbnails are blurred or represented with neutral placeholders.

- Risk: AI suggestions could be interpreted as final decisions.
  Mitigation: AI badges, warnings, and review panels state that the authority must validate.

- Risk: Public dashboards could expose small groups.
  Mitigation: Public views show only aggregated, anonymized metrics and explain k-anonymity in plain language.

## Module Boundaries

- Tlachia screens display institutional monitoring and explainability mocks only.
- Machiyotl screens display local evidence capture and sealing mocks only.
- Chimalli screens display guided orientation and routing suggestions only.
- Cross-module views such as evidence kit and case review present copied mock data without shared backend state.
