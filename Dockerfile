FROM nikolaik/python-nodejs:latest
RUN mkdir -p /home/node/erdbms/node_modules
WORKDIR /home/node/erdbms

COPY ./ ./

RUN npm install

EXPOSE 2380

CMD while true; do node main; sleep 2; done
