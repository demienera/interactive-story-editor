@AGENTS.md
@docs/ARCHITECTURE.md

# Project

Interactive Story Editor: a visual editor and player for branching stories.
Product overview is in `README.md`, versions and task order are in `ROADMAP.md`.

## Stack

- Next.js 16 (App Router), React 19
- `@xyflow/react` 12 (React Flow)
- SCSS Modules
- `clsx` for combining class names
- Vitest, React Testing Library (jsdom)
- React Hook Form + Zod

Planned, not installed yet: Redux Toolkit (see `ROADMAP.md`).

## Commands

- `npm run dev`: start the dev server
- `npm run lint`: run ESLint
- `npm run build`: production build
- `npm run test`: run all tests
- `npx vitest run <path>`: run a single test file

## Layout

- `src/entities/story/model`: story types and `story-engine` (domain logic)
- `src/entities/story/data`: built-in example stories (`examples/`) and `example-stories.ts`
- `src/entities/story/library`: the user's stories and their layouts in localStorage (external store without React)
- `src/features/story-library`: hooks over the store, story factory, home page story lists and buttons ("New story", "Edit a copy", "Delete")
- `src/features/story-editor/lib`: story-to-flow conversion, editor layout state, initial auto layout, node factory, transitions (connections), edge routing, node and story details form schemas, undo history, issue messages
- `src/features/story-editor/ui`: `StoryEditor` component, custom nodes (`nodes/`), custom edge (`edges/`), node editing panel (`node-panel/`), story check panel (`issues-panel/`), story title and description form (`story-details/`)
- `src/features/story-player/ui`: `StoryPlayer` component
- `src/views/{home,editor,play}/ui`: page composition (`HomePage`, `EditorPage`, `PlayPage` + `UserStoryPlayer`)
- `src/app`: Next.js routes only (`params`, `generateStaticParams`), layout and global styles
- `src/app/styles/_tokens.scss`: design tokens (CSS custom properties), the only place with literal colors

## Conventions

- Tests live next to the code: `*.test.ts` run in Node (`unit` project), `*.test.tsx` run in jsdom with React Testing Library (`ui` project, setup in `vitest.setup.ts`).
- Non-component files use kebab-case; components use PascalCase.

# Development Guidelines

## Architecture

- Keep domain logic independent from React, Redux, and React Flow.
- `entities` contain domain models and domain logic.
- `features` contain user-facing functionality.
- `views` compose features into pages (the FSD `pages` layer; named `views` because Next.js treats `src/pages` as the Pages Router).
- `app` contains Next.js routes only; a route reads `params` and renders a view.
- A layer imports only from layers below it (`app → views → features → entities`); features never import each other.
- React Flow is a presentation layer for the story editor, not the source of truth.
- Avoid abstractions that do not solve a real current problem.

## Components & UI

- Prefer small components with a clear responsibility.
- Prefer composition over overly generic components.
- Use semantic HTML whenever possible.
- Do not create custom UI primitives when native HTML provides the required behavior.
- Keep interaction logic close to the component that owns the interaction.

## Accessibility

- Prefer semantic HTML over ARIA.
- Do not use `div` or `span` as substitutes for native interactive elements.
- All interactive elements must be keyboard accessible.
- Interactive elements must have a meaningful accessible name.
- Preserve visible `:focus-visible` states.
- Form controls must have accessible labels.
- Do not communicate important information through color alone.
- Dynamic errors and important state changes must be accessible to assistive technologies.
- Test keyboard interaction for important user flows.
- Use ARIA only when native HTML semantics are insufficient.

## TypeScript

- Avoid `any` unless there is a documented technical reason.
- Prefer discriminated unions for domain variants.
- Reuse existing domain types instead of duplicating them.
- Keep public APIs and complex data structures explicitly typed.
- Do not weaken types just to make an error disappear.

## State Management

- Use local React state for local UI state.
- Do not introduce Redux for simple component state.
- Add Redux Toolkit when shared or complex editor state requires it.
- Keep domain logic independent from Redux.
- Do not duplicate the same state across React, Redux, and React Flow without a clear reason.

## Testing

- Test behavior and contracts rather than implementation details.
- Keep domain logic tests independent from React.
- Use React Testing Library for important UI behavior.
- Prefer meaningful tests over tests written only for coverage.
- Run lint, build, and tests after significant changes.

## Styling

- Use SCSS Modules for component-specific styles.
- Combine or conditionally apply class names with `clsx`, not template strings or string concatenation.
- Keep global styles limited to genuinely global rules.
- Avoid inline styles unless there is a clear reason.
- Do not rely on color alone to communicate state.
- Consider responsive behavior when creating components.

## Code Quality

- Prefer simple solutions over premature abstraction.
- Do not add dependencies without a concrete need.
- Do not create abstractions before a real repetition or complexity appears.
- Preserve the existing architecture unless there is a clear reason to change it.
- Do not mix domain logic with UI just for brevity.
- Do not add Tailwind or a custom UI library.
- WebSocket is only for Party Mode (v2); backend, database, and authentication not before v3.
- Avoid complex state machines and generic "for the future" components.
