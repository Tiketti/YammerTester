function YCtrl($scope, $http) {

	$scope.menus = [];
	$scope.messages = [ ];

	$scope.readMenus = function() {
		console.dir('read menus');

		$http.get('api/menus/get').success(function(data) {
			// console.dir('data length: ' + data.length);
			// console.log('data stringified: ' + JSON.stringify(data, null, 4));

			// console.log('json stringified: ' + JSON.stringify(json, null, 4));
			// console.dir('json: ' + json);
			// console.dir('json.restaurant: ' + data[0].restaurant);
			// console.dir('json.courses: ' + data[0].courses);

			$scope.menus = data;
		});

	};

	$scope.readMessages = function() {
		console.dir('read messages');

		yam.getLoginStatus(function(response) {
			if (response.authResponse) {
				// console.log("logged in");
			   // console.dir(response); //print user information to the console

	      		yam.platform.request({
			        url: "messages.json",     //this is one of many REST endpoints that are available
			        method: "GET",
			        data: {    //use the data object literal to specify parameters, as documented in the REST API section of this developer site
	  			        threaded: "true",
				        limit: "10",
			        },
			        success: function (response) { //print message response information to the console
			          console.log("The request was successful.");
			          $scope.messages = angular.copy(response.messages);
			          $scope.$apply();

			        },
			        error: function (response) {
			          alert("There was an error with the request.");
			          console.dir(response);
			        }
		      	});

	  		}
			else {
		      yam.platform.login(function (response) { //prompt user to login and authorize your app, as necessary
		      	if (response.authResponse) {
		          //console.dir(response); //print user information to the console
		      	}
		  	});
		  }
		});
	};
}
