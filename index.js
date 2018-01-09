const fs = require('fs');
const path = require('path');
const express = require('express');
const _ = require('lodash');
const multer = require('multer');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const sharp = require('sharp');
const winston = require('winston');

const app = express();

const adapter = new FileAsync('db.json');
const db = (async connection => {
  const dbConnection = await connection;
  await dbConnection.defaults({ resource: [], users: [] }).write();
  return dbConnection;
})(lowdb(adapter));

const { createLogger, format, transports } = winston;
const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: 'log/error.log', level: 'error' }),
    new transports.File({ filename: 'log/combined.log' })
  ]
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.simple()
    })
  );
}

// Routes
const packageJson = require('./package.json');
// Root
app.get('/', (req, res) =>
  res.json(
    _.pick(packageJson, ['name', 'version', 'description', 'author', 'license'])
  )
);

// Upload image
const allowTypes = process.env.ALLOW_TYPES.split(',').map(type => type.trim());
const uploadConfig = {
  fields: process.env.MAX_FIELD || 17,
  files: process.env.MAX_FILE || 17,
  fileSize: (process.env.MAX_SIZE || 100) * 1048576,
  parts: process.env.MAX_PART || 17
};
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve(__dirname, 'public/resource'));
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

app.post('/upload', uploader.array('images'), async ({ files }, res) => {
  const dbInstance = await db;

  const insertQueue = [];
  const images = [];
  _.each(files, ({ filename, path: imagePath, size }) => {
    // Insert image information to db
    insertQueue.push(
      dbInstance
        .get('resource')
        .push({
          id: filename,
          name: filename,
          path: imagePath,
          size
        })
        .write()
    );
    // Prepare data to return to client
    images.push({
      name: filename
    });
  });
  await Promise.all(insertQueue);

  res.json({ images });
});

// Serve image
const allowSizes = {
  xs: 0.2,
  sm: 0.4,
  md: 0.6,
  lg: 0.8,
  full: 1,
  '70x70': { width: 70, height: 70 }
};
const DEFAULT_SIZE = 1;
app.get('/image/:size/:id', async ({ params }, res, next) => {
  try {
    const { size, id } = params;
    const imgPath = path.resolve(__dirname, process.env.FOLDER_RESOURCE, id);
    const imgCachePath = path.resolve(
      __dirname,
      'public/cache',
      `${size}-${id}`
    );

    if (!fs.existsSync(imgPath)) {
      throw new Error(`Image #${id} is not exist.`);
    }

    // Serve cache
    if (fs.existsSync(imgCachePath)) {
      return fs.createReadStream(imgCachePath).pipe(res);
    }
    const imageStream = sharp(imgPath);
    // Get image data
    const imageData = await imageStream.metadata();

    const requestSize = allowSizes[size] ? allowSizes[size] : DEFAULT_SIZE;
    let imgWidth;
    let imgHeight;

    // Resize with percent
    if (_.isNumber(requestSize)) {
      imgWidth = imageData.width * requestSize;
      imgHeight = imageData.height * requestSize;
    }
    // resize with absolute size
    if (_.isObject(requestSize)) {
      imgWidth = requestSize.width;
      imgHeight = requestSize.height;
    }

    if (imgWidth && imgHeight) {
      imageStream.resize(imgWidth, imgHeight);
    }

    // Embedded watermark
    const watermark = sharp(
      path.resolve(__dirname, 'public/static', 'logo.png')
    );
    const watermarkData = await watermark.metadata();
    if (imgWidth && imgHeight) {
      watermark.resize(
        watermarkData.width * imgWidth / imageData.width,
        watermarkData.height * imgHeight / imageData.height
      );
    }

    imageStream.overlayWith(await watermark.toBuffer(), {
      gravity: 'southwest'
    });

    imageStream
      .clone()
      .toFile(imgCachePath)
      .catch(({ message, code, stack }) =>
        logger.error(message, { code, stack })
      );

    return imageStream.pipe(res);
  } catch (err) {
    return next(err);
  }
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.message, { code: err.code, stack: err.stack });
  const message =
    process.env.NODE_ENV !== 'production'
      ? err.message
      : 'An error encountered while processing images';
  res.status(500).json({ message });

  return next();
});

module.exports = app;
