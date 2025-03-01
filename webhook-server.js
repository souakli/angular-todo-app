import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
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
  hmac.update(JSON.stringify(payload));
  const calculatedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(Buffer.from(calculatedSignature), Buffer.from(signature));
}

// Fonction pour déclencher le workflow GitHub Actions
async function triggerGitHubWorkflow(event, projectId) {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN non défini, impossible de déclencher le workflow');
    return false;
  }

  try {
    const response = await axios.post(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/dispatches`,
      {
        event_type: 'lokalise-translation-updated',
        client_payload: {
          source: 'lokalise-webhook',
          event: event,
          project_id: projectId
        }
      },
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Workflow GitHub déclenché avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors du déclenchement du workflow GitHub:', error.message);
    if (error.response) {
      console.error('Détails de la réponse:', error.response.data);
    }
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
  
  console.log('Webhook reçu:', req.body);
  
  // Extraire les informations pertinentes
  const event = req.body.event || 'unknown';
  const projectId = req.body.project_id || 'unknown';
  
  // Traiter les événements liés aux traductions
  if (event.includes('translation') || event.includes('key') || event.includes('language')) {
    try {
      const success = await triggerGitHubWorkflow(event, projectId);
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
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Erreur interne du serveur' 
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

// Endpoint racine pour faciliter les tests
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur webhook en ligne. Utilisez /webhook pour les notifications Lokalise.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur webhook en écoute sur le port ${PORT}`);
  console.log(`URL du webhook: http://votre-domaine.com/webhook`);
  console.log(`Endpoint de santé: http://votre-domaine.com/health`);
});
