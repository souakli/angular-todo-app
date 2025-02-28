const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
    console.log('Webhook reçu de Lokalise');
    console.log('Event:', req.body.event);
    
    // Exécuter le script de téléchargement
    exec('node download-translations.mjs', (error, stdout, stderr) => {
        if (error) {
            console.error('Erreur lors du téléchargement:', error);
            return res.status(500).json({ error: 'Erreur lors du téléchargement' });
        }
        console.log('Téléchargement réussi:', stdout);
        
        // Reconstruire l'application
        exec('npm run build -- --localize', (error, stdout, stderr) => {
            if (error) {
                console.error('Erreur lors de la reconstruction:', error);
                return res.status(500).json({ error: 'Erreur lors de la reconstruction' });
            }
            console.log('Reconstruction réussie:', stdout);
        });
    });
    
    res.json({ status: 'Téléchargement et reconstruction en cours' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur webhook en écoute sur le port ${PORT}`);
});
