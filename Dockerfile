FROM nginx:latest
COPY dist/  /usr/share/nginx/html/

CMD ["/bin/bash", "-c", "sed -i \"s@<html@<html base_url=\"$BASE_URL\" base_url=\"$OPERATION_URL\" base_url=\"$LOG_URL\" base_url=\"$UPLOAD_URL\" @\" /usr/share/nginx/html/index.html; nginx -g \"daemon off;\""]
