# Repaused Backend

Express.js API for Repaused. Users create **graveyards** for abandoned work, add **projects** to them, and visitors can browse the public ones.

## Stack

- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose**
- **jsonwebtoken** + **express-jwt** for authentication
- **dotenv** for local environment variables
- **cors**, **morgan**, **http-errors**

## Project structure

```
src/
  server.js                     # App entry point, middleware, route mounting
  config/
    database.js                 # MongoDB connection
  controller/
    auth_controller.js          # Register, login, profile, delete, availability checks
    graveyard_controller.js     # Public browsing and graveyard CRUD
    project_controller.js       # Project create, read, update
    dashboard_controller.js     # Logged-in user's graveyards + projects
  middleware/
    auth.js                     # JWT verification for protected routes
  model/
    user.js
    graveyard.js
    project.js
  routes/
    auth.js
    graveyard.js
    project.js
    dashboard.js
  utils/
    validator.js                # Request validation helpers
    project_access.js           # Resolve user / project ownership helpers
.env                            # Local secrets (not committed)
```

## Prerequisites

- Node.js 18+
- A MongoDB Atlas (or local) connection string

## Setup

1. Clone and install:

```bash
git clone https://github.com/RevenantCo/repaused_backend.git
cd repaused_backend
npm install
```

2. Create a `.env` file in the project root:

```env
PORT=3000
MONGO_DB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_string
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

3. Start the server:

```bash
npm start
```

The API runs at `http://localhost:3000/`.

## Environment variables

| Variable       | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `MONGO_DB_URI` | Yes      | MongoDB connection URI                           |
| `JWT_SECRET`   | Yes      | Secret used to sign login tokens                 |
| `PORT`         | No       | Server port (defaults to `3000`)                 |

## Authentication

Protected routes expect the token from `POST /api/auth/login`:

```
Authorization: Bearer <token>
```

Tokens are valid for 24 hours (`expiresIn: 86400`). Requests without a valid token, or with a token for a deleted account, receive `401`.

## API

### Auth — `/api/auth`

| Method   | Path                        | Auth | Description                             |
|----------|-----------------------------|------|-----------------------------------------|
| `POST`   | `/register`                 | No   | Create a user account                   |
| `POST`   | `/login`                    | No   | Log in with nickname + password         |
| `PATCH`  | `/update-profile`           | Yes  | Update your name, email, GitHub username|
| `DELETE` | `/delete-account`           | Yes  | Soft-delete your account                |
| `GET`    | `/check-nickname`           | No   | Is a nickname free?                     |
| `GET`    | `/check-github-username`    | No   | Is a GitHub username free?              |

Register body:

```json
{
  "name": "Ada Lovelace",
  "nickname": "ada",
  "github_username": "ada-dev",
  "email": "ada@example.com",
  "password": "secret123"
}
```

Login body and response:

```json
{ "nickname": "ada", "password": "secret123" }
```

```json
{
  "ok": true,
  "message": "Login successful",
  "data": { "token": "eyJhbGciOiJIUzUxMiIs...", "expiresIn": 86400 }
}
```

Availability check:

```
GET /api/auth/check-nickname?nickname=ada
GET /api/auth/check-github-username?github_username=ada-dev
```

```json
{ "nickname": "ada", "available": false }
```

### Graveyards — `/api/graveyards`

| Method  | Path                 | Auth | Description                              |
|---------|----------------------|------|------------------------------------------|
| `GET`   | `/`                  | No   | List public graveyards (title, description)|
| `GET`   | `/:id`               | No   | One public graveyard with its projects   |
| `POST`  | `/`                  | Yes  | Create a graveyard                       |
| `POST`  | `/:id/projects`      | Yes  | Add a project to your graveyard          |
| `PATCH` | `/:id`               | Yes  | Edit your graveyard                      |

Create/update graveyard body:

```json
{ "title": "Old Scripts", "description": "Experiments that went nowhere." }
```

### Projects — `/api/projects`

| Method  | Path     | Auth | Description                          |
|---------|----------|------|--------------------------------------|
| `POST`  | `/`      | Yes  | Create a project (send `graveyard` id in body) |
| `GET`   | `/:id`   | No   | View a project and its GitHub info   |
| `PATCH` | `/:id`   | Yes  | Edit a project you own               |

Create project body:

```json
{
  "graveyard": "665f1a2b3c4d5e6f7a8b9c0d",
  "name": "Old CLI",
  "epitaph": "Killed by a better library.",
  "description": "A command-line tool from 2022.",
  "github": {
    "repository_url": "https://github.com/example/old-cli",
    "repo_name": "old-cli",
    "readme": "# Old CLI",
    "description": "Archived command-line tool",
    "stars": 42,
    "main_language": "JavaScript",
    "last_commit_date": "2023-01-01T00:00:00.000Z",
    "creation_date": "2022-01-01T00:00:00.000Z"
  }
}
```

All `github` fields are optional. They are stored exactly as sent; the backend never calls GitHub. Flat keys such as `github_stars` are also accepted.

### Dashboard — `/api/dashboard`

| Method | Path | Auth | Description                                      |
|--------|------|------|--------------------------------------------------|
| `GET`  | `/`  | Yes  | Your graveyards, each with its projects          |

```json
{
  "data": [
    {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "title": "Old Scripts",
      "description": "Experiments that went nowhere.",
      "is_public": true,
      "projects": [
        {
          "id": "665f1a2b3c4d5e6f7a8b9c0e",
          "name": "Old CLI",
          "epitaph": "Killed by a better library.",
          "description": "A command-line tool from 2022.",
          "github": { "repo_name": "old-cli", "stars": 42 }
        }
      ]
    }
  ]
}
```

## Errors

Validation errors include the failing fields:

```json
{
  "error": {
    "message": "Validation failed",
    "fields": { "email": "Invalid email address" },
    "status": 400
  }
}
```

Common statuses: `400` bad input, `401` missing/invalid credentials, `403` not the owner, `404` unknown resource/route, `409` nickname/email/GitHub username already taken.

Unmatched routes return:

```json
{
  "error": {
    "message": "Route not found",
    "status": 404
  }
}
```

## Behavior notes

- Deleting an account sets `deleted_at`; the row stays in MongoDB and soft-deleted users are excluded from normal queries and cannot log in.
- Availability checks count soft-deleted accounts as taken so the answer matches registration's unique indexes.
- Only public graveyards appear in the public list/detail endpoints; owners see all of their own through the dashboard.
- Password hashes and salts are never returned in responses.

## Testing with Postman

Import `postman/Repaused.postman_collection.json`. The collection has all 16 requests grouped by feature. Run it in this order:

1. **Health** → confirm the server is running.
2. **Auth** → Register, Login (saves `token`), checks, profile update. Leave Delete account last.
3. **Graveyards** → List, Create (saves `graveyardId`), Add project (saves `projectId`), detail, update.
4. **Projects** → detail and update.
5. **Dashboard** → your graveyards with projects.

The token and generated ids are stored automatically as collection variables. Edit the `baseUrl`, `nickname`, `githubUsername`, `email`, and `password` variables in the collection if you want different test data.

## Deployment (Render)

1. Connect this GitHub repo to a Render Web Service.
2. Set the start command to `npm start`.
3. Add environment variables in the Render dashboard (do **not** rely on `.env` in production):
   - `MONGO_DB_URI`
   - `JWT_SECRET`
   - `PORT` (optional; Render usually sets this)
4. In MongoDB Atlas → Network Access, allow Render traffic.

## Scripts

| Command     | Description              |
|-------------|--------------------------|
| `npm start` | Start the Express server |

## License

ISC
