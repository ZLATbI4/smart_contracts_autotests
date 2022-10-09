FROM node:18-alpine

WORKDIR /usr/src/app/
COPY . .

# fix issue ENOENT in alpine https://github.com/facebook/flow/issues/3649#issuecomment-447115855
RUN apk --no-cache add ca-certificates wget && \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk
RUN apk add glibc-2.28-r0.apk

CMD sh run_tests.sh