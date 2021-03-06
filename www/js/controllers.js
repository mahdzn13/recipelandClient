var neo4JDatabaseUrl = 'http://192.168.1.33:8080';
var mongoDatabaseUrl = 'http://192.168.1.53:3000';
var crudUserUrl = 'http://192.168.1.53:5000/api/user';

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
      //activateComment
      $scope.verifyToken();
    });

    $scope.verifyToken = function () {
      $http({
        method: 'GET',
        url: mongoDatabaseUrl + '/verify-token' ,
        headers: {
          'Authorization' : localStorage.getItem("token")
        }
      }).then(function (resp) {
        console.log(resp.data.id)
        $rootScope.userId = resp.data.id

      }, function (resp) {
        $scope.logOut();
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


    $scope.removeFromList = function (recipeNodeId){
      console.log(recipeNodeId);
      var sendData = {
        recipeNodeId: recipeNodeId,
        userNodeId: $rootScope.userNodeId,
      };
      $http.post(
        neo4JDatabaseUrl + '/removeBlacklistedRecipe',
        sendData
        )
      .success(function(data, status, headers, config) {
        $scope.data = data;
      })
      .error(function(data, status, headers, config) {
        $scope.status = status;
      });
    }

    var url = neo4JDatabaseUrl + '/getBlacklistedRecipes?userNodeId=' + $rootScope.userNodeId;

    $http({
      method: 'GET',
      url: url
    }).then(function (resp) {
      console.log(resp.data);
      $scope.recipeList = resp.data;
    }, function (resp) {
    });
  })

  .controller('favCtrl', function($scope, $http, $rootScope) {
    $scope.recipeList = {};
    $scope.title = 'Favourite Recipes';

    $scope.removeFromList = function (recipeNodeId){
      console.log(recipeNodeId);
      var sendData = {
        recipeNodeId: recipeNodeId,
        userNodeId: $rootScope.userNodeId,
      };
      $http.post(
        neo4JDatabaseUrl + '/removeFavedRecipe',
        sendData
        )
      .success(function(data, status, headers, config) {
        $scope.data = data;
      })
      .error(function(data, status, headers, config) {
        $scope.status = status;
      });
    }

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
    $scope.seeLater = true;

    var url = neo4JDatabaseUrl + '/getSeeLaterRecipes?userNodeId=' + $rootScope.userNodeId;

    $http({
      method: 'GET',
      url: url
    }).then(function (resp) {
      $scope.recipeList = resp.data;
    }, function (resp) {
    });
  })
  //SignIn app
  .controller('signInCtrl', function($scope, $http, $state, $rootScope){
    $scope.signInData = {};
    $scope.createUser = function(){
      console.log($scope.signInData)
      if($scope.signInData.username != undefined &&
       $scope.signInData.password != undefined &&
       $scope.signInData.email != undefined &&
       $scope.signInData.name != undefined &&
       $scope.signInData.surname != undefined){
        $http.post(
          crudUserUrl,
          $scope.signInData
          )
      .success(function(data, status, headers, config) {
        $scope.data = data;
        $rootScope.createdUserOK = true;
        var sendData = {
          username: $scope.signInData.username,
          email: $scope.signInData.email,
          name: $scope.signInData.name,
          surname: $scope.signInData.surname
        };

       $http.post(
          neo4JDatabaseUrl + '/createUser',
          sendData
          )
       .success(function(data, status, headers, config) {
         $scope.data = data;
        })
        .error(function(data, status, headers, config) {
          $scope.status = status;
        });
        $state.go("login");

      })
      .error(function(data, status, headers, config) {
        console.log(status)
        $scope.status = status;
      });
    }else{
      console.log('Todos los campos son obligatorios')
    }
  }
})

  //MyProfile Controller
  .controller('myProfileCtrl', function($scope, $rootScope, $http, $state){
    $rootScope.id;
    console.log("userID" + $rootScope.userId)
    var urlGet = crudUserUrl + '/' + $rootScope.userId;
    console.log(urlGet);
    $scope.updateData = {};
    $http({
      method: 'GET',
      url: urlGet
    }).then(function (resp) {
      $scope.updateData.activated = resp.data.activated;
      $scope.updateData.username = resp.data.username;
      $scope.updateData.name = resp.data.name;
      $scope.updateData.surname = resp.data.surname;
      $scope.updateData.email = resp.data.email;
      console.log($scope.updateData);
    }, function (resp) {
      console.log(resp);
    });

    $scope.updateUser = function(){
      $http.put(
        crudUserUrl,
        $scope.updateData

      ).success(function(data, status, headers, config) {
        $scope.data = data;

      })
      .error(function(data, status, headers, config) {
        console.log(status)
        $scope.status = status;
      });
    }
  }
)

  // Login to the app
  .controller('loginCtrl', function($scope, $http, $rootScope, $state ,$ionicPopup) {
    $scope.loginData = {};

    if ($rootScope.createdUserOK === true){
      $rootScope.createdUserOK = false;
      $ionicPopup.show({
        title: 'Account created succesfully!',
        buttons:
        [{
          text: 'Ok'
        }]
      });
    }

    $scope.doLogin = function () {
      //deactivateComment
      //Line must be deleted on live environment
      //$scope.neo4jlogin($scope.loginData.username);
      var sendData = {
        username: $scope.loginData.username,
        password: $scope.loginData.password
      };

     $http.post(
        mongoDatabaseUrl + '/token-local',
        sendData
        )
     .success(function(data, status, headers, config) {
       if (typeof (Storage) !== "undefined") {
         localStorage.setItem("token", "" + data.split("|")[0]);
         //activateComment
         // Functional -> $scope.neo4jlogin($scope.loginData.username);
         $scope.neo4jlogin($scope.loginData.username);
       } else {
         console.log("Sorry! Your browser doesn't support web storage.");
       }
      })
      .error(function(data, status, headers, config) {
        $scope.status = status;
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

    $scope.removeAllergyFromUser = function(allergyNodeId){
      console.log("a");
      var sendData = {
        allergyNodeId: allergyNodeId,
        userNodeId: $rootScope.userNodeId,
      };
      $http.post(
        neo4JDatabaseUrl + '/removeAllergyFromUser',
        sendData
      )
      .success(function(data, status, headers, config) {
        $scope.data = data;
      })
      .error(function(data, status, headers, config) {
        $scope.status = status;
      });
    }

    $scope.addAllergy = function (selectedAllergy){
      console.log(selectedAllergy);
      var sendData = {
        allergyNodeId: this.selectedAllergy.nodeId,
        userNodeId: $rootScope.userNodeId,
      };
      console.log(sendData);
      $http.post(
        neo4JDatabaseUrl + '/addAllergyToUser',
        sendData
        )
      .success(function(data, status, headers, config) {
        $scope.data = data;
      })
      .error(function(data, status, headers, config) {
        $scope.status = status;
      });
    }

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
    $scope.commentCount;

    $http.get(neo4JDatabaseUrl + '/getAllCountOfCommentsFromRecipe?recipeNodeId=' + $rootScope.recipe.nodeId)
    .success(function(data, status, headers, config) {
      if ( data !== undefined){
        $scope.commentCount = data;
      } else {
        $scope.commentCount = 0;
      }

    }).error(function(data, status, headers, config) {

    });
  })

  // Controller for user created recipes
  .controller('myRecipesCtrl', function ($rootScope,$http,$scope,$ionicPopup) {
    $scope.title = "My recipe book";
    $scope.myRecipes = true;

    if ($rootScope.recipeCreatedOK === true){
      $rootScope.recipeCreatedOK = false;
      $ionicPopup.show({
        title: 'Recipe created succesfully!',
        buttons:
        [{
          text: 'Ok'
        }]
      });
    }


    $http({
      method: 'GET',
      url: neo4JDatabaseUrl + '/getCreatedRecipes?userNodeId=' + $rootScope.userNodeId
    }).then(function (resp) {
      console.log(resp.data);
      console.log(resp.data.recipe);
      $scope.createdBy = resp.data.user.name;
      $scope.recipeList = resp.data.recipe;
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
    $scope.title = 'Search results';
    $scope.search = true;

    var url = $rootScope.searchUrl;
    /**
    * Receiver position of the item and action
    **/
    $scope.addTo = function (pos,action) {
      console.log($rootScope.userNodeId);
      console.log($scope.recipeList[pos].nodeId);
      if ( action === "favourite"){
        //Favourite recipe
        var sendData = {
          recipeNodeId: $scope.recipeList[pos].nodeId,
          userNodeId: $rootScope.userNodeId,
        };
        console.log(sendData);
        $http.post(
          neo4JDatabaseUrl + '/userFavedRecipe',
          sendData
          )
        .success(function(data, status, headers, config) {
          $scope.data = data;
        })
        .error(function(data, status, headers, config) {
          $scope.status = status;
        });
      } else if ( action === "seelater"){
        //See later recipe
        var sendData = {
          recipeNodeId: $scope.recipeList[pos].nodeId,
          userNodeId: $rootScope.userNodeId,
        };
        $http.post(
          neo4JDatabaseUrl + '/userSeeLaterRecipe',
          sendData
          )
        .success(function(data, status, headers, config) {
          $scope.data = data;
        })
        .error(function(data, status, headers, config) {
          $scope.status = status;
        });
      } else if ( action === "blacklist"){
        //Blacklist recipe
        var sendData = {
          recipeNodeId: $scope.recipeList[pos].nodeId,
          userNodeId: $rootScope.userNodeId,
        };
        $http.post(
          neo4JDatabaseUrl + '/userBlacklistedRecipe',
          sendData
          )
        .success(function(data, status, headers, config) {
          $scope.data = data;
        })
        .error(function(data, status, headers, config) {
          $scope.status = status;
        });
      }
    }

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

  .controller('createRecipeCtrl', function($scope, $http, $rootScope, $ionicScrollDelegate, $state) {
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
        $rootScope.recipeCreatedOK = true;
        $state.go("app.myRecipes");
      })
      .error(function(data, status, headers, config) {
        $scope.status = status;
      });
    }
  })

  // Search controller
  .controller('searchCtrl', function ($rootScope, $http, $scope, $ionicPopup, $state) {
    $scope.title = "Select your ingredients";
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
