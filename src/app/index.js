'use strict';

angular
    .module('energy', ['ngCookies', 'ngTouch', 'ui.router', 'ui.bootstrap', 'leaflet-directive'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/?step',
                templateUrl: 'app/main/main.html',
                controller: 'MainCtrl'
            })
            .state('editor', {
                controller: ['$scope', 'navService', 'markerService', function($scope, navService, markerService) {
                    navService.steps.then(function(steps) {
                        $scope.steps = steps;
                        markerService.markers.then(function(markers) {
                            $scope.markers = markers;
                        });
                    });
                }],
                url: '/editor',
                templateUrl: 'app/editor/editor.html'
            });
        $urlRouterProvider.otherwise('/');
    })
    .filter('btoa', function() {
        return function(input) {
            return btoa(input);
        };
    })
    .config( [
        '$compileProvider',
        function( $compileProvider )
        {   
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data:application)/);
            // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
        }
    ]);
