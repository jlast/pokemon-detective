# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Local Development

Run the API and frontend in separate terminals:

```sh
npm run dev:api
npm run dev
```

The frontend expects the API at `http://localhost:3001` by default. If that port is already in use, start the API on another port and point Vite at it:

```sh
PORT=3002 npm run dev:api
VITE_API_TARGET=http://localhost:3002 npm run dev
```

The frontend uses `localhost:5173` for local auth redirects. If that port is already in use, stop the existing Vite process rather than letting the app move to another port.

## Case Hierarchy

### `src/game/caseModel.ts`

```mermaid
flowchart TD
  A[Case] --> B[Suspects]
  A --> C[Locations]
  A --> D[Evidence]
  A --> E[Solution]

  C --> F[Location]
  F --> G[LocationAction]

  D --> H[Evidence shape]
```

### `src/game/cases/`

```mermaid
flowchart TD
  A[CaseConfig] --> B[Case metadata]
  A --> C[Locations]
  A --> D[Evidence templates]
  A --> E[evidenceOverrides]

  C --> F[Location]
  F --> G[LocationAction]
  G --> H[Evidence id + narrative text]

  D --> I[Base evidence list]
```

### `src/game/caseGeneration.ts`

```mermaid
flowchart TD
  A[Pokemon data] --> B[CaseTrait rules]
  B --> C[evidenceTraitById]
  B --> D[getPokemonCaseTraits]
  C --> E[actionEvidencePools]
  E --> F[LocationAction evidenceId]
  D --> G[Evidence matching]
  C --> H[Deduction text]
```

This is the authored content shape to keep in mind when adding a new case.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
