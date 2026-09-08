// Required variables
require("dotenv").config();
const path = require("path");
const express = require("express");
const compression = require("compression");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressHandlebars = require("express-handlebars");
const helmet = require("helmet");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const redis = require("redis");

const router = require("./router.js");
const { touchRedis, startKeepAlive } = require("./redisKeepAlive.js");

const {
  PORT,
  NODE_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_URL,
  DB_NAME,
  REDISCLOUD_URL,
} = process.env;
const port = PORT || NODE_PORT || 3000;
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
  url: REDISCLOUD_URL,
});

redisClient.on("error", (err) => console.log(`Redis error: ${err}`));
// Have the server connect to redis before opening.
redisClient.connect().then(() => {
  const app = express();
  // Update your Helmet configuration
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "'data:'"],
        connectSrc: ["'self'", "https://api.themoviedb.org"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    }),
  );
  app.use("/assets", express.static(path.resolve(`${__dirname}/../hosted/`)));
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  // Public health check. The scheduled monitor hits this: it wakes the
  // free-tier web service and issues a real Redis command in one request, so a
  // 200 here proves the session store is actually reachable. Registered before
  // the session middleware and before router()'s catch-all, and deliberately
  // outside requiresSecure so a plain HTTP probe gets an answer, not a redirect.
  app.get("/health", async (req, res) => {
    try {
      const { ping, lastPing } = await touchRedis(redisClient);
      return res.status(200).json({ status: "ok", redis: ping, lastPing });
    } catch (err) {
      return res.status(503).json({ status: "error", message: err.message });
    }
  });

  // Create a session tracking feature to log users and accounts that access the server/database.
  // These session keys will be stored in redis.
  app.use(
    session({
      key: "sessionid",
      store: new RedisStore({
        client: redisClient,
      }),
      secret: "Domo Arigato",
      resave: false,
      saveUninitialized: false,
    }),
  );
  // enable app to use handlebars.
  app.engine("handlebars", expressHandlebars.engine({ defaultLayout: "" }));
  app.set("view engine", "handlebars");
  app.set("views", `${__dirname}/../views`);
  // Create and open the server.
  router(app);
  // Touch Redis on a timer so an idle-but-awake instance still exercises the
  // store. Covers only the awake window -- Render's free tier sleeps after
  // ~15 min idle, which is what the scheduled /health probe is for.
  startKeepAlive(redisClient);
  app.listen(port, (err) => {
    if (err) {
      throw err;
    }
    const appUrl = `http://localhost:${port}/`;
    process.stdout.write(`Listening on port ${port}\n`);
    process.stdout.write(`App URL: ${appUrl}\n`);
  });
});
