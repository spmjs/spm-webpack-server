'use strict';

var express = require('express');
var webpackDevMiddleware = require('webpack-dev-middleware');
var http = require('http');
var https = require('https');
var fs = require('fs');
var serveIndex = require("serve-index");
var path = require('path');

function Server(compiler, opts) {
  opts = opts || {};
  this.headers = opts.headers;

  compiler.plugin('compile', function(stats) {});
  compiler.plugin('invalid', function(stats) {});
  compiler.plugin('done', function(stats) {});

  var app = this.app = new express();

  app.use(this.middleware = webpackDevMiddleware(compiler, opts));

  app.get('*', express.static(opts.cwd), serveIndex(opts.cwd));

  this.listeningApp = opts.https
    ? https.createServer({
    // using built-in self-signed certificate
    key: opts.key || fs.readFileSync(path.join(__dirname, "./ssl/server.key")),
    cert: opts.cert || fs.readFileSync(path.join(__dirname, "./ssl/server.crt")),
    ca: opts.ca || fs.readFileSync(path.join(__dirname, "./ssl/ca.crt")),
    requestCert: true,
    rejectUnauthorized: false
  }, app)
    : http.createServer(app);
}

Server.prototype.use = function() {
  this.app.use.apply(this.app, arguments);
};

Server.prototype.listen = function() {
  this.listeningApp.listen.apply(this.listeningApp, arguments);
};

module.exports = Server;
