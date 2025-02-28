import { LokaliseApi } from '@lokalise/node-api';
import https from 'https';
import fs from 'fs';
import unzipper from 'unzipper';
import path from 'path';

const apiKey = '7cd9343a4ee5bd6c3d2066f4cc9eedc8e6de6388';
const projectId = '7835424467bf5c965b0411.50285011';

const client = new LokaliseApi({ apiKey });

async function downloadTranslations() {
    try {
        console.log('Starting download process...');
        
        const response = await client.files().download(projectId, {
            format: 'xlf',
            original_filenames: false,
            directory_prefix: '',
            filter_langs: ['fr', 'en', 'ar'],
            export_empty_as: 'skip',
            replace_breaks: false,
            include_comments: false,
            include_description: false,
            include_path: false,
            indentation: '2sp',
            placeholder_format: 'i18n',
            escape_percent: false,
            add_newlines: true,
            bundle_structure: 'messages.%LANG_ISO%.%FORMAT%'
        });

        console.log('Got bundle URL:', response.bundle_url);
        
        if (response.bundle_url) {
            const zipFile = fs.createWriteStream('translations.zip');
            
            https.get(response.bundle_url, (res) => {
                res.pipe(zipFile);
                
                zipFile.on('finish', () => {
                    zipFile.close();
                    
                    fs.createReadStream('translations.zip')
                        .pipe(unzipper.Extract({ path: 'src/locale' }))
                        .on('close', () => {
                            console.log('Translations downloaded and extracted to src/locale');
                            
                            // Rename messages.fr.xlf to messages.xlf if needed
                            if (fs.existsSync('src/locale/messages.fr.xlf') && !fs.existsSync('src/locale/messages.xlf')) {
                                fs.copyFileSync('src/locale/messages.fr.xlf', 'src/locale/messages.xlf');
                                console.log('Copied messages.fr.xlf to messages.xlf');
                            }
                            
                            // Show content of downloaded files
                            console.log('Content of downloaded French translations:');
                            if (fs.existsSync('src/locale/messages.fr.xlf')) {
                                console.log(fs.readFileSync('src/locale/messages.fr.xlf', 'utf8'));
                            }
                            
                            console.log('Content of downloaded Arabic translations:');
                            if (fs.existsSync('src/locale/messages.ar.xlf')) {
                                console.log(fs.readFileSync('src/locale/messages.ar.xlf', 'utf8'));
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

downloadTranslations();
