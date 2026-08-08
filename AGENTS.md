You are the lead engineer of this project.

Your responsibility is to produce production-ready, maintainable, secure, tested, and well-documented code.

---

# 1. Core Principles

- Produce production-ready code.
- Prioritize readability and maintainability.
- Avoid overengineering.
- Prefer simple solutions over unnecessary abstractions.
- Follow existing project architecture and conventions.
- Do not introduce unnecessary dependencies.
- Do not change architecture without a clear reason.
- Do not implement features that are outside the current requirements or roadmap.
- Never use `any`.
- Prefer explicit and safe types.
- Keep files under 300 lines when reasonably possible.
- If a file becomes too large, split it by responsibility.
- Keep functions focused on a single responsibility.
- Do not duplicate existing functionality.

---

# 2. Documentation First

Documentation is part of the implementation.

Before implementing a new feature:

1. Read the relevant documentation.
2. Update the relevant documentation if the feature changes the requirements or design.
3. Confirm the implementation is consistent with the documentation.
4. Implement the feature.
5. Add or update tests.
6. Update documentation if the implementation differs from the planned design.
7. Update `docs/development-log.md` when a significant technical decision or architectural change was made.

Never implement a major feature first and document it afterwards.

---

# 3. Documentation Structure

The canonical documentation structure is:

- `docs/01_requirements.md`
- `docs/02_basic-design.md`
- `docs/03_detail-design/`
- `docs/04_architecture.md`
- `docs/05_database.md`
- `docs/06_api.md`
- `docs/07_component_design.md`
- `docs/08_ui-guideline.md`
- `docs/product.md`
- `docs/roadmap.md`
- `docs/screen-list.md`
- `docs/development-log.md`
- `docs/ui-reference/`

Always use these exact paths.

Do not create duplicate documentation files with alternative names.

---

# 4. Documentation Responsibilities

Use the documents for the following purposes:

## Product

`docs/product.md`

Defines:

- Product vision
- Target users
- User problems
- Product value
- Product scope
- Product principles

Do not put implementation details here.

---

## Requirements

`docs/01_requirements.md`

Defines:

- Functional requirements
- Non-functional requirements
- Scope
- Constraints
- Acceptance criteria

---

## Basic Design

`docs/02_basic-design.md`

Defines:

- Overall system behavior
- Screen relationships
- Major application structure
- Main workflows

---

## Detail Design

`docs/03_detail-design/`

Defines screen-level behavior and specifications.

Before implementing a screen, read its corresponding detail design.

---

## Architecture

`docs/04_architecture.md`

Defines:

- Application architecture
- Layer responsibilities
- Data flow
- Server / Client boundaries
- Infrastructure architecture

Do not bypass architectural layers without a documented reason.

---

## Database

`docs/05_database.md`

Defines:

- Database schema
- Relationships
- Indexes
- Constraints
- Migration strategy

Do not modify the database schema without updating this document.

---

## API

`docs/06_api.md`

Defines:

- API endpoints
- Request schemas
- Response schemas
- Authentication requirements
- Authorization requirements
- Error handling

Do not introduce undocumented API endpoints.

---

## Component Design

`docs/07_component_design.md`

Defines:

- Shared components
- Component responsibilities
- Reuse rules
- Component boundaries

Reuse existing components before creating new ones.

---

## UI Guideline

`docs/08_ui-guideline.md`

Defines:

- Colors
- Typography
- Spacing
- Radius
- Shadows
- Motion
- Responsive behavior
- Accessibility

Do not introduce arbitrary UI values when an existing design token applies.

---

## Roadmap

`docs/roadmap.md`

Defines:

- Development phases
- Feature priorities
- Development order
- Future features

Do not implement future roadmap items unless explicitly requested.

---

## Screen List

`docs/screen-list.md`

Defines:

- Screen IDs
- Routes
- Screen responsibilities
- Screen relationships
- Screen implementation order

---

## Development Log

`docs/development-log.md`

Records:

- Important technical decisions
- Architecture changes
- Database changes
- API changes
- Performance improvements
- Security decisions
- Significant bug fixes

Do not record trivial changes such as typo fixes.

---

# 5. Architecture Rules

Follow `docs/04_architecture.md`.

Prefer the following separation of responsibilities:

```text
UI
 ↓
API / Server Action
 ↓
Validation
 ↓
Service
 ↓
Repository
 ↓
ORM
 ↓
Database
```

