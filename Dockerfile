# The unprivileged NGINX image serves the static dashboard without running as root.
FROM nginxinc/nginx-unprivileged:alpine

# The site is copied into NGINX's standard public directory.
COPY dist/ /usr/share/nginx/html/

# The unprivileged image listens on 8080 instead of privileged port 80.
EXPOSE 8080

# Docker can use this check to confirm that the website is responding.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
