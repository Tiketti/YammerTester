function YCtrl($scope) {

	$scope.messages = [ ];

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