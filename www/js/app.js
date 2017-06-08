// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

})

.config(function($ionicConfigProvider, $httpProvider, $provide, $stateProvider, $urlRouterProvider) {
  // Cache 0
  $ionicConfigProvider.views.maxCache(0);


  // State provider...
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/sideMenu.html',
      controller: 'menuCtrl'
    })

    .state('app.search', {
      url: '/search',
      views: {
        'menuContent': {
          templateUrl: 'templates/search.html',
          controller: 'searchCtrl'
        }
      }
    })

    .state('app.allergies', {
        url: '/allergies',
        views: {
          'menuContent': {
            templateUrl: 'templates/allergies.html',
            controller: 'allergiesCtrl'
          }
        }
      })

    .state('app.blacklist', {
      url: '/blacklist',
      views: {
        'menuContent': {
          templateUrl: 'templates/list.html',
          controller: 'blacklistCtrl'
        }
      }
    })

    .state('app.fav', {
      url: '/fav',
      views: {
        'menuContent': {
          templateUrl: 'templates/list.html',
          controller: 'favCtrl'
        }
      }
    })

    .state('app.seelater', {
      url: '/seelater',
      views: {
        'menuContent': {
          templateUrl: 'templates/list.html',
          controller: 'seelaterCtrl'
        }
      }
    })

    .state('app.list', {
      url: '/list',
      views: {
        'menuContent': {
          templateUrl: 'templates/list.html',
          controller: 'searchListCtrl'
        }
      }
    })

    .state('app.mainMenu', {
      url: '/mainMenu',
      views: {
        'menuContent': {
          templateUrl: 'templates/mainMenu.html',
          controller: 'menuCtrl'
        }
      }
    })

    .state('app.recipe', {
      url: '/recipe',
      views: {
        'menuContent': {
          templateUrl: 'templates/recipe.html',
          controller: 'recipeCtrl'
        }
      }
    })

    .state('app.randomRecipe', {
      url: '/recipe',
      views: {
        'menuContent': {
          templateUrl: 'templates/recipe.html',
          controller: 'randomRecipeCtrl'
        }
      }
    })
    .state('app.comment', {
      url: '/comment',
      views: {
        'menuContent': {
          templateUrl: 'templates/commentList.html',
          controller: 'commentListCtrl'
        }
      }
    })
    .state('app.createRecipe', {
      url: '/createRecipe',
      views: {
        'menuContent': {
          templateUrl: 'templates/createRecipe.html',
          controller: 'createRecipeCtrl'
        }
      }
    })
    .state('app.myRecipes', {
      url: '/myRecipes',
      views: {
        'menuContent': {
          templateUrl: 'templates/list.html',
          controller: 'myRecipesCtrl'
        }
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
