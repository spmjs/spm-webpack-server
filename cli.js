#!/usr/bin/env node

'use strict';

require('gnode');
var program = require('commander');
var log = require('spm-log');
var webpack = require('webpack');
var getWebpackOpts = require('spm-webpack').build.getWebpackOpts;
var Server = require('./index');

program
  .option('--weinre', 'weinre')
  .option('--livereload', 'livereload')
  .option('--https', 'https')
  .option('--port', 'port')
  .option('--debug', 'build files without compress')
  .option('--verbose', 'show more logging')
  .parse(process.argv);

log.config(program);

var args = {
  cwd: process.cwd(),
  debug: program.debug,
  https: program.https,
  weinre: program.weinre,
  livereload: program.livereload,
  quiet: true
};

var port = program.port || 8000;
var host = '127.0.0.1';

getWebpackOpts(args, function(err, webpackOpts) {
  webpackOpts.devtool = '#eval';
  new Server(webpack(webpackOpts), args).listen(port, host, function(err) {
    if(err) throw err;
    log.info('webserver', 'listened on', port);
  });
});

