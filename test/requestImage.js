const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const shelljs = require('shelljs');
const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('..');

const { assert } = chai;
chai.use(chaiHttp);

describe('Request image with full size', () => {
  let server;
  let fileName;
  const resourcePath = path.resolve(__dirname, '../public/resource');
  const cachePath = path.resolve(__dirname, '../public/cache');

  before(async () => {
    //  Clear cache
    shelljs.rm('-rf', `${cachePath}/*`);
    // Clear resource
    shelljs.rm('-rf', `${resourcePath}/*`);

    server = chai.request(app);

    const { body } = await server
      .post('/upload')
      .attach(
        'images',
        fs.readFileSync(`${__dirname}/SuperWoman.jpg`),
        'SuperWoman.jpg'
      );
    fileName = body.images[0].name;
  });

  it('should return image binary will full size', async () => {
    const { status, text } = await server.get(`/image/full/${fileName}`);
    // Assert
    assert.equal(status, 200);
    return new Promise((resolve, reject) =>
      fs.readFile(`${cachePath}/full-${fileName}`, 'utf8', (err, data) => {
        if (err) return reject(err);

        assert.equal(
          crypto
            .createHash('md5')
            .update(text)
            .digest('hex'),

          crypto
            .createHash('md5')
            .update(data)
            .digest('hex')
        );

        return resolve(true);
      })
    );
  });
});
