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
