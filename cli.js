#!/usr/bin/env node

'use strict';

require('gnode');
var program = require('commander');
var log = require('spm-log');
var Server = require('./index');
var spmArgv = require('spm-argv');
var extend = require('extend');

program
  .version(require('./package').version, '-v, --version')
  .option('--weinre', 'weinre')
  .option('--livereload', 'livereload')
  .option('--https', 'https')
  .option('-p, --port <port>', 'port')
  .option('--proxy', 'proxy with anyproxy')
  .option('--debug', 'build files without compress')
  .option('--verbose', 'show more logging')
  .parse(process.argv);

log.config(program);

var cwd = process.cwd();
var args = {
  cwd: cwd,
  debug: program.debug,
  https: program.https,
  weinre: program.weinre,
  livereload: program.livereload,
  proxy: program.proxy,
  quiet: !program.verbose,
  port: program.port || 8000
};

var sw = require('spm-webpack');
var getWebpackOpts = sw.build.getWebpackOpts;

var spmArgs = extend(true, {}, {server:{devtool:'#source-map'}}, spmArgv(cwd));

getWebpackOpts(args, function(err, webpackOpts) {
  webpackOpts.devtool = spmArgs.server.devtool;
  new Server(sw.webpack(webpackOpts), args).listen(args.port, function(err) {
    if(err) throw err;
    log.level = 'info';
    log.info('webserver', 'listened on', args.port);
  });
});

