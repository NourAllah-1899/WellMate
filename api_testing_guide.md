# 🚀 Guide de Test API - WellMate (Postman)

Ce document répertorie les points de terminaison (endpoints) pour tester la gestion des repas.

## 🔗 Configuration de base
- **Base URL** : `http://localhost:5000/api`
- **Authentification** : 
    - Méthode : **Bearer Token** dans l'onglet *Authorization*.
    - Token : À obtenir via la route de connexion.

---

## 🔐 Authentification (Pour obtenir le Token)

### Connexion
- **URL** : `POST /api/auth/login`
- **Body (JSON)** :
```json
{
  "email": "votre@email.com",
  "password": "votre_mot_de_passe"
}
```
*Récupérez le `token` dans la réponse JSON.*

---

## 🍽️ Gestion des Repas

### 1. Lister les repas du jour
- **URL** : `GET /api/meals/today`
- **Description** : Utile pour obtenir les `id` des repas récemment ajoutés.

### 2. Ajouter un nouveau repas (Create)
- **URL** : `POST /api/meals`
- **Body (JSON)** :
```json
{
  "description": "Ex: Salade César au poulet",
  "estimatedCalories": 450,
  "eatenAt": "2026-04-05T12:00:00.000Z" (Optionnel)
}
```

### 3. Modifier un repas (Update)
- **URL** : `PUT /api/meals/:id`
- **Description** : Remplacez `:id` par l'identifiant réel du repas.
- **Body (JSON)** :
```json
{
  "description": "Nouveau nom (ex: Grosse Salade César)",
  "estimatedCalories": 550
}
```

### 4. Supprimer un repas (Delete)
- **URL** : `DELETE /api/meals/:id`
- **Description** : Remplacez `:id` par l'identifiant réel du repas.
- **Body** : *(Aucun)*

### 5. Historique (30 derniers jours)
- **URL** : `GET /api/meals/history`

---

## 📝 Notes Importantes
- **Port** : Le port par défaut est **5000**.
- **IA (OpenAI)** : Si vous omettez `estimatedCalories` lors du `POST` ou `PUT`, le système tentera de les estimer automatiquement via l'IA.
