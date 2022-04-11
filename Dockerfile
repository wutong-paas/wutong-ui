FROM --platform=$TARGETPLATFORM node:12 as builder
WORKDIR /app
COPY . .

RUN yarn install && yarn run build

FROM --platform=$TARGETPLATFORM  nginx:latest
COPY --from=builder /app/dist/  /usr/share/nginx/html/

CMD ["/bin/bash", "-c", "sed -i \"s@<html@<html base_url=\"$BASE_URL\" operation_url=\"$OPERATION_URL\" log_url=\"$LOG_URL\" upload_url=\"$UPLOAD_URL\" @\" /usr/share/nginx/html/index.html; nginx -g \"daemon off;\""]
