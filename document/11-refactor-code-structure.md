# Tái cấu trúc code

## Bài trước đó

[Sử dụng docker](10-dockerized-your-app.md)

Như vậy là phần ứng dụng chính của chúng ta sau 10 bài đã hoàn thành. Trong quá trình làm, để đơn giản hoá việc tổ chức code, cũng như giúp các bạn dễ theo dõi, mình chỉ sử dụng một file `index.js` duy nhất. Trên thực tế thì chúng ta nên tách ứng dụng ra làm hai phần

* Routes - sử dụng `express` hay `socketio` để xử request dựa trên `url` hay `event`
* Controller hay Service - sử dụng cấu trúc của bạn để các bạn giải quyết logic.

Vì vậy ở bài này mình sẽ đưa ra hướng để các bạn có thể tự tái cấu trúc lại

## Di chuyển các setting ra một file riêng

Trong bài mình có hướng dẫn các bạn sử dụng `dotenv` để config các biến môi trường. Trong thực tế các bạn vẫn cần một file `config` để lưư nhiều hơn các config trong ứng dụng của bạn.

* `dotenv` dùng để lưư những setting cứng, đi theo môi trường và không phụ thuộc vào các yếu tố khác như thư viện, port, biến tĩnh, ... Ví dụ như tên thư mục lưu cache, options của database, đường dẫn file logo hoặc vị trí file logo
* `setting.js` dùng để config những phần còn lại như option của database, resolve đường dẫn tuyệt đối đến các thư mục, parse các setting từ `dotenv`, ...

## Di chuyển logger ra thư viện riêng

Các bạn nên di chuyển logger bằng `winston` ra một file riêng để dễ cấu hình hơn, như quyết định có hiện log trong console, tuỳ chỉnh các log được lưu lại, format được lưu, ...

## Chuyển phần code resize, upload ra serice

Mình quyết định chuyển phần code resize, upload ảnh ra thành một từng function riêng. Tách resize ra thành resize có hoặc không có chèn logo, thêm hàm `generateCacheUrl` để tạo đường dẫn cache sau khi upload và một số hàm khác

Tập hợp các hàm ở trên mình gọi chung là `image serive`. Bản thân mình không thích viết OOP trong javascript, cho nên tất cả các hàm ở trên chỉ là `function`.

## Sử dụng `express router` để điều hướng

Việc còn lại khá là nhẹ nhàng, các bạn chỉ cần giữ lại các endpoint, trong endpoint thay vì xử lý trực tiếp thì chúng ta gọi các serivce để thực hiện các tác vụ.

## Kết luận

Ở phần này mình chỉ nói khá là ngắn gọn vì mỗi người sẽ tự có cách tổ chúc code khác nhau. Mình chỉ nêu ra cách mà mình tổ chức code theo mình nghĩ là thuận tiện và tốt.

Các bạn có thể tham khảo source code sau khi được refactor tại đây [p6-static](https://github.com/picosix/p6-static)

Để test thì các bạn có thể làm theo hướng dẫn của phần `Quick start for dev`. Cũng chỉ là khởi chạy các docker container mà thôi.

[Source Code]()

## Bài kế tiếp

Updating ...
