# Development Guidelines

## Architecture

- Keep domain logic independent from React, Redux, and React Flow.
- `entities` contain domain models and domain logic.
- `features` contain user-facing functionality.
- `app` contains routes and page composition.
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
- Keep global styles limited to genuinely global rules.
- Avoid inline styles unless there is a clear reason.
- Do not rely on color alone to communicate state.
- Consider responsive behavior when creating components.

## Code Quality

- Prefer simple solutions over premature abstraction.
- Do not add dependencies without a concrete need.
- Do not create abstractions before a real repetition or complexity appears.
- Preserve the existing architecture unless there is a clear reason to change it.
- After significant changes, run:
  - `npm run lint`
  - `npm run build`
  - `npm run test`
