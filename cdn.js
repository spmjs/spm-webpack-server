'use strict';

var request = require('request');
var log = require('spm-log');

module.exports = function(opts) {

  var proxy = opts && opts.proxy || ['https://115.238.23.196', 'a.alipayobjects.com'];

  return function(req, res, next){
    var url = proxy[0] + req.url;
    log.info('cdn', 'fetch', url);

    request({
      url: url,
      headers: {
        'Host': proxy[1]
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
