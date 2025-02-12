# glowing-telegram-frontend

## Introduction
This is the web frontend for the Glowing Telegram project, designed to manage and schedule live streams, manage stream recordings, and edit episodes from the stream recordings into YouTube videos.

## Quick Start
1. Clone the repository.
1. Install dependencies: `npm install`
1. Copy the example environment configuration: `cp .env.defaults .env`
1. Update the environment configuration with your settings.
1. Start development server: `npm run start`
1. Visit http://localhost:5173 in your browser.

## Usage
1. Run tests: `npm test`
2. Launch Storybook for UI components: `npm run storybook`
3. Build project for production: `npm run build`

## Tooling & Libraries
- React Admin for data-driven pages
- React Router for routing
- Material UI for components
- MSW for mocking API requests
- Vitest for testing
- Storybook for UI component documentation
- Biome for formatting and linting

## Project Structure
- /src: application code
  - /resources: React Admin resources
  - /components: shared components
  - /hooks: custom hooks
  - /mocks: MSW service worker mocking setup
- /public: static assets
- package.json: scripts and dependencies
- .env.defaults: example environment configuration

## Contributing
1. Fork the repository and create a new branch.
2. Commit changes with clear messages.
3. Open a pull request for review.

## License
This project is licensed under the AGPL-3.0-only. Please see the LICENSE file for more details.
