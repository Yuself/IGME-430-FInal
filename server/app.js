// Load env variables
require('dotenv').config();



// Require modules
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { engine } = require('express-handlebars');
//domo c
const redis = require('redis');
const { RedisStore } = require('connect-redis');

const session = require('express-session');

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/DomoMaker';

mongoose.connect(dbURI);

// domo c
const redisClient = redis.createClient({
    url: process.env.REDISCLOUD_URL,
});

// please to god work this time
redisClient.on('error', (err) => {
    process.stderr.write(`${err}\n`);
});

redisClient.connect().then(() => {
    const app = express();

    app.use('/assets', express.static(path.resolve(__dirname, '../hosted')));
    app.use(favicon(path.resolve(__dirname, '../hosted/img/favicon.png')));
    app.use(compression());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    //changed domo c
    app.use(session({
        key: 'sessionid',
        store: new RedisStore({
            client: redisClient,
        }),
        secret: 'Domo Maker',
        resave: false,
        saveUninitialized: false,
    }));
    app.use(helmet({
        contentSecurityPolicy: false,
    }));
    app.engine('handlebars', engine({
        defaultLayout: false,
    }));

    app.set('view engine', 'handlebars');
    app.set('views', path.resolve(__dirname, '../views'));

    router(app);

    mongoose.connection.once('open', () => {
        app.listen(port);
    });
});
