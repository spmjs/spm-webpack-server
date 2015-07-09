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
      cwd : join(fixtures, 'server-with-pkg-name'),
      debug : true
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
      .expect(function(res){
        if(res.text.indexOf('/******/ (function(modules) { // webpackBootstraps') === 0) throw new Error('Missing webpackBootstrap');
      })
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
      cwd : join(fixtures, 'server-with-pkg-version'),
      debug : true
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
      .expect(function(res){
        if(res.text.indexOf('/******/ (function(modules) { // webpackBootstraps') === 0) throw new Error('Missing webpackBootstrap');
      })
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
      cwd : join(fixtures, 'server-with-pkg-name-and-version'),
      debug : true
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
      .expect(function(res){
        if(res.text.indexOf('/******/ (function(modules) { // webpackBootstraps') === 0) throw new Error('Missing webpackBootstrap');
      })
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
      cwd : join(fixtures, 'server-with-pkg-hash-is-enabled'),
      debug : true
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
      .expect(function(res){
        if(res.text.indexOf('/******/ (function(modules) { // webpackBootstraps') === 0) throw new Error('Missing webpackBootstrap');
      })
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

describe('server-with-specify-dest', function() {

  var app = null;
  var args = null;

  before(function (done) {
    args = {
      cwd : join(fixtures, 'server-with-specify-dest'),
      debug : true
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

  it('get /a/0.1.0/src/a.js', function(done) {
    request(app.listen())
      .get('/a/0.1.0/src/a.js')
      .expect(function(res){
        if(res.text.indexOf('/******/ (function(modules) { // webpackBootstraps') === 0) throw new Error('Missing webpackBootstrap');
      })
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

  it('get /src/a.js', function(done) {
    request(app.listen())
      .get('/src/a.js')
      .expect(function(res){
        if(res.text.indexOf('/******/ (function(modules) { // webpackBootstraps') === 0) throw new Error('Missing webpackBootstrap');
      })
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

  it('get /a/0.1.0/src/a.css', function(done) {
    request(app.listen())
      .get('/a/0.1.0/src/a.css')
      .end(function(err){
        if (err) return done(err);
        done();
      });
  });

});

