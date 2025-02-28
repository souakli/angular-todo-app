import { LokaliseApi } from '@lokalise/node-api';
import fs from 'fs';

const apiKey = '7cd9343a4ee5bd6c3d2066f4cc9eedc8e6de6388';
const projectId = '7835424467bf5c965b0411.50285011';

const client = new LokaliseApi({ apiKey });

async function uploadTranslations() {
    try {
        // Upload French translations
        console.log('Reading French source file...');
        const frFilePath = 'src/locale/messages.xlf';
        const frFileContent = fs.readFileSync(frFilePath, 'base64');

        console.log('Uploading French translations...');
        const frResponse = await client.files().upload(projectId, {
            data: frFileContent,
            filename: 'messages.xlf',
            lang_iso: 'fr',
            convert_placeholders: true,
            detect_icu_plurals: true,
            apply_tm: true,
            tags: ['angular'],
            format: 'xlf',
            cleanup_mode: false,
            replace_modified: true,
            skip_detect_lang_iso: false,
            use_automations: true
        });

        console.log('French upload response:', frResponse);

        // Upload Arabic translations
        console.log('Reading Arabic translation file...');
        const arFilePath = 'src/locale/messages.ar.xlf';
        const arFileContent = fs.readFileSync(arFilePath, 'base64');

        console.log('Uploading Arabic translations...');
        const arResponse = await client.files().upload(projectId, {
            data: arFileContent,
            filename: 'messages.ar.xlf',
            lang_iso: 'ar',
            convert_placeholders: true,
            detect_icu_plurals: true,
            apply_tm: true,
            tags: ['angular'],
            format: 'xlf',
            cleanup_mode: false,
            replace_modified: true,
            skip_detect_lang_iso: false,
            use_automations: true
        });

        console.log('Arabic upload response:', arResponse);
        console.log('All uploads successful!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

uploadTranslations();
