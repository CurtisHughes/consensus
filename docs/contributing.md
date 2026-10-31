# Contributing

## Prerequisites
These are the tools you will need to have installed to develop for this project:
- [Node](https://nodejs.org/en/) 26 (the version is pinned in [.nvmrc](../.nvmrc), so `nvm use` will pick it up)
- npm (ships with Node)

## Local setup
```
nvm use
npm install
```

The app is built with [Vue 3](https://vuejs.org/), [Vite](https://vite.dev/), [Pinia](https://pinia.vuejs.org/), [Vue Router](https://router.vuejs.org/), and the [Firebase JS SDK](https://firebase.google.com/docs/web/setup).

### Compiles and hot-reloads for development
```
npm run dev
```

### Type-checks, compiles, and minifies for production
```
npm run build
```

### Type-checks, compiles, and minifies for development
```
npm run build:dev
```

### Run unit tests ([Vitest](https://vitest.dev/))
```
npm run test:unit
```

### Run end-to-end tests ([Cypress](https://www.cypress.io/))
```
npm run test:e2e
```

This builds the app, serves it with `vite preview`, and runs the specs in `cypress/e2e` headlessly. Use `npm run test:e2e:open` to run them interactively against the dev server instead.

### Lint and format
```
npm run lint
npm run format
```

A pre-commit hook (installed automatically by `npm install`) runs ESLint and Prettier on staged files.
