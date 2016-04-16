module.exports = {
  summary: function () {
    return 'my anyproxy';
  },

  replaceServerResDataAsync: function (req, res, serverResData, callback) {
    serverResData = serverResData.toString().replace('a.js', 'b.js');
    callback(serverResData);
  }
};

