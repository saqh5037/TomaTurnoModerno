const http = require('http');
const httpProxy = require('http-proxy-simple-server');

const proxy = httpProxy.createProxyServer({
  target: 'http://[::1]:3100',
  ws: true
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

server.listen(3100, '0.0.0.0', () => {
  console.log('IPv4 Proxy listening on 0.0.0.0:3100 -> [::1]:3100');
});
