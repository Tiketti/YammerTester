var host = '127.0.0.1';
var port = 1337;

var express = require('express');
var menuApi = require('./api/menu.js');

var app = express();
app.use(express.static(__dirname));

app.all('*', function(req, res, next) {
  next();
 });

app.get('/api', function (req, res) {
  res.send('API is running');
});

// returns menus for all known restaurants
app.get('/api/menus/get/:name?', function (req, res){

  console.dir('named parameter: ' + req.params.name);

  menuApi.getMenus(req.params.name, function callback(menusResult) {
    res.json(menusResult)
  });


});

app.listen(port, host);
console.log('listening at ' + host + ':' + port);
