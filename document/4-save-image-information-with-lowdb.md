# Lưu data với LowDB

## Bài trước đó

[Upload ảnh với multer](./3-upload-image-with-multer.md)

Với project này mình muốn dùng một "portable database", nghĩa là không cần cài đặt nặng nề mà đặt tính "đơn giản", "gọn nhẹ", "dễ sử dụng" làm tiêu chí hàng đầu. Vì vậy `json database` là lựa chọn khá tôt (sqllite cũng là một lựa chọn) vì mình có thẻ giúp người dùng dễ dàng thêm vào các field mà người dùng muốn lưu lại khi upload ảnh. Mình chọn [lowdb](https://github.com/typicode/lowdb) vì nó đáp ứng được các tiêu chí (với lại do mình quen dùng :))

## Cài đặt

```shell
$ yarn add lowdb
```

## Sử dụng

Sau khi cài đặt xong bạn cần chỉnh sửa file `index.js` lại như sau

```javascript
...

const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

...

const adapter = new FileAsync('db.json');
const db = (async connection => {
  const dbConnection = await connection;
  await dbConnection.defaults({ resource: [], users: [] }).write();
  return dbConnection;
})(lowdb(adapter));

...
```

Các bạn có thể thấy ở đây mình tạo một `adapter` sử dụng `asynchronous adatapter` để sử dụng promise khi thao tác với database. Bạn có thể sử dụng `synchronous adatapter` với adapter `FileSync` (mình không khuyến khích).

Sau đó mình định nghĩa một `Immediately Invoked Function Expression` (IIFE - Xem thêm về [IIFE](https://developer.mozilla.org/vi/docs/Glossary/IIFE)) vì khi khởi tạo connection xong thì `lowdb` sẽ trả về một promise, mà chúng ta cần khởi tạo file database cùng với một vài giá trị (ở đây là `resource` và `users`). Những giá trị này tương đương với collection bên `mognodb` hoặc table bên `SQL`.

Lúc này sẽ có một file `db.json` sẽ đưọc tạo ra trong project của bạn với nội dung

```json
{
  "resource": [],
  "users": []
}
```

Đồng thời khi nhìn vào terminal bạn sẽ phát hiện là `nodemon` sẽ khởi động liên tục. Lý do là `lowdb` sẽ ghi giá trị vào file `db.json` ngay khi chúng ta khởi động app, trong khi đó `nodemon` sẽ khởi động lại app khi có bất kỳ file `js`, `json`, ... nào được thay đổi nội dung trong project của chúng ta. Vì vậy sẽ sinh ra một vòng lặp vô tận.

Để giải quyết tính trạng trên thì chúng ta cần thông báo cho `nodemon` rằng không cần kiểm tra sự thay đổi của file `db.json` bằng cách sửa lại câu lệnh `start-dev` trong file `package.json` như sau

```
...
  "scripts": {
    "start-dev": "node -r dotenv/config ./node_modules/.bin/nodemon --ignore db.json index.js"
  },
...
```

Sau đó bạn tắt và khởi động lại app thì sẽ thấy nodemon không còn bị khởi động liên tục nữa

## Lưu thông tin ảnh khi upload

Bạn còn nhớ endpoint `/upload` mà chúng ta đã định nghĩa ở bài 3? Bây giờ chúng ta cần sửa lại nó một tí

```javascript
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
```

Bạn cần chú ý là mình lặp qua tất cả các files đã được upload thành công (multer sẽ lưu những file đó vào biến req.files - mình dùng [Spread Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator) để lấy ra biến files), với mỗi vòng lặp mình

* Lưu promise của việc lưu data vào một biến tạm - `insertQueue`
* Lưu thông tin sẽ trả về cho client ở một biến tạm khác - `images`

Sau khi kết thúc vòng lặp mình thực thi tất cả các promise trong biến `insertQueue` để lưu data vào database. Sau đó lấy thông tin trong biến `images` trả về cho client

## Test

Bạn có thể dùng lại câu lệnh ở bài 3 để tiếp tục test

```shell
curl -F "images=@./test/SuperWoman.jpg" -F "images=@./test/SuperWoman.jpg" http://localhost:9999/upload
```

thì bạn sẽ thấy kết quả trả về trên terminal là

```json
{
  "images": [
    { "name": "1514989443560-SuperWoman.jpeg" },
    { "name": "1514989443568-SuperWoman.jpeg" }
  ]
}
```

và file `db.json` sẽ có dữ liệu

```json
{
  "resource": [
    {
      "id": "1514989443560-SuperWoman.jpeg",
      "name": "1514989443560-SuperWoman.jpeg",
      "path":
        "__HOME__/projects/p6-static-example/public/resource/1514989443560-SuperWoman.jpeg",
      "size": 206319
    },
    {
      "id": "1514989443568-SuperWoman.jpeg",
      "name": "1514989443568-SuperWoman.jpeg",
      "path":
        "__HOME__/projects/p6-static-example/public/resource/1514989443568-SuperWoman.jpeg",
      "size": 206319
    }
  ],
  "users": []
}
```

## Kết luận

Kết thúc phần thì các bạn có thể lưu được data vào `json database`. Các bạn nên đọc thêm về `lowdb` để hiểu thêm về cách mà thư viện này thực hiện các thao tác `CRUD` cũng như cách hoạt động của thư viện (viết bởi `lodasb` nên bạn nào xài quen thư viện này sẽ đễ tiếp cận).

Bài tập của các bạn: Sử dụng một `unique id` thay vì sử dụng `filename` làm id.

[Source Code](https://github.com/picosix/p6-static-example/tree/5c2c0dd357efd1d07fc1e7a2de0eec99e8d41e19)

## Bài kế tiếp

[Render ảnh với Stream](./5-render-image-with-stream.md)
