# Interactive Story Editor

A visual editor and player for branching interactive stories.

Authors build a nonlinear story from scenes, choices and endings on a node graph, check it for problems, and play it right away. The story model is independent from the UI: the editor and the player are two views over the same data.

**Live demo:** _coming soon_

<!-- Add a GIF of the editor and the player here after the deployment. -->

## Features

### Editor

- **Graph view** built with React Flow: start, scene and ending nodes; each choice of a scene has its own connection point.
- **Add and delete nodes:** "Add scene" / "Add ending" place a node in the center of the view and focus its title; Delete or Backspace removes the selected node, and Undo brings it back in place.
- **Node panel** (React Hook Form + Zod): edit titles, text and choices with validation and accessible error messages.
- **Scene backgrounds:** a scene or ending picks a background from the built-in catalog in a `<select>` with a preview.
- **Connections two ways:** drag from a connection point with the mouse, or pick the target in a `<select>` from the keyboard.
- **Story check:** live validation (no start, dead ends, choices that lead nowhere, unreachable nodes, unknown backgrounds). Each problem is a button that selects the node.
- **Undo / redo** with toolbar buttons and `Ctrl+Z` / `Ctrl+Shift+Z` (works with non-Latin keyboard layouts).
- **Story details:** title and description.
- **Autosave** of the story and node positions to `localStorage`.

### Player

- Plays any story through the shared Story Engine: Begin, Continue, choices, endings, Restart and Play again.
- Visual novel layout: the scene text sits in a window at the bottom of the screen, the upper part of the background stays open. The start screen shows the story description.
- Typing effect: the text appears letter by letter; a click or any key shows it at once, and with reduced motion it appears immediately. The full text is always in the DOM for screen readers. Choices, Continue and "The End" appear when the text is complete.
- Scene backgrounds: a scene or ending can set a background from the built-in catalog. It stays until a later scene changes it, like in a visual novel, and changes with a crossfade (instant with reduced motion). The next backgrounds are preloaded.
- Focus moves to the new scene title after every step, so keyboard and screen reader users never lose their place.

### Library

- A hero band with a background image and a "New story" button.
- Two tabs, "My stories" and "Examples" (keyboard-accessible WAI-ARIA tabs), with cards that show the story cover and its size ("3 scenes · 2 endings").
- "My stories" with Edit, Play and Delete. Delete asks for confirmation in a native `<dialog>` (Cancel gets focus, Esc closes it).
- Three built-in example stories with different graph shapes (a tree, merging branches, loops with several endings). Examples are read-only; "Edit a copy" creates an editable copy.

### Accessibility

- Every action is available from the keyboard, including creating nodes, connecting them and deleting them.
- Semantic HTML first: native buttons, links, `<select>`, `<details>`, labelled forms.
- Live regions announce saves, connections, undo/redo and validation results.
- Visible `:focus-visible` everywhere, including graph nodes; node type and issue severity are shown as text, not only by color.
- Light and dark theme follow the system setting; text contrast is at least 4.5:1.

## Tech stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **React Flow** (`@xyflow/react`) for the graph editor
- **React Hook Form** + **Zod** for forms and validation
- **SCSS Modules** with design tokens in CSS custom properties, `clsx`
- **Vitest** + **React Testing Library** (jsdom, `user-event`)

## Architecture

The core rule: **the story domain model does not depend on React, Redux or React Flow.**

```text
                    Story (domain)
                          │
            ┌─────────────┴─────────────┐
            ↓                           ↓
         Editor                      Player
            │                           │
  React Flow (presentation)       Story Engine
```

- `Story` is the single source of truth: plain objects with `nodes` (a discriminated union `start | scene | ending`) and `edges` (`continue | choice`). Choices belong to a scene, like in Twine and Ink.
- **Edits are pure functions** (`addNode`, `updateNode`, `removeNode`, `connect`, `disconnect`): `Story → Story`, no mutation. This makes undo/redo a simple stack of states and keeps the logic testable without React.
- **Operations vs validation:** operations keep references intact and throw on programming errors; states an author passes through while editing (a dead end, an unreachable node) are allowed and reported by `validateStory`.
- **React Flow is only a view.** An adapter (`storyToFlow`) converts the story into React Flow nodes and edges; React Flow never owns the data. Node positions live in a separate editor layout, not in the domain model.
- **Edge routing** picks node sides from the current positions, so lines follow the nodes while dragging without per-edge state.
- **Storage** is a small external store over `localStorage`, read in React with `useSyncExternalStore`.

### Layers

The project follows a simplified [Feature-Sliced Design](https://feature-sliced.design/). A layer imports only from the layers below it, and features never import each other.

```text
app       Next.js routes: params, generateStaticParams, layout, global styles
  ↓
views     page composition (the FSD "pages" layer; Next.js reserves src/pages)
  ↓
features  story-editor, story-player, story-library
  ↓
entities  story model, Story Engine, operations, validation, examples, storage
```

## Project structure

```text
src/
  app/                      routes, layout, design tokens
  views/                    HomePage, EditorPage, PlayPage, UserStoryPlayer
  features/
    story-editor/
      lib/                  adapter, layout, transitions, history, form schemas (pure, unit-tested)
      ui/                   StoryEditor, custom nodes and edge, node panel, story check, story details
    story-player/
      lib/                  typing effect, scene backgrounds
      ui/                   StoryPlayer
    story-library/
      lib/                  library hooks, story factory, cover, stats
      ui/                   tabs, story cards, buttons, delete dialog
  entities/story/
    model/                  types, story-engine, story-operations, validate-story
    data/                   example stories, background catalog
    library/                localStorage store
```

## Getting started

Requirements: Node.js 20.9 or later, npm.

```bash
git clone <repository-url>
cd interactive-story-editor
npm install
npm run dev
```

Open http://localhost:3000.

### Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | start the dev server     |
| `npm run build`      | production build         |
| `npm start`          | run the production build |
| `npm run lint`       | ESLint                   |
| `npm run test`       | all tests                |
| `npm run test:watch` | tests in watch mode      |

## Testing

Vitest runs two projects:

- **unit** (`*.test.ts`, Node): the domain model, Story Engine, operations, validation, the React Flow adapter, edge routing, undo history, form mapping, the storage, the typing effect and scene backgrounds. They run without a DOM, which also guarantees that the domain does not depend on the browser.
- **ui** (`*.test.tsx`, jsdom + React Testing Library): the main user flows, queried by role and accessible name. The Player is played to an ending with the keyboard, including focus moves and the typing effect (full text in the DOM, finishing on a key, reduced motion). The library tests cover tab navigation with the arrow keys and the delete confirmation dialog. The editor tests cover adding and saving a scene, validation errors, connecting nodes from the keyboard, undo/redo with buttons and shortcuts, and deleting with undo.

Mouse dragging on the graph is not tested in jsdom (it has no layout); the same domain operations are covered through the keyboard path and unit tests.
