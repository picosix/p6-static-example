# Resize ảnh với sharp

## Bài trước đó

[Render ảnh với Stream](./5-render-image-with-stream.md)

# Resize ảnh

Chúng ta cần tạo ra một endpoint, nơi mà client sẽ gửi lên request một tấm ảnh với kích thước mà client muốn (300x300 với mobile, 600x600 với tablet, full size với laptop chẳng hạn). Để làm đều đó chúng ta cần sửa lại endpoint `/image/:id` thành

```javascript
...

// Serve image
app.get('/image/:size/:id', async ({ params }, res, next) => {
  try {
    const { size, id } = params;
    const imgPath = path.resolve(__dirname, process.env.FOLDER_RESOURCE, id);

    if (!fs.existsSync(imgPath)) {
      throw new Error(`Image #${id} is not exist.`);
    }

    const imageStream = sharp(imgPath);
    // Get image data
    const imageData = await imageStream.metadata();
    if (size === 'xs') {
      imageStream.resize(imageData.width * 0.2, imageData.height * 0.2);
    }

    return imageStream.pipe(res);
  } catch (err) {
    return next(err);
  }
});

...
```

Ở đây mình quy định rằng nếu user request kích thước `xs` thì sẽ resize ảnh về còn 20%. Bây giờ, khi bạn truy cập lại vào đường dẫn ảnh ở bài trước (nhớ thêm `/xs/`, ví dụ `http://localhost:9999/image/xs/1514989443568-SuperWoman.jpeg`) thì bạn sẽ thấy tấm ảnh đã được thu nhỏ lại. Easy!!!

Nhưng không lẽ với mỗi size mình lại thêm 1 đoạn code? Không đời nào!!! Mình lười lắm. Cho nên mình sẽ sửa lại thế này

```javascript
...

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

    if (!fs.existsSync(imgPath)) {
      throw new Error(`Image #${id} is not exist.`);
    }

    const imageStream = sharp(imgPath);
    // Get image data
    const imageData = await imageStream.metadata();

    const requestSize = allowSizes[size] ? allowSizes[size] : DEFAULT_SIZE;

    // Resize with percent
    if (_.isNumber(requestSize)) {
      imageStream.resize(
        imageData.width * requestSize,
        imageData.height * requestSize
      );
    }
    // resize with absolute size
    if (_.isObject(requestSize)) {
      imageStream.resize(requestSize.width, requestSize.height);
    }

    return imageStream.pipe(res);
  } catch (err) {
    return next(err);
  }
});

...
```

Ở đây mình config để nếu client yêu cầu một size không hợp lệ thì sẽ dùng DEFAULT_SIZE, và nếu trong giá trị của `request size` là số thì nghĩa là chúng ta sẽ resize theo phần trăm của tấm ảnh (0 < x < 1) hoặc resize bằng với đúng size mà chúng ta muốn.

# Ghi cache

Ok, mọi thứ đã hoạt động tốt rồi, giờ là lúc chúng ta tối ưu nó. Bởi vì việc resize khá là tốn tài nguyên (siêu tốn), cho nên tốt nhất sau khi resize ảnh rồi, chúng ta ghi ra một file ảnh, để làn sau việc của chúng ta chỉ là đọc file đó mà thôi.

Đầu tiên cách bạn cần tạo thư mục `public/cache` và sửa lại endpoint `image/:size/:id` như sau

```javascript
...


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

    // Resize with percent
    if (_.isNumber(requestSize)) {
      imageStream.resize(
        imageData.width * requestSize,
        imageData.height * requestSize
      );
    }
    // resize with absolute size
    if (_.isObject(requestSize)) {
      imageStream.resize(requestSize.width, requestSize.height);
    }

    // Write cache
    imageStream
      .clone()
      .toFile(imgCachePath)
      .catch(console.log);

    return imageStream.pipe(res);
  } catch (err) {
    return next(err);
  }
});

...
```

Chúng ta cần clone instance của `sharp` ra để ghi vào một file cache để lần request sau, chúng ta check xem file cache nếu đã tồn tại rồi thì dùng `fs.createReadStream` để trả về ảnh. Hẳn các bạn còn nhớ hàm này mình đã hướng dẫn ở bài [Render ảnh với Stream](./5-render-image-with-stream.md).

## Kết luận

Về cơ bản thì bài hôm nay cũng chẳng có gì khó khăn cả. Điểm cần chú ý của bài này là cách mà chúng ta sử dụng api `resize` và `toFile` của `sharp` để resize và ghi cache file ảnh. Ngoài ra, `sharp` còn hỗ trợ chúng ta chèn ảnh (mình sẽ hướng dẫn ở bài sau), xoay ảnh, chỉnh sửa màu, ... bạn có thể tham khảo tại đây [sharp document](http://sharp.dimens.io/en/stable/)

[Source Code](https://github.com/picosix/p6-static-example/tree/aa541a56cc006f79c54b2f88c7c78de27f370daa)

## Bài kế tiếp

[Chèn watermark với sharp](./7-embedded-watermark-with-sharp.md)
