import { LokaliseApi } from '@lokalise/node-api';
import https from 'https';
import fs from 'fs';
import unzipper from 'unzipper';
import path from 'path';

const apiKey = '734e16be07a04592870ce8847b9213ae1c601c6f';
const projectId = '7835424467bf5c965b0411.50285011';

const client = new LokaliseApi({ apiKey });

async function downloadTranslations() {
    try {
        console.log('Downloading translations...');
        const response = await client.files().download(projectId, {
            format: 'xlf',
            original_filenames: false,
            directory_prefix: '',
            filter_langs: ['fr', 'en', 'ar'],
            export_empty_as: 'base'
        });

        console.log('Response:', response);
        
        if (response.bundle_url) {
            console.log('Downloading bundle from:', response.bundle_url);
            
            https.get(response.bundle_url, (res) => {
                res.pipe(fs.createWriteStream('translations.zip'))
                   .on('finish', () => {
                       console.log('Extracting translations...');
                       fs.createReadStream('translations.zip')
                         .pipe(unzipper.Extract({ path: 'temp_translations' }))
                         .on('close', () => {
                             console.log('Moving files to correct location...');
                             
                             // Ensure src/locale exists
                             if (!fs.existsSync('src/locale')) {
                                 fs.mkdirSync('src/locale', { recursive: true });
                             }
                             
                             // Move files from temp directory to src/locale
                             const tempDir = 'temp_translations';
                             const files = fs.readdirSync(tempDir);
                             files.forEach(file => {
                                 if (file.endsWith('.xlf')) {
                                     const sourcePath = path.join(tempDir, file);
                                     const targetPath = path.join('src/locale', file);
                                     fs.renameSync(sourcePath, targetPath);
                                 }
                             });
                             
                             console.log('Cleaning up...');
                             fs.rmSync('temp_translations', { recursive: true, force: true });
                             fs.unlinkSync('translations.zip');
                             
                             // Remove old locale directory if it exists
                             const oldLocaleDir = 'src/locale/locale';
                             if (fs.existsSync(oldLocaleDir)) {
                                 fs.rmSync(oldLocaleDir, { recursive: true, force: true });
                             }
                             
                             console.log('Translations downloaded and extracted successfully!');
                         });
                   });
            });
        } else {
            throw new Error('No bundle URL in response');
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

downloadTranslations();
