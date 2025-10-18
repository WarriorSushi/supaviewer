# Contributing to SupaViewer

First off, thank you for considering contributing to SupaViewer! It's people like you that make SupaViewer such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs** if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript and React styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Process

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `pnpm install`
3. **Set up environment**: Copy `.env.example` to `.env.local` and fill in your credentials
4. **Run the development server**: `pnpm dev`
5. **Make your changes** and test thoroughly
6. **Run linter**: `pnpm lint`
7. **Commit your changes** using conventional commits
8. **Push to your fork** and submit a pull request

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Follow [Conventional Commits](https://www.conventionalcommits.org/)

Examples:
```
feat: Add video search functionality
fix: Resolve rating submission bug
docs: Update README with deployment instructions
chore: Update dependencies
```

### TypeScript Styleguide

* Use TypeScript for all new code
* Define proper types/interfaces
* Avoid `any` types when possible
* Use functional components with hooks
* Follow the existing code structure

### React Styleguide

* Use functional components
* Use hooks for state management
* Keep components small and focused
* Extract reusable logic into custom hooks
* Use proper prop types

### CSS/Tailwind Styleguide

* Use Tailwind utility classes
* Follow the design system in `DESIGN_SYSTEM.md`
* Keep consistent spacing and sizing
* Use CSS variables for theme values

## Project Structure

```
supaviewer/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions
├── supabase/        # Database migrations
└── docs/            # Documentation
```

## Testing

* Write tests for new features
* Ensure all tests pass before submitting PR
* Test on multiple browsers
* Test responsive design on mobile

## Documentation

* Update README.md if needed
* Document new features
* Add JSDoc comments to functions
* Update relevant markdown files in `/docs`

## Questions?

Feel free to create an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉
