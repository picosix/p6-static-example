# Sử dụng docker

## Bài trước đó

[Viết test case](./9-write-test-case.md)

Trước khi bắt đầu bài này, các bạn cần tìm hiểu một số khái niệm

* Docker là gì?
* Docker images là gì?
* Docker container là gì?

Mình sẽ giải thích ngắn gọn như sau

* Docker image giống như một file iso khi các bạn cài đặt một hệ điều hành, được đóng gói kèm theo các cài đặt sẵn cho các môi trường ứng dụng khác nhau.
* Docker container tương đương với một máy ảo chạy các hệ điều hành (docker image)

## Tạo docker images

Có tất cả 3 image cần thiết cho ứng dụng của chúng ta

* `node` chạy ứng dụng nodeJS
* `nginx` render các tấm ảnh mà chúng ta đã cache
* `nginx-proxy` đảm nhận việc point các domain vào các container ứng dụng

### Image `node`

Các bạn tạo file `docker/node` với nội dung như sau

```Dockerfile
FROM node:9

RUN mkdir /app
WORKDIR /app

EXPOSE 9999
```

trong đó chúng ta sẽ

* Kế thừa một image mà người ta đã build sẵn dành cho node `FROM node:9`
* Tạo thư mục app trong image `RUN mkdir /app`
* Xác định tất cả các command sẽ chạy trong thư mục `/app` `WORKDIR /app`
* Và cho phép kết nối với container tạo nên từ image này thông qua cổng `9999` `EXPOSE 9999`

### Image `nginx`

Các bạn tạo file `docker/nginx` với nội dung như sau

```Dockerfile
FROM nginx:1

RUN mkdir /app
WORKDIR /app

EXPOSE 80
```

### Image `nginx-proxy`

Các bạn tạo file `docker/nginx-proxy` với nội dung như sau

```Dockerfile
FROM jwilder/nginx-proxy

RUN { \
      echo 'client_body_buffer_size 128m;'; \
      echo 'client_max_body_size 128m;'; \
    } > /etc/nginx/conf.d/nginx-proxy.conf
```

Ở image này, mình có thêm file `nginx-proxy.conf` vào thư mục config của nginx để thêm một số config về kích thước file tối đa có thể upload lên server. Ngoài ra các bạn có thể thêm một số config khác nếu bạn muốn.

### Tạo images

Câu lệnh để tạo docker image có dạng như sau

```shell
$ docker build [option] folder
```

`option` có thể là

* `-t` tag của docker image, có thể là bất ký tên nào mà bạn muốn, miễn là theo format `__USER__/__NAME__`
* `-f` đường dẫn tuyệt đối đến file docker (ví dụ `docker/node` mà chúng ta tạo ở trên)

`folder` là đường dẫn đến thư mục của file docker (thường là vậy) để nếu bạn cần copy file/folder vào docker image thì bạn sẽ đặt ở đây.

Để tạo 3 image thì bạn chạy các câu lệnh sau

* `p6/node` `$ docker build -t p6/node -f $(pwd)/docker/node $(pwd)/docker`
* `p6/nginx` `$ docker build -t p6/nginx -f $(pwd)/docker/nginx $(pwd)/docker`
* `p6/nginx-proxy` `$ docker build -t p6/nginx-proxy -f $(pwd)/docker/nginx-proxy $(pwd)/docker`

kết quả của các lần chạy sẽ có dạng

```shell
Sending build context to Docker daemon 3.072kB
Step 1/4 : FROM node:9
---> 3d1823068e39
Step 2/4 : RUN mkdir /app
---> Running in d3113a263e6a
---> 953cfc3e8446
Removing intermediate container d3113a263e6a
Step 3/4 : WORKDIR /app
---> 785559629e34
Removing intermediate container 23f0cfee56c9
Step 4/4 : EXPOSE 9999
---> Running in fb48e2dbf883
---> ea7a36d420cd
Removing intermediate container fb48e2dbf883
Successfully built ea7a36d420cd
Successfully tagged p6/node:latest
```

## Chạy docker container

Câu lệnh để chạy docker container có dạng như sau

```shell
$ docker run [option] DOCKER_IMAGE [command] [...args]
```

`option` có các tuỳ chọn như sau

