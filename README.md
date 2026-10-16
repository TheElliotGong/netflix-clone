# Netflix Clone

A full-stack Netflix-inspired video browsing application built with Node.js, Express, React, MongoDB, and Redis. Users can create an account, choose a profile, browse video content, and manage favorite and recently watched lists.

## Features

- Account sign-up, sign-in, logout, and password changes
- Secure password hashing with `bcrypt`
- Redis-backed session storage
- Multiple profiles per account with selectable avatars
- Profile creation, editing, and deletion
- Video browsing with popular, trending, and premium content sections
- Favorite and recently watched video lists
- Responsive server-rendered pages with React-powered client interactions
- `/health` endpoint for application and Redis availability checks

## Technology

- **Frontend:** React 18, React DOM, Bootstrap, Webpack, Babel
- **Backend:** Node.js, Express, Express Handlebars
- **Data:** MongoDB with Mongoose
- **Sessions:** Redis with `express-session` and `connect-redis`
- **Security and performance:** Helmet, compression, bcrypt

## Getting Started

### Requirements

- Node.js and npm
- A MongoDB database
- A Redis instance

### Installation

```bash
npm install
```

Create a `.env` file in the project root with the database, Redis, and port settings used by the server:

```env
PORT=3000
DB_USER=your_mongodb_username
DB_PASSWORD=your_mongodb_password
DB_URL=your_mongodb_cluster_host
DB_NAME=your_database_name
REDISCLOUD_URL=redis://localhost:6379
```

For a hosted Redis provider, replace `REDISCLOUD_URL` with the provider's connection URL. The MongoDB connection is assembled from the `DB_*` values in `server/app.js`.

### Run the application

```bash
npm start
```

This builds the React bundles with Webpack and starts the Express server. Open [http://localhost:3000](http://localhost:3000), or use the port configured by `PORT`.

## Development Commands

```bash
npm run webpack       # Build client bundles
npm run webpackWatch  # Rebuild bundles when client files change
npm run nodemon       # Restart the server when server or hosted files change
npm run lint:client  # Lint and fix client JavaScript/JSX
npm test              # Run the project's test command
npm run redis:ping    # Keep the Redis connection active
```

## Project Structure

```text
client/      React entry points and shared client helpers
hosted/      Webpack output, CSS, and image assets
server/      Express application, routes, controllers, middleware, and models
views/       Handlebars page templates
```

The main server entry point is `server/app.js`. Webpack creates separate bundles for the login, profile, password-change, and main video views.

## Application Flow

1. An account is created or authenticated through the login page.
2. The server stores the authenticated account in a Redis-backed session.
3. The user selects or manages profiles.
4. Authenticated requests load video data and profile-specific favorites or watch history.
5. Account and profile changes are persisted in MongoDB.