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

L'application est configurée pour se mettre à jour automatiquement lorsque des traductions sont modifiées dans Lokalise, grâce à l'intégration des webhooks Lokalise avec GitHub Actions.

### Configuration du webhook Lokalise vers GitHub

1. **Créer un token d'accès personnel GitHub**:
   - Allez dans vos paramètres GitHub > Developer settings > Personal access tokens
   - Générez un nouveau token avec les permissions `repo`
   - Copiez ce token, vous en aurez besoin pour configurer le webhook

2. **Configurer le webhook dans Lokalise**:
   - Dans votre projet Lokalise, allez dans Settings > Webhooks
   - Ajoutez un nouveau webhook avec les paramètres suivants:
     - URL: `https://api.github.com/repos/souakli/angular-todo-app/dispatches`
     - Méthode: POST
     - Format: JSON
     - Headers:
       ```
       Accept: application/vnd.github.v3+json
       Authorization: token YOUR_GITHUB_TOKEN
       ```
       (Remplacez YOUR_GITHUB_TOKEN par votre token personnel GitHub)
     - Corps de la requête:
       ```json
       {
         "event_type": "lokalise-translation-updated",
         "client_payload": {
           "source": "lokalise-webhook",
           "event": "{{event}}",
           "project_id": "{{project_id}}"
         }
       }
       ```
     - Événements à surveiller: `project.translation.updated`, `project.translation.proofread`, `project.keys.added`, `project.keys.modified`

3. **Ajouter le secret Lokalise API Key dans GitHub**:
   - Allez dans les paramètres de votre dépôt GitHub
   - Cliquez sur Secrets and variables > Actions
   - Ajoutez un nouveau secret nommé `LOKALISE_API_KEY` avec votre clé API Lokalise

### Comment ça fonctionne

1. Quand une traduction est mise à jour dans Lokalise, un webhook est envoyé à GitHub
2. GitHub Actions reçoit cet événement et déclenche le workflow `Build and Deploy Multilingual App`
3. Le workflow télécharge les dernières traductions depuis Lokalise
4. Les traductions sont committées dans le dépôt
5. L'application est reconstruite avec les nouvelles traductions
6. L'application mise à jour est déployée sur GitHub Pages

Avec cette configuration, vos traductions sont toujours à jour sans aucune intervention manuelle !

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch or when the workflow is manually triggered.

The deployed application is available at: https://souakli.github.io/angular-todo-app/

## License

This project is licensed under the MIT License.
