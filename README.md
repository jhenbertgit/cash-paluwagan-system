# Project Onboarding Guide

Welcome to the [Next.js](https://nextjs.org) project! This guide will help you set up your development environment and get started quickly.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 14.x or later
- **pnpm**: Version 6.x or later
- **Git**: For version control

## Setup Instructions

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Switch to the Development Branch:**

   ```bash
   git checkout development
   ```

3. **Pull the Latest Development Resources:**

   ```bash
   git pull origin development
   ```

4. **Install Dependencies:**

   Using pnpm:

   ```bash
   pnpm install
   ```

5. **Environment Variables:**

   Copy the example environment file to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Alternatively, you can copy it to `.env`:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env.local` or `.env` file to add the necessary environment variables.

6. **Run the Development Server:**

   Using pnpm:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Development Workflow

- **Code Structure:**

  - `src/app`: Contains the main application logic and components.
  - `src/lib`: Contains utility functions and actions.
  - `public`: Static assets like images and fonts.

- **Linting and Formatting:**
  - Ensure your code adheres to the project's linting rules by running:
    ```bash
    pnpm lint
    ```

## Commit Guidelines

To maintain a clean and understandable project history, please follow these commit message guidelines:

- **Use Conventional Commits:** Start with a type like `feat`, `fix`, `chore`, etc.
- **Use the Present Tense:** "Add feature" not "Added feature".
- **Use the Imperative Mood:** "Move cursor to..." not "Moves cursor to...".
- **Keep Messages Short and Descriptive:** Aim for 50 characters or less for the subject line.
- **Separate Subject from Body with a Blank Line:** If you need to provide more detail, add a body after a blank line.
- **Reference Issues and Pull Requests:** Use `#` followed by the issue or PR number.
- **Example Commit Message:**
  ```
  feat: Add user authentication feature

  - Short description here
  - Implement login and logout functionality
  - Integrate with Clerk for user management
  - Closes #123
  ```

## Deployment

Deploy your application using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). Follow the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

For any questions or issues, feel free to reach out to the project maintainers.

Happy coding!
