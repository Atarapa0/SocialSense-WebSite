# Nginx tabanlı statik web sitesi için Dockerfile
FROM nginx:alpine

# Nginx varsayılan yapılandırmasını kaldır
RUN rm -rf /usr/share/nginx/html/*

# Yalnızca yayınlanacak statik dosyaları web köküne kopyala
COPY *.html style.css /usr/share/nginx/html/
COPY tr/ /usr/share/nginx/html/tr/
COPY assets/ /usr/share/nginx/html/assets/

# Özel nginx yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3000 portunu aç
EXPOSE 3000

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
