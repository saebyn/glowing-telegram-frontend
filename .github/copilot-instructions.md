# Glowing Telegram Frontend

Always follow these instructions and only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.

The Glowing Telegram Frontend is a React 19 + TypeScript + Vite web application for managing live streams, stream recordings, and editing episodes from stream recordings into YouTube videos. Built with React Admin, Material UI, MSW for API mocking, Vitest for testing, Storybook for component documentation, and Biome for linting/formatting.

## Working Effectively

### Essential Setup Commands
Run these commands in sequence for initial setup:
- `npm install` -- Install dependencies. Takes 1-2 minutes. NEVER CANCEL. Set timeout to 180+ seconds.
- `cp .env.defaults .env` -- Set up environment configuration for local development
- `npm run typecheck` -- Validate TypeScript compilation. Takes 6-10 seconds.
- `npm run biome:ci` -- Run linting/formatting checks. Takes <1 second. Note: Warnings about `any` types are expected.

### Build and Test Commands
- `npm run build` -- Build for production. Takes 15-20 seconds. NEVER CANCEL. Set timeout to 300+ seconds.
- `npm test` -- Run unit tests with Vitest. Takes 2-3 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- `npm run test:ui` -- Run tests with interactive UI

### Development Server
- `npm run start` -- Start development server on http://localhost:5173. Takes <1 second to start. NEVER CANCEL.
- `npm run serve` -- Preview production build on http://localhost:4173

### Storybook
- `npm run storybook` -- Start Storybook on http://localhost:6006. Takes 5-10 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- `npm run build-storybook` -- Build static Storybook. Takes 15-20 seconds. NEVER CANCEL. Set timeout to 300+ seconds.

### Code Quality
- `npm run lint` -- Run Biome linting only
- `npm run lint:fix` -- Auto-fix linting issues
- `npm run format` -- Format code with Biome (includes linting)
- **ALWAYS** run `npm run format` before committing changes or CI will fail

## Validation and Testing

### Manual Validation Requirements
After making changes, ALWAYS run through these validation steps:
1. **Build validation**: Run `npm run build` and ensure it completes successfully
2. **Test validation**: Run `npm test` and ensure all tests pass
3. **Format validation**: Run `npm run format` to ensure code style compliance
4. **Application validation**: Start the dev server with `npm run start` and test actual functionality

### Required User Scenarios to Test
When making changes, test these complete user flows:
1. **Navigation flow**: Navigate between Series, Streams, Episodes, Video clips, and Twitch Streams pages
2. **Stream Manager**: Click "Stream Manager" button to access stream management interface
3. **Calendar view**: Test the calendar interface on the Streams page
4. **Create flows**: Test "Create" buttons on list pages
5. **Filter functionality**: Apply and clear filters on list pages to verify filter persistence

### Component Testing with Storybook
- Always test UI component changes in Storybook
- Run `npm run storybook` and verify components render correctly
- Test component interactions and variations

## Expected Issues and Workarounds

### Authentication Errors (Expected)
The application shows authentication errors in development mode because:
- It tries to connect to AWS Cognito with placeholder credentials from `.env.defaults`
- This results in "User not found" and "Failed to fetch" errors
- **This is normal behavior** - the app uses MSW mocks for API data in development

### Build Warnings (Expected)
- Vite warns about large chunks (>500KB) - this is normal for a React Admin application
- Biome shows warnings about `any` types - these are in progress and don't break functionality
- Storybook may warn about missing addons - these are optional

## Repository Structure

### Key Directories
- `/src`: Main application code
  - `/components`: Reusable components organized by atomic design (atoms, molecules, organisms, pages, templates)
  - `/resources`: React Admin resource configurations (series, streams, episodes, video_clips, twitch)
  - `/ra`: React Admin configuration (data provider, auth provider, store)
  - `/mocks`: MSW service worker for API mocking
  - `/hooks`: Custom React hooks
  - `/utilities`: Helper functions
  - `/scheduling`: Stream scheduling logic
  - `/widgets`: Dashboard widgets
- `/public`: Static assets
- `/.storybook`: Storybook configuration
- `/.github/workflows`: CI/CD pipelines

### Important Files
- `package.json`: Scripts and dependencies
- `vite.config.ts`: Vite build configuration
- `biome.json`: Linting and formatting rules
- `tsconfig.json`: TypeScript configuration
- `.env.defaults`: Example environment variables (copy to `.env`)

## CI/CD Pipeline

### GitHub Actions
The repository uses two main workflows:
1. **unittest.yml**: Runs on push/PR to main
   - Node.js 22
   - `npm ci` (install dependencies)
   - `npm run biome:ci` (linting/formatting)
   - `npm run build` (build validation)
   - `npm test` (unit tests)

2. **publish.yml**: Manual deployment workflow
   - Builds application with production environment variables
   - Deploys to AWS S3

### Pre-commit Validation
Before committing changes, ALWAYS run:
1. `npm run format` -- Ensures code style compliance
2. `npm run build` -- Ensures production build works
3. `npm test` -- Ensures all tests pass

## Common Tasks

### Adding New Components
1. Create component in appropriate `/src/components/` subdirectory
2. Add Storybook story if it's a reusable component
3. Add tests if complex logic is involved
4. Run `npm run format` before committing

### Working with React Admin Resources
- Resource configurations are in `/src/resources/`
- Each resource has List, Create, Edit, and Show components
- Data provider is in `/src/ra/dataProvider/`
- Authentication provider is in `/src/ra/authProvider.ts`

### API Mocking
- MSW handlers are in `/src/mocks/handlers/`
- Set `VITE_MOCKS_ENABLED=true` in `.env` to enable mocking (default in development)
- API base URL is configurable via `VITE_API_URL`

### Environment Configuration
Required environment variables (see `.env.defaults` for examples):
- `VITE_API_URL`: Backend API URL
- `VITE_WEBSOCKET_URL`: WebSocket URL for real-time updates
- `VITE_MOCKS_ENABLED`: Enable/disable MSW mocking
- AWS Cognito variables for authentication
- Twitch API variables for stream integration

## Timing Expectations

### Command Execution Times
- `npm install`: 60-90 seconds
- `npm run build`: 15-20 seconds
- `npm test`: 2-3 seconds
- `npm run storybook`: 5-10 seconds (startup)
- `npm run build-storybook`: 15-20 seconds
- `npm run typecheck`: 6-10 seconds
- `npm run biome:ci`: <1 second

### CRITICAL: Timeout Settings
Always use these minimum timeout values:
- Install commands: 180+ seconds
- Build commands: 300+ seconds
- Test commands: 120+ seconds
- **NEVER CANCEL** long-running operations - they complete successfully

## Node.js Version Requirements
- **Required**: Node.js 20.x or higher (CI uses Node.js 22)
- **Package Manager**: npm (included with Node.js)
- Check versions: `node --version && npm --version`

## Filter Persistence Testing
The application includes comprehensive filter persistence that saves user filter choices in localStorage. To test:
1. Navigate to any list page (Series, Streams, Episodes, Video clips)
2. Apply various filters (search, dropdowns, dates)
3. Refresh the page
4. Verify all filter values are restored correctly

See `/src/ra/FILTER_PERSISTENCE_TESTING.md` for detailed testing procedures.