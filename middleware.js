'use strict';

var expressMiddleware = require('webpack-dev-middleware');

function middleware(doIt, req, res) {
  var originalEnd = res.end;

  return function (done) {
    res.end = function () {
      originalEnd.apply(this, arguments);
      done(null, 0);
    };
    doIt(req, res, function () {
      done(null, 1);
    });
  };
}

module.exports = function (compiler, option) {
  var doIt = expressMiddleware(compiler, option);
  return function*(next) {
    var ctx = this;
    var req = this.req;
    var isHTML = /\.html?$/.test(this.url.split('?')[0]);
    var runNext = yield middleware(doIt, req, {
      end: function (content) {
        // 添加 html fix
        if (isHTML) {
          content = ctx.htmlPrefix + content + ctx.htmlPostfix;
        }

        ctx.body = content;
      },
      setHeader: function () {
        ctx.set.apply(ctx, arguments);
      }
    });
    if (runNext) {
      yield *next;
    }
  };
};
