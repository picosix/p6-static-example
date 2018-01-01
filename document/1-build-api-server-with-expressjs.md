# Khởi tạo api server với ExpressJS

## Bài trước đó

[Ý tưởng](./0-idea.md)

## Khởi tạo project và cài đặt express

* Tạo thư mục vào khởi tạo project

```shell
$ mkdir p6-static
$ cd p6-static
$ yarn init
```

* Sau câu lệnh `$ yarn init` thì bạn cần trả lời vài câu hỏi cho project. Bạn có thể chỉ việc nhấn Enter cho đến khi xong. Output có thể như thế này (tuỳ vào bạn xài yarn hay npm)

```shell
yarn init v1.3.2
question name (p6-static-example):
question version (0.0.1):
question description (Serve an image at different size / resolution depending on user request):
question entry point (index.js):
question repository url (git@github.com:picosix/p6-static-example.git):
question author (TuanNguyen):
question license (MIT):
question private:
success Saved package.json
Done in 7.53s.
```

Nếu bạn thấy output của bạn không giống của mình thì ... kệ nó đi, đôi khi nó khác cũng có thể do mình cập nhật document thiếu vài chỗ. Output chỗ này không quan trọng.

* Bây giờ bạn sẽ có một file `package.json` trong project của bạn (với mình là `~/projects/p6-static-example/package.json`). Tiếp theo bạn cần cài `express` và `lodash`

```shell
$ yarn add express lodash
```

* Tạo file `index.js` để khởi tạo server đầu tiên của bạn.

```javascript
const express = require('express');
const _ = require('lodash');

const app = express();

// Routes
const packageJson = require('./package.json');
// Root
app.get('/', (req, res) =>
  res.json(
    _.pick(packageJson, ['name', 'version', 'description', 'author', 'license'])
  )
);

const port = process.env.PORT || 9999;
app.listen(port);
```

* Giờ chạy server của bạn bằng câu lệnh

```shell
$ node index.js
```

