const express = require('express');
const _ = require('lodash')

const app = express();

// Routes
const packageJson = require('./package.json');
// Root
app.get('/', (req, res) =>
  res.json(
    _.pick(packageJson, ['name', 'version'])
  )
);

const port = process.env.PORT || 9999;
app.listen(port);