* `-d` chạy docker container ở chế độ `detached mode`, nghĩa là sau khi container được khởi động thì thoát khỏi container
* `--restart` container sẽ được tự động restart lại nếu như nó bị exist (app bị crash, tắt và mở lại máy). Chế độ này đặc biệt có ích khi bạn đang code, tắt máy, mở lại và những container của bạn sẽ khởi động cùng với máy
* `--name` đặt tên cho container của bạn, nếu bạn không đặt tên thì docker sẽ dùng `random name`. Tên của một docker thường được dùng để bạn thao tác với container như restart, stop, chạy command, ...
* `-p` map port từ bên ngoài vào trong container thông qua cú pháp `__OUTSITE_PORT__:__INSITE_PORT__`
* `-v` map volume (thường là thư mục) từ bên ngoài vào bên trong container thông qua cú pháp `__OUTSITE_VOLUME__:__INSITE_VOLUME__`
* `-e` set các `environment variables` cho container, với NodeJS thì các biến này sẽ được gắn vào `process.env`
  ### Chạy `node` container
* `--link` link từ một container với một container với format `__CONTAINER_NAME__:__ANOTHER_NAME__`, Lúc này bên trong container chúng ta có thể dùng thế này `http://__ANOTHER_NAME__:PORT` để truy cập đến container với port được chỉ định

Bạn cần chạy câu lệnh sau

```shell
$ docker run -d --restart always --name p6-static-node -v $(pwd):/app -p 9999:9999 p6/node yarn start-dev
```

bây giờ bạn có thể vào địa chỉ `http://localhost:9999/` để test thử ứng dụng

### Chạy `nginx-proxy` container

Bạn cần chạy câu lệnh sau

```shell
$ docker run -d --restart always --name nginx-proxy -p 80:80 -p 443:443 -v $(pwd)/certs:/etc/nginx/certs -v /var/run/docker.sock:/tmp/docker.sock:ro picosix/nginx-proxy
```

Ở đây, `nginx-proxy` sẽ là một proxy link giữa các `virtual host` hoặc `domain` của bạn đến từng docker container nhờ vào cấu hình của `nginx`. Sau khi chạy container `nginx-proxy`, nếu bạn muốn thêm một `virtual host` thì chỉ cần thêm `environment variables` `-e VIRTUAL_HOST=__YOUR_HOST_NAME__`

Ví dụ như bây giờ chúng ta xoá container `p6-static-node` ở phía trên bằng câu lệnh

```shell
$ docker rm -f p6-static-node
```

và tạo lại container bằng cách chạy câu lệnh sau

```shell
$ docker run -d --restart always -e VIRTUAL_HOST=static.picosix.local  --name p6-static-node -v $(pwd):/app -p 9999:9999 p6/node yarn start-dev
```

Bạn cần phải thêm dòng này vào file `/etc/hosts` của bạn

```text
127.0.0.1	static.picosix.local
```

sau đó bạn có thể vào đường dẫn `http://static.picosix.local/` để kiểm tra kết quả

## Chạy `nginx` container

Các bạn cần tạo một file `docker/nginx/default.conf` để làm nơi chứa các config (rewrite rule, proxy, ...) của nginx dùng để render các file cache

