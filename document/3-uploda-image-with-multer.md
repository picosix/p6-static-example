# Upload image with multer

## Bài trước đó

[Project config](./2.project-config.md)

## Giới thiệu

Với hướng dẫn trước thì chúng ta đã hoàn thành việc setup project để cuộc sống của chúng ta đơn giản hơn :D. Ở bài này mình sẽ hướng dẫn các bạn sử dụng thư viện [multer](https://github.com/expressjs/multer) xử lý các request `multipart/form-data` được dùng để upload file.

## Cài đặt

```shell
$ yarn add multer
```

## Sử dụng

Multer có các phần sau bạn cần chú ý

* `storeage` là nơi bạn quyết định thư mục mà file của bạn được upload đến, tên mà file bạn muốn đặt khi đã upload xong
* `fileFilter` là config để bạn giới hạn các loại file mà bạn cho phép upload
* `limits` là config để bạn giới hạn data của tiến trình upload, như số lượng file được upload, kích thước file tối đa, độ dài của field upload

1. Đầu tiên bạn cần tạo thư mục `public/resource` trong project của bạn để có thể lưu trữ hình được upload lên

```shell
$ mkdir -p public/resource
```

2. Bạn tạo một `api endpoint` để xử lý việc upload ảnh bằng express. Thêm đoạn sau vào file `index.js` của bạn

```javascript

...

const path = require('path')
const multer = require('multer')

...

// Upload image
const allowTypes = ['image/png', 'image/jpeg', 'image/gif'];
const uploadConfig = {
  fields: 17,
  files: 17,
  fileSize: 100 * 1048576,
  parts: 17
};
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, `${path.resolve(__dirname, '..', 'resource')}`);
  },
  filename(req, { originalname, mimetype }, cb) {
    const nameSegments = originalname.split('.');
    const name = nameSegments[0] || `${Date.now()}`;

    const mineTypeSegments = mimetype.split('/');
    const ext = mineTypeSegments[1] || 'jpeg';
    cb(null, `${Date.now()}-${name}.${ext}`);
  }
});
const fileFilter = (req, { mimetype }, cb) =>
  cb(null, Boolean(allowTypes.indexOf(mimetype) > -1));
const uploader = multer({ storage, fileFilter, limits: uploadConfig });

app.post('/upload', uploader.array('images'), (req, res) =>
  res.json({ images: req.files })
);
```

trong đó

* Function `destination` trong `storage` sẽ trả về đường dẫn TUYỆT ĐỐI đến thư mục mà bạn muốn ảnh đưọc upload đến (ở đây là thư mục `public/resource` mà bạn đã tạo ở trên)
* Function `filename` trong `storage` sẽ trả về file name mà bạn muốn lưu lại. Ở đây mình có thực hiện một số biến đổi để tên file trả về theo dạng `[timetamp]-[name].[ext]`. Bạn có thể đổi lại theo ý thích của bạn, miễn là đảm bảo tên các file chắc chắn không trùng với nhau
* `fileFilter` sẽ trả về `true` nếu bạn cho phép upload file với `mimetype` của file đó (ở đây là ảnh, và các file được upload mình ở biến `allowTypes`) và trả về `false` nếu bạn không cho upload
* Riêng phần `uploadConfig` bạn có thể coi tại cại đây [Multer limits config](https://github.com/expressjs/multer#limits). Bạn cần chú ý là `fileSize` là file size với đơn vị là byte, nên ở đây mình muốn cho upload ảnh với kích thước 100 Mb thì mình phải nhân với 1024 * 1024 để ra đơn vị mà megabytes.
* `uploader.array` nghĩa là bạn muốn cho phép người dùng upload nhiều file, với tên field là `images`
* Về endpoind `/upload` thì khá dễ. Chúng ta có 2 midleware ở đây, đầu tiên là multer để upload file, sau đó là midleware sẽ xử lý những phần tiếp theo như trả kết quả cho client, lưu thôn tin ảnh vào database. Ở midleware thứ 2 thì `req.files` là biến sẽ chứa thông tin của tất cả file đã được upload thành công.

## Test

Để thực hiện việc test ở thời điểm hiện tại, mình sẽ dùng curl để test. Bạn cũng có thể dùng `Postman` để test, hoặc bạn tự viết http test của bạn cũng được. Mình sẽ hướng dẫn các bạn viết file test sau.

Để test thì bạn cần tạo thư mục `test` và để vào đó 1 tấm hình bất kỳ. Mình có để sẵn một tấm hình với tên `SuperWoman.jpg`, bạn có thể sử dụng. Chạy câu lện sau để test

```shell
$ curl -F "images=@$HOME/projects/p6-static-example/test/SuperWoman.jpg" http://localhost:9999/upload
```

Bạn cần chú ý là tên field chúng ta cần có cặp ngoặc vuông để biểu thị rằng chúng ta upload nhiều file, trước đường dẫn file cần có ký tự `@` và `$HOME` là biến của linux trả về đường dẫn đến thư mục của user hiện tại mà bạn đang dùng. Đường dẫn ở trên là đường dẫn tuyệt đối đến file ảnh mà mình đặt trong project, mình dùng nó để các bạn dễ hiểu hơn nên bạn có thể dùng đường dẫn tương đối để cho ngắn gọn giống thế này

```shell
curl -F "images=@./test/SuperWoman.jpg" http://localhost:9999/upload
```

Nếu bạn muốn upload nhiều file trong cùng một câu lênh `curl` thì có thể viết như sau

```shell
curl -F "images=@./test/SuperWoman.jpg" -F "images=@./test/SuperWoman.jpg" http://localhost:9999/upload
```

Các câu lệnh trên đều sẽ trả về kết quả json ở trên terminal (vì mục đích bảo vệ bản thân thì mình đã thay đoạn dẫn đến user của mình bằng **HOME**, ở local của bạn thì kết quả sẽ là về đường dẫn tuyệt đối)

```json
{
  "images": [
    {
      "fieldname": "images",
      "originalname": "SuperWoman.jpg",
      "encoding": "7bit",
      "mimetype": "image/jpeg",
      "destination": "__HOME__/projects/p6-static-example/public/resource",
      "filename": "1514903078262-SuperWoman.jpeg",
      "path":
        "__HOME__/projects/p6-static-example/public/resource/1514903078262-SuperWoman.jpeg",
      "size": 206319
    }
  ]
}
```

Bạn nên mở thư mục `public/resource` để check xem những file bạn upload đã được lưu hay chưa :D

## Thêm file .gitignore cho `public/resource`

Lý do để thêm file `.gitignore` cho thư mục này là vì bạn sẽ không muốn post hình lên respository. Bạn nên thêm file `.gitignore` với nội dung như sau

```text
*.png
*.jpeg
*.jpg
*.webp
*.gif
```

## Sử dụng `dotenv` để lưu config

Ở bài đầu tiên mình có giới thiệu với các bạn thư viện `dotenv` để lưu trữ các config, thì ở bài này chúng ta sẽ thực hành ngay và luôn.

Đầu tiên bạn cần sửa lại nội dung file `.env` và `.env.example` như sau

```text
# System
NODE_ENV=devlopment
PORT=9999

# Folders
FOLDER_RESOURCE=public/resource

# Upload config
ALLOW_TYPES=image/png,image/jpeg,image/gif
MAX_FIELD=17
MAX_FILE=17
MAX_SIZE=100
MAX_PART=17
```

và rồi sửa lại file `index.js` sử dụng các biến môi trường như sau

```javascript

...


const allowTypes = process.env.ALLOW_TYPES.split(',').map(type => type.trim);
const uploadConfig = {
  fields: process.env.MAX_FIELD || 17,
  files: process.env.MAX_FILE || 17,
  fileSize: (process.env.MAX_SIZE || 100) * 1048576,
  parts: process.env.MAX_PART || 17
};

...

```

Bạn cần khởi động lại server vì biến môi trường đưọc load trước `nodemon` nên bạn thay đổi file `.env` server sẽ không tự reload được. Sau đó chúng ta nên test lại bằng câu lệnh 

```shell
curl -F "images=@./test/SuperWoman.jpg" -F "images=@./test/SuperWoman.jpg" http://localhost:9999/upload
```

Enjoy!!!

## Kết thúc

Qua phần hướng dẫn này các bạn đã có thể sử dụng thư viện `multer` để upload file với các config mà mình thường dùng. Ngoài ra các bạn cũng có thể thay đổi code để phù hợp hơn với project của các bạn như: đổi format tên file, đường dẫn `resource` động theo ngày tháng hiện tại của server

Bài tập của các bạn: Sử dụng đường dẫn động để lưư ảnh. Ví dụ ngày hôm nay là 2017-01-02 thì bạn cần lưư đường dẫn là `~/projects/p6-static-example/public/resource/2017/01/08/1514902657873-SuperWoman.jpeg`. Ở bài tập này các bạn có thể dùng lệnh tạo thư mục của [NodeJS mkdir](https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback) hoặc dùng thư viện [mkdirp](https://github.com/substack/node-mkdirp) hoặc [ShellJS mkdir](https://github.com/shelljs/shelljs#mkdiroptions-dir--dir-)

Result: https://github.com/picosix/p6-static-example/tree/ea0a05906d5c3ffc88a6d46b91db0856f7e6f16a

## Bài kế tiếp

Updating ...
