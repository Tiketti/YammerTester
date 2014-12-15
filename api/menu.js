var request = require('request');
var cheerio = require('cheerio');

exports.getMenus = function (restaurantName, callback) {

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

          var currentDate = new Date();
          var paddedDate = padDate(currentDate);

          var tomorrowDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
          var paddedTomorrowDate = padDate(tomorrowDate);

          var matches = [];
          dishes.each(function(i, elem) {
            // console.dir($(this).text());

            //TODO: replace hardcoded date
            if($(this).text().indexOf(paddedDate) >= 0) {
              // matches
              matches.push($(this).text());

              // loop til you find tomorrow's date or known end character sequence
              var sibling = $(this).next();

              while(sibling.text().indexOf(paddedTomorrowDate) < 0 && sibling.text().indexOf('_____________') < 0 ) {
                matches.push(sibling.text());
                sibling = sibling.next();
              }
            }
          });

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
  if(restaurantName != null) {
    restaurants = restaurants.filter(function (item) {
      return item.name == restaurantName;
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
      callback(menus);
    };
  }

  // returns MM.dd.yyyy
  // and yes, we're deliberately leaving the trailing period off since it might not be there
  function padDate(date) {
    return ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2);
  }

}
