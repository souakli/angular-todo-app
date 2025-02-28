import { LokaliseApi } from '@lokalise/node-api';
import https from 'https';
import fs from 'fs';
import unzipper from 'unzipper';
import path from 'path';
import { DOMParser, XMLSerializer } from 'xmldom';

const apiKey = process.env.LOKALISE_API_KEY || '7cd9343a4ee5bd6c3d2066f4cc9eedc8e6de6388';
const projectId = '7835424467bf5c965b0411.50285011';

const client = new LokaliseApi({ apiKey });

// Fonction pour extraire les IDs des trans-units d'un fichier XLF
function extractTransUnitIds(xmlContent) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    const transUnits = xmlDoc.getElementsByTagName('trans-unit');
    const ids = [];
    
    for (let i = 0; i < transUnits.length; i++) {
        const id = transUnits[i].getAttribute('id');
        if (id) {
            ids.push(id);
        }
    }
    
    return ids;
}

// Fonction pour attendre un certain temps
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadTranslations() {
    try {
        console.log('Starting download process...');
        
        // Lire le fichier source pour obtenir les IDs valides
        if (!fs.existsSync('src/locale/messages.xlf')) {
            console.error('Source file src/locale/messages.xlf not found');
            process.exit(1);
        }
        
        const sourceContent = fs.readFileSync('src/locale/messages.xlf', 'utf8');
        const validIds = extractTransUnitIds(sourceContent);
        console.log(`Found ${validIds.length} valid translation IDs in source file:`, validIds);
        
        // Vérifier les clés dans Lokalise
        console.log('Checking keys in Lokalise...');
        const keys = await client.keys().list({
            project_id: projectId,
            limit: 100
        });
        
        console.log(`Found ${keys.items.length} keys in Lokalise`);
        
        // Afficher les traductions pour chaque clé
        for (const key of keys.items) {
            console.log(`Key: ${JSON.stringify(key.key_name)}`);
            if (key.translations) {
                for (const translation of key.translations) {
                    console.log(`  ${translation.language_iso}: "${translation.translation || '<empty>'}"`);
                }
            }
        }
        
        // Attendre 5 secondes pour s'assurer que Lokalise a bien traité toutes les modifications
        console.log('Waiting 5 seconds before downloading...');
        await sleep(5000);
        
        // Forcer une exportation fraîche (non mise en cache)
        console.log('Creating a fresh export from Lokalise...');
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
                            console.log('Translations downloaded and extracted to src/locale');
                            
                            // Vérifier que les fichiers ont été téléchargés correctement
                            const files = fs.readdirSync('src/locale');
                            console.log('Files in src/locale:', files);
                            
                            // Show content of downloaded files
                            console.log('Content of downloaded Arabic translations:');
                            if (fs.existsSync('src/locale/messages.ar.xlf')) {
                                console.log(fs.readFileSync('src/locale/messages.ar.xlf', 'utf8'));
                            } else {
                                console.log('Arabic translations file not found!');
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
