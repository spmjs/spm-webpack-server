'use strict';

var path = require('path');
var combo = require('combo-url');
var request = require('co-request');
var log = require('spm-log');

module.exports = function(opts) {

  var contentTypes = {
    '.css': 'text/css',
    '.js': 'application/javascript'
  }

  return function*(next) {

    var url = decodeURIComponent(this.url);

    if (!combo.isCombo(url)) {
      return yield next;
    }

    var data = combo.parse(url);
    var ret = [];
    var contentType = contentTypes[path.extname(data.combo[0])] || 'text/plain';

    for (var i = 0; i < data.combo.length; i++) {
      var item = data.combo[i];
      var _url = this.protocol + '://' + opts.hostname + ':' + opts.port + item;

      log.info('combo fetch', _url);
      var result = yield request(_url);

      if (result.statusCode === 404 || result.statusCode === 204) {
        log.error('' + result.statusCode, _url)
        this.status = 404
        this.body = result.statusMessage + ':\n' + _url
        return
      }

      ret.push(result.body);
    }

    // Set content-type by the first file in combo request
    this.set('content-type', contentType);
    this.body = ret.join('\n');
  };

};
