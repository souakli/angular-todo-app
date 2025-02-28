import { LokaliseApi } from '@lokalise/node-api';
import fs from 'fs';

const apiKey = process.env.LOKALISE_API_KEY || '7cd9343a4ee5bd6c3d2066f4cc9eedc8e6de6388';
const projectId = '7835424467bf5c965b0411.50285011';

const client = new LokaliseApi({ apiKey });

async function uploadTranslations() {
    try {
        console.log('Starting upload process...');
        console.log('API Key:', apiKey);
        console.log('Project ID:', projectId);

        // Supprimer toutes les clés existantes du projet
        console.log('Deleting all existing keys from the project...');
        try {
            // Récupérer toutes les clés existantes
            const keys = await client.keys().list({
                project_id: projectId,
                limit: 5000 // Maximum possible
            });
            
            if (keys.items && keys.items.length > 0) {
                const keyIds = keys.items.map(key => key.key_id);
                console.log(`Found ${keyIds.length} keys to delete`);
                
                // Supprimer toutes les clés
                await client.keys().delete(projectId, keyIds);
                console.log(`Deleted ${keyIds.length} keys from the project`);
            } else {
                console.log('No keys found in the project');
            }
        } catch (deleteError) {
            console.error('Error deleting keys:', deleteError.message);
            // Continue with upload even if deletion fails
        }

        // Upload French (source) file from messages.xlf only
        const frContent = fs.readFileSync('src/locale/messages.xlf', 'base64');
        console.log('Uploading French translations from messages.xlf...');
        await client.files().upload(projectId, {
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

        console.log('Upload completed successfully');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

uploadTranslations();
