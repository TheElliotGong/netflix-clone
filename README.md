# netflix-clone

## Render Deployment

This repo now includes a Render Blueprint in `render.yaml`.

### What is configured

- A Node web service named `netflix-clone`
- A Redis service named `netflix-clone-redis`
- Build command: `npm ci && npm run render-build`
- Start command: `npm start`

### Required environment variables

Use `.env.example` as the source of truth. The key variables are:

- `MONGO_URI` (recommended)
- `SESSION_SECRET`
- `REDIS_URL` (auto-wired from Render Redis by `render.yaml`)
- `TMDB_API_TOKEN` (recommended) or `TMDB_API_KEY`

Legacy Mongo variables are also supported by the server if you do not provide `MONGO_URI`:

- `DB_USER`
- `DB_PASSWORD`
- `DB_URL`
- `DB_NAME`

### Deploy on Render

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repo.
3. Set `MONGO_URI` in the Render dashboard (or connect it from a secret store).
4. Deploy.