```nginx
# If we receive X-Forwarded-Proto, pass it through; otherwise, pass along the
# scheme used to connect to this server
map $http_x_forwarded_proto $proxy_x_forwarded_proto {
  default $http_x_forwarded_proto;
  ''      $scheme;
}
# If we receive X-Forwarded-Port, pass it through; otherwise, pass along the
# server port the client connected to
map $http_x_forwarded_port $proxy_x_forwarded_port {
  default $http_x_forwarded_port;
  ''      $server_port;
}
# If we receive Upgrade, set Connection to "upgrade"; otherwise, delete any
# Connection header that may have been passed to this server
map $http_upgrade $proxy_connection {
  default upgrade;
  '' close;
}
# Apply fix for very long server names
server_names_hash_bucket_size 128;
# Default dhparam
ssl_dhparam /etc/nginx/dhparam/dhparam.pem;
# Set appropriate X-Forwarded-Ssl header
map $scheme $proxy_x_forwarded_ssl {
  default off;
  https on;
}
gzip_types text/plain text/css application/javascript application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
log_format vhost '$host $remote_addr - $remote_user [$time_local] '
                 '"$request" $status $body_bytes_sent '
                 '"$http_referer" "$http_user_agent"';
access_log off;
resolver 8.8.8.8 8.8.4.4;
# HTTP 1.1 support
proxy_http_version 1.1;
proxy_buffering off;
proxy_set_header Host $http_host;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $proxy_connection;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $proxy_x_forwarded_proto;
proxy_set_header X-Forwarded-Ssl $proxy_x_forwarded_ssl;
proxy_set_header X-Forwarded-Port $proxy_x_forwarded_port;
# Mitigate httpoxy attack (see README for details)
proxy_set_header Proxy "";

client_body_buffer_size 128m;
client_max_body_size 128m;

server {
    listen       80;
    server_name  localhost;
    root      /app/public;

    #charset koi8-r;
    access_log  /var/log/nginx/access.log vhost;
    error_log  /var/log/nginx/error.log warn;

    # Deny access to resource
    location ~ /(resource) {
      deny all;
    }

    # Deny access to .gitignore file
    location ~ /. {
      deny all;
    }

    location ~ ^/image/(.*)$ {
      sendfile            on;
      sendfile_max_chunk  1m;
      tcp_nopush          on;
      tcp_nodelay         on;
      keepalive_timeout   65;

      if (-f $document_root/cache/$1) {
        rewrite ^/image/(.*)$ /cache/$1 break;
      }

      try_files $uri @nodeapp;
    }

    location / {
      try_files $uri @nodeapp;
    }

    location @nodeapp {
      proxy_pass http://p6_static_node:9999;
    }

    # error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
      root   /usr/share/nginx/html;
    }
}
```

các bạn chỉ cần quan tâm đoạn này

```nginx
 location ~ ^/image/(.*)$ {
      sendfile            on;
      sendfile_max_chunk  1m;
      tcp_nopush          on;
      tcp_nodelay         on;
      keepalive_timeout   65;

      if (-f $document_root/cache/$1) {
        rewrite ^/image/(.*)$ /cache/$1 break;
      }

      try_files $uri @nodeapp;
    }
```

Bạn còn nhớ endpoint `/image/:size/:id`? Ỏ đây mình sẽ config để nginx thử tìm các file trong thư mục `public/cache`, nếu tìm được thì chúng ta sẽ render file ảnh đó ngay, còn nếu không thì chúng ta sẽ thử dùng proxy `@nodeapp` để point tới app nodejs của chúng ta

## Chạy `nginx` container

Các bạn cần tạo một file `docker/nginx-config/default.conf` để làm nơi chứa các config (rewrite rule, proxy, ...) của nginx dùng để render các file cache

```nginx
# If we receive X-Forwarded-Proto, pass it through; otherwise, pass along the
# scheme used to connect to this server
map $http_x_forwarded_proto $proxy_x_forwarded_proto {
  default $http_x_forwarded_proto;
  ''      $scheme;
}
# If we receive X-Forwarded-Port, pass it through; otherwise, pass along the
# server port the client connected to
map $http_x_forwarded_port $proxy_x_forwarded_port {
  default $http_x_forwarded_port;
  ''      $server_port;
}
# If we receive Upgrade, set Connection to "upgrade"; otherwise, delete any
# Connection header that may have been passed to this server
map $http_upgrade $proxy_connection {
  default upgrade;
  '' close;
}
# Apply fix for very long server names
server_names_hash_bucket_size 128;
# Default dhparam
ssl_dhparam /etc/nginx/dhparam/dhparam.pem;
# Set appropriate X-Forwarded-Ssl header
map $scheme $proxy_x_forwarded_ssl {
  default off;
  https on;
}
gzip_types text/plain text/css application/javascript application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
log_format vhost '$host $remote_addr - $remote_user [$time_local] '
                 '"$request" $status $body_bytes_sent '
                 '"$http_referer" "$http_user_agent"';
access_log off;
resolver 8.8.8.8 8.8.4.4;
# HTTP 1.1 support
proxy_http_version 1.1;
proxy_buffering off;
proxy_set_header Host $http_host;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $proxy_connection;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $proxy_x_forwarded_proto;
proxy_set_header X-Forwarded-Ssl $proxy_x_forwarded_ssl;
proxy_set_header X-Forwarded-Port $proxy_x_forwarded_port;
# Mitigate httpoxy attack (see README for details)
proxy_set_header Proxy "";

client_body_buffer_size 128m;
client_max_body_size 128m;

server {
    listen       80;
    server_name  localhost;
    root      /app/public;

    #charset koi8-r;
    access_log  /var/log/nginx/access.log vhost;
    error_log  /var/log/nginx/error.log warn;

    # Deny access to resource
    location ~ /(resource) {
      deny all;
    }

    # Deny access to .gitignore file
    location ~ /. {
      deny all;
    }

    location ~ ^/image/([a-zA-Z0-9\-\_]+)/([a-zA-Z0-9\-\_\.]+)$ {
      sendfile            on;
      sendfile_max_chunk  1m;
      tcp_nopush          on;
      tcp_nodelay         on;
      keepalive_timeout   65;

      if (-f $document_root/cache/$1-$2) {
        rewrite /image/([a-zA-Z0-9\-\_]+)/([a-zA-Z0-9\-\_\.]+)$ /cache/$1-$2 break;
      }

      try_files $uri @nodeapp;
    }

    location / {
      try_files $uri @nodeapp;
    }

    location @nodeapp {
      proxy_pass http://p6_static_node:9999;
    }

    # error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
      root   /usr/share/nginx/html;
    }
}
```

