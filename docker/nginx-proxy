FROM jwilder/nginx-proxy

RUN { \
      echo 'client_body_buffer_size 128m;'; \
      echo 'client_max_body_size 128m;'; \
    } > /etc/nginx/conf.d/nginx-proxy.conf