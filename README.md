# Bâtisseur Web

Site vitrine statique pour l’agence de création de sites WordPress.

## Assistant IA

Le widget est chargé automatiquement sur les pages qui utilisent `script.js`. En l’absence d’endpoint, il répond immédiatement depuis les données publiées sur le site : offres, prix, délais, maintenance, offre Artisan et coordonnées.

Pour activer un vrai modèle IA, créer un webhook n8n dédié (par exemple `/webhook/assistant-batisseur`) avec cette chaîne :

1. Webhook `POST` recevant `message`, `page` et `siteData`.
2. Nœud OpenAI (ou autre fournisseur IA) avec `message` comme question et `siteData` comme contexte strict.
3. Réponse JSON contenant `reply`, par exemple `{ "reply": "..." }`.

Puis renseigner l’URL de production dans `AI_AGENT_ENDPOINT` au début du bloc « Assistant IA » de `script.js`. La clé API doit rester dans n8n, jamais dans le navigateur.

## Réception des réservations dans Airtable

Le formulaire envoie tous ses champs (`offre`, `nom`, `telephone`, `email`, `metier`, `ville`, `services_artisan`, `horaires`, `date`, `creneau` et `message`) en JSON vers un webhook Airtable Automation.

Configuration :

1. Dans Airtable, ouvrir la base et créer une Automation.
2. Choisir le déclencheur `When webhook received` et copier l’URL générée.
3. Ajouter l’action `Create record`, choisir la table des demandes, puis associer chaque champ reçu à la colonne Airtable correspondante.
4. Tester l’automation, puis l’activer.
5. Coller l’URL de production dans `AIRTABLE_WEBHOOK_URL` au début du bloc « Reservation page logic » de `script.js`.

Créer au minimum ces colonnes dans Airtable : `offre`, `nom`, `telephone`, `email`, `metier`, `ville`, `services_artisan`, `horaires`, `date`, `creneau` et `message`. Les champs vides peuvent rester vides pour les offres qui ne sont pas Artisan.

Le webhook Airtable ne renvoie pas d’autorisation CORS. Le script utilise donc `no-cors` et envoie le JSON comme corps `text/plain`; Airtable reçoit la demande, mais le navigateur ne peut pas lire le statut de réponse. Dans l’Automation, utilisez le corps reçu par le déclencheur pour mapper les champs ou parsez-le comme JSON si Airtable l’affiche comme texte.

Pour une confirmation HTTP fiable et un mapping JSON automatique sans traitement supplémentaire dans Airtable, il faut utiliser une fonction serveur (Cloudflare Worker, Netlify Function ou équivalent) entre le site et Airtable.

Cette méthode ne met pas de clé API Airtable dans le navigateur. Si Airtable bloque aussi l’origine HTTPS de votre domaine, il faudra utiliser une fonction serveur (Cloudflare Worker, Netlify Function ou équivalent) entre le site et Airtable; ne mettez jamais un token Airtable dans `script.js`.
