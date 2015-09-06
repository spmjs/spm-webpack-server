'use strict';

var combo = require('combo-url');
var request = require('co-request');
var log = require('spm-log');

module.exports = function(opts) {

  return function*(next){

    var url = decodeURIComponent(this.url);

    if (!combo.isCombo(url)) {
      return yield next;
    }

    var data = combo.parse(url);
    var ret = [];

    for (var i=0; i<data.combo.length; i++) {
      var item = data.combo[i];
      var _url = this.protocol + '://' + opts.hostname + ':' + opts.port + item;

      log.info('combo', 'fetch', _url);
      var result = yield request(_url);

      if (result.statusCode === 404) {
        log.error('404', _url);
        this.status = 404;
        this.body = 'Not Found:\n' + _url;
        return;
      }

      ret.push(result.body);
    }

    this.body = ret.join('\n');
  };

};
