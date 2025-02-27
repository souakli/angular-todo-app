import { LokaliseApi } from '@lokalise/node-api';
import fs from 'fs';

const apiKey = '734e16be07a04592870ce8847b9213ae1c601c6f';
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
            format: 'xlf'
        });

        console.log('Response:', response);
        console.log('Upload successful!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

uploadTranslations();
