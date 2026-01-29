# Nginx tabanlı statik web sitesi için Dockerfile
FROM nginx:alpine

# Nginx varsayılan yapılandırmasını kaldır
RUN rm -rf /usr/share/nginx/html/*

# Statik dosyaları kopyala
COPY . /usr/share/nginx/html/

# Özel nginx yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3000 portunu aç
EXPOSE 3000

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
