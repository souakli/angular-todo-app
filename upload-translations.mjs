import { LokaliseApi } from '@lokalise/node-api';
import fs from 'fs';
import { DOMParser } from 'xmldom';

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
    
    // Parcourir les trans-units et supprimer ceux qui n'ont pas d'ID valide
    for (let i = transUnits.length - 1; i >= 0; i--) {
        const id = transUnits[i].getAttribute('id');
        if (!validIds.includes(id)) {
            console.log(`Removing trans-unit with ID ${id} as it's not in the source file`);
            transUnits[i].parentNode.removeChild(transUnits[i]);
        }
    }
    
    // Convertir le document XML en chaîne
    return xmlDoc.toString();
}

async function uploadTranslations() {
    try {
        console.log('Starting upload process...');
        console.log('API Key:', apiKey);
        console.log('Project ID:', projectId);

        // Lire le fichier source pour obtenir les IDs valides
        const sourceContent = fs.readFileSync('src/locale/messages.xlf', 'utf8');
        const validIds = extractTransUnitIds(sourceContent);
        console.log(`Found ${validIds.length} valid translation IDs in source file:`, validIds);

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
        
        // Filtrer et uploader les traductions arabes
        const arContentRaw = fs.readFileSync('src/locale/messages.ar.xlf', 'utf8');
        const filteredArContent = filterXlfByValidIds(arContentRaw, validIds);
        fs.writeFileSync('src/locale/messages.ar.filtered.xlf', filteredArContent);
        const arContent = fs.readFileSync('src/locale/messages.ar.filtered.xlf', 'base64');
        
        console.log('Uploading filtered Arabic translations...');
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

        // Filtrer et uploader les traductions anglaises
        const enContentRaw = fs.readFileSync('src/locale/messages.en.xlf', 'utf8');
        const filteredEnContent = filterXlfByValidIds(enContentRaw, validIds);
        fs.writeFileSync('src/locale/messages.en.filtered.xlf', filteredEnContent);
        const enContent = fs.readFileSync('src/locale/messages.en.filtered.xlf', 'base64');
        
        console.log('Uploading filtered English translations...');
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
