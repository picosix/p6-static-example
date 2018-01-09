# Ghi log với winston

## Bài trước đó

[Chèn watermark với sharp](./7-embedded-watermark-with-sharp.md)

Trong quá trình ứng dụng đang chạy, sẽ có lúc ứng dụng bị lỗi (tất nhiên rồi, bug là đặc sản rồi :D). Lúc đó chỉ có những dòng log quý giá mới có thể giúp chúng ta biết rằng "Điều \*\*\* gì đã xảy ra với ứng dụng của ... vậy? Với NodeJS thì mình thấy `winston` xài khá là ngon, hỗ trợ nhiều cấu hìnhd dể bạn có thể ghi log một cách thuận tiện.

## Cài đặt

```shell
$ yarn add winston@next
```

Sau khi cài đặt xong thì bạn cần tạo folder `log` để làm nơi chứa các file log

## Sử dụng

Các bạn sửa lại file `index.js` như sau

```javascript
...

const winston = require('winston')

...

const {createLogger,format,transports} = winston

...

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    // Ghi log ra 2 file tách biệt
    // error.log sẽ ghi lại những error trong ứng dụng
    // combined.log sẽ ghi lại toàn bộ log như: error, warn, info, ...
    new transports.File({ filename: 'log/error.log', level: 'error' }),
    new transports.File({ filename: 'log/combined.log' })
  ]
});

// Nếu ứng dụng không phải là môi trường `production`
// thì chúng ta sẽ ghi log ra console để giúp quá trình debug dễ dàng hơn
// Định dạng log sẽ là `${info.level}: ${info.message} JSON.stringify({ ...rest })`
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }));
}

...
```

Tại sao chúng ta lại cần hai file log `error.log` và `combined.log`? Bởi vì trong hầu hết trường hợp, chúng ta chỉ cần quan tâm ứng dụng bị lỗi thế nào, input của hàm bị lỗi, ... Vì thê ghi ra file `error.log` giúp chúng ta dễ dàng tìm được dòng log của bug nhanh nhất. Thêm vào đó nếu project đang trong giai đoạn phát triền thì để dễ dàng debug chúng ta ghi luôn log ra ngoài console :D

## Sử dụng

Bạn còn nhớ, ở bài trước, mình có dòng này

```javascript
...

imageStream
  .clone()
  .toFile(imgCachePath)
  .catch(console.log);

...
```

Ở bài trước, mình chỉ đơn giản là ghi log ra console khi mà quá trình ghi cach bị lỗi, cách này chỉ có thể áp dụng với môi trường dev, stage mà không thể dùng cho production. Vì thế chúng ta cần sửa lại như thế này

```javascript
...

imageStream
  .clone()
  .toFile(imgCachePath)
  .catch(({ message, code, stack }) =>
    logger.error(message, { code, stack })
  );

...
```

Để test được phần logger này thì các bạn đơn giản là xoá đi thư mục `public/cache`, sau đó vào một link ảnh (ví dụ `http://localhost:9999/image/full/1514989443568-SuperWoman.jpeg`) thì các bạn sẽ thấy một lỗi như thế này

```shell
error: vips__file_open_write: unable to open file "__HOME__/projects/p6-static-example/public/cache/full-1514989443568-SuperWoman.jpeg" for writing
unix error: No such file or directory
 {"stack":"Error: vips__file_open_write: unable to open file \"__HOME__/projects/p6-static-example/public/cache/full-1514989443568-SuperWoman.jpeg\" for writing\nunix error: No such file or directory\n"}
```

Nếu bạn mở hai file `log/error.log` và `log/combined.log` thì sẽ thấy được một dòng log tương tự như trên.

Ngoài ra các bạn cũng cần sửa lại `error handler` của express như thế này để chúng ta ghi lại log của ứng dụng

```javascript
...

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

...
```

Để test cho trường hợp này thì bạn chỉ cần gây lỗi ở bất kì endpoint nào và truy cập vào endpoint đó. Ở đây mình thêm một chữ `s` vào endpoint `/image/:size/:id` và sẽ được kết quả ở console như sau

```shell
error: s is not defined {"stack":"ReferenceError: s is not defined\n    at app.get (/home/picosix/projects/p6-static-example/index.js:111:5)\n    at Layer.handle [as handle_request] (/home/picosix/projects/p6-static-example/node_modules/express/lib/router/layer.js:95:5)\n    at next (/home/picosix/projects/p6-static-example/node_modules/express/lib/router/route.js:137:13)\n    at Route.dispatch (/home/picosix/projects/p6-static-example/node_modules/express/lib/router/route.js:112:3)\n    at Layer.handle [as handle_request] (/home/picosix/projects/p6-static-example/node_modules/express/lib/router/layer.js:95:5)\n    at /home/picosix/projects/p6-static-example/node_modules/express/lib/router/index.js:281:22\n    at param (/home/picosix/projects/p6-static-example/node_modules/express/lib/router/index.js:354:14)\n    at param (/home/picosix/projects/p6-static-example/node_modules/express/lib/router/index.js:365:14)\n    at param (/home/picosix/projects/p6-static-example/node_modules/express/lib/router/index.js:365:14)\n    at Function.process_params (/home/picosix/projects/p6-static-example/node_modules/express/lib/router/index.js:410:3)"}
```

Ngoài ghi lại error log, các bạn cũng có thể ghi lại các level log khác nhau như sau

```javascript
logger.log('silly', "127.0.0.1 - there's no place like home");
logger.log('debug', "127.0.0.1 - there's no place like home");
logger.log('verbose', "127.0.0.1 - there's no place like home");
logger.log('info', "127.0.0.1 - there's no place like home");
logger.log('warn', "127.0.0.1 - there's no place like home");
logger.log('error', "127.0.0.1 - there's no place like home");
logger.info("127.0.0.1 - there's no place like home");
logger.warn("127.0.0.1 - there's no place like home");
logger.error("127.0.0.1 - there's no place like home");
```

## Kết luận

Ở phần này mình đã hướng dẫn các bạn cách ghi log ra file để tiện việc debug. Ngoài ra các bạn có thể ghi log ra database [winston-mongodb](https://github.com/winstonjs/winston-mongodb), gửi mail [winston-mail](https://github.com/wavded/winston-mail), hoặc giàu có hơn thì xài [winston-aws-cloudwatch](https://github.com/timdp/winston-aws-cloudwatch), ...

Nếu như thư viện có sẵn không đủ để bạn sử dụng, bạn có thể tự tạo một logger theo ý mình dựa theo hướng dẫn ở đây [Custom logger](https://github.com/winstonjs/winston#adding-custom-transports)

[Source Code](https://github.com/picosix/p6-static-example/tree/b8517ae3a7c98be4d37c870b754f90c3c2bc7756)

## Bài kế tiếp

[Viết test case](./9-write-test-case.md)
