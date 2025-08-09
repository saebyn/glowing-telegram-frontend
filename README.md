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

## Deployment

### Frontend Version Management
The deployment workflow supports dynamic version switching through a version info system:

#### How it works
1. The `publish.yml` GitHub Actions workflow deploys each release to a versioned folder in S3: `s3://bucket/v1.2.3/`
2. After successful deployment, a `config/version.json` file is created and uploaded to `s3://bucket/config/version.json`
3. The version file contains the currently active version: `{"currentVersion":"v1.2.3"}`

#### Deploying a new version
1. Go to the "Actions" tab in GitHub
2. Select "Publish to s3" workflow
3. Click "Run workflow"
4. Enter the release version (e.g., `v1.2.3`) and select the environment
5. The workflow will build, deploy, and update the version info automatically

#### Rolling back to a previous version
To rollback without redeploying:
1. Manually update the `config/version.json` file in S3 to point to the desired version
2. Example: Change `{"currentVersion":"v1.2.3"}` to `{"currentVersion":"v1.2.2"}`
3. CloudFront will serve the previous version immediately

#### Benefits
- Instant version switching without infrastructure changes
- Simple rollback mechanism
- Prepares for advanced deployment strategies (A/B testing, canary deployments)

## Contributing
1. Fork the repository and create a new branch.
2. Commit changes with clear messages.
3. Open a pull request for review.

## License
This project is licensed under the AGPL-3.0-only. Please see the LICENSE file for more details.
