/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */

'use strict';

var path = require('path');
var fs = require('fs');
var MemoryFileSystem = require('memory-fs');
var mime = require('mime');
var log = require('spm-log');
var join = require('path').join;
var existsSync = fs.existsSync;
var readFileSync = fs.readFileSync;

// constructor for the middleware
module.exports = function(compiler, options) {

  if(!options) options = {};
  if(options.watchDelay === undefined) options.watchDelay = 200;
  if(typeof options.stats === 'undefined') options.stats = {};
  if(!options.stats.context) options.stats.context = process.cwd();

  var pkg = options.pkg;
  if (!pkg) {
    var pkgFile = join(options.cwd, 'package.json');
    if (existsSync(pkgFile)) {
      pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
    }
  }

  // store our files in memory
  //var files = {};
  var fs = compiler.outputFileSystem = new MemoryFileSystem();

  compiler.plugin('done', function(stats) {
    log.info('build', 'done');
    var errors = stats.compilation.errors;
    if (errors && errors.length) {
      errors.forEach(function(err) {
        log.error('error', err.message);
      });
    }

    // We are now on valid state
    state = true;
    // Do the stuff in nextTick, because bundle may be invalidated
    //  if a change happend while compiling
    process.nextTick(function() {
      // check if still in valid state
      if(!state) return;
      // print webpack output
      var displayStats = (!options.quiet && options.stats !== false);
      if(displayStats &&
        !(stats.hasErrors() || stats.hasWarnings()) &&
        options.noInfo)
        displayStats = false;
      if(displayStats) {
        console.log(stats.toString(options.stats));
      }
      if (!options.noInfo && !options.quiet)
        console.info('webpack: bundle is now VALID.');

      // execute callback that are delayed
      var cbs = callbacks;
      callbacks = [];
      cbs.forEach(function continueBecauseBundleAvailible(cb) {
        cb();
      });
    });

    // In lazy mode, we may issue another rebuild
    if(forceRebuild) {
      forceRebuild = false;
      rebuild();
    }
  });

  // on compiling
  function invalidPlugin() {
    log.info('build', 'start');
    if(state && (!options.noInfo && !options.quiet))
      console.info('webpack: bundle is now INVALID.');
    // We are now in invalid state
    state = false;
  }
  compiler.plugin('compile', invalidPlugin);

  // the state, false: bundle invalid, true: bundle valid
  var state = false;

  // in lazy mode, rebuild automatically
  var forceRebuild = false;

  // delayed callback
  var callbacks = [];

  // wait for bundle valid
  /*
  function ready(fn, req) {
    if(state) return fn();
    if(!options.noInfo && !options.quiet)
      console.log('webpack: wait until bundle finished: ' + req.url);
    callbacks.push(fn);
  }
  */
  // start watching
  if(!options.lazy) {
    var watching = compiler.watch(options.watchDelay, function(err) {
      if(err) throw err;
    });
  } else {
    state = true;
  }

  function rebuild() {
    if(state) {
      state = false;
      compiler.run(function(err) {
        if(err) throw err;
      });
    } else {
      forceRebuild = true;
    }
  }

  function pathJoin(a, b) {
    return a === '/' ? '/' + b : (a||'') + '/' + b;
  }

  function getFilenameFromUrl(url) {
    // publicPrefix is the folder our bundle should be in
    var localPrefix = options.publicPath || '/';
    if(url.indexOf(localPrefix) !== 0) {
      if(/^(https?:)?\/\//.test(localPrefix)) {
        localPrefix = '/' + localPrefix.replace(/^(https?:)?\/\/[^\/]+\//, '');
        // fast exit if another directory requested
        if(url.indexOf(localPrefix) !== 0) return false;
      } else return false;
    }
    // get filename from request
    var filename = url.substr(localPrefix.length);
    if(filename.indexOf('?') >= 0) {
      filename = filename.substr(0, filename.indexOf('?'));
    }

    //remove name and version info from filename
    var delPrefix = (options.pkg.name ? options.pkg.name + '/' : '') + (options.pkg.version ? options.pkg.version + '/' : '');
    if(delPrefix !== '' && filename.indexOf(delPrefix) === 0) {
      filename = filename.substr(delPrefix.length);
    }

    var filenameDir = path.dirname(filename);
    var filenameBase = path.basename(filename);
    var hashInfo = filenameBase.match(/^(\w+)\-[a-z0-9]{20}(\..+)$/i);
    if (!!hashInfo) {
      filename = filenameDir + '/' + hashInfo[1] + hashInfo[2];
    }
    return filename ? pathJoin(compiler.outputPath, filename) : compiler.outputPath;
  }

  //function normalizeOutputPath(outputPath) {
  //  var originOutputPath = outputPath;
  //  outputPath = outputPath.replace(options.cwd, '');
  //  if (outputPath.charAt(0) === '/') {
  //    outputPath = outputPath.slice(1);
  //  }
  //  var arr = outputPath.split('/');
  //  if (arr.length > 1 && arr[0] === 'dist') {
  //    return path.join(options.cwd, 'dist');
  //  } else {
  //    return originOutputPath;
  //  }
  //}

  // The middleware function
  function *webpackDevMiddleware(next) {
    /*jshint validthis:true */
    if (!options.noRequestLog) log.info('request', this.url);
    var prefix  = require('./utils').getPrefix(pkg);
    var url = this.url;
    if (prefix && this.url.indexOf(prefix) === -1) {
      url = '/' + prefix + url.slice(1);
    }

    var filename = getFilenameFromUrl(url);
    log.debug('file parsed', filename);
    if (filename === false) return yield next;

    // in lazy mode, rebuild on bundle request
    if(options.lazy && filename === pathJoin(compiler.outputPath, options.filename)) {
      rebuild();
    }
    // delay the request until we have a vaild bundle
    //ready(function() {

      try {
        var stat = fs.statSync(filename);
        if(!stat.isFile()) {
          if (stat.isDirectory()) {
            filename = path.join(filename, 'index.html');
            stat = fs.statSync(filename);
            if(!stat.isFile()) throw 'next';
          } else {
            throw 'next';
          }
        }
      } catch(e) {
        log.debug('file not found');
        return yield next;
      }

      if (!options.noRequestLog) log.info('file found', filename);

      // server content
      var content = fs.readFileSync(filename);
      this.set('Access-Control-Allow-Origin', '*'); // To support XHR, etc.
      this.set('Content-Type', mime.lookup(filename));
      if(options.headers) {
        for(var name in options.headers) {
          this.set(name, options.headers[name]);
        }
      }
      this.body = content;
    //}, this);
  }

  webpackDevMiddleware.getFilenameFromUrl = getFilenameFromUrl;

  webpackDevMiddleware.invalidate = function() {
    if(watching) watching.invalidate();
  };
  webpackDevMiddleware.close = function(callback) {
    callback = callback || function(){};
    if(watching) watching.close(callback);
    else callback();
  };

  webpackDevMiddleware.fileSystem = fs;
  return webpackDevMiddleware;
};