các bạn chỉ cần quan tâm đoạn này

```nginx
location ~ ^/image/(.*)$ {
  sendfile            on;
  sendfile_max_chunk  1m;
  tcp_nopush          on;
  tcp_nodelay         on;
  keepalive_timeout   65;

  if (-f $document_root/cache/$1) {
    rewrite ^/image/(.*)$ /cache/$1 break;
  }

  try_files $uri @nodeapp;
}
```

Bạn còn nhớ endpoint `/image/:size/:id`? Ỏ đây mình sẽ config để nginx thử tìm các file trong thư mục `public/cache`, nếu tìm được thì chúng ta sẽ render file ảnh đó ngay, còn nếu không thì chúng ta sẽ thử dùng proxy `@nodeapp` để point tới app nodejs của chúng ta

Và proxy

```nginx
location @nodeapp {
  proxy_pass http://p6_static_node:9999;
}
```

có nghĩa là chúng ta là chúng ta sẽ chỉ cho `nginx` truy cập vào container có tên được map là `p6_static_node` với port được `expose` là `9999`

Lúc này các bạn cần xoá container `p6-static-node` để cập nhật cấu hình mới.

```shell
$ docker rm -f p6-static-node
```

Khởi chạy `node`

```shell
$ docker run -d --restart always --name p6-static-node -v $(pwd):/app  p6/node yarn start-dev
```

Khởi chạy `nginx`

```shell
$ docker run -d -e VIRTUAL_HOST=static.picosix.local --restart always --name p6-static-nginx -v $(pwd)/docker/nginx-config:/etc/nginx/conf.d/ -v $(pwd):/app --link p6-static-node:p6_static_node picosix/nginx
```

các bạn có chú ý là mình có tham số `--link p6-static-node:p6_static_node` dùng để link container `node` vào container `nginx`?

Bây giờ bạn có thể test thử bằng các vào endpoint `/image/:size/:id` (ví dụ `http://static.picosix.local/image/full/1515422559870-SuperWoman.jpeg`). Nếu mọi thứ đều ổn thì các bạn sẽ thấy tấm ảnh cùng với logo của bạn.

## Kết luận

Bài này khá nặng về phần server, với một số bạn sẽ có thể không quen. Nhưng với vai trò là một lập trình viên (mình muốn trở thành `backend developer`), để có thể tạo ra một ứng dụng tốt, thì phần server là một phần không thể thiếu. Thử tưởng tượng bạn làm việc trong một `startup`, bạn phải vừa thiết kế database, xây dựng backend, vừa phải phải đảm bảo deploy đúng hạn bản production thì bạn sẽ hiểu được tầm quan trọng của những kiến thức về server (linux) :D

Với docker, mọi việc đã được đơn giản hoá khá nhiều. Vậy thì tại sao bạn lại không bỏ một ít thời gian để học cách giúp sản phẩm của bạn tốt hơn?

[Source Code]()

## Bài kế tiếp

Updating ...
