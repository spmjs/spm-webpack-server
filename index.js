'use strict';

var express = require('express');
var webpackDevMiddleware = require('webpack-dev-middleware');
var http = require('http');
var https = require('https');
var fs = require('fs');
var serveIndex = require("serve-index");
var path = require('path');
var log = require('spm-log');
var join = path.join;
var readFile = fs.readFileSync;

function Server(compiler, opts) {
  opts = opts || {};
  this.headers = opts.headers;

  compiler.plugin('compile', function(stats) {
    log.info('build', 'compile');
  });
  compiler.plugin('invalid', function(stats) {
    log.info('build', 'invalid');
  });
  compiler.plugin('done', function(stats) {
    log.info('build', 'done');
    if (opts.livereload) {
      try {
        var items = Object.keys(stats.compilation.assets);
        lrServer.changed({body: {files: items}});
        log.info('livereload', 'changed', items.join(', '));
      } catch (e) {
        console.log(e);
      }
    }
  });

  var ip = require('internal-ip')();

  var app = this.app = new express();

  app.use(require('./combo')({
    hostname: ip,
    port: opts.port
  }));

  app.get(/\.html?$/, function(req, res, next) {
    var file = join(opts.cwd, req.url);
    var content = readFile(file, 'utf-8');
    if (opts.livereload) {
      content = content + '<script src="http://'+ip+':35729/livereload.js"></script>'
    }
    if (opts.weinre) {
      content = content + '<script src="http://'+ip+':8990/target/target-script-min.js#anonymous"></script>'
    }
    res.send(content);
  });

  app.use(this.middleware = webpackDevMiddleware(compiler, opts));

  app.get('*', express.static(opts.cwd), serveIndex(opts.cwd));

  if (opts.weinre) {
    require('coffee-script');
    require('weinre').run({
      httpPort: 8990,
      boundHost: ip,
      verbose: false,
      debug: false,
      readTimeout: 5,
      open: false,
      weinre: true,
      deathTimeout: 15
    });
  }

  if (opts.livereload) {
    var lrServer = require('tiny-lr')();
    lrServer.listen(35729, function(err) {
      if (err) {
        log.error('livereload', err);
        return;
      }
      log.info('livereload', 'listened on 35729');
    });
  }

  if (opts.proxy) {
    var anyproxy;
    try {
      anyproxy = require('anyproxy');
    } catch(e) {
      log.error('error', 'npm install anyproxy -g to enable proxy');
      process.exit(1);
    }

    if (!anyproxy) {
      log.error('proxy', '`anyproxy` is not install correctly');
      process.exit(1);
    }

    !anyproxy.isRootCAFileExists() && anyproxy.generateRootCA();

    new anyproxy.proxyServer({
      type: 'http',
      port: opts.anyproxyPort || 8989,
      hostname: 'localhost',
      rule: require('./rule')({
        port: opts.port,
        hostname: ip
      })
    });
  }

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
