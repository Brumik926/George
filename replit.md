# Finančný účet

Bezpečná mobilná ukážka osobného finančného účtu s lokálnymi demo prevodmi a históriou pohybov.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/financny-ucet-demo/app/` — Expo Router obrazovky pre prehľad, aktivity, platbu a detail pohybu.
- `artifacts/financny-ucet-demo/context/AccountContext.tsx` — lokálny stav účtu a AsyncStorage perzistencia.
- `artifacts/financny-ucet-demo/constants/colors.ts` — svetlá a tmavá modro-biela farebná paleta.

## Architecture decisions

- Demo prevody zostávajú výhradne lokálne a nikdy nevolajú bankový ani platobný systém.
- Potvrdenia sa exportujú ako lokálne PDF/HTML súbory a vždy obsahujú označenie VZOR / NEPLATNÝ DOKLAD.
- Zostatok a história sa ukladajú cez AsyncStorage, aby demo správanie pretrvalo medzi spusteniami.

## Product

Používateľ vidí zostatok, prijaté platby a výdavky za aktuálny mesiac, môže vytvoriť simulovaný prevod s validáciou a stiahnuť neplatné vzorové potvrdenie.

## User preferences

- Vizuál má vychádzať zo štruktúry dodaných mobilných bankových obrazoviek, ale bez imitácie skutočnej bankovej identity.

## Gotchas

- Aplikácia je zámerne označená ako DEMO; nemeníť texty, ktoré vysvetľujú, že platby nie sú skutočné.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
