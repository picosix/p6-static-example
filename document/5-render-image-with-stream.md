# Render ảnh với Stream

## Bài trước đó

[Lưu data với LowDB](./4-save-image-information-with-lowdb.md)

## Thêm api endpoint

Bạn cần thêm một endpoint cho api với cấu trúc như sau

```javascript
...

const fs = require('fs');
const path = require('path');

...

// Serve image
app.get('/image/:id', async (req, res, next) => {
  // Code
});

// Error handler
app.use((err, req, res, next) => {
  const message =
    process.env.NODE_ENV !== 'production'
      ? err.message
      : 'An error encountered while processing images';
  res.status(500).json({ message });

  return next();
});

...
```

Trong endpoint `/image/:id`, thì `id` chính là tên của bức ảnh mà bạn upload vào folder `public/resource` (ví dụ `1514989443560-SuperWoman.jpeg`)

Ở đây mình thêm một midleware để xử lý các thông báo lỗi. Và chỉ hiển thị thông báo lỗi đầy đủ khi mà môi trường không phải là `production` (xác định bởi biến process.env.NODE_ENV)

## Render ảnh bằng NodeJS Stream

Khi render bất kỳ file nào bằng NodeJS bạn cũng nên sử dụng stream vì nó sẽ giúp giảm thiểu bộ nhớ sử dụng của ứng dụng. Bạn có thể đọc bài [Node.js Streams: Everything you need to know](https://medium.freecodecamp.org/node-js-streams-everything-you-need-to-know-c9141306be93) để hiểu rõ hơn.

Vì vậy chúng ta cần sửa file `index.js` lại như sau

```javascript
...

// Serve image
app.get('/image/:size/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const imgPath = path.resolve(__dirname, process.env.FOLDER_RESOURCE, id);

    if (!fs.existsSync(imgPath)) {
      throw new Error(`Image #${id} is not exist.`);
    }

    const imageStream = fs.createReadStream(imgPath);
    return imageStream.pipe(res);
  } catch (err) {
    return next(err);
  }
});

...
```

Chúng ta cần check xem file image cần có tồn tại không bằng hàm synchronous `fs.existsSync(imgPath)` (chúng ta không dùng hàm fs.exists(imgPath) vì nó đã bị gán nhãn `Deprecated`. Xem thêm tại [File System](https://nodejs.org/api/fs.html#fs_fs_exists_path_callback)). Sau đó tao render ảnh trả về cho client thông qua `ReadStream`

Sau khi truy cập vào địa chỉ `http://localhost:9999/image/:id` (ví dụ `http://localhost:9999/image/1514989443560-SuperWoman.jpeg`) bạn sẽ thấy hình ảnh được render trên trình duyệt.

## Render ảnh bằng `sharp`

Phần hướng dẫn render bằng thư viện `sharp` này phục vụ cho viêc chúng ta sẽ resize và render ảnh cho client ở phần hướng dẫn sau. Về bản chất hầu hết các thư viện chỉnh sửa ảnh của NodeJS đều sẽ có option để chúng ta sử dụng `ReadStream` để trả kết quả về client.

Bạn cần cài đặt `sharp` bằng câu lệnh

```shell
$ yarn add sharp
```

Và chỉnh sửa endpoint `/image/:id` lại như sau

```javascript
...

const sharp = require('sharp');

...

// Serve image
app.get('/image/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const imgPath = path.resolve(__dirname, process.env.FOLDER_RESOURCE, id);

    if (!fs.existsSync(imgPath)) {
      throw new Error(`Image #${id} is not exist.`);
    }

    const imageStream =sharp(imgPath);
    return imageStream.pipe(res);
  } catch (err) {
    return next(err);
  }
});

...
```

Sau khi truy cập vào địa chỉ `http://localhost:9999/image/:id` (ví dụ `http://localhost:9999/image/1514989443560-SuperWoman.jpeg`) bạn sẽ thấy hình ảnh được render trên trình duyệt.

## Kết luận

Phần render ảnh với `ReadStream` này khá là đơn giản. Nội dung chính của phần này chỉ gồm 3 phần

* Tại sao nên sử dụng `ReadStream` để render ảnh (link mình cung cấp trong bài). Tóm tắt là giúp giảm bộ nhớ sử dụng.
* Render ảnh bầng core module của NodeJS - `fs`
* Render ảnh bằng thư viện `sharp`

Bài tập của các bạn: Làm quen và sử dụng cơ bản thư viện [sharp](https://github.com/lovell/sharp) để chuẩn bị cho bài học sau.

[Source Code](https://github.com/picosix/p6-static-example/tree/f3236d3369bab74ec1ec0a46d3e97703a743964b)

## Bài kế tiếp

[Resize ảnh với sharp](./6-resize-image-with-sharp.md)
