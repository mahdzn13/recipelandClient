var neo4JDatabaseUrl = 'http://192.168.1.33:8080';
var mongoDatabaseUrl = 'http://172.16.5.55:3000';

angular.module('starter.controllers', [], function($httpProvider) {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
})

  // Sidemenu
  .controller('menuCtrl', function ($rootScope, $scope, $http, $state) {

    $scope.username = "";

    $scope.logOut = function() {
      localStorage.removeItem("token");
      $state.go("login");
    };

    $scope.$on("$ionicView.beforeEnter", function() {
      //$scope.verifyToken();

    });

    $scope.verifyToken = function () {
      $http({
        method: 'GET',
        url: mongoDatabaseUrl + '/verify-token' ,
        headers: {
          'Authorization' : localStorage.getItem("token")
        }
      }).then(function (resp) {
      }, function (resp) {
        //$scope.logOut();
      });
    };


  })

  // Global list controller
  .controller('listCtrl', function ($scope, $rootScope, $state,$http) {
    $scope.savedRecipe = function (recipe) {
      $rootScope.recipe = recipe;
      $state.go("app.recipe");
    }
  })

  // Populate lists
  .controller('blacklistCtrl', function($scope, $http, $rootScope) {
    $scope.recipeList = {};
    $scope.title = 'Blacklist';

    var url = neo4JDatabaseUrl + '/getBlacklistedRecipes?userNodeId=' + $rootScope.userNodeId;


    $http({
      method: 'GET',
      url: url
    }).then(function (resp) {
      $scope.recipeList = resp.data;
    }, function (resp) {
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
    }, function (resp) {
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
    }, function (resp) {
    });
  })

  // Login to the app
  .controller('loginCtrl', function($scope, $http, $rootScope, $state) {

    $scope.loginData = {};

    $scope.doLogin = function () {
      //Line must be deleted on live environment
      $scope.neo4jlogin($scope.loginData.username);
      $http({
        method: 'GET',
        //username: $scope.loginData.username,
        //password: $scope.loginData.password,
        url: mongoDatabaseUrl + '/token-local?username=' + $scope.loginData.username +'&' +
                                'password=' + $scope.loginData.password
      }).then(function (resp) {
        if (typeof (Storage) !== "undefined") {
          localStorage.setItem("token", "" + resp.data.split("|")[0]);
          // Functional -> $scope.neo4jlogin($scope.loginData.username);
          $scope.neo4jlogin($scope.loginData.username);
        } else {
          console.log("Sorry! Your browser doesn't support web storage.");
        }
      }, function (resp) {
      });
    };

    // Neo4J 'login', getting userNodeId
    $scope.neo4jlogin = function (username) {

      // Getting userNodeId
      var url = neo4JDatabaseUrl + '/getUserNode?username=' + username;

      $http({
        method: 'GET',
        url: url
      }).then(function (resp) {
        $rootScope.userNode = resp.data;
        $rootScope.userNodeId = resp.data.nodeId;
        $state.go("app.mainMenu");
      }, function (resp) {
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
    }, function (resp) {
    });

    $http({
      method: 'GET',
      url: neo4JDatabaseUrl + '/getUserAllergies?userNodeId=' + $rootScope.userNodeId
    }).then(function (resp) {
      $scope.allergies = resp.data;
    }, function (resp) {
    });

  })

  // Recipes controller
  .controller('recipeCtrl', function ($rootScope, $scope,$http) {
    $scope.commentCount = 0;

    $http.get(neo4JDatabaseUrl + '/getAllCountOfCommentsFromRecipe?recipeNodeId=' + $rootScope.recipe.nodeId)
      .success(function(data, status, headers, config) {
          $scope.commentCount = data;
      }).error(function(data, status, headers, config) {
      });
  })

  // Controller for user created recipes
  .controller('myRecipesCtrl', function ($rootScope,$http,$scope) {
    $scope.title = "My recipe book";
    $http({
      method: 'GET',
      url: neo4JDatabaseUrl + '/getCreatedRecipes?userNodeId=' + $rootScope.userNodeId
    }).then(function (resp) {
      $scope.recipeList = resp.data;
    }, function (resp) {

    });
  })

  // randomRecipes controller
  .controller('randomRecipeCtrl', function ($rootScope,$http,$scope) {
    $http({
      method: 'GET',
      url: neo4JDatabaseUrl + '/getAllRecipes'
    }).then(function (resp) {
      var random = Math.floor(Math.random() * resp.data.length);
      $scope.recipe = resp.data[random];
    }, function (resp) {
    });
  })

  // Marco please, stop touching ma code bitch
  .controller('searchListCtrl', function($scope, $http, $rootScope) {
    $scope.recipeList = {};
    $scope.title = 'Recipe list';

    var url = $rootScope.searchUrl;


     var ajaxPetition = function (url) {
     // Ajax petition
       $http({
         method: 'GET',
         url: url
       }).then(function (resp) {
         // Save recipes
         $scope.recipeList = resp.data;
       }, function (resp) {
       });
     };
     ajaxPetition(url);


  })

  .controller('commentListCtrl', function($scope, $http, $rootScope) {
    $rootScope.recipe;
    $scope.commentList = "";
    $scope.title = 'Comments for ' + $rootScope.recipe.name;


    $http.get(neo4JDatabaseUrl + '/getAllCommentsFromRecipe?recipeNodeId=' + $rootScope.recipe.nodeId)
      .success(function(data, status, headers, config) {
          $scope.commentList = data;
      }).error(function(data, status, headers, config) {
          console.log(status);
      });
  })

  .controller('createRecipeCtrl', function($scope, $http, $rootScope, $ionicScrollDelegate) {
    $scope.imgLink = "https://image.flaticon.com/icons/svg/431/431569.svg";
    $scope.recipeTitle = "";
    $scope.recipeText = "";
    $scope.listOfIngredients = [];

    //Adds an ingredient to the list used to in preview
    $scope.addIngredientToList = function (){
      var element = angular.element( document.querySelector( '#ingredientInsert' ) );
      var duplicated = isOnList(element.val());
      if (!duplicated){
        $scope.listOfIngredients.push(element.val());
        element.val("");
      }
      

    };

    //Returns true if it finds a duplicated
    function isOnList(duplicate){
      for (currentIngredient in $scope.listOfIngredients) {
        if ($scope.listOfIngredients[currentIngredient] === duplicate){
          return true;
        }
      }
      return false;
    }
    $scope.removeElementFromArray = function (name){
      $scope.listOfIngredients.splice($scope.listOfIngredients.indexOf(name), 1);

    }

    //Ajax for the creation of the recipe
    $scope.createRecipe = function(){
      var sendData = {
        "recipeName": $scope.recipeTitle,
        "recipeImage": $scope.imgLink,
        "recipeText": $scope.recipeText,
        "userId": $rootScope.userNodeId,
        "ingredientArray": $scope.listOfIngredients,
      };
      $http.post(
        neo4JDatabaseUrl + '/createRecipe',
        sendData
      )
      .success(function(data, status, headers, config) {
        $scope.data = data;
      })
      .error(function(data, status, headers, config) {
        $scope.status = status;
      });
    }
  })

  // Search controller
  .controller('searchCtrl', function ($rootScope, $http, $scope, $ionicPopup, $state) {

    $scope.selectedIngredient = null;
    $scope.ingredients = {};

    $scope.chosenIngredientsId = [];
    $scope.chosenIngredients = [];
    $scope.recipeList = [];

    $scope.addIngredientToList = function (ingredient) {
      if ($scope.chosenIngredientsId.length < 7) {
        var duplicatedNodeId = isOnChosenIdList(ingredient.nodeId);

        if (!duplicatedNodeId){
          $scope.chosenIngredients.push(ingredient);
          $scope.chosenIngredientsId.push(ingredient.nodeId);
        }

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

    //Returns true if it finds a duplicated
    function isOnChosenIdList(duplicate){
      for (chosenIngredientPos in $scope.chosenIngredientsId) {
        if ($scope.chosenIngredientsId[chosenIngredientPos] === duplicate){
          return true;
        }
      }
      return false;
    }

    //Remove elemento from arrays
    $scope.removeElementFromArray = function (recipe){
      for (var i= 0; i < $scope.chosenIngredients.length; i++){
        if ($scope.chosenIngredients[i].nodeId === recipe.nodeId){
          $scope.chosenIngredients.splice(i, 1);
          break;
        }
      }
      $scope.chosenIngredientsId.splice($scope.chosenIngredientsId.indexOf(recipe.nodeId), 1);

    }

    $scope.doSearch = function () {
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
      $rootScope.searchUrl = url;
      $state.go("app.list");

    };

    $http({
      method: 'GET',
      url: neo4JDatabaseUrl + '/getAllIngredients'
    }).then(function (resp) {
      $scope.ingredients = resp.data;
    }, function (resp) {
    });
  })

;
