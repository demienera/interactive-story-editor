# Interactive Story Editor

A visual editor for creating branching interactive stories.

The project allows authors to build nonlinear stories from scenes, choices, and endings, visualize story flow as a graph, and preview the result as an interactive experience.

## Overview

The application is built around two main modes:

- **Editor** — create and edit a story as a visual node-based graph.
- **Player** — preview and play the resulting interactive story.

The long-term goal is to allow users to create branching stories without writing code and publish them for others to play.

### Story flow

```text
START
  ↓
SCENE
  ↓
CHOICE
 ↙    ↘
SCENE  SCENE
 ↓      ↓
ENDING ENDING
```

The story itself is represented by a domain model consisting of nodes and edges. The visual editor is only a representation of that model, which keeps the story logic independent from the UI.

## Tech Stack

### Frontend

- [Next.js](https://nextjs.org/)
- React
- TypeScript
- SCSS Modules

### State & Forms

- Redux Toolkit
- React Hook Form
- Zod

### Editor

- React Flow

### Testing

- Vitest
- React Testing Library

### Planned Backend

- Next.js API / backend layer
- PostgreSQL
- Prisma

## Architecture

The project separates the story domain from its visual representation.

```text
                    Story Domain
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
           Editor                  Player
              │                     │
         React Flow              React UI
```

The editor is responsible for manipulating the story graph, while the player uses the same story model to execute the story.

The story engine is designed as a framework-independent layer so that story logic does not depend on React or the visual editor.

## Getting Started

### Requirements

- Node.js
- npm

### Installation

```bash
git clone <repository-url>
cd interactive-story-editor
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```
