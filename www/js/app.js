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

.config(function($httpProvider, $provide, $stateProvider, $urlRouterProvider) {
  // Interceptor
  $provide.factory('myHttpInterceptor', function($q) {
  return {
    // optional method
    'request': function(config) {
      // do something on success
      console.log("I'm requesting bitch!");
      return config;
    },

    // optional method
   'requestError': function(rejection) {
      // do something on error
      if (canRecover(rejection)) {
        return responseOrNewPromise
      }
      return $q.reject(rejection);
    },



    // optional method
    'response': function(response) {
      // do something on success
      return response;
    },

    // optional method
   'responseError': function(rejection) {
      // do something on error
      if (canRecover(rejection)) {
        return responseOrNewPromise
      }
      return $q.reject(rejection);
    }
  };
});

  $httpProvider.interceptors.push('myHttpInterceptor');

  // State provider...
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/sideMenu.html',
      controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
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

    .state('app.list', {
      url: '/list',
      views: {
        'menuContent': {
          templateUrl: 'templates/list.html'
        }
      }
    })

    .state('app.recipe', {
      url: '/recipe',
      views: {
        'menuContent': {
          templateUrl: 'templates/recipe.html',
        }
      }
    })

    .state('app.mainMenu', {
      url: '/mainMenu',
      views: {
        'menuContent': {
          templateUrl: 'templates/mainMenu.html',
        }
      }
    })

    .state('app.login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'

    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/mainMenu');
});
