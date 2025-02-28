import { LokaliseApi } from '@lokalise/node-api';
import https from 'https';
import fs from 'fs';
import unzipper from 'unzipper';

// Configuration
// Pour le développement local, vous pouvez définir une clé API par défaut ici
// ATTENTION: Ne jamais commit cette clé dans le dépôt public
const DEFAULT_API_KEY = ''; // Laissez vide pour la production
const apiKey = process.env.LOKALISE_API_KEY || DEFAULT_API_KEY;
const projectId = '7835424467bf5c965b0411.50285011';

// Vérification de la clé API
if (!apiKey) {
    console.error('ERREUR: La variable d\'environnement LOKALISE_API_KEY n\'est pas définie ou est vide.');
    console.error('Veuillez définir cette variable dans les secrets GitHub de votre dépôt:');
    console.error('1. Allez sur GitHub et accédez à votre dépôt angular-todo-app');
    console.error('2. Cliquez sur "Settings" (Paramètres)');
    console.error('3. Dans le menu de gauche, cliquez sur "Secrets and variables" puis "Actions"');
    console.error('4. Cliquez sur "New repository secret"');
    console.error('5. Nom: LOKALISE_API_KEY');
    console.error('6. Valeur: Votre clé API Lokalise');
    console.error('7. Cliquez sur "Add secret"');
    console.error('');
    console.error('Pour le développement local, vous pouvez également définir cette variable d\'environnement:');
    console.error('- Windows (PowerShell): $env:LOKALISE_API_KEY="votre_clé_api"');
    console.error('- Windows (CMD): set LOKALISE_API_KEY=votre_clé_api');
    console.error('- Linux/macOS: export LOKALISE_API_KEY="votre_clé_api"');
    process.exit(1);
}

console.log('Initializing Lokalise API client with API key length:', apiKey ? apiKey.length : 0);
const client = new LokaliseApi({ apiKey });

async function downloadFreshTranslations() {
    try {
        console.log('Starting fresh download process...');
        
        // Forcer une exportation fraîche (non mise en cache)
        console.log('Creating a fresh export from Lokalise with no cache...');
        const exportResponse = await client.files().download(projectId, {
            format: 'xlf',
            original_filenames: false,
            directory_prefix: '',
            filter_langs: ['fr', 'en', 'ar'],
            export_empty_as: 'empty',
            replace_breaks: false,
            include_comments: false,
            include_description: false,
            include_path: false,
            indentation: '2sp',
            placeholder_format: 'i18n',
            escape_percent: false,
            add_newlines: true,
            bundle_structure: 'messages.%LANG_ISO%.%FORMAT%',
            use_cache: false, // Ne pas utiliser le cache
            export_sort: 'first_added' // Trier par ordre d'ajout
        });

        console.log('Got bundle URL:', exportResponse.bundle_url);
        
        if (exportResponse.bundle_url) {
            const zipFile = fs.createWriteStream('translations.zip');
            
            https.get(exportResponse.bundle_url, (res) => {
                res.pipe(zipFile);
                
                zipFile.on('finish', () => {
                    zipFile.close();
                    
                    fs.createReadStream('translations.zip')
                        .pipe(unzipper.Extract({ path: 'src/locale' }))
                        .on('close', () => {
                            console.log('Fresh translations downloaded and extracted to src/locale');
                            
                            // Vérifier que les fichiers ont été téléchargés correctement
                            const files = fs.readdirSync('src/locale');
                            console.log('Files in src/locale:', files);
                            
                            // Afficher le contenu des fichiers téléchargés
                            if (fs.existsSync('src/locale/messages.ar.xlf')) {
                                console.log('Arabic translations downloaded successfully');
                            } else {
                                console.log('Arabic translations file not found!');
                            }
                            
                            if (fs.existsSync('src/locale/messages.en.xlf')) {
                                console.log('English translations downloaded successfully');
                            } else {
                                console.log('English translations file not found!');
                            }
                            
                            fs.unlink('translations.zip', () => {});
                        });
                });
            }).on('error', (err) => {
                console.error('Error downloading translations:', err.message);
                process.exit(1);
            });
        } else {
            console.error('No bundle URL returned');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

downloadFreshTranslations();
