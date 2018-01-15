# p6-static-example

[DEMO](http://static.picosix.p6app/demo/index.html)

Lưu ý: Vì giới hạn của server, bạn chỉ nên upload ảnh với kích thước **FULL HD** (1920px/1200px) trở xuống

Project này là một tutorial giúp các bạn xây dựng một server ảnh - trả về tấm ảnh với đúng kích thước mà bạn muốn. Những hướng dẫn này được thực hiện trong quá trình mình xây dựng sản phẩm [picosix/p6-static](https://github.com/picosix/p6-static), với các bước được đơn giản hoá để các bạn có thể dễ dàng tiếp cận.

Các bạn có thể

* Theo dõi tutorial này và làm theo để tạo ra một project riêng cho bạn
* Sử dụng bản production tại [picosix/p6-static](https://github.com/picosix/p6-static)

## Nội dung bài học

0. [Ý tưởng](./document/0-idea.md)
1. [Khởi tạo api server với ExpressJS](./document/1-build-api-server-with-expressjs.md)
1. [Project config](./document/2.project-config.md)
1. [Upload ảnh với multer](./document/3-upload-image-with-multer.md)
1. [Lưu data với LowDB](./document/4-save-image-information-with-lowdb.md)
1. [Render ảnh với Stream](./document/5-render-image-with-stream.md)
1. [Resize ảnh với sharp](./document/6-resize-image-with-sharp.md)
1. [Chèn watermark với sharp](./document/7-embedded-watermark-with-sharp.md)
1. [Ghi log với winston](./document/8-write-log-with-winston.md)
1. [Viết test case](./document/9-write-test-case.md)
1. [Sử dụng docker](./document/10-dockerized-your-app.md)
1. [Tái cấu trúc code](./document/11-refactor-code-structure.md)
1. [Deploy project lên VPS (Digital Ocean)](./document/12-deployment.md)
