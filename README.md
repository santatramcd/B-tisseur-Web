# Bâtisseur Web

Site vitrine statique pour l’agence de création de sites WordPress.

## Assistant IA

Le widget est chargé automatiquement sur les pages qui utilisent `script.js`. En l’absence d’endpoint, il répond immédiatement depuis les données publiées sur le site : offres, prix, délais, maintenance, offre Artisan et coordonnées.

Pour activer un vrai modèle IA, créer un webhook n8n dédié (par exemple `/webhook/assistant-batisseur`) avec cette chaîne :

1. Webhook `POST` recevant `message`, `page` et `siteData`.
2. Nœud OpenAI (ou autre fournisseur IA) avec `message` comme question et `siteData` comme contexte strict.
3. Réponse JSON contenant `reply`, par exemple `{ "reply": "..." }`.

Puis renseigner l’URL de production dans `AI_AGENT_ENDPOINT` au début du bloc « Assistant IA » de `script.js`. La clé API doit rester dans n8n, jamais dans le navigateur.

Le formulaire de réservation continue d’utiliser son webhook n8n existant séparément.
