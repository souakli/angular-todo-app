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

        // Upload French (source) file from messages.xlf
        const frContent = fs.readFileSync('src/locale/messages.xlf', 'base64');
        console.log('Uploading French translations from messages.xlf...');
        await client.files().upload(projectId, {
            data: frContent,
            filename: 'messages.xlf',
            lang_iso: 'fr',
            convert_placeholders: true,
            cleanup_mode: false,
            replace_modified: false,
            skip_detect_lang_iso: true,
            replace: true
        });
        
        // Upload French translations from messages.fr.xlf if it exists
        if (fs.existsSync('src/locale/messages.fr.xlf')) {
            const frSpecificContent = fs.readFileSync('src/locale/messages.fr.xlf', 'base64');
            console.log('Uploading French translations from messages.fr.xlf...');
            await client.files().upload(projectId, {
                data: frSpecificContent,
                filename: 'messages.fr.xlf',
                lang_iso: 'fr',
                convert_placeholders: true,
                cleanup_mode: false,
                replace_modified: false,
                skip_detect_lang_iso: true,
                replace: true
            });
        }

        // Upload Arabic translations
        const arContent = fs.readFileSync('src/locale/messages.ar.xlf', 'base64');
        console.log('Uploading Arabic translations...');
        await client.files().upload(projectId, {
            data: arContent,
            filename: 'messages.ar.xlf',
            lang_iso: 'ar',
            convert_placeholders: true,
            cleanup_mode: false,
            replace_modified: false,
            skip_detect_lang_iso: true,
            replace: true
        });

        // Upload English translations
        const enContent = fs.readFileSync('src/locale/messages.en.xlf', 'base64');
        console.log('Uploading English translations...');
        await client.files().upload(projectId, {
            data: enContent,
            filename: 'messages.en.xlf',
            lang_iso: 'en',
            convert_placeholders: true,
            cleanup_mode: false,
            replace_modified: false,
            skip_detect_lang_iso: true,
            replace: true
        });

        console.log('Upload completed successfully');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

uploadTranslations();
