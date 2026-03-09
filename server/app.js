// Required variables
require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;
const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

// Set up app.
mongoose.connect(MONGO_URI).catch((err) => {
  if (err) {
    // console.log('Could not connect to database');
    throw err;
  }
});
// Include redis content and connection details.
const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});

// redisClient.on('error', (err) => console.log(`Redis error: ${err}`));
// Have the server connect to redis before opening.
redisClient.connect().then(() => {
  const app = express();
  // Update your Helmet configuration
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", 'https://api.themoviedb.org'],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  }));
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  // Create a session tracking feature to log users and accounts that access the server/database.
  // These session keys will be stored in redis.
  app.use(session({
    key: 'sessionid',
    store: new RedisStore({
      client: redisClient,
    }),
    secret: 'Domo Arigato',
    resave: false,
    saveUninitialized: false,
  }));
  // enable app to use handlebars.
  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);
  // Create and open the server.
  router(app);
  app.listen(port, (err) => {
    if (err) {
      throw err;
    }
    // console.log(`Listening on port ${port}`);
  });
});
