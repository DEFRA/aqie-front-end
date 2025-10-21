# GitHub Copilot Instructions

This file contains specific instructions for GitHub Copilot to follow when generating code for this repository.

## General Guidelines

## - Always add a comment: `''`.

- Follow the existing coding style and conventions used in this repository.
- Use descriptive variable and function names.
- Ensure code is well-documented with inline comments where necessary.

## Specific Instructions

- For functions:
  - Make parameters optional by providing default values where applicable.
  - Use helper functions to keep the code modular and reusable.
- For regular expressions:
  - Use case-insensitive flags (`i`) where appropriate.
  - Ensure regular expressions are well-commented and easy to understand.

## Error Handling

- Always include error handling for asynchronous functions.
- Log errors using the `logger` utility provided in the project.

## Coding Standards

- **Code Formatting**:
  - Use consistent indentation (e.g., 2 spaces or 4 spaces) throughout the codebase.
  - Ensure all files are formatted using Prettier or the project's configured formatter.
  - Avoid trailing whitespace and ensure files end with a newline.

- **Naming Conventions**:
  - Use `camelCase` for variable and function names (e.g., `getUserData`).
  - Use `PascalCase` for class names (e.g., `UserController`).
  - Use `UPPER_SNAKE_CASE` for constants (e.g., `MAX_RETRY_COUNT`).
  - Use descriptive and meaningful names for variables, functions, and classes.

- **Code Structure**:
  - Keep functions small and focused on a single responsibility.
  - Group related functions and constants together for better readability.
  - Avoid deeply nested code; refactor into smaller functions where necessary.

- **Comments**:
  - Add comments to explain the purpose of complex logic or algorithms.
  - Use `TODO` comments to highlight areas that need further work or improvement.
  - Avoid redundant comments that simply restate the code.

- **Error Handling**:
  - Always handle errors gracefully and provide meaningful error messages.
  - Use `try-catch` blocks for asynchronous functions and log errors using the `logger` utility.

- **Security**:
  - Avoid hardcoding sensitive information (e.g., API keys, passwords) in the codebase.
  - Use environment variables for sensitive data and configuration.

- **Testing**:
  - Write unit tests for all new functions and features.
  - Ensure test coverage meets the project's requirements (e.g., 90% or higher).
  - Use meaningful test descriptions and organize tests logically.

- **Version Control**:
  - Commit code frequently with clear and descriptive commit messages.
  - Follow the project's branching strategy (e.g., `feature/`, `bugfix/`, `hotfix/` branches).
  - Avoid committing large, unrelated changes in a single commit.

- **Dependencies**:
  - Use only necessary dependencies and keep them up to date.
  - Avoid using deprecated or unmaintained libraries.
  - Lock dependency versions to prevent unexpected changes.

- **Performance**:
  - Optimize code for readability first, then for performance if necessary.
  - Avoid premature optimization unless performance is a known bottleneck.
  - Use efficient algorithms and data structures where applicable.

- **Code Reviews**:
  - Ensure all code changes are reviewed by at least one team member before merging.
  - Address all feedback from code reviews before finalizing changes.
  - Use pull requests to document and discuss changes.
