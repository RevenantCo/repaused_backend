# Repaused Backend

Express.js API for Repaused, with MongoDB via Mongoose.

## Stack

- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose**
- **dotenv** for local environment variables
- **cors**, **morgan**, **http-errors**

## Project structure

```
src/
  server.js            # App entry point, middleware, routes
  config/
    database.js        # MongoDB connection
.env                   # Local secrets (not committed)
```

## Prerequisites

- Node.js 18+
- A MongoDB Atlas (or local) connection string

## Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/RevenantCo/repaused_backend.git
cd repaused_backend
npm install
```

2. Create a `.env` file in the project root:

```env
PORT=3000
MONGO_DB_URI=your_mongodb_connection_string
```

3. Start the server:

```bash
npm start
```

The API runs at `http://localhost:3000/`.

## Environment variables

| Variable       | Required | Description                          |
|----------------|----------|--------------------------------------|
| `MONGO_DB_URI` | Yes      | MongoDB connection URI               |
| `PORT`         | No       | Server port (defaults to `3000`)     |

## API

| Method | Path | Description        |
|--------|------|--------------------|
| `GET`  | `/`  | Health / hello check |

Unmatched routes return a `404` JSON error:

```json
{
  "error": {
    "message": "Route not found",
    "status": 404
  }
}
```

## Deployment (Render)

1. Connect this GitHub repo to a Render Web Service.
2. Set the start command to `npm start`.
3. Add environment variables in the Render dashboard (do **not** rely on `.env` in production):
   - `MONGO_DB_URI`
   - `PORT` (optional; Render usually sets this)
4. In MongoDB Atlas → Network Access, allow Render traffic (e.g. `0.0.0.0/0` or Render’s outbound IPs).

## Scripts

| Command     | Description              |
|-------------|--------------------------|
| `npm start` | Start the Express server |

## License

ISC
