# Sprint 6 — Endpoints pour Postman

Base URL: `http://localhost:5000`

En-têtes communs:
- `Content-Type: application/json`
- `Authorization: Bearer <TOKEN>` (pour les routes protégées)

---

## Module Événements (events)

- GET `/api/events`
  - Description: Récupère la liste des événements. Auth facultative (si fourni, indique lesquels l'utilisateur a rejoint).
  - Query params: `activity_type` (optionnel)
  - Exemple: `GET http://localhost:5000/api/events`

- GET `/api/events/:id`
  - Description: Détails d'un événement (auth facultative pour savoir si l'utilisateur a rejoint).
  - Exemple: `GET http://localhost:5000/api/events/123`

- GET `/api/events/my-events`
  - Description: Récupère les événements créés et rejoints par l'utilisateur.
  - Auth: Obligatoire
  - Exemple: `GET http://localhost:5000/api/events/my-events`

- POST `/api/events`
  - Description: Créer un événement.
  - Auth: Obligatoire
  - Body (JSON) requis:
    {
      "title": "string",
      "activity_type": "Running|Walking|...",
      "date": "YYYY-MM-DD",
      "time": "HH:MM" ,
      "latitude": 33.8869,
      "longitude": 9.5375,
      "description": "string (optionnel)",
      "max_participants": 10 (optionnel)
    }
  - Exemple curl:
    curl -X POST http://localhost:5000/api/events \
      -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <TOKEN>' \
      -d '{"title":"Beach Yoga","activity_type":"Yoga","date":"2026-05-20","time":"09:00","latitude":33.8869,"longitude":9.5375}'

- POST `/api/events/:id/join`
  - Description: Rejoindre un événement.
  - Auth: Obligatoire
  - Exemple: `POST http://localhost:5000/api/events/123/join`

- DELETE `/api/events/:id/join`
  - Description: Quitter un événement (supprime la participation).
  - Auth: Obligatoire
  - Exemple: `DELETE http://localhost:5000/api/events/123/join`

- PUT `/api/events/:id`
  - Description: Mettre à jour un événement (seul le créateur).
  - Auth: Obligatoire
  - Body: envoyer uniquement les champs à modifier (mêmes noms que pour POST)
  - Exemple: `PUT http://localhost:5000/api/events/123` avec body `{ "title": "New title" }`

- DELETE `/api/events/:id`
  - Description: Supprimer un événement (seul le créateur).
  - Auth: Obligatoire
  - Exemple: `DELETE http://localhost:5000/api/events/123`

---

## Chatbot Santé

- POST `/api/chatbot/message`
  - Description: Envoie un message au chatbot santé (utilise un modèle local Ollama en backend).
  - Auth: Non requis
  - Body (JSON):
    { "message": "Bonjour, quel est mon IMC si je pèse 70kg et mesure 1.75m ?" }
  - Réponse: `{ "reply": "..." }`
  - Exemple curl:
    curl -X POST http://localhost:5000/api/chatbot/message \
      -H 'Content-Type: application/json' \
      -d '{"message":"How many calories in 100g of apple?"}'

---

Notes / conseils rapides:
- Lancez le serveur backend: `cd backend && npm run dev` (ou `npm start`).
- Pour les routes protégées, récupérez d'abord un token via l'API d'auth (`POST /api/auth/login` ou `register`) puis ajoutez l'en-tête `Authorization: Bearer <token>` dans Postman.
- Les validations et codes de réponse sont documentés dans les contrôleurs: vérifiez les messages d'erreur retournés (`message` dans la réponse JSON).
