# Finsyghts Development Guidelines

## Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build and typecheck project
- `npm run test` - Run all tests
- `npm run test -- path/to/test.ts` - Run a specific test
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run check` - Format and lint fix

## Code Style

- **TypeScript**: Strict mode, no unused locals/parameters
- **Formatting**: No semicolons, single quotes, trailing commas
- **Imports**: Group by external/internal, use path alias `@/`
- **Components**: Functional components with explicit typing
- **CSS**: Use Tailwind with `cn()` utility for class merging
- **Error Handling**: No console.log (only warn/error allowed)
- **Naming**: PascalCase for components, camelCase for functions/variables
- **File Structure**: Group related components in `-ui` folders
- **Forms**: Use TanStack Form with Zod validation
- **State**: Use Zustand/React Query for state management
- **Testing**: Use Vitest and React Testing Library
