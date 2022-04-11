#!/bin/bash

mkdir ./node_modules
chmod 777 ./node_modules
docker run --rm -v "$(pwd)":/app -w=/app node:12 sh -c "yarn install && yarn run build"

if [ ! -d "./dist" ];then
    exit 1;
fi

docker build -t wutong-ui:${VERSION} .
docker tag wutong-ui:${VERSION} wutongpaas/wutong-ui:${VERSION}
docker push wutongpaas/wutong-ui:${VERSION}

docker tag wutong-ui:${VERSION} swr.cn-southwest-2.myhuaweicloud.com/wutong/wutong-ui:${VERSION}
docker push swr.cn-southwest-2.myhuaweicloud.com/wutong/wutong-ui:${VERSION}