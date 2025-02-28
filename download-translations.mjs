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
        console.log('API Key:', apiKey);
        console.log('Project ID:', projectId);
        
        console.log('Requesting download from Lokalise...');
        const response = await client.files().download(projectId, {
            format: 'xlf',
            original_filenames: false,
            directory_prefix: '',
            filter_langs: ['fr', 'en', 'ar'],
            export_empty_as: 'skip',
            export_sort: 'last_updated_desc',
            replace_breaks: false,
            include_comments: false,
            include_description: false,
            include_path: false,
            indentation: '2sp',
            json_unescaped_slashes: true,
            placeholder_format: 'i18n',
            escape_percent: false,
            add_newlines: true,
            yaml_include_root: false,
            bundle_structure: '%LANG_ISO%.%FORMAT%'
        });

        console.log('Download response:', JSON.stringify(response, null, 2));
        
        if (response.bundle_url) {
            console.log('Got bundle URL:', response.bundle_url);
            
            const zipFile = fs.createWriteStream('translations.zip');
            console.log('Created write stream for translations.zip');
            
            https.get(response.bundle_url, (res) => {
                console.log('Started downloading bundle...');
                console.log('Response status:', res.statusCode);
                console.log('Response headers:', res.headers);
                
                res.pipe(zipFile);
                
                zipFile.on('finish', () => {
                    console.log('Zip file download completed');
                    zipFile.close();
                    
                    console.log('Starting extraction...');
                    fs.createReadStream('translations.zip')
                        .pipe(unzipper.Extract({ path: 'temp_translations' }))
                        .on('close', () => {
                            console.log('Extraction completed');
                            
                            // Ensure src/locale exists
                            if (!fs.existsSync('src/locale')) {
                                console.log('Creating src/locale directory');
                                fs.mkdirSync('src/locale', { recursive: true });
                            }
                            
                            // Move files from temp directory to src/locale
                            console.log('Moving files to src/locale');
                            const tempDir = path.join('temp_translations', 'locale');
                            if (fs.existsSync(tempDir)) {
                                const files = fs.readdirSync(tempDir);
                                console.log('Files in temp directory:', files);
                                
                                files.forEach(file => {
                                    if (file.endsWith('.xlf')) {
                                        const sourcePath = path.join(tempDir, file);
                                        const targetPath = path.join('src/locale', `messages.${file}`);
                                        console.log(`Moving ${sourcePath} to ${targetPath}`);
                                        fs.copyFileSync(sourcePath, targetPath);
                                    }
                                });
                            } else {
                                console.error('Locale directory not found in zip');
                            }
                            
                            console.log('Cleaning up...');
                            fs.rmSync('temp_translations', { recursive: true, force: true });
                            fs.unlinkSync('translations.zip');
                            
                            console.log('Process completed successfully!');
                        })
                        .on('error', (err) => {
                            console.error('Error during extraction:', err);
                        });
                });
            }).on('error', (err) => {
                console.error('Error downloading bundle:', err);
            });
        } else {
            throw new Error('No bundle URL in response');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

downloadTranslations();
