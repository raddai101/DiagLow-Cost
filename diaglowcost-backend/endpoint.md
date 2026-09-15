| Méthode  | Endpoint                                 | Authentification  | Fonction                          |
| -------- | ---------------------------------------- | ----------------  | --------------------------------- |
| `GET`    | `/`                                      | ❌                | Informations générales du backend |
| `GET`    | `/api/v1/health`                         | ❌*               | Vérifier l'état du backend        |
| `POST`   | `/api/v1/auth/register`                  | ❌                | Créer un compte                   |
| `POST`   | `/api/v1/auth/login`                     | ❌                | Se connecter et obtenir le JWT    |
| `GET`    | `/api/v1/auth/me`                        | ✅ JWT            | Récupérer l'utilisateur connecté  |
| `GET`    | `/api/v1/sessions`                       | ✅ JWT            | Lister les conversations          |
| `POST`   | `/api/v1/sessions`                       | ✅ JWT            | Créer une conversation            |
| `PATCH`  | `/api/v1/sessions/{session_id}`          | ✅ JWT            | Renommer une conversation         |
| `DELETE` | `/api/v1/sessions/{session_id}`          | ✅ JWT            | Supprimer une conversation        |
| `GET`    | `/api/v1/sessions/{session_id}/messages` | ✅ JWT            | Récupérer les messages            |
| `POST`   | `/api/v1/rag/search`                     | ✅ JWT            | Rechercher dans la base RAG       |
| `POST`   | `/api/v1/chat`                           | ✅ JWT            | Envoyer une question à l'IA       |
| `GET`    | `/api/v1/admin/users`                    | ✅ Admin          | Lister les utilisateurs           |