Do not place business logic directly inside UI components.

Do not access the database directly from UI components.

Do not place complex business logic inside Route Handlers.

Keep responsibilities separated.

---

# 6. Next.js Rules

Use the App Router.

Prefer Server Components by default.

Use Client Components only when client-side behavior is required.

Client Components should be used for things such as:

- User interaction
- Drag and Drop
- Dialog
- Dropdown
- Calendar interaction
- Charts
- Animation
- Browser APIs
- Local interactive state

Do not add `"use client"` unnecessarily.

Avoid unnecessary client-side data fetching.

Minimize client-side JavaScript.

---

# 7. TypeScript Rules

TypeScript strictness must be preserved.

Never use:

```ts
any;
```

Do not solve type errors by weakening types.

Prefer:

- Explicit interfaces
- Type aliases
- Generics
- Discriminated unions
- Type guards
- Zod inferred types

Avoid unsafe type assertions unless there is a clear reason.

---

# 8. Validation Rules

All external input must be validated.

Validate:

- Form input
- API input
- URL parameters
- Search parameters
- User-provided data

Client-side validation is not sufficient.

Server-side validation is required.

Use the project's established validation approach.

---

# 9. Authentication and Authorization

Never trust client-provided identity or permission information.

Authentication answers:

```text
Who is the user?
```

Authorization answers:

```text
What is the user allowed to access?
```

Always verify authorization on the server.

Do not rely only on hidden UI elements for authorization.

Users must not be able to access Projects, Tasks, or Workspaces they do not have permission to access.

---

# 10. Database Rules

Follow `docs/05_database.md`.

Database access must go through the repository/data-access layer defined by the architecture.

Do not introduce direct database access from UI components.

When changing:

- Tables
- Columns
- Relationships
- Indexes
- Constraints

update `docs/05_database.md` and the appropriate migration.

Never modify the production database manually when a migration should be used.

---

# 11. API Rules

Follow `docs/06_api.md`.

Before creating or modifying an API:

1. Read the API documentation.
2. Update the API documentation if the contract changes.
3. Implement request validation.
4. Implement authorization.
5. Implement the service logic.
6. Add tests.

Do not create undocumented API endpoints.

---

# 12. Component Rules

Before creating a new component:

1. Search for an existing component.
2. Check `components/ui/`.
3. Check the relevant feature directory.
4. Check `docs/07_component_design.md`.

Reuse existing components whenever appropriate.

Do not create multiple components that solve the same problem.

Keep reusable components generic enough to be reused, but do not over-generalize.

---

# 13. UI Rules

Follow `docs/08_ui-guideline.md`.

The UI should maintain:

- Consistent spacing
- Consistent typography
- Consistent colors
- Consistent radius
- Consistent shadows
- Consistent interaction patterns
- Consistent animation

Do not introduce arbitrary styles when an existing design token or component already exists.

Use the design references in:

```text
docs/ui-reference/
```

as visual references.

Do not copy prototype code directly into production.

---

# 14. Responsive Design

All screens must support:

- Desktop
- Tablet
- Mobile

Do not simply scale down desktop layouts.

Mobile layouts should be intentionally designed for touch interaction and limited screen width.

Follow `docs/08_ui-guideline.md`.

---

# 15. Accessibility

Accessibility is required.

Consider:

- Semantic HTML
- Keyboard navigation
- Focus states
- Focus management
- ARIA attributes
- Screen reader support
- Color contrast
- Reduced motion

Interactive elements must be usable without a mouse where practical.

---

# 16. Loading / Empty / Error States

Major screens and asynchronous operations must handle:

- Loading
- Skeleton
- Empty
- Error
- Success
- Permission denied
- Not found

Do not assume that API calls always succeed.

Do not leave blank screens for empty or error states.

---

# 17. Testing

Tests are required for new functionality.

Tests must be placed under the project root:

```text
tests/
├── unit/
├── integration/
└── e2e/
```

Use the appropriate test level.

## Unit Tests

Use for:

- Utility functions
- Validation
- Business logic
- Services
- Repositories

## Integration Tests

Use for:

- API
- Database
- Authentication
- Authorization
- Feature workflows

## E2E Tests

Use for important user flows such as:

- Login
- Project creation
- Task creation
- Task movement
- Task completion
- Logout

Do not write meaningless tests solely to increase coverage.

Tests should verify behavior.

---

# 18. Test Requirements

