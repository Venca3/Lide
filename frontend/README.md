# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Using API pagination headers

Frontend requests should read `X-Total-Count` for the total number of items and use `page`/`size` query params for navigation. The server also provides a `Link` header with `rel` links (`first`, `prev`, `next`, `last`).

Example fetch usage:

```ts
async function fetchPersons(q: string, page = 0, size = 20) {
  const url = `/api/persons?q=${encodeURIComponent(q)}&page=${page}&size=${size}`;
  const res = await fetch(url);
  const total = Number(res.headers.get('X-Total-Count') ?? 0);
  const link = res.headers.get('Link');
  const items = await res.json(); // array of persons
  return { items, total, link };
}
```

Frontend should prefer `X-Total-Count` for paginator totals; `Link` is optional helper for navigation links.

### Vite proxy and CORS

During development the frontend runs on a different port (e.g. `http://localhost:5173`). `vite.config.ts` includes a proxy mapping so requests to `/api/*` are forwarded to the backend (no CORS required). In production, the backend must allow cross-origin requests from the frontend origin; set the backend property `app.cors.allowed-origins` (comma-separated) to your deployed frontend URL(s).

Example `vite.config.ts` proxy snippet (already present in this project):

```ts
server: {
  proxy: {
    '/api': 'http://localhost:8081'
  }
}
```

Example env for production backend (set in `run.env` or environment):

```
app.cors.allowed-origins=https://app.example.com
```
