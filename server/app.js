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
const dbURL = process.env.MONGODB_URI || 'mongodb://127.0.0.1/Netflix-Clone';

// Set up app.
mongoose.connect(dbURL).catch((err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});
// Include redis content and connection details.
const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});

redisClient.on('error', (err) => console.log(`Redis error: ${err}`));
// Have the server connect to redis before opening.
redisClient.connect().then(() => {
  const app = express();
  app.use(helmet());
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
    console.log(`Listening on port ${port}`);
  });
});
