'use strict';
var join = require('path').join;
var request = require('supertest');
var Server = require('..');
var sw = require('spm-webpack');
var fixtures = join(__dirname, 'fixtures');
//var log = require('spm-log');
//var spmArgv = require('spm-argv');
//var extend = require('extend');
var fs = require('fs');
var existsSync = fs.existsSync;
var readFileSync = fs.readFileSync;


describe('server-with-pkg-name', function() {

  var app = null;
  var args = null;

  before(function (done) {
    args = {
      cwd : join(fixtures, 'server-with-pkg-name')
    };
    process.chdir(args.cwd);
    var pkgFile = join(args.cwd, 'package.json');
    if (existsSync(pkgFile)) {
      args.pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
      args.pkg.spm.hash = false;
    }
    sw.build.getWebpackOpts(args, function (err, webpackOpts) {
      var server = new Server(sw.webpack(webpackOpts), args);
      app = server.app;
      server.once('done', done);
    });
  });

  it('get /hello/a.js', function(done) {
      request(app.listen())
      .get('/hello/a.js')
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

  it('get /hello/a.css', function(done) {
      request(app.listen())
      .get('/hello/a.css')
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

});

describe('server-with-pkg-version', function() {

  var app = null;
  var args = null;

  before(function (done) {
    args = {
      cwd : join(fixtures, 'server-with-pkg-version')
    };
    process.chdir(args.cwd);
    var pkgFile = join(args.cwd, 'package.json');
    if (existsSync(pkgFile)) {
      args.pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
      args.pkg.spm.hash = false;
    }
    sw.build.getWebpackOpts(args, function (err, webpackOpts) {
      var server = new Server(sw.webpack(webpackOpts), args);
      app = server.app;
      server.once('done', done);
    });
  });

  it('get /0.0.1/a.js', function(done) {
      request(app.listen())
      .get('/0.0.1/a.js')
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

  it('get /0.0.1/a.css', function(done) {
      request(app.listen())
      .get('/0.0.1/a.css')
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

});

describe('server-with-pkg-name-and-version', function() {

  var app = null;
  var args = null;

  before(function (done) {
    args = {
      cwd : join(fixtures, 'server-with-pkg-name-and-version')
    };
    process.chdir(args.cwd);
    var pkgFile = join(args.cwd, 'package.json');
    if (existsSync(pkgFile)) {
      args.pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
      args.pkg.spm.hash = false;
    }
    sw.build.getWebpackOpts(args, function (err, webpackOpts) {
      var server = new Server(sw.webpack(webpackOpts), args);
      app = server.app;
      server.once('done', done);
    });
  });

  it('get /hello/0.0.1/a.js', function(done) {
      request(app.listen())
      .get('/hello/0.0.1/a.js')
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

  it('get /hello/0.0.1/a.css', function(done) {
      request(app.listen())
      .get('/hello/0.0.1/a.css')
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

});

describe('server-with-pkg-hash-is-enabled', function() {

  var app = null;
  var args = null;

  before(function (done) {
    args = {
      cwd : join(fixtures, 'server-with-pkg-hash-is-enabled')
    };
    process.chdir(args.cwd);
    var pkgFile = join(args.cwd, 'package.json');
    if (existsSync(pkgFile)) {
      args.pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
      args.pkg.spm.hash = false;
    }
    sw.build.getWebpackOpts(args, function (err, webpackOpts) {
      var server = new Server(sw.webpack(webpackOpts), args);
      app = server.app;
      server.once('done', done);
    });
  });

  it('get /hello/0.0.1/a-91b41dcd96c9d90587eb.js', function(done) {
      request(app.listen())
      .get('/hello/0.0.1/a-91b41dcd96c9d90587eb.js')
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

  it('get /hello/0.0.1/a.css', function(done) {
      request(app.listen())
      .get('/hello/0.0.1/a.css')
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

});

