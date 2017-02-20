'use strict';

var koa = require('koa');
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
        log.warn('livereload', 'changed', items.join(', '));
      } catch (e) {
        console.log(e);
      }
    }
  }.bind(this));

  var ip = require('internal-ip')();

  var app = this.app = koa();

  // combo 拆分
  app.use(require('./combo')({
    hostname: ip,
    port: opts.port
  }));

  app.use(function *(next) {
    this.set({
      'Access-Control-Allow-Origin': '*',
      'Timing-Allow-Origin': '*'
    });

    this.oldUrl = this.url;

    // 替换 server.family
    if (opts.pkg.spm && opts.pkg.spm.server && opts.pkg.spm.server.family) {
      var f = opts.pkg.spm.server.family;
      if (f.charAt(0) !== '/') f = '/' + f;
      this.url = this.url.replace(new RegExp('^' + f), '');
    }

    // 处理 livereload 和 weinre
    this.htmlPrefix = this.htmlPostfix = '';
    if (/\.html?$/.test(this.url.split('?')[0])) {
      if (global.SPM_SERVER_HTTP_INJECT) {
        this.htmlPrefix = global.SPM_SERVER_HTTP_INJECT;
      }

      var postFix = [];
      if (opts.livereload) {
        postFix.push('<script src="http://' + ip + ':35729/livereload.js"></script>');
      }
      if (opts.weinre) {
        postFix.push('<script src="http://' + ip + ':8990/target/target-script-min.js#anonymous"></script>');
      }
      this.htmlPostfix = '\n' + postFix.join('\n');
    }

    // 替换 /name/version 为空
    var prefix = [''];
    if (opts.pkg.spm && opts.pkg.spm.dest) {
        var dest = opts.pkg.spm.dest;
        prefix.push(dest.substring(dest.indexOf("/")+1));
    }
    if (opts.pkg.name) prefix.push(opts.pkg.name);
    if (opts.pkg.version) prefix.push(opts.pkg.version);
    prefix = prefix.join('/');

    if (prefix && this.url.indexOf(prefix) === 0) {
      this.url = this.url.replace(prefix, '');
    }

    // 替换 -hash.js 为 .js
    var m = this.url.match(/^([^-]+)\-[a-z0-9]{20}(\..+)$/i);
    if (m && m[1]) {
      this.url = m[1] + m[2];
    }

    yield next;
  });

  // webpack 中间件
  opts.noInfo = true;
  try {
    if (opts.pkg.spm.server.lazy) opts.lazy = true;
  } catch(e) {}
  app.use(require('./middleware')(compiler, opts));

  // 恢复 url 属性
  app.use(function *(next) {
    if (this.oldUrl) {
      this.url = this.oldUrl;
      delete this.oldUrl;
    }
    yield next;
  });

  // 针对普通静态 html 文件的 fix
  app.use(function *(next) {
    var file = url.parse(this.url).pathname;
    file = join(opts.cwd, file);
    var isHTML = /\.html?$/.test(this.url);
    if (isHTML && fs.existsSync(file)) {
      var content = readFile(file, 'utf-8');

      var docTypeReg =  new RegExp('^\s*\<\!DOCTYPE\s*.+\>.*$', 'im');
      var docType = content.match(docTypeReg);
      if (docType) {
        content = content.replace(docTypeReg, docType[0] + this.htmlPrefix);
      } else {
        content = this.htmlPrefix + content + this.htmlPostfix;
      }
      this.body = content;
    } else {
      yield next;
    }
  });

  // 静态资源
  app.use(require('./static')(opts.cwd, {
    index: 'dont-have-index.xxxx'
  }));

  // 目录访问
  app.use(require('koa-serve-index')(opts.cwd, {
    hidden: true,
    view: 'details'
  }));

  // cdn 反向代理
  app.use(require('./cdn')());

  // weinre 服务器
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

  // livereload 服务器
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

  // anyproxy 代理
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

  // https 支持
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
