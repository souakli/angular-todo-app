import { LokaliseApi } from '@lokalise/node-api';

const apiKey = '7cd9343a4ee5bd6c3d2066f4cc9eedc8e6de6388';
const projectId = '7835424467bf5c965b0411.50285011';

const client = new LokaliseApi({ apiKey });

async function checkKeys() {
    try {
        const keys = await client.keys().list({
            project_id: projectId,
            limit: 5000
        });
        
        console.log(`Found ${keys.items.length} keys in Lokalise:`);
        console.log(JSON.stringify(keys.items, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkKeys();
