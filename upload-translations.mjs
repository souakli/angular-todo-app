import { LokaliseApi } from '@lokalise/node-api';
import fs from 'fs';

const apiKey = '7cd9343a4ee5bd6c3d2066f4cc9eedc8e6de6388';
const projectId = '7835424467bf5c965b0411.50285011';

const client = new LokaliseApi({ apiKey });

async function uploadTranslations() {
    try {
        console.log('Reading source file...');
        const filePath = 'src/locale/messages.xlf';
        const fileContent = fs.readFileSync(filePath, 'base64');

        console.log('Uploading translations...');
        const response = await client.files().upload(projectId, {
            data: fileContent,
            filename: 'messages.xlf',
            lang_iso: 'fr',
            convert_placeholders: true,
            detect_icu_plurals: true,
            apply_tm: true,
            tags: ['angular'],
            format: 'xlf',
            cleanup_mode: true,
            replace_modified: true,
            skip_detect_lang_iso: false,
            use_automations: true
        });

        console.log('Response:', response);
        console.log('Upload successful!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

uploadTranslations();
