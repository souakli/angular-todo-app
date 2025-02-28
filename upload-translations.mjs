import { LokaliseApi } from '@lokalise/node-api';
import fs from 'fs';

const apiKey = process.env.LOKALISE_API_KEY || '7cd9343a4ee5bd6c3d2066f4cc9eedc8e6de6388';
const projectId = '7835424467bf5c965b0411.50285011';

// Vérification de la clé API
if (!apiKey) {
    console.error('LOKALISE_API_KEY environment variable is not set or empty');
    process.exit(1);
}

console.log('Initializing Lokalise API client with API key length:', apiKey ? apiKey.length : 0);
const client = new LokaliseApi({ apiKey });

async function uploadTranslations() {
    try {
        console.log('Starting upload process...');
        console.log('API Key:', apiKey);
        console.log('Project ID:', projectId);

        // Vérifier que le fichier source existe
        if (!fs.existsSync('src/locale/messages.xlf')) {
            console.error('Source file src/locale/messages.xlf not found');
            process.exit(1);
        }
        
        // Supprimer d'abord toutes les clés existantes
        console.log('Deleting all existing keys in Lokalise...');
        try {
            const keys = await client.keys().list({
                project_id: projectId,
                limit: 5000
            });
            
            if (keys.items && keys.items.length > 0) {
                console.log(`Found ${keys.items.length} keys to delete`);
                
                // Récupérer tous les IDs de clés
                const keyIds = keys.items.map(key => key.key_id);
                
                // Supprimer les clés
                await client.keys().delete(projectId, {
                    keys: keyIds
                });
                
                console.log(`Deleted ${keyIds.length} keys from Lokalise`);
            } else {
                console.log('No keys found to delete');
            }
        } catch (error) {
            console.error('Error deleting keys:', error.message);
            // Continuer malgré l'erreur
        }
        
        // Uploader le fichier source
        console.log('Uploading source file to Lokalise...');
        const frContent = fs.readFileSync('src/locale/messages.xlf', 'base64');
        
        const uploadResponse = await client.files().upload(projectId, {
            data: frContent,
            filename: 'messages.xlf',
            lang_iso: 'fr',
            convert_placeholders: true,
            cleanup_mode: true, 
            replace_modified: true, 
            skip_detect_lang_iso: true,
            replace: true, 
            delete_keys: true, 
            detect_icu_plurals: true,
            apply_tm: false 
        });
        
        console.log('Upload response:', uploadResponse);
        console.log('Source file uploaded to Lokalise');
        console.log('Upload completed successfully');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

uploadTranslations();
