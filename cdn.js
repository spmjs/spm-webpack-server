'use strict';

var request = require('request');
var log = require('spm-log');
var spmrc = require('spmrc');

module.exports = function(opts) {

  opts = opts || {};

  var cdnHost = opts.cdnHost || spmrc.get('cdnHost') || 'https://a.alipayobjects.com';
  var cdnDomain = opts.cdnDomain || spmrc.get('cdnDomain') || 'a.alipayobjects.com';

  return function(req, res, next){
    var url = cdnHost + req.url;
    log.info('cdn', 'fetch', url);

    request({
      url: url,
      headers: {
        'Host': cdnDomain
      },
      gzip: true
    }, function(err, result) {
      if (result.statusCode === 404) {
        log.info('cdn', '404', url);
        next();
      } else {
        res.end(result.body);
      }
    });

  };

};
