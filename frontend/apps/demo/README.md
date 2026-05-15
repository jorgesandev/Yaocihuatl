# Yaocihuatl Frontend Demo

Hackathon demo application for the initial Yaocihuatl interface.

The demo is now designed to run as a real deployed application with synthetic data. It can call the backend, use demo authentication, and read/write seeded records through PostgreSQL as modules are connected.

The “Demo” label remains visible because the dataset is synthetic, credentials are public, actions are safe/revisable, and no legal determination is automatic. Do not use real personal data, sensitive evidence, private communications, or real case files in this environment.

Current boundaries:

- Chimalli can call the backend service already integrated by Rafa.
- Tlachia and Machiyotl screens still use frontend mock interactions until their real APIs are implemented.
- Demo auth users are seeded by the backend: `mujer`, `analista`, `revisor`, `observador`.
- Evidence files in the seed are non-sensitive local placeholders referenced by hash metadata.

Run from the repository root:

```bash
npm install
npm run dev
```

Routes are implemented with Next.js App Router under `src/app`.
