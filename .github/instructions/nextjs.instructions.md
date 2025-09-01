--- 

applyTo: '**' 

---

## General Principles

- **Clean Code:** Prioritize readability, maintainability, and reusability.
- **Conciseness:** Favor concise yet expressive code.
- **Descriptive Naming:** Use clear, descriptive names for variables, functions, components, and files (e.g., `getUserProfile`, `ProductCard`, `useAuth`).
- **DRY (Don't Repeat Yourself):** Extract reusable logic into functions, custom hooks, or components.
- **Modularization:** Break features into small, independent units (components, hooks, utilities, services).
- **TypeScript First:** All new code must be written in **TypeScript** with `strict: true` enabled.
- **Testable Code:** Write code that can be tested easily (unit and integration).
- **Package Management:** Use **bun** for dependencies and scripts. Do not use `npm` or `yarn`.
- **Documentation:** Document core concepts inside the `docs/` folder.

### General Guidelines

- Co-locate logic that changes together.
- Group code by **feature**, not by type.
- Separate **UI, logic, and data fetching**.
- Types must be consistent across **DB → server → client**.
- Clear distinction between **business logic** and **infrastructure code**.
- Code should be easy to replace and delete.
- Extending features should require minimal changes across files.
- Each function/API does one thing well and at a single level of abstraction.
- Keep public APIs minimal — expose only what’s necessary.
- Prefer pure functions (easy to test, reason about).
- Long, explicit names > short, vague names.

---

## React Specific Guidelines

### Component Design

- **Functional Components & Hooks only.** Avoid class components unless for error boundaries.
- **Single Responsibility:** Each component should handle one concern.
- **Naming:** Components use `PascalCase`; props use `camelCase`.
- **Props:**
  - Destructure props in function signatures.
  - Define all props with TypeScript interfaces/types.
- **Immutability:** Never mutate props/state directly.
- **Fragments:** Use `<>...</>` to avoid unnecessary wrappers.
- **Custom Hooks:** Extract reusable logic (`useDebounce`, `useLocalStorage`, etc.).
- **UI Components:** Use [shadcn/ui](https://ui.shadcn.com/) for consistency and accessibility.

### State Management

- **Local state:** `useState` / `useReducer`.
- **Global state:** Prefer **Context API** or a light state library (Zustand, Jotai). Use Redux only if complexity demands it.
- For async remote data, prefer **SWR** or **React Query** with caching and invalidation.

### Styling

- Use **Tailwind CSS v4+** for styling.
- Keep styles scoped and consistent.

### Performance

- **Keys:** Always use stable, unique keys when mapping lists (avoid indexes unless static).
- **Memoization:**
  - Use `React.memo` for components that re-render unnecessarily.
  - Use `useMemo` for **expensive computations** or **derived values**.
  - Use `useCallback` when passing stable callbacks to children or dependency arrays.
  - **Do not overuse memoization** — apply only when profiling shows a real issue.
- **Lazy Loading:** Use `React.lazy`, `Suspense`, and `next/dynamic` for code-splitting.

---

## Next.js Specific Guidelines

### Data Fetching & Rendering

- **App Router by default.** Avoid Pages Router for new features.
- **Server Components first:** Fetch data inside async Server Components (App Router) for performance and security.
- **Data Fetching Strategies:**
  - Rarely changing data → `fetch` with `revalidate`.
  - Frequently changing data → server-side fetch (`cache: "no-store"`).
  - Client-side fetch only for truly user-specific data after hydration.
- **Parallel Fetching:** Initiate independent requests in parallel.

### Routing

- Use **file-based routing** (App Router).
- Use **Route Groups** `(folderName)` to organize without affecting URL.
- Use **Dynamic Segments** `[slug]` with clear type definitions.
- Add `middleware.ts` for auth, redirects, or global checks.

### Optimization

- **Images:** Always use `next/image`.
- **Fonts:** Use `next/font` instead of external CDNs.
- **Dynamic Imports:** Use `next/dynamic` for large, rarely used components.
- **Streaming & Edge:** Prefer edge rendering and streaming for performance-sensitive routes.
- **Progressive/Selective Hydration:** Use islands architecture and hydrate only critical parts first.

### Project Structure
./src/...
../app
../components
../features
../hooks
../lib
../services
../types
../docs


- Co-locate related files (components, styles, tests).
- Put reusable, non-component-specific code in `/lib`.
- Use `_lib`, `_components` folders for private, non-routable modules.
- **No barrel files.** Import directly to avoid circular dependencies.

### SEO & Accessibility

- Use `generateMetadata` (App Router) for SEO.
- Always write semantic HTML.
- Add ARIA attributes and ensure keyboard navigation.

### TypeScript

- Always in **strict mode**.
- Put shared types in `/types` with descriptive filenames (`user.ts`, `post.ts`).
- Do not define interfaces/types inside component files.

---

## Example of Expected Copilot Responses

- **Prompt:** `// Create a React button component`
- **Output:**  
  A small functional component with `PascalCase`, `React.FC<Props>`, prop destructuring, typed props, and clean event handling.

- **Prompt:** `// Implement a Next.js API route for products`
- **Output:**  
  An async route handler (`app/api/products/route.ts`) with server-side data fetching, error handling, and reusable helpers in `/lib`.

- **Prompt:** `// Refactor form component to use validation hook`
- **Output:**  
  A new `useFormValidation.ts` hook in `/hooks`, and the form component updated to use it. Validation rules extracted into `/lib/validation.ts`.

---
