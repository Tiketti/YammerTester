var host = '127.0.0.1';
var port = 1337;

var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

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

  //TODO: separate into a module?

  var menus = [];
  var restaurants = [
    {
      name: "Kellohalli",
      url: "http://kellohalli.fi/2-nostot/40-lounaslista.html",
      parserFunction: function(callback) {
        request(this.url, function(err, response, body) {

        	if(!err && response.statusCode == 200) {
        		var $ = cheerio.load(body);
            // console.dir('item-page: ' + $('.item-page'));
            // console.dir('item-page.each: ' + $('p', '.item-page')); //.each(function(p) {
            //   console.dir(p);
            // }));

            var dishes = $('p', '.item-page');

            // bless this mess --> FIX
            var currentDate = new Date();
            var paddedDate = ('0' + currentDate.getDate()).slice(-2) + '.' + ('0' + (currentDate.getMonth() + 1)).slice(-2);
            var tomorrowDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            var paddedTomorrowDate = ('0' + tomorrowDate.getDate()).slice(-2) + '.' + ('0' + (tomorrowDate.getMonth() + 1)).slice(-2) + '.';
            console.dir(paddedDate + '  --  ' + paddedTomorrowDate);

            var matches = [];
            dishes.each(function(i, elem) {
              console.dir($(this).text());

              //TODO: replace hardcoded date
              if($(this).text().indexOf(paddedDate) >= 0) {
                  // matches
                  matches.push($(this).text());

                  // loop til you find tomorrow's date. or known end
                  var sibling = $(this).next();

                  while(sibling.text().indexOf(paddedTomorrowDate) < 0 && sibling.text().indexOf('_____________') < 0 ) {
                    matches.push(sibling.text());
                    sibling = sibling.next();
                  }
              }
            });

            console.dir('matches: ' + matches);

            //TODO: try to parse price
            var courses = [];
            matches.forEach(function (item) {
              courses.push( { name: item } );
            });

            callback(courses);
        	}
        });
      }
    },
    {
      name: "Sodexo Hermanni",
      url: "http://www.sodexo.fi/ruokalistat/output/daily_json/51/{year}/{month}/{day}/fi",
      parserFunction: function(callback) {
        var currentDate = new Date();
        var url = this.url.replace("{year}", currentDate.getFullYear('yyyy'));
        url = url.replace("{month}", ('0' + (currentDate.getMonth() + 1)).slice(-2));
        url = url.replace("{day}", ('0' + currentDate.getDate()).slice(-2));

        request(url, function(err, response, body) {
          if(!err && response.statusCode == 200) {
            var result = JSON.parse(body);

            var courses = [];
            result.courses.forEach(function (item) {
              courses.push( { name: item.title_fi, price: item.price } );
            });

            callback(courses);
          } else {

            //TODO: handle error

            console.dir('error occurred. error: ' + err)
            callback(null);
          }
        });

      }
    }
  ];

  // look for only one restaurant if a parameter was supplied
  if(req.params.name != null) {
    restaurants = restaurants.filter(function (item) {
      return item.name == req.params.name;
    });
  }

  restaurants.forEach(function(item) {
    item.parserFunction(function parserFinished (courses) {
        menus.push( { restaurant: item.name, courses: courses } );
        returnIfReady();
    });
  });

  function returnIfReady() {
    if(menus.length == restaurants.length) {
      res.json(menus);
    };
  }

  // function restaurantFactory(restaurantName, courses, callback) {
  //   var restaurant = ( { name: restaurantName, courses: [] } );
  //   courses.forEach(function (item) {
  //     restaurant.courses.push( { name: item.title_fi } );
  //   });
  //
  //   callback(restaurant);
  // }

});

app.listen(port, host);
console.log('listening at ' + host + ':' + port);
