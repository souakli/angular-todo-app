# Angular Todo App with Multilingual Support

A simple Todo application built with Angular, featuring multilingual support with translations managed through Lokalise.

## Features

- Create, read, update, and delete todo items
- Multilingual support (French, English, Arabic)
- Automatic deployment to GitHub Pages
- Integration with Lokalise for translation management

## Development

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Angular CLI

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/souakli/angular-todo-app.git
   cd angular-todo-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   ng serve
   ```

4. Access the application at `http://localhost:4200/`

### Multilingual Development

This project uses Angular i18n for internationalization. The application is available in:

- French (default): `/fr/`
- English: `/en/`
- Arabic: `/ar/`

#### Translation Workflow

1. Extract translation messages:
   ```
   ng extract-i18n
   ```

2. Upload translations to Lokalise:
   ```
   LOKALISE_API_KEY=your_api_key node upload-translations.mjs
   ```

3. Download translations from Lokalise:
   ```
   LOKALISE_API_KEY=your_api_key node download-translations.mjs
   ```

4. Build the application with all languages:
   ```
   npm run build -- --localize
   ```

5. Serve the multilingual build:
   ```
   npx serve dist/angular-todo-app/browser
   ```

## Lokalise Webhook Integration

The application includes a webhook server that automatically triggers the GitHub Actions workflow when translations are updated in Lokalise.

### Setup Webhook Server

1. Install dependencies:
   ```
   npm install
   ```

2. Set environment variables:
   ```
   export GITHUB_TOKEN=your_github_token
   export LOKALISE_WEBHOOK_SECRET=your_webhook_secret
   ```

3. Start the webhook server:
   ```
   node webhook-server.js
   ```

4. Configure Lokalise webhook:
   - Go to your Lokalise project
   - Navigate to Settings > Webhooks
   - Add a new webhook with the URL of your server (e.g., `https://your-server.com/webhook`)
   - Select events: `project.translation.updated`, `project.translation.proofread`, `project.keys.added`, `project.keys.modified`
   - Add a secret key (same as `LOKALISE_WEBHOOK_SECRET`)
   - Save the webhook

### How It Works

1. When translations are updated in Lokalise, it sends a webhook notification to your server
2. The server verifies the webhook signature and triggers the GitHub Actions workflow
3. GitHub Actions downloads the latest translations, commits them to the repository, and deploys the updated application

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch or when the workflow is manually triggered.

The deployed application is available at: https://souakli.github.io/angular-todo-app/

## License

This project is licensed under the MIT License.
