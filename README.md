# Basic React TypeScript Bootstrap

A modern starter template for React applications with TypeScript, Tailwind CSS, and Vite.

## Features

- ⚡️ [React 19](https://react.dev/) - The latest version of React
- 🔥 [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- 🔒 [TypeScript](https://www.typescriptlang.org/) - Type safety for your JavaScript
- 💨 [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- 📝 [ESLint](https://eslint.org/) - Pluggable JavaScript linter
- 💖 [Prettier](https://prettier.io/) - Opinionated code formatter
- 📚 [TypeDoc](https://typedoc.org/) - Documentation generator for TypeScript
- 🔄 [SWC](https://swc.rs/) - Super-fast JavaScript/TypeScript compiler

## Getting Started

### Prerequisites

- Node.js (v21 or newer)
- npm or yarn

### Installation

1. Clone this repository

```bash
git clone <repository-url>
cd basic-react-ts
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server with TypeScript type checking
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run docs` - Generate documentation with TypeDoc
- `npm run watch:docs` - Generate documentation in watch mode

## Project Structure

```
basic-react-ts/
├── public/             # Static assets
├── src/
│   ├── assets/         # Project assets (images, fonts, etc.)
│   ├── style/          # CSS and styling files
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Application entry point
│   └── vite-env.d.ts   # Vite environment type declarations
├── .env                # Environment variables
├── .prettierrc         # Prettier configuration
├── eslint.config.js    # ESLint configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Documentation

Generate API documentation using TypeDoc:

```bash
npm run docs
```

The documentation will be available in the `docs` directory.
