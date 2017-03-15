angular.module('starter.controllers', [])

  .controller('AppCtrl', function($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };
  })

  // Populate lists
  .controller('listCtrl', function($scope, $http) {
    $scope.recipeList = {};

    $http({
      method: 'GET',
      url: 'http://172.16.6.81:8080/getAllRecipes'
    }).then(function (resp) {
      $scope.recipeList = resp.data;
      console.log(resp.data);
    }, function (resp) {
      console.log('Error');
      console.log(resp.data);
    });
  })

  // Login to the app
  .controller('loginCtrl', function($scope) {

  })

  // Interceptor
  .controller('ajax', function ($http) {

  })

  // Allergies controller
  .controller('allergiesCtrl', function ($scope, $http) {
    $scope.selectedAllergy = null;
    $scope.allergies = {};

    $http({
      method: 'GET',
      url: 'http://172.16.6.81:8080/getAllAllergies'
    }).then(function (resp) {
      $scope.allergies = resp.data;
      console.log(resp.data);
    }, function (resp) {
      console.log('Error');
      console.log(resp.data);
    });
  })

  .controller('mainMenuCtrl', function ($scope, $location) {
    $scope.$location = $location;
  })



  /* Directive goClick
.directive( 'goclick', function () {
  console.log("Clicked!");
  return function ( scope, element, attrs ) {
    var path;

    attrs.$observe( 'goClick', function (val) {
      path = val;
    });

    element.bind( 'click', function () {
      scope.$apply( function () {
        $location.path( path );
      });
    });
  };
});
*/

;
