require('dotenv').config();

const app = require('./src/exporter');
app(process.argv.slice(2), process.env, __dirname);