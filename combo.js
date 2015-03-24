'use strict';

var combo = require('combo-url');
var request = require('request');
var async = require('async');
var log = require('spm-log');

module.exports = function(opts) {

  return function(req, res, next) {

    var url = decodeURIComponent(req.url);

    if (!combo.isCombo(url)) {
      return next();
    }

    var data = combo.parse(url);

    async.mapSeries(data.combo, function(item, callback) {
      var _url = req.protocol + '://' + opts.hostname + ':' + opts.port + item;

      log.info('combo', 'fetch', _url);
      request(_url, function(err, result) {
        if (result.statusCode === 404) {
          log.error('combo', '404', _url);
          res.status(404).send('Not found: ' + _url);
        } else {
          callback(null, result.body);
        }
      });
    }, function(err, result) {
      res.end(result.join('\n'));
    });
  };

};
