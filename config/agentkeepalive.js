const https = require('https');
const http = require('http');
const HttpAgent = require('agentkeepalive');
const {HttpsAgent} = require('agentkeepalive');

const agentOptions = {
  keepAlive: true,
  maxSockets: 16,
  maxFreeSockets: 16,
  keepAliveMsecs: 1000,
  freeSocketKeepAliveTimeout: 1000 * 60 * 5,
};

http.globalAgent = new HttpAgent(agentOptions);
https.globalAgent = new HttpsAgent(agentOptions);
