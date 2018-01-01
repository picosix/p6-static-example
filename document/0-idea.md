# Ý tưởng

## Cảm hứng

Ở công ty cũ, mình có một task về xây dựng một server render hình ảnh dựa trên request. Ví dụ

* xxx.com/full/**DATE_TIME**-the-fancy-image.png -> Trả về hình ảnh với kích thước gốc có kèm watermark
* xxx.com/logo/**DATE_TIME**-the-fancy-image.png -> Trả về hình ảnh được resize về kích thước quy định (size cho logo) và kèm watermark
* xxx.com/logo/**DATE_TIME**-the-fancy-image.png ?crop=1-> Trả về hình ảnh được cắt với kích thước quy định (size cho logo) và kèm watermark

Ở thời điểm đó, do giới hạn về thời gian (deadline dí đến #beep#), trình độ có hạn (junior :D), thủ đoạn cũng không có gì :( nên mình mới chỉ làm xong task mà chưa phải hoàn thành task. Sau một thời gian trăn trở (thật ra là không làm gì cứ nhớ về những dòng code kinh khủng của mình), hiện tại mình có thời gian (khá là rảnh buổi tối và cuối tuần), trình độ đủ kiếm cơm và mong muôn viết lách thì mình quyết đinh làm lại project đó một lần nữa với công nghệ mới hơn.

## Mục đích của project

1. Giúp một số bạn mới bắt đầu cuộc sống của một lập trình viên tham gia vào một project có tính ứng dụng thực tế, thú vị (theo mình là vui hơn là làm TODO project). Hiểu được cách tìm kiếm thông tin, đặt câu hỏi, giải quyết vần đề MỘT MÌNH.
2. Tạo ra một bản production-ready của static server phục vụ cho nhu cầu render ảnh với các kích thước khác nhau
3. Mình tin là người Việt Nam cũng có nhiều bạn sẵn sàng làm việc cho một dự án phi lợi nhuận (Nonprofit) :D, ít nhất trong project này. Mình hoan nghênh mọi cống hiến của các bạn, lắng nghe các yêu cầu và các câu hỏi, mình sẽ giải thích trong tầm hiểu biết của bản thân mình.

## Yêu cầu

* Biết javascript (không phải Jquery nhé), biết thêm về NodeJS càng tốt
* Biết các câu lệnh linux cơ bản (không biết các bạn có học môn "Hệ điều hành" và chọn Ubuntu không :D)
* Biết tự tìm kiếm và đặt câu hỏi

## Công nghệ sử dụng

* NodeJS. Mình fan NodeJS mà (dù kiếm cơm bằng PHP). Lý do chọn NodeJS là vì mình có thể cùng viết code backend và frontend trên một ngôn ngữ, cộng đồng lớn, build prototype khá là nhanh.
* Nginx. Chỉ một từ NGON. Nhanh, mạnh, dễ dùng. Render ảnh thì dùng Nginx là đúng bài luôn.
* Docker. Dễ dàng tạo một môi trường thống nhất từ development, test, cho tới production. Bạn chỉ cần build + config một lần và sử dụng, không cần mỗi server lại lặp lại các công việc install, setting, testing.

## Roadmap

0. Ý tưởng (Bài mà bạn đang đọc)
1. Khởi tạo api server với [express](https://github.com/expressjs/express)
2. Project config (gitignore, eslint, prettier, ...)
3. Upload ảnh với [multer](https://github.com/expressjs/multer)
4. Lưu thông tin ảnh với [lowdb](https://github.com/typicode/lowdb)
5. Render ảnh với NodeJS Stream [File System](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options)
6. Resize và render ảnh với [sharp](https://github.com/lovell/sharp)
7. Chèn watermark với [sharp](https://github.com/lovell/sharp)
8. Ghi log với [winston](https://github.com/winstonjs/winston)
9. Viết test case
10. Sử dụng docker
11. Tái cấu trúc code

### Note

1. Trong project này mình sử dụng [yarn](yarnpkg.com) như **node project manager**, nếu bạn muốn dùng `npm` (default **node project manager**) thì bạn có thể thay tất cả câu lệnh có từ `yarn` bằng `npm`
2. Mình đã test và project chạy được trên Ubuntu 17.04. Với window thì bạn nên cài `git bash` theo hướng dẫn ở [Freetuts](https://freetuts.net/cai-dat-git-bash-de-hoc-nodejs-665.html). Với macOS thì mình bó tay, các bạn phải tự bơi vậy, chừng nào mình mua thì mình sẽ cập nhật sau :D
3. Tất cả các câu lệnh bắt đầu với ký tự `$` nghĩa là bạn phải chạy với quyền là user bình thường, bắt đầu bằng `#` nghĩa là bạn phải có quyền root mới chạy được. Ví dụ

* `$ mkdir p6-static`
* `# chmod -R 777 .`

## Road map

Về cơ bản mình đã hoàn thành được 40% của project (gồm code và test), còn 10% của check security và 50% của deploy app lên một VPS. Mình sẽ post đều đều 2 bài/1 tuần, hi vọng hết tết Âm lịch các bạn có thể hoàn thành xong project. Cứ mong vậy đi.

## Cách tiếp cận

1. Hướng đơn giản nhất

* Mình post bài, các bạn đọc
* Gặp bug, không hiểu -> google -> hỏi ở một số group hoặc stackoverflow -> post issue lên trang github của project này -> tự xử. Chắc chắn là mình không thể trả lời hết các câu hỏi của các bạn, nên hãy tự thân vận động trước đi, hãy tính đến trường hợp xấu nhất là bạn không tìm được giải pháp rồi chán project.
* Đặt câu hỏi về một số đoạn code mà bạn cho là mình code sai. Tất nhiên rồi, mình là người mà (:D) nên mình cũng sẽ sai, chúng ta sẽ thảo luận như hai người đàn ông (có thể là n ngưòi đàn ông :D).

2. Hướng tích cực

* Mình post bài, các bạn đọc
* Các bạn đưa ra yêu cầu một số tính năng
* Nếu mình làm, mình sẽ cập nhật bạn vào phần _Contributors_
* Nếu mình không làm (vì ti tỉ lý do lý trấu), bạn làm, tạo một pull request (make a PR), mình sẽ cập nhật bạn vào phần _Contributors_

## Bài kế tiếp

[Khởi tạo api server với ExpressJS](./1-build-api-server-with-expressjs.md)
