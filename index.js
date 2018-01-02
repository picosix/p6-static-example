const express = require('express');
const _ = require('lodash');
const path = require('path');
const multer = require('multer');

const app = express();

// Routes
const packageJson = require('./package.json');
// Root
app.get('/', (req, res) =>
  res.json(
    _.pick(packageJson, ['name', 'version', 'description', 'author', 'license'])
  )
);

// Upload image
const allowTypes = process.env.ALLOW_TYPES.split(',').map(type => type.trim);
const uploadConfig = {
  fields: process.env.MAX_FIELD || 17,
  files: process.env.MAX_FILE || 17,
  fileSize: (process.env.MAX_SIZE || 100) * 1048576,
  parts: process.env.MAX_PART || 17
};
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, `${path.resolve(__dirname, 'public/resource')}`);
  },
  filename(req, { originalname, mimetype }, cb) {
    const nameSegments = originalname.split('.');
    const name = nameSegments[0] || `${Date.now()}`;

    const mineTypeSegments = mimetype.split('/');
    const ext = mineTypeSegments[1] || 'jpeg';
    cb(null, `${Date.now()}-${name}.${ext}`);
  }
});
const fileFilter = (req, { mimetype }, cb) =>
  cb(null, Boolean(allowTypes.indexOf(mimetype) > -1));
const uploader = multer({ storage, fileFilter, limits: uploadConfig });

app.post('/upload', uploader.array('images'), (req, res) =>
  res.json({ images: req.files })
);

const port = process.env.PORT || 9999;
app.listen(port);