và truy cập địa chỉ [localhost:9999](http://localhost:9999) bạn sẽ thấy output

```json
{
  "name": "p6-static-example",
  "version": "0.0.1",
  "description":
    "Serve an image at different size / resolution depending on user request",
  "author": "TuanNguyen",
  "license": "MIT"
}
```

## Sử dụng biến môi trường để lưu config

Trong file `index.js` ở trên bạn có thấy mình sử dụng biến `process.env.PORT`, biến này có thể được lấy từ param trên câu lệnh của bạn. Thay vì chỉ chạy `$ node index.js`, bạn có thể chạy câu lệnh sau

```shell
$ PORT=9998 node index.js
```

Bây giờ bạn vào trở lại app với đường dẫn [localhost:9998](http://localhost:9998) bạn sẽ thấy kết quả như trên.

Vậy nếu bạn có cỡ 20 settings thì sao? Câu lệnh chắc dài cả cây số mất. Vì thế chúng ta có thư viện [dotenv](https://github.com/motdotla/dotenv)

### Cài đặt dotenv

```shell
$ yarn add dotenv
```

### Tạo file chứa biến môi trường

Bạn cần tạo một file `.env` với nội dung như sau

```text
# System
NODE_ENV=devlopment
PORT=9999
```

Bây giờ bạn có thể chạy câu lệnh

```shell
$ node -r dotenv/config index.js
```

với tham số `--require` (`-r`) sẽ bắt buộc node load nội dung file `.env` lên trước khi thực thi file `index.js`. Điều này đảm bảo tất cả biển môi trường của bạn sẽ xuất hiện trong `process.env`. Giờ thì bạn truy cập địa chỉ [localhost:9999](http://localhost:9999) để xem kết quả

Kể từ bây giờ bạn có thể dùng file `.env` để chứa tất cả biến môi trưòng mà bạn cần.

* **Note:** Tất cả biến môi trường đều sẽ xử lý dưới dạng text, nếu bạn muốn dùng
  * array -> lưu cách nhau bằng dấu `,` rồi cắt chuỗi. Ex: `ALLOW_TYPES=image/png,image/jpeg,image/gif`
  * object -> lưu dạng json rồi decode

## Cài đặt development environment

Nãy giờ có một vấn đề mình chưa nói, là mỗi khi bạn cần kiểm tra những thay đổi của code, bạn cần nhấn `Ctrl + C` để ngừng chương trình rồi chạy lại. Mình thì làm biếng lắm (có lẽ cũng có nhiều người làm biếng như mình), nên mới sinh ra một số thư viện sẽ tự động reload app cho bạn khi bạn thay đổi code. Nổi bật nhất là [nodemon](https://github.com/remy/nodemon)

### Cài đặt nodemon

```shell
yarn add -D nodemon
```

với tham số `-D` nghĩa là bạn muốn thêm thư viện `nodemon` vào block gọi là `devDependencies` -> chỉ xài với dev, không xài với production

### Sử dụng nodemon

Bạn cần thêm `package scripts` vào file `package.json`, giống như thế này

```json
{
  "name": "p6-static-example",
  "version": "0.0.1",
  "description":
    "Serve an image at different size / resolution depending on user request",
  "main": "index.js",
  "repository": "git@github.com:picosix/p6-static-example.git",
  "author": "TuanNguyen",
  "license": "MIT",
  "scripts": {
    "start-dev": "node -r dotenv/config ./node_modules/.bin/nodemon index.js"
  },
  "dependencies": {
    "dotenv": "^4.0.0",
    "express": "^4.16.2",
    "lodash": "^4.17.4"
  },
  "devDependencies": {
    "nodemon": "^1.14.6"
  }
}
```

sau đó bạn chạy `package script`

```shell
$ yarn start-dev # với npm `$ npm run start-dev`
```

sẽ có output

```shell
yarn run v1.3.2
$ node -r dotenv/config ./node_modules/.bin/nodemon index.js
[nodemon] 1.14.6
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `node index.js`
```

Bạn cần check lại địa chỉ [localhost:9999](http://localhost:9999) để đảm bảo app vẫn chạy đúng

```json
{
  "name": "p6-static-example",
  "version": "0.0.1",
  "description":
    "Serve an image at different size / resolution depending on user request",
  "author": "TuanNguyen",
  "license": "MIT"
}
```

Bạn có thể test thử bằng cách

```javascript
...
app.get('/', (req, res) =>
  res.json(
    _.pick(packageJson, ['name', 'version']) // bỏ 3 fields  'description', 'author', 'license'
  )
);
...
```

trên terminal của bạn nên có thêm 2 dòng

```shell
yarn run v1.3.2
$ node -r dotenv/config ./node_modules/.bin/nodemon index.js
[nodemon] 1.14.6
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `node index.js`
[nodemon] restarting due to changes... // Đây là hai dòng được thêm vào
[nodemon] starting `node index.js` // sau khi bạn thay đổi code trong file index.js
```

Bạn cần check lại địa chỉ [localhost:9999](http://localhost:9999) và chắc rằng bạn có output như thế này

```json
{ "name": "p6-static-example", "version": "0.0.1" }
```

Bạn nhớ trả lại những dòng mà bạn đã sửa về như cũ - show đủ thông tin `name`, `version`, `description`, `author`, `license`

## Push code lên github

Nếu đây là lần đầu bạn có ý định push code lên github thì bạn cần

1. Tạo project mới trên github
2. Thêm remote respo `$ git remote add origin git@github.com:picosix/p6-static-example.git`. Bạn nên thay `git@github.com:picosix/p6-static-example.git` bằng đường dẫn đến project của bạn. Với đường dẫn bắt đầu bằng `git` thì bạn cần có ssh key để push code. Bạn có thể đọc ở đây [Connecting to github with ssh](https://help.github.com/articles/connecting-to-github-with-ssh/)
3. Config name và email cho git project

* `$ git config user.name 'picosix'` thay `picosix` bằng tên của ban
* `$ git config user.email 'picosix.com@gmail.com` thay `picosix.com@gmail.com` bằng email của bạn

4. Bạn cần copy nội dung file [.gitignore](https://github.com/picosix/p6-static/blob/master/.gitignore), lưu vào project của bạn với tên `.gitignore`
5. Commit `git add . && git commit -m 'Init commit'`
6. Push code `git push origin master`

Mình không đi sâu vào phần git vì có khá nhiều hướng dẫn bạn có thể tìm được. Ví dụ series [Git cơ bản](https://thachpham.com/series/git-co-ban) của anh "Thach Pham".

## Kết thúc

Về cơ bản bạn đã setup xong một project API server với NodeJS và ExpressJS của bạn. Tuy nhiên chúng ta còn cần vài cài đặt để project có thể chạy mượt mà. Bạn có thể đợi mình giới thiệu ở bài kế hoặc tìm hiểu trước về `eslint`, `pretier`.

Result: https://github.com/picosix/p6-static-example/tree/28cfad7fd2a42d0bd369fb9598cadb5e424dc19c

## Bài kế tiếp

[Project config](./2.project-config.md)
