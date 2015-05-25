'use strict';

var koa = require('koa');
var webpackDevMiddleware = require('./middleware');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var log = require('spm-log');
var join = path.join;
var readFile = fs.readFileSync;
var url = require('url');
var util = require('util');
var events = require('events');

function Server(compiler, opts) {
  events.EventEmitter.call(this);

  opts = opts || {};
  this.headers = opts.headers;

  compiler.plugin('done', function(stats) {
    this.emit('done');

    if (opts.livereload) {
      try {
        var items = Object.keys(stats.compilation.assets);
        lrServer.changed({body: {files: items}});
        log.info('livereload', 'changed', items.join(', '));
      } catch (e) {
        console.log(e);
      }
    }
  }.bind(this));

  var ip = require('internal-ip')();

  var app = this.app = koa();

  app.use(require('./combo')({
    hostname: ip,
    port: opts.port
  }));

  app.use(function *(next) {
    var file = url.parse(this.url).pathname;
    file = join(opts.cwd, file);
    var isHTML = /\.html?$/.test(this.url);

    if (isHTML && (opts.livereload || opts.weinre)) {
      var content = readFile(file, 'utf-8');
      if (opts.livereload) {
        content = content + '<script src="http://' + ip + ':35729/livereload.js"></script>';
      }
      if (opts.weinre) {
        content = content + '<script src="http://' + ip + ':8990/target/target-script-min.js#anonymous"></script>';
      }
      this.body = content;
    } else {
      yield next;
    }

    this.set({
      'Access-Control-Allow-Origin': '*',
      'Timing-Allow-Origin': '*'
    });
  });

  app.use(webpackDevMiddleware(compiler, opts));

  app.use(require('./static')(opts.cwd));
  app.use(require('koa-serve-index')(opts.cwd, {
    hidden: true,
    view: 'details'
  }));

  app.use(require('./cdn')());

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

  this.listeningApp = opts.https ? https.createServer({
    // using built-in self-signed certificate
    key: opts.key || fs.readFileSync(path.join(__dirname, './ssl/server.key')),
    cert: opts.cert || fs.readFileSync(path.join(__dirname, './ssl/server.crt')),
    ca: opts.ca || fs.readFileSync(path.join(__dirname, './ssl/ca.crt')),
    requestCert: true,
    rejectUnauthorized: false
  }, app.callback())
    : http.createServer(app.callback());
}

Server.prototype.use = function(gen) {
  this.app.use(gen);
  return this;
};

Server.prototype.listen = function() {
  this.listeningApp.listen.apply(this.listeningApp, arguments);
};

util.inherits(Server, events.EventEmitter);

module.exports = Server;
