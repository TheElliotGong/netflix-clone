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

const {
  PORT,
  NODE_PORT,
  NODE_ENV = 'development',
  SESSION_SECRET,
  REDIS_URL,
  REDISCLOUD_URL,
  DB_USER,
  DB_PASSWORD,
  DB_URL,
  DB_NAME,
  MONGO_URI: mongoUriFromEnv,
} = process.env;

const port = PORT || NODE_PORT || 3000;
const sessionSecret = SESSION_SECRET || 'Domo Arigato';
const redisUrl = REDIS_URL || REDISCLOUD_URL;
const MONGO_URI = mongoUriFromEnv || (
  DB_USER && DB_PASSWORD && DB_URL && DB_NAME
    ? `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
    : null
);

if (!MONGO_URI) {
  throw new Error('Missing MongoDB connection settings. Set MONGO_URI or DB_USER/DB_PASSWORD/DB_URL/DB_NAME.');
}

// Set up app.
mongoose.connect(MONGO_URI).catch((err) => {
  if (err) {
    // console.log('Could not connect to database');
    throw err;
  }
});
const startServer = (redisStore) => {
  const app = express();
  app.set('trust proxy', 1);
  // Update your Helmet configuration
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://api.themoviedb.org'],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  }));
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  // Create a session tracking feature to log users and accounts that access the server/database.
  // These session keys will be stored in redis.
  const sessionOptions = {
    key: 'sessionid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  };

  if (redisStore) {
    sessionOptions.store = redisStore;
  }

  app.use(session(sessionOptions));
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
};

if (redisUrl) {
  // Include redis content and connection details.
  const redisClient = redis.createClient({
    url: redisUrl,
  });

  redisClient.connect().then(() => {
    startServer(new RedisStore({ client: redisClient }));
  }).catch((err) => {
    throw err;
  });
} else {
  startServer(null);
}
