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

// Fonction pour filtrer un fichier XLF et ne garder que les trans-units avec des IDs valides
function filterXlfByValidIds(xmlContent, validIds) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    const transUnits = xmlDoc.getElementsByTagName('trans-unit');
    let removedCount = 0;
    
    // Parcourir les trans-units et supprimer ceux qui n'ont pas d'ID valide
    for (let i = transUnits.length - 1; i >= 0; i--) {
        const id = transUnits[i].getAttribute('id');
        if (!validIds.includes(id)) {
            console.log(`Removing trans-unit with ID ${id} as it's not in the source file`);
            transUnits[i].parentNode.removeChild(transUnits[i]);
            removedCount++;
        }
    }
    
    console.log(`Removed ${removedCount} invalid trans-units`);
    
    // Convertir le document XML en chaîne
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
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
        
        // Vérifier d'abord si les clés dans Lokalise correspondent aux clés valides
        try {
            const keys = await client.keys().list({
                project_id: projectId,
                limit: 5000
            });
            
            if (keys.items && keys.items.length > 0) {
                const lokaliseKeyIds = keys.items.map(key => key.key_name);
                console.log(`Found ${lokaliseKeyIds.length} keys in Lokalise:`, lokaliseKeyIds);
                
                // Vérifier si toutes les clés Lokalise sont valides
                const invalidKeys = lokaliseKeyIds.filter(id => !validIds.includes(id));
                if (invalidKeys.length > 0) {
                    console.log(`⚠️ WARNING: Found ${invalidKeys.length} invalid keys in Lokalise:`, invalidKeys);
                } else {
                    console.log('✅ All keys in Lokalise are valid');
                }
            } else {
                console.log('No keys found in Lokalise');
            }
        } catch (error) {
            console.error('Error checking Lokalise keys:', error.message);
        }
        
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
                        .pipe(unzipper.Extract({ path: 'src/locale-temp' }))
                        .on('close', () => {
                            console.log('Translations downloaded and extracted to src/locale-temp');
                            
                            // Filtrer les fichiers téléchargés
                            if (fs.existsSync('src/locale-temp/messages.ar.xlf')) {
                                const arContent = fs.readFileSync('src/locale-temp/messages.ar.xlf', 'utf8');
                                const filteredArContent = filterXlfByValidIds(arContent, validIds);
                                fs.writeFileSync('src/locale/messages.ar.xlf', filteredArContent);
                                console.log('Filtered Arabic translations saved to src/locale/messages.ar.xlf');
                            }
                            
                            if (fs.existsSync('src/locale-temp/messages.en.xlf')) {
                                const enContent = fs.readFileSync('src/locale-temp/messages.en.xlf', 'utf8');
                                const filteredEnContent = filterXlfByValidIds(enContent, validIds);
                                fs.writeFileSync('src/locale/messages.en.xlf', filteredEnContent);
                                console.log('Filtered English translations saved to src/locale/messages.en.xlf');
                            }
                            
                            if (fs.existsSync('src/locale-temp/messages.fr.xlf')) {
                                const frContent = fs.readFileSync('src/locale-temp/messages.fr.xlf', 'utf8');
                                const filteredFrContent = filterXlfByValidIds(frContent, validIds);
                                fs.writeFileSync('src/locale/messages.fr.xlf', filteredFrContent);
                                console.log('Filtered French translations saved to src/locale/messages.fr.xlf');
                            }
                            
                            // Rename messages.fr.xlf to messages.xlf if needed
                            if (fs.existsSync('src/locale/messages.fr.xlf') && !fs.existsSync('src/locale/messages.xlf')) {
                                fs.copyFileSync('src/locale/messages.fr.xlf', 'src/locale/messages.xlf');
                                console.log('Copied messages.fr.xlf to messages.xlf');
                            }
                            
                            // Show content of downloaded files
                            console.log('Content of filtered Arabic translations:');
                            if (fs.existsSync('src/locale/messages.ar.xlf')) {
                                console.log(fs.readFileSync('src/locale/messages.ar.xlf', 'utf8'));
                            }
                            
                            fs.unlink('translations.zip', () => {});
                            
                            // Supprimer le dossier temporaire
                            if (fs.existsSync('src/locale-temp')) {
                                fs.rmSync('src/locale-temp', { recursive: true, force: true });
                                console.log('Temporary directory removed');
                            }
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
