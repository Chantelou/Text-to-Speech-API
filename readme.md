# Text-to-Speech API (Node.js / Express)

Cette API open-source, développée par **Chantelou NGOUANOU**, permet de convertir du texte en audio (TTS). Elle peut être intégrée à des workflows **n8n**, WhatsApp, ou tout autre service nécessitant la conversion **texte → audio**.

Le projet est prêt à être déployé sur [Render](https://render.com) ou tout autre hébergeur compatible **Node.js**.

---

# Déploiement en un clic sur Render

Si vous avez déjà un compte Render, vous pouvez déployer cette API directement en cliquant sur le lien ci-dessous :

[Déployer l’API sur Render](https://dashboard.render.com/new/web?repo=https://github.com/votre-utilisateur/votre-repo)

> Render créera automatiquement le service et vous fournira l’URL publique de votre API.

> ⚠️ **Important :** Les services Render gratuits mettent l’application en veille après **15 minutes d’inactivité**.  
> Pour éviter cela, il est recommandé de **ping le serveur toutes les 10 minutes**.

---

# ⏱️ Maintenir le serveur actif avec cron-job.org

1. Créez un compte gratuit sur [cron-job.org](https://cron-job.org).
2. Connectez-vous et cliquez sur **“Créer un Cronjob”**.
3. Remplissez le formulaire :
   - **URL** : `https://votre-api.com` (ou n’importe quel endpoint public)
   - **Calendrier d'exécution** : `Choisissez 10 minutes`  
4. Activez le cron-job.  
5. Votre API sera pingée automatiquement toutes les 10 minutes, évitant ainsi la mise en veille.

---

# ⚙️ Variables d’environnement

Pour utiliser l’API correctement, certaines variables peuvent être configurées dans Render :

| Variable | Description | Exemple | Obligatoire |
|----------|-------------|---------|-------------|
| `GEMINI_API_KEY` | Clé API pour Gemini (facultatif) | `abcd1234` | Non |
| `ELEVEN_LABS_API_KEY` | Clé API pour Eleven Labs (facultatif) | `xyz9876` | Non |
| `GEMINI_VOICE` | Voix par défaut pour Gemini | `Kore` | Non |
| `ELEVEN_LABS_VOICE` | ID de la voix pour Eleven Labs | `21m00Tcm4TlvDq8ikWAM` | Non |
| `DOMAIN_AUTORISE` | Domaine autorisé pour CORS (sécurité) | `https://votresite.com` | **Oui** |

> ⚠️ La variable `DOMAIN_AUTORISE` est **obligatoire** pour des raisons de sécurité : elle empêche l’utilisation de l’API depuis des domaines non autorisés.

---

# 📄 Routes POST disponibles

| Route | Service | Description |
|-------|---------|-------------|
| `/edge-tts` | Gratuit | Convertit le texte en audio en utilisant Edge-TTS (100% gratuit) |
| `/gemini-tts` | Gemini | Convertit le texte en audio avec Gemini (requiert clé API) |
| `/11labs` | Eleven Labs | Convertit le texte en audio avec Eleven Labs (requiert clé API) |

# Exemple de requête POST avec `axios` :

```javascript
import axios from 'axios';

const text = "Bonjour, ceci est un test TTS";

// Edge-TTS (gratuit)
const responseEdge = await axios.post('https://votre-api.com/edge-tts', { text });
console.log(responseEdge.data.url);

// Gemini
const responseGemini = await axios.post('https://votre-api.com/gemini-tts', { text });
console.log(responseGemini.data.url);

// Eleven Labs
const response11labs = await axios.post('https://votre-api.com/11labs', { text });
console.log(response11labs.data.url);

👨‍💻 Créé par Chantelou Ngouanou (Tknodev School Officiel)