FROM node:12 as builder
ENV JQ_VERSION=1.6
RUN wget --no-check-certificate https://github.com/stedolan/jq/releases/download/jq-${JQ_VERSION}/jq-linux64 -O /tmp/jq-linux64
RUN cp /tmp/jq-linux64 /usr/bin/jq
RUN chmod +x /usr/bin/jq

WORKDIR /app
COPY . .
RUN jq 'to_entries | map_values({ (.key) : ("$" + .key) }) | reduce .[] as $item ({}; . + $item)' ./config/config.json > ./config/config.tmp.json && mv ./config/config.tmp.json ./config/config.json
RUN yarn install && yarn run build

FROM nginx:latest
COPY ./start-ui.sh /usr/bin/start-ui.sh
RUN chmod +x /usr/bin/start-ui.sh
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist/ .
ENTRYPOINT [ "start-ui.sh" ]