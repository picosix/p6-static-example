# Chèn watermark với sharp

## Bài trước đó

[Resize ảnh với sharp](./6-resize-image-with-sharp.md)

Về cơ bản sau 5 bài hướng dẫn thì phần ứng dụng chính của chúng ta đã xong.

* Upload ảnh lên server
* Trả về ảnh với kích thước mà client muốn

Ở phần này mình sẽ hướng dẫn các bạn cách chèn watermark cho ảnh. Phần này cần thiết khi bạn không muốn người khác crawl dữ liệu web của bạn (ảnh có watermark thì crawl cũng như không hehe)

# Chèn ảnh

Đầu tiên bạn cần tạo thư mục `public/static` và để vào đó một tấm ảnh mà bạn muốn làm logo (mình có để sẵn log của mình trong github rồi). Sau đó bạn chỉnh sửa lại file `index.js` như sau

```javascript
...


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
      .catch(console.log);

    return imageStream.pipe(res);
  } catch (err) {
    return next(err);
  }
});

...
```

Như các bạn thấy, ở đây mình dùng `sharp` để load logo lên, sau đó resize ảnh lại dựa trên phần trăm resize của ảnh cần load. Các bạn chú ý đoạn

```javascript
...

imageStream.overlayWith(await watermark.toBuffer(), {
  gravity: 'southwest'
});

...
```

mình sử dụng async/await để lấy được buffer của tấm ảnh, sau đó dùng api `overlayWith` của `sharp` để render logo ở vị trí `southwest` - góc dưới bên trái.

Các bạn có thể đọc thêm

* Option của `overlayWith` tại [api-composite](http://sharp.dimens.io/en/stable/api-composite/)
* Vị trí có thể render logo [gravity](http://sharp.dimens.io/en/stable/api-resize/#crop). Về cơ bản thì có các vị trí `north`, `northeast`, `east`, `southeast`, `south`, `southwest`, `west`, `northwest`, `center` and `centre`. Các bạn có thể từ từ thử

Bây giờ bạn có thể truy cập vào endpoint `/image/:size/:id` để thấy ảnh của bạn đã có watermark (ví dụ `http://localhost:9999/image/xs/1514989443568-SuperWoman.jpeg`). Lỡ mà bạn "xui xui" không thấy tấm ảnh thì cũng đừng lo :D Bạn có nhớ vụ cache file ở bài trước không? Xoá hết file cache đi rồi bạn sẽ thấy điều "ma thuật" :)

## Kết luận

Ở phần này mình chỉ hướng dẫn các bạn phần đơn giản nhất. Bạn có logo, bạn chèn nó vào ảnh của bạn vào vị trí bạn muốn. Xong. Còn về việc bạn muốn logo trong suốt (đọc ở đây [Colour manipulation](http://sharp.dimens.io/en/stable/api-colour/#background)), một số kiểu render khác (xem ở đây [Api Operation](http://sharp.dimens.io/en/stable/api-operation/)), tìm hiểu các dạng output thay vì chỉ là buffer (xem ở đây [Api Output](http://sharp.dimens.io/en/stable/api-output/)), ... thì bạn có thể tự xem và tự làm theo các link mình cung cấp ở trên

Phần này cũng là phần kết thúc hướng dẫn thao tác với thư viện `sharp`. Lý do mà mình chọn thư viện này để sử dụng là vì

* Hiệu năng cao [Performance](http://sharp.dimens.io/en/stable/performance/) khi so với một số thư viện khác như `imagemagick`, `gm`, `jimp`, ...
* API đơn giản, dễ sử dụng. Mình lười lắm :D nên mình muốn làm mọi thứ phải thật mạnh mẽ nhưng cũng phải đơn giản để người dùng có thể sử dụng dễ dàng.

Nếu các bạn muốn mình viết về phần này thì có thể tạo một issue tại đây

https://github.com/picosix/p6-static-example/issues/new

[Source Code](https://github.com/picosix/p6-static-example/tree/a4938b1560124194959ce4b6fe5fe447adab999c)

## Bài kế tiếp

[Ghi log với winston](./8-write-log-with-winston.md)
