import express from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import cors from "cors";
import debug from 'debug';
import bearerToken from "express-bearer-token";
import csv from "csv-parser";
import crypto from "crypto";

const {publicStore, userStore} = require('./data/DataStore.js');

require('dotenv').config();

// Loggers used. Environment variables used to limit output
const debugAutoWire = debug('auto-wire');
const debugAutoWireWarning = debug('auto-wire-warning');

const app = express();

app.use(require('morgan')('dev'));
require('./data/DataStore');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bearerToken());
app.use(cookieParser());
app.use(cors());
app.use(express.static('public'));

// auto-wire routes. Must export default router, and a prefix.
const files = fs.readdirSync(path.join(__dirname, 'routes'));
files.forEach(file => {
  const router = require(path.join(__dirname, './routes', file));

  if (!router.router) {
    debugAutoWireWarning(`'${file}' did not export a 'router'. Skipped`);
    return;
  }
  if (!router.prefix) {
    debugAutoWireWarning(`'${file}' did not export a 'prefix' path. Defaulting to '/'`);
  }

  app.use(router.prefix || '/', router.router);
  debugAutoWire(`registered '${file}' to route '${router.prefix || '/'}'`);
});

//populate the public data store with our samples when we start up the server.
export let dataset = {};
/* clear the data */
publicStore.clear();

/* Process csvs located in data/in/line_charts */
fs.readdirSync('data/in/line_charts/').forEach(file => {
  let bad_key = fs.readFileSync(`data/in/line_charts/${file}`, 'utf-8').split(',')[0];
  fs.createReadStream(`data/in/line_charts/${file}`)
    .pipe(csv())
    .on('data', (row) => {
      /* serialize row sample */
      const id_num = crypto.randomBytes(20).toString('hex');
      dataset[id_num] = [];
      Object.keys(row).forEach((key) => {
        if(key != bad_key) {
          dataset[id_num].push(row[key]);
        }
      });
    })
    .on('end', () => {
      publicStore.set("samples", dataset);
    });
});

console.log('CSV files successfully processed');

/* Reset user tasks in case sample space has changed */
let users= Object.keys(userStore.clone());
users.forEach((user) => {
  userStore.set(`${user}.tasks`, []);
  userStore.set(`${user}.labels`, []);
});

export default app;
