#!/usr/bin/env node

'use strict';

var program = require('commander');
var log = require('spm-log');
var spmArgv = require('spm-argv');
var extend = require('extend');
var Server = require('./index');
var path = require('path');
var join = path.join;
var fs = require('fs');
var existsSync = fs.existsSync;
var readFileSync = fs.readFileSync;

program
  .version(require('./package').version, '-v, --version')
  .option('-p, --port <port>', 'port')
  .option('--proxy', 'proxy with anyproxy')
  .option('--livereload', 'livereload')
  .option('--compress', 'build files with compress')
  .option('--weinre', 'weinre')
  .option('--https', 'https')
  .option('--verbose', 'show more logging')
  .option('--define [yourMode]', 'using the value of pkg.spm.define.yourMode or pkg.spm.define.default when "yourMode" is not specified')
  .parse(process.argv);

//log.config(program);

var cwd = process.cwd();
var args = {
  cwd: cwd,
  debug: !program.compress,
  https: program.https,
  weinre: program.weinre,
  livereload: program.livereload,
  proxy: program.proxy,
  port: program.port || 8000,
  define: program.define
};

var sw = require('spm-webpack');

// 获取 package.json
var pkgFile = join(cwd, 'package.json');
if (existsSync(pkgFile)) {
  args.pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
  args.pkg.spm.hash = false;
}

// fromServer 在 spm-webpack 里会启动 copy 文件的 watch 模式
args.fromServer = true;

// 安装依赖
sw.build.installDeps(args, function() {

  var wpOpts = sw.build.getWebpackOpts(args);

  var spmArgs = extend(true, {}, {server:{devtool:'#source-map'}}, spmArgv(cwd,wpOpts.pkg));
  wpOpts.devtool = spmArgs.server.devtool;


  isPortInUse(args.port, function() {
    log.error('error', 'port %s is in use', args.port);
  }, function() {
    var server = new Server(sw.webpack(wpOpts), args);
    server.app.listen(args.port, function(err) {
      if(err) throw err;
      log.info('webserver', 'listened on', args.port);
    });
  });

});

function isPortInUse(port, error, success) {
  var conn = require('net').createServer();
  conn.unref();
  conn.on('error', error.bind(null, port));
  conn.listen(port, function() {
    conn.close(success.bind(null, null, conn.address().port));
  });
}

require('atool-monitor').emit();
