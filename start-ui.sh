#!/usr/bin/env bash
export EXISTING_VARS=$(printenv | awk -F= '{print $1}' | sed 's/^/\$/g' | paste -sd,);
export JS_FOLDER="/usr/share/nginx/html/*.js"
for file in $JSFOLDER;
do
    cat $file | envsubst $EXISTING_VARS | tee $file
done
nginx -g 'daemon off;'