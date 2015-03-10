'use strict';

angular.module('energy', ['ngCookies', 'ngTouch', 'ui.router', 'ui.bootstrap', 'leaflet-directive'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/main/main.html',
                controller: 'MainCtrl'
            })
            .state('editor', {
                controller: ['$scope', 'navService', function($scope, navService) {
                    navService.steps.then(function(steps) {
                        $scope.steps = steps;
                    });
                }],
                url: '/editor',
                templateUrl: 'app/editor/editor.html'
            });
        $urlRouterProvider.otherwise('/');
    });
