'use strict';

var request = require('co-request');
var log = require('spm-log');
var spmrc = require('spmrc');

module.exports = function(opts) {

  opts = opts || {};

  var cdnHost = opts.cdnHost || spmrc.get('cdnHost') || 'https://a.alipayobjects.com';
  var cdnDomain = opts.cdnDomain || spmrc.get('cdnDomain') || 'a.alipayobjects.com';

  return function*(next){
    var url = cdnHost + this.url;
    log.info('cdn', 'fetch', url);

    var result = yield request({
      url: url,
      headers: {
        'Host': cdnDomain
      },
      gzip: true
    });

    if (result.statusCode === 404) {
      log.info('cdn', '404', url);
      yield next;
    } else {
      this.body = result.body;
    }

  };

};
