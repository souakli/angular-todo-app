const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Token GitHub avec accès aux workflows
const LOKALISE_WEBHOOK_SECRET = process.env.LOKALISE_WEBHOOK_SECRET; // Secret partagé avec Lokalise
const GITHUB_REPO_OWNER = 'souakli';
const GITHUB_REPO_NAME = 'angular-todo-app';

app.use(express.json());

// Fonction pour vérifier la signature du webhook Lokalise
function verifySignature(payload, signature) {
  if (!LOKALISE_WEBHOOK_SECRET) {
    console.warn('LOKALISE_WEBHOOK_SECRET non défini, la vérification de signature est désactivée');
    return true;
  }
  
  const hmac = crypto.createHmac('sha256', LOKALISE_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

// Fonction pour déclencher le workflow GitHub Actions
async function triggerGitHubWorkflow() {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN non défini, impossible de déclencher le workflow GitHub');
    return false;
  }

  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/dispatches`,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      data: {
        event_type: 'lokalise-translation-updated',
        client_payload: {
          source: 'lokalise-webhook',
          timestamp: new Date().toISOString()
        }
      }
    });
    
    console.log('Workflow GitHub déclenché avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors du déclenchement du workflow GitHub:', error.response?.data || error.message);
    return false;
  }
}

app.post('/webhook', async (req, res) => {
  // Vérifier la signature si elle est fournie
  const signature = req.headers['x-lokalise-signature'];
  if (signature && !verifySignature(req.body, signature)) {
    console.error('Signature invalide');
    return res.status(401).json({ error: 'Signature invalide' });
  }
  
  console.log('Webhook reçu de Lokalise');
  console.log('Event:', req.body.event);
  
  // Vérifier que c'est bien un événement de mise à jour de traduction
  if (req.body.event === 'project.translation.updated' || 
      req.body.event === 'project.translation.proofread' ||
      req.body.event === 'project.keys.added' ||
      req.body.event === 'project.keys.modified') {
    
    console.log('Événement de traduction détecté, déclenchement du workflow GitHub...');
    const success = await triggerGitHubWorkflow();
    
    if (success) {
      return res.json({ 
        status: 'success', 
        message: 'Workflow GitHub déclenché avec succès' 
      });
    } else {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Échec du déclenchement du workflow GitHub' 
      });
    }
  }
  
  // Pour les autres types d'événements, simplement accuser réception
  res.json({ 
    status: 'acknowledged', 
    message: 'Événement reçu mais aucune action requise' 
  });
});

// Endpoint pour tester que le serveur fonctionne
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur webhook en ligne' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur webhook en écoute sur le port ${PORT}`);
  console.log(`URL du webhook: http://votre-domaine.com/webhook`);
  console.log(`Endpoint de santé: http://votre-domaine.com/health`);
});
