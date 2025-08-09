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

This project uses GitHub Actions for automated deployment to AWS S3. Deployments are manually triggered and support multiple environments.

### How to Deploy

1. **Navigate to GitHub Actions**: Go to the repository's Actions tab on GitHub
2. **Select Workflow**: Choose "Publish to s3" workflow  
3. **Trigger Deployment**: Click "Run workflow" and provide:
   - **Release version**: Semantic version number (e.g., `1.2.3`)
   - **Environment**: Target environment name (configured in GitHub repository settings)

### Prerequisites

Before deploying, ensure the following are configured in GitHub:

#### Repository Environments
- Environments must be configured in GitHub repository settings
- Each environment should have the required variables and secrets

#### Required Environment Variables
Each deployment environment needs these variables configured:
- `API_URL`: Backend API endpoint URL
- `AWS_REGION`: AWS region for deployment (e.g., `us-west-2`)
- `AWS_ROLE_ARN`: IAM role ARN for AWS authentication
- `BUCKET_NAME`: S3 bucket name for deployment
- `COGNITO_CLIENT_ID`: AWS Cognito client ID
- `COGNITO_USER_POOL_ID`: AWS Cognito user pool ID  
- `COGNITO_DOMAIN`: AWS Cognito domain
- `LOGOUT_URI`: Logout redirect URI
- `REDIRECT_URI`: Authentication redirect URI
- `TWITCH_CLIENT_ID`: Twitch API client ID
- `WEBSOCKET_URL`: WebSocket endpoint URL
- `CONTENT_URL`: Content delivery URL

### Deployment Process

The deployment workflow performs these steps:

1. **Setup**: Checks out code and sets up Node.js 22
2. **Dependencies**: Installs dependencies with `npm ci`
3. **Build**: Builds the application with environment-specific configuration
4. **AWS Setup**: Configures AWS credentials using the provided IAM role
5. **Deploy**: Syncs the built files to the specified S3 bucket under the release version path

### Release Versioning

- Use semantic versioning (e.g., `1.0.0`, `1.2.3-beta.1`)
- Each release is deployed to a separate path in S3: `s3://bucket-name/release-version/`
- This allows for easy rollbacks and multiple version hosting

### Local Build Testing

Before deploying, test the production build locally:

```bash
npm run build
npm run serve
```

Visit http://localhost:4173 to verify the production build works correctly.

## Contributing
1. Fork the repository and create a new branch.
2. Commit changes with clear messages.
3. Open a pull request for review.

## License
This project is licensed under the AGPL-3.0-only. Please see the LICENSE file for more details.
