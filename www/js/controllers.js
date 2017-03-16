var neo4JDatabaseUrl = 'http://79.157.118.158:8080';
var mongoDatabaseUrl = 'http://192.168.1.49:3000';

angular.module('starter.controllers', [])

  // Sidemenu
  .controller('menuCtrl', function ($rootScope, $scope, $http) {

    $scope.logOut = function() {
      localStorage.removeItem("token");
      $state.go("login");
    }

    $scope.$on("$ionicView.beforeEnter", function() {
      $scope.verifyToken();

    });

    $scope.verifyToken = function () {
      $http({
        method: 'GET',
        //username: $scope.loginData.username,
        //password: $scope.loginData.password,
        url: mongoDatabaseUrl + '/verify-token' ,
        headers: {
          'Authorization' : localStorage.getItem("token")
        }
      }).then(function (resp) {
        if (typeof (Storage) !== "undefined") {
          if (angular.equals(localStorage.getItem("token"),resp.data)) {
            console.log("Verified motherfucker");
          } else {
            $scope.logOut();
            console.log("You're out retard");
          }

        } else {
          console.log("Sorry! Your browser doesn't support web storage.");
        }
        console.log(resp.data);
      }, function (resp) {
        console.log('Error');
        console.log(resp.data);
      });
      console.log($scope.loginData);
    };


  })

  // Global list controller
  .controller('listCtrl', function ($scope, $rootScope) {
    $scope.savedRecipe = function (recipe) {
      $rootScope.recipe = recipe;
      console.log("Saving recipe" + recipe)
    }
  })

  // Populate lists
  .controller('blacklistCtrl', function($scope, $http, $rootScope) {
    $scope.recipeList = {};
    $scope.title = 'Blacklist';

    var url = neo4JDatabaseUrl + '/getBlacklistedRecipes?userNodeId=' + $rootScope.userNodeId;
    console.log(url);

    $http({
      method: 'GET',
      url: url
    }).then(function (resp) {
      $scope.recipeList = resp.data;
      console.log(resp.data);
    }, function (resp) {
      console.log('Error');
      console.log(resp.data);
    });
  })

  .controller('favCtrl', function($scope, $http, $rootScope) {
    $scope.recipeList = {};
    $scope.title = 'Favourite Recipes';

    var url = neo4JDatabaseUrl + '/getFavedRecipes?userNodeId=' + $rootScope.userNodeId;

    $http({
      method: 'GET',
      url: url
    }).then(function (resp) {
      $scope.recipeList = resp.data;
      console.log(resp.data);
    }, function (resp) {
      console.log('Error');
      console.log(resp.data);
    });
  })

  .controller('seelaterCtrl', function($scope, $http, $rootScope) {
    $scope.recipeList = {};
    $scope.title = 'See later';

    var url = neo4JDatabaseUrl + '/getSeeLaterRecipes?userNodeId=' + $rootScope.userNodeId;

    $http({
      method: 'GET',
      url: url
    }).then(function (resp) {
      $scope.recipeList = resp.data;
      console.log(resp.data);
    }, function (resp) {
      console.log('Error');
      console.log(resp.data);
    });
  })

  // Login to the app
  .controller('loginCtrl', function($scope, $http, $rootScope) {

    $scope.loginData = {};

    $scope.doLogin = function () {
      $http({
        method: 'GET',
        //username: $scope.loginData.username,
        //password: $scope.loginData.password,
        url: mongoDatabaseUrl + '/token-local?username=' + $scope.loginData.username +'&' +
                                'password=' + $scope.loginData.password
      }).then(function (resp) {
        if (typeof (Storage) !== "undefined") {
          localStorage.setItem("token", "" + resp.data);
          console.log(localStorage.getItem("token"));
        } else {
          console.log("Sorry! Your browser doesn't support web storage.");
        }
      }, function (resp) {
        console.log('Error');
        console.log(resp.data);
      });
      console.log($scope.loginData);
    };

    // MongoDB login
    $scope.mongodblogin = function () {

      // TODO: Albert shiat

    };

    /* Mock pre-login
    $scope.username = 'mahernandezd'; //TODO change this user
    $rootScope.username = 'mahernandezd';
    */

    // Neo4J 'login', getting userNodeId
    $scope.neo4jlogin = function () {

      // Getting userNodeId
      var url = neo4JDatabaseUrl + '/getUserNode?username=' + $scope.username;

      $http({
        method: 'GET',
        url: url
      }).then(function (resp) {
        $rootScope.userNodeId = resp.data.nodeId;
        console.log(resp.data);
      }, function (resp) {
        console.log('Error');
        console.log(resp.data);
      });
    };

  })

  // Interceptor
  .controller('ajax', function ($http) {
    // TODO !!!
  })

  // Allergies controller
  .controller('allergiesCtrl', function ($scope, $http, $rootScope) {
    $scope.selectedAllergy = null;
    $scope.allergies = {};
    $scope.allAlergies = {};

    $http({
      method: 'GET',
      url: neo4JDatabaseUrl + '/getAllAllergies'
    }).then(function (resp) {
      $scope.allAllergies = resp.data;
      console.log(resp.data);
    }, function (resp) {
      console.log('Error');
      console.log(resp.data);
    });

    $http({
      method: 'GET',
      url: neo4JDatabaseUrl + '/getUserAllergies?userNodeId=' + $rootScope.userNodeId
    }).then(function (resp) {
      $scope.allergies = resp.data;
      console.log(resp.data);
    }, function (resp) {
      console.log('Error');
      console.log(resp.data);
    });

  })

  // Recipes controller
  .controller('recipeCtrl', function ($rootScope) {
    console.log($rootScope.savedRecipe);
  })

  // randomRecipes controller
  .controller('randomRecipes', function ($rootScope) {
    $http({
      method: 'GET',
      url: neo4JDatabaseUrl + '/getAllRecipes'
    }).then(function (resp) {
      var random = Math.floor(Math.random() * resp.data.length());
      $scope.recipe = resp.data[random];
      console.log(resp.data);
    }, function (resp) {
      console.log('Error');
      console.log(resp.data);
    });
  })

  // Marco please, stop touching ma code bitch
  .controller('searchListCtrl', function($scope, $http, $rootScope) {
    $scope.recipeList = {};
    $scope.title = 'Recipe list';

    var url = $rootScope.searchUrl;
    console.log(url);


     var ajaxPetition = function () {
     // Ajax petition
       $http({
         method: 'GET',
         url: url
       }).then(function (resp) {
         // Save recipes
         $scope.recipeList = resp.data;
         console.log('Returning search recipe list');
         console.log(resp.data);
       }, function (resp) {
         console.log('Error');
         console.log(resp.data);
       });
     };
     ajaxPetition(url);


  })

  // Search controller
  .controller('searchCtrl', function ($rootScope, $http, $scope, $ionicPopup) {

    $scope.selectedIngredient = null;
    $scope.ingredients = {};

    $scope.chosenIngredientsId = [];
    $scope.chosenIngredientsName = [];
    $scope.recipeList = [];

    $scope.addIngredientToList = function (ingredient) {
      if ($scope.chosenIngredientsId.length < 7) {
        $scope.chosenIngredientsId.push(ingredient.nodeId);
        $scope.chosenIngredientsName.push(ingredient.name);
        console.log('ingredient: '+ ingredient.name);
      } else {
        $ionicPopup.show({
          title: 'Too many ingredients!',
          buttons:
            [{
              text: 'Ok'
            }]
        });
      }
    };

    $scope.doSearch = function () {
      console.log();
      var url = neo4JDatabaseUrl + '/getRecipesWithIngredientsAndSubstitutes?';

      // Formatting the query
      for (i=0; i<7; i++) {
        url += 'nodeId' + (i+1) + '=';
        if ($scope.chosenIngredientsId[i]) {
          url += $scope.chosenIngredientsId[i]
        } else {
          url += null;
        }
        if (i+1<7) {
          url += '&';
        }
      }
      console.log("Mi url:" + url);
      $rootScope.searchUrl = url;

    };

    $http({
      method: 'GET',
      url: neo4JDatabaseUrl + '/getAllIngredients'
    }).then(function (resp) {
      $scope.ingredients = resp.data;
      console.log(resp.data);
    }, function (resp) {
      console.log('Error');
      console.log(resp.data);
    });
  })

;
