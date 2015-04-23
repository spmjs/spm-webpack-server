#!/usr/bin/env node

'use strict';

require('gnode');
var program = require('commander');
var log = require('spm-log');
var spmArgv = require('spm-argv');
var extend = require('extend');
var Server = require('./index');

program
  .version(require('./package').version, '-v, --version')
  .option('-p, --port <port>', 'port')
  .option('--proxy', 'proxy with anyproxy')
  .option('--livereload', 'livereload')
  .option('--compress', 'build files with compress')
  .option('--weinre', 'weinre')
  .option('--https', 'https')
  .option('--verbose', 'show more logging')
  .parse(process.argv);

log.config(program);

var cwd = process.cwd();
var args = {
  cwd: cwd,
  debug: !program.compress,
  https: program.https,
  weinre: program.weinre,
  livereload: program.livereload,
  proxy: program.proxy,
  quiet: !program.verbose,
  port: program.port || 8000
};

var sw = require('spm-webpack');

sw.build.getWebpackOpts(args, function(err, webpackOpts) {
  var spmArgs = extend(true, {}, {server:{devtool:'#source-map'}}, spmArgv(cwd));
  webpackOpts.devtool = spmArgs.server.devtool;

  if (spmArgs.server.define) {
    for (var i=0; i<webpackOpts.plugins.length; i++) {
      var p = webpackOpts.plugins[i];
      if (p.definitions) {
        webpackOpts.plugins.splice(i, 1);
        break;
      }
    }
    webpackOpts.plugins.push(new sw.webpack.DefinePlugin(spmArgs.server.define));
  }

  new Server(sw.webpack(webpackOpts), args).listen(args.port, function(err) {
    if(err) throw err;
    log.level = 'info';
    log.info('webserver', 'listened on', args.port);
  });

});
