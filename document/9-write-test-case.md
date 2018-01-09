# Viết test case

## Bài trước đó

[Ghi log với winston](./8-write-log-with-winston.md)

Với bản thân mình, mỗi ứng dụng mà mình viết ra, mình luôn luôn cố gắng để có thẻ viết nhiều test case hết sực có thể. Và phong cách viết code yêu thích của mình là ngồi viết test case trước, rồi mới viết code để thực thi cái test case mà mình viết. Tuy nhiên thực tế phũ phàng lắm :( deadline mà dí thì thời gian đâu mà viết test case.

Vì để tạo cảm hứng học tập, nên mình quyết định đặt phần test case ở gần cuối của series. Mình chỉ muốn khuyên các bạn nên viết test case để cover hết tất cả các trường hợp mà bạn viết code. Cho dù bạn làm project một mình, hay bạn làm cùng team thì test case cũng sẽ giúp bạn

* Kiểm tra ứng dụng của bạn một cách tự động
* Đảm bảo production của bạn luôn không xảy ra những bug cũ
* Giúp cuộc đời bạn tươi đẹp hơn (đùa đấy :D)

## Viết test case với MochaJS và ChaiJS

[mocha](https://github.com/mochajs/mocha) là thư viện giúp bạn viết test dễ dàng hơn, đơn giản và dễ sử dụng. Như lời dẫn của trang github "Did you know Mocha is a dependency of over 100,000 projects published to npm alone?", mocha được sử dụng bởi rất rất nhiều người, nên bạn có thể yên tâm về chất lượng của thư viện này.

[chai](https://github.com/chaijs/chai) là thư viện giúp viết BDD (behavior test driven) / TDD (test driven development) test. Thư viện này có nhiệm vụ giúp bạn khẳng định một kết quả trong test case có như mong muốn của bạn hay không? Nếu không đúng thì nó sẽ báo lỗi ra cho bạn biết.

[chai-http](https://github.com/chaijs/chai-http) là thư viện giúp bạn test ứng dụng thông qua kết nối `http`.

## Bắt đầu viết test

Đầu tiên, bạn cần xác định bạn cần test những phần nào. Theo những bài trước, chúng ta cần test hai `http endpoint` là `/upload` và `/image/:size/:id`.

Tiếp theo bạn cần cài đặt các thư viện cần thiết

```shell
$ yarn add -D mocha chai chai-http shelljs
```

### Cấu hình eslint với mocha

Ban đầu, eslint sẽ báo lỗi không tìm thấy một số hàm của `mocha`. Đó là do bạn chưa khai báo cho eslint biết môi trường mà bạn muốn eslint detect. Bạn cần sửa lại file `.eslintrc.js` như sau

```javascript
module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    mocha: true
  },
  plugins: ['prettier']
};
```

bạn cần chú ý là mình có thêm phần `env` vào ở đoạn code trên.

Tiếp theo bạn cần sửa lại file `package.json` để có thể chạy lệnh `yarn test`

```json
...
  "scripts": {
    "start-dev": "node -r dotenv/config ./node_modules/.bin/nodemon --ignore db.json index.js",
    "linter": "./node_modules/.bin/eslint",
    "pretest": "yarn linter src",
    "test": "node -r dotenv/config ./node_modules/.bin/mocha --exit --recursive"
  },
...
```

trong đó `linter` là lệnh để chúng ta chạy `eslint` trên toàn project, `pretest` sẽ chạy ngay trước khi các test case được chạy (ở đây chúng ta chạy lệnh `linter` để đảm bảo tất cả các code được viết theo đúng chuẩn `airbnb`), và câu lệnh chạy test `test`.

Ở câu lệnh `test`, mình muốn mocha có thể load tất cả những biến môi trường (dùng `node -r dotenv/config`), thoát khỏi test sau khi test xong (dùng `--exit`) và test case có thể đặt trong các thư mục con (dùng `--recursive`). Các bạn có thể tham khảo thêm các cấu hình của mocha tại đây [Usage](https://mochajs.org/#usage)

### Chỉnh sửa file `index.js`

Để có thể test được ứng dụng của chúng ta, đầu tiên bạn cần thay thế đoạn

```javascript
...

const port = process.env.PORT || 9999;
app.listen(port);
```

bằng đoạn

```javascript
...

module.exports = app;
```

Mục đích của việc này là giúp chúng ta `export` ứng dụng ra để cả `server http` và `server test` đều có thể hoạt động cùng lúc. Vậy làm sao chúng ta chạy được `server http` lúc này khi ở file `index.js` không còn `listen` ở cổng `9999`? Bạn cần thêm file `bin/www.js` với nội dung như sau

```javascript
const app = require('..');

const port = process.env.PORt || 9999;
app.listen(port);
```

và sửa lại câu lệnh `start-dev` trong file `package.json` như sau

```json
"start-dev": "node -r dotenv/config ./node_modules/.bin/nodemon --ignore db.json bin/www.js",
```

lúc này bạn có thể test lại ứng dụng bằng cách chạy câu lệnh

```shell
$ yarn start-dev
```

### Viết test case với endpoint `/upload`

Các bạn tạo file `upload.js` trong thư mục `test` với nội dung như sau

```javascript
const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');
const shelljs = require('shelljs');

const app = require('..');

const { assert } = chai;
chai.use(chaiHttp);

describe('Upload', () => {
  let server;
  const resourcePath = path.resolve(__dirname, '../public/resource');

  before(async () => {
    server = chai.request(app);
    shelljs.rm('-rf', `${resourcePath}/*`);
  });

  it('should upload images successfully', async () => {
    const { status, body } = await server
      .post('/upload')
      .attach(
        'images',
        fs.readFileSync(`${__dirname}/SuperWoman.jpg`),
        'SuperWoman.jpg'
      );
    // Assert
    assert.equal(status, 200);
    assert.exists(body.images, 'Return files should be exist');
    assert.isArray(body.images, 'Return array of files');
    assert.equal(
      body.images.length,
      1,
      'The number of return files should be matched'
    );

    return new Promise(resolve =>
      fs.readdir(resourcePath, (err, files) => {
        assert.isNotOk(err);
        assert.equal(
          files.filter(file => file[0] !== '.').length,
          1,
          'The uploaded file should be in the right place'
        );
        resolve(true);
      })
    );
  });
});
```

Ở đây, `describe` là keyword mô tả một test case của bạn, với mỗi `it` là một trường hợp của test case (ví dụ như trong đoạn code ở trên mình muốn test trường hợp upload hình ảnh thành công). Và`before` là hook sẽ được chạy trước khi TẤT CẢ test function `it` đưọc chạy (khác vơí `beforeEach` là chạy trước MỖI test function `it`)

Ở đây, trong function `before`, mình khai báo server sẽ đưọc test bằng cú pháp `server = chai.request(app);`. Đoạn này giải thích vì sao chúng ta phải tác ứng dụng ra file `bin/www.js`. Vì, `chai` và `chaiHttp` sẽ chỉ nhận một `instance` của `httpServer`. Cho nên nếu chúng ta trả về app đang `listen` ở cổng 9999, nếu chúng ta có hơn 2 file test thì sẽ bị lỗi trùng cổng.

Để giải quyết vấn đề trùng cổng thì các bạn có thể tắt server sau khi đã test xong ở môi file với function `after` của mocha. Tuy nhiên cách này bắt bạn phải viết lặp đi lặp lại nhiều lần. Mình thì làm biếng lắm :D nên mình chọn cách trên.

Ngoài ra, để đảm bảo test case của chúng ta luôn đúng, chúng ta cần phải xoá tất cả file ảnh trong thư mục `public/resource` đi. bằng đoạn code `shelljs.rm('-rf', resourcePath);`
Bởi vì mình đang sử dụng NodeJS v9, cho nên tất cả các test case mình sẽ dùng cú pháp `async/await`. Đó là lý do bạn thấy cú pháp thế này

```javascript
const { status, body } = await server
  .post('/upload')
  .attach(
    'images',
    fs.readFileSync(`${__dirname}/SuperWoman.jpg`),
    'SuperWoman.jpg'
  );
```

Ở đây, mình post lên endpoint `/upload` một file ảnh bằng câu lệnh [attach](https://github.com/chaijs/chai-http#setting-up-requests) của `chai-http`. Sau đó chúng ta cần phải

* Đảm bảo status của request là 200: `assert.equal(status, 200);`
* Đảm bảo trong request trả về nội dung có biến `images`: `assert.exists(body.images, 'Return files should be exist');`
* Biến `images` phải là một array: `assert.isArray(body.images, 'Return array of files');`
* Vì chúng ta upload lên 1 file nên chúng ta phải kiểm tra kết quả trả về là bằng 1

Riêng đoạn này

```javascript
return new Promise(resolve =>
  fs.readdir(resourcePath, (err, files) => {
    assert.isNotOk(err);
    assert.equal(
      files.filter(file => file[0] !== '.').length,
      1,
      'The uploaded file should be in the right place'
    );
    resolve(true);
  })
);
```

mình sẽ kiểm tra trong thư mục `public/resource` chỉ có một tấm ảnh mà chúng ta vừa upload lên. Đoạn code `files.filter(file => file[0] !== '.').length` sẽ lấy tất cả file không phải là file ẩn (bắt đầu với ký tự `.` trên linux) sau khi đọc thư mục `public/resouce` bằng lệnh `fs.readdir`

Để bắt đầu test, bạn cần chạy câu lệnh

```shell
$ yarn test
```

Kêt quả sau khi test sẽ có dạng như thế này nghĩa là bạn đã test thành công. Để kiểm tra lại, bạn nên vào thư mục `public/resource` để kiểm tra xem có đúng là thư mục này có tấm ảnh mà bạn upload hay không

```shell
yarn run v1.3.2
$ yarn linter src
$ ./node_modules/.bin/eslint src
$ node -r dotenv/config ./node_modules/.bin/mocha --exit --recursive


  Upload
    ✓ should upload images successfully (46ms)


  1 passing (81ms)

Done in 1.39s.
```

### Viết test case với endpoint `/image/:size/:id`

Các bạn cần tạo file `test/requestImage.js` với nội dung như sau

```javascript
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
```

Ở test case này, các bạn cần chú ý

* Mình xoá cả tất cả ảnh trong hai thư mục cache và resource
* Mình upload một tấm ảnh mới
* Mình request một tấm ảnh với đưòng dẫn cần test
* Sau khi request xong, với biến `text` chính là nội dung của bức ảnh, chúng ta đọc file cache vừa đưọc ghi, dùng `hash md5` nội dung của biến `text` và nội dung của file cache vừa đọc để biết là file cache chính là file chúng ta cần.

Với cách test này, có một hạn chế là nếu trong quá trình request, kết quả trả về thiếu vài byte, thì test case của chúng ta sẽ sai. Hiện tại mình vẫn chưa biết cách fix cho vấn đề này.

## Kết luận

Khi một ứng dụng của bạn được cover hoàn toàn bằng test case, khi bạn deploy lên môi trưòng `production` sẽ rất là khoẻ. Trong quá trình đi làm hoặc tự code, hiệu suất làm việc khi mà có và không có test case khác nhau rất là lớn. Lúc mới vừa đi làm, mình cứ nghĩ là tại sao chúng ta lại phải viết test case. Nhưng từ khi mình bắt đầu viết test case, mình mới biết rằng, dù ban đầu bạn vừa code vừa viết test khá là lâu, nhưng khoản thời gian đó không là khi mà bạn cần test lại hết tất cả tính năng khi thêm mới một tính năng mới bất kỳ.

Nói về tầm quan trọng của test case, theo mình thấy, tất cả các thư viện được nhiều người sử dụng đều có một bộ test case. Và khi bạn muốn tạo một `pull request` trên một respo của ngưòi khác, họ sẽ luôn chạy test case trước khi merge code của bạn vào.

Chính vì thế, mình nhắc lại lời khuyên một lần nữa. Hãy viết tất cả các test case bạn có thể viết, từ unit test, đến interaction test, ...

Các bạn nên luôn nhớ một điều `Mọi sai lầm luôn phải trả giá`. Và nếu hôm nay bạn không có gắng hạn chế các sai lầm, thì có thể ngày mai bạn sẽ trả giá rất rất nhiều.

Bài tập của các bạn: Viết test case cho truờng hợp render ảnh với các kích thước khác

[Source Code](https://github.com/picosix/p6-static-example/tree/3eac416b5f7961dc23ae29d410adf23a23d6976f)

## Bài kế tiếp

[Sử dụng docker](10-dockerized-your-app.md)