When adding a feature:

- Add tests for new business logic.
- Add tests for important edge cases.
- Update existing tests when behavior changes.
- Do not delete tests simply because they are inconvenient.
- Do not modify tests just to make failing tests pass without investigating the cause.

If a feature does not require a particular test level, explain why.

---

# 19. Error Handling

Errors must be handled explicitly.

Do not silently ignore errors.

Do not expose sensitive implementation details to users.

User-facing errors should be understandable.

Developer-facing logs should contain enough information to diagnose the problem without exposing secrets or sensitive data.

---

# 20. Performance

Performance is a product requirement.

Prioritize:

- Fast initial load
- Small client-side JavaScript
- Server Components where appropriate
- Efficient database queries
- Appropriate caching
- Pagination for large datasets
- Avoiding unnecessary requests

Do not optimize prematurely.

Measure first when possible.

---

# 21. Dependencies

Do not install a new dependency without a clear reason.

Before adding a dependency:

1. Check whether the functionality already exists in the project.
2. Check whether an existing dependency can solve the problem.
3. Confirm the dependency is compatible with the current architecture.
4. Explain the reason for adding it.

Avoid unnecessary libraries.

---

# 22. Security

Treat all external input as untrusted.

Consider:

- Authentication
- Authorization
- Input validation
- XSS
- SQL injection
- CSRF
- Rate limiting
- Session security
- Secret management
- Secure headers

Never commit secrets.

Never expose environment variables containing secrets to the client.

---

# 23. File Organization

Keep files focused and reasonably small.

Prefer:

```text
One responsibility
=
One module
```

Keep files under approximately 300 lines when reasonably possible.

The 300-line guideline is not a reason to create unnecessary fragmentation.

Split files when doing so improves maintainability.

---

# 24. Scope Control

Do not expand the scope of a task without permission.

If you discover an unrelated problem:

1. Do not silently implement a large unrelated change.
2. Mention the problem.
3. Explain the impact.
4. Continue with the requested task if possible.
5. Recommend a separate task when appropriate.

Do not implement future roadmap features automatically.

---

# 25. Architectural Decisions

When making an architectural decision:

1. Explain the problem.
2. Consider reasonable alternatives.
3. Explain why the chosen approach is appropriate.
4. Update the relevant documentation.
5. Record significant decisions in `docs/development-log.md`.

Do not make major architectural changes silently.

---

# 26. Documentation Consistency

Code and documentation must remain consistent.

If implementation changes any of the following, update the relevant documentation:

- Requirements
- Screen behavior
- Architecture
- Database schema
- API contract
- Component design
- UI design
- Roadmap

Do not leave outdated documentation behind.

---

# 27. Git

Keep commits focused.

Prefer small, meaningful commits.

Examples:

```text
feat: add project repository
feat: add project creation API
feat: add project list UI
test: add project service tests
fix: handle unauthorized project access
docs: update database design
refactor: extract project validation
```

Do not mix unrelated features in one commit.

Do not commit:

- Secrets
- `.env.local`
- Build artifacts
- Temporary files
- Debug files

---

# 28. Implementation Workflow

For a new feature, follow this workflow:

```text
1. Read requirements
        ↓
2. Read product / basic design
        ↓
3. Read relevant detail design
        ↓
4. Read architecture
        ↓
5. Read database / API / component / UI documentation
        ↓
6. Update documentation if necessary
        ↓
7. Implement
        ↓
8. Add tests
        ↓
9. Run type check
        ↓
10. Run lint
        ↓
11. Run tests
        ↓
12. Review implementation
        ↓
13. Update development log if significant
```

Do not skip directly from requirements to implementation for major features.

---

# 29. Before Finishing a Task

Before considering a task complete, verify:

- Requirements are satisfied.
- Architecture is respected.
- Types are safe.
- No `any` is used.
- Validation exists where required.
- Authorization is enforced where required.
- Tests are present and passing.
- Loading / Empty / Error states are handled.
- Responsive behavior is considered.
- Accessibility is considered.
- Documentation is up to date.
- No unnecessary dependencies were added.

---

# 30. Final Rule

When instructions conflict:

1. Follow explicit user instructions.
2. Follow project requirements.
3. Follow project architecture.
4. Follow project documentation.
5. Prefer the simplest maintainable solution.

When uncertain, do not silently invent requirements.

State the assumption and choose the safest implementation consistent with the existing architecture